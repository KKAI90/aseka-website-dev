import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const JOBS = [
  { id:1, company:"山本フーズ株式会社",   position:"調理師・キッチンスタッフ", positionVn:"Nhân viên bếp",        industry:"飲食",  jlptMin:"N4", salary:"¥200,000", location:"東京都 新宿区",  status:"urgent" },
  { id:2, company:"東京工場株式会社",     position:"製造ラインスタッフ",        positionVn:"Công nhân dây chuyền", industry:"製造",  jlptMin:"N5", salary:"¥185,000", location:"埼玉県 川口市",  status:"urgent" },
  { id:3, company:"グランドホテル大阪",   position:"客室清掃スタッフ",          positionVn:"Phục vụ phòng",        industry:"ホテル",jlptMin:"N4", salary:"¥175,000", location:"大阪府 難波",    status:"open"   },
  { id:4, company:"みどり農業組合",       position:"農場作業員",                positionVn:"Nhân viên nông trại",  industry:"農業",  jlptMin:"N5", salary:"¥165,000", location:"北海道 札幌市",  status:"open"   },
  { id:5, company:"さくらレストラン",     position:"ホールスタッフ",            positionVn:"Phục vụ bàn",          industry:"飲食",  jlptMin:"N4", salary:"¥170,000", location:"神奈川県 横浜市",status:"paused" },
];

const JLPT_RANK: Record<string,number> = { N1:5, N2:4, N3:3, N4:2, N5:1, "なし":0, "":0 };

export async function POST(req: NextRequest) {
  try {
    // 1. Lấy dữ liệu từ Form
const formData = await req.formData();
const file = formData.get("cv") as File | null; 

if (!file) {
  return NextResponse.json({ error: "Không tìm thấy file CV" }, { status: 400 });
}

// 2. Chuyển đổi file sang Base64 để gửi cho Gemini (Cách này cực kỳ ổn định)
const bytes = await file.arrayBuffer();
const base64Data = Buffer.from(bytes).toString("base64");

// 3. Cấu hình Model Gemini
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  generationConfig: { 
    responseMimeType: "application/json" // Ép AI luôn trả về JSON chuẩn
  }
});

const prompt = `You are an HR assistant. Analyze this CV and extract info. 
Respond ONLY with valid JSON:
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "jlpt": "N1/N2/N3/N4/N5 or なし",
  "industry": "飲食 or 製造 or 農業 or ホテル or その他",
  "experienceYears": number,
  "summary": "Japanese summary",
  "summaryVn": "Vietnamese summary"
}`;

// 4. Gọi API Gemini (Gửi kèm cả file gốc)
const result = await model.generateContent([
  {
    inlineData: {
      data: base64Data,
      mimeType: file.type // Tự động nhận diện PDF hoặc Ảnh
    }
  },
  prompt
]);

const rawResult = result.response.text();
const candidateInfo = JSON.parse(rawResult);

// ... (Giữ nguyên đoạn code so khớp Job Matching bên dưới của bạn)
        }
    });

    const systemInstruction = `You are an HR assistant for Aseka株式会社.
    Extract information from this CV text. Respond ONLY with valid JSON following this schema:
    {
      "name": "string",
      "email": "string",
      "phone": "string",
      "dateOfBirth": "YYYY-MM-DD",
      "gender": "男性 or 女性",
      "jlpt": "N1/N2/N3/N4/N5 or なし",
      "industry": "飲食 or 製造 or 農業 or ホテル or その他",
      "experienceYears": number,
      "skills": ["string"],
      "certifications": ["string"],
      "summary": "2-3 sentence summary in Japanese",
      "summaryVn": "2-3 sentence summary in Vietnamese",
      "strengths": ["string"],
      "preferredLocation": "string",
      "availability": "string"
    }`;

    const prompt = `Please analyze this CV text and extract information:\n\n${cleanText}`;

    // Gọi Gemini API
    const result = await model.generateContent(`${systemInstruction}\n\n${prompt}`);
    const rawResult = result.response.text();

    let candidateInfo;
    try {
      candidateInfo = JSON.parse(rawResult);
    } catch (e) {
      console.error("JSON Parse Error:", e);
      candidateInfo = {
        name: file.name.replace(/\.(pdf|docx|doc)$/i,""),
        jlpt:"N4", industry:"飲食", experienceYears:0, skills:[], strengths:[],
        summary:"CV分析完了", summaryVn:"Đã phân tích CV",
      };
    }

    // Giữ nguyên logic Job matching của bạn
    const candidateJlptRank = JLPT_RANK[candidateInfo.jlpt] || 0;
    const suggestions = JOBS
      .filter(job => job.status !== "full")
      .map(job => {
        let score = 0;
        const reasons: string[] = [];
        if (job.industry === candidateInfo.industry) { score+=40; reasons.push(`業種マッチ · Đúng ngành ${job.industry}`); }
        const reqRank = JLPT_RANK[job.jlptMin] || 0;
        if (candidateJlptRank >= reqRank) { score+=30; reasons.push(`日本語レベル適合 · Tiếng Nhật phù hợp (${candidateInfo.jlpt})`); }
        else if (candidateJlptRank === reqRank-1) { score+=10; reasons.push(`日本語レベル近似 · Gần đủ`); }
        if (candidateInfo.experienceYears >= 3) { score+=20; reasons.push(`経験${candidateInfo.experienceYears}年`); }
        else if (candidateInfo.experienceYears >= 1) { score+=10; reasons.push(`経験あり`); }
        if (job.status === "urgent") { score+=10; reasons.push(`緊急募集 · Khẩn cấp`); }
        return { ...job, score, reasons, matchPct: Math.min(score,100) };
      })
      .sort((a,b) => b.score-a.score)
      .slice(0,3);

    return NextResponse.json({ 
        candidate: candidateInfo, 
        suggestions, 
        fileName: file.name, 
        fileSize: file.size 
    });

  } catch (err: any) {
    console.error("Gemini analysis error:", err);
    return NextResponse.json({ 
        error: "CV分析中にエラーが発生しました",
        details: err.message 
    }, { status:500 });
  }
}