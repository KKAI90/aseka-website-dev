import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Đảm bảo đã cài: npm install @google/generative-ai
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
    const formData = await req.formData();
    const file = formData.get("cv") as File | null;
    if (!file) return NextResponse.json({ error: "CVファイルが必要です" }, { status:400 });

    const bytes = await file.arrayBuffer();
    const base64Data = Buffer.from(bytes).toString("base64");

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash", // Thay đổi từ 1.5-flash sang 2.0-flash
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `Analyze this CV and extract information. Respond ONLY with valid JSON:
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

    const result = await model.generateContent([
      { inlineData: { data: base64Data, mimeType: file.type } },
      prompt
    ]);

    const candidateInfo = JSON.parse(result.response.text());

    // Job matching logic
    const candidateJlptRank = JLPT_RANK[candidateInfo.jlpt] || 0;
    const suggestions = JOBS
      .filter(job => job.status !== "full")
      .map(job => {
        let score = 0;
        const reasons: string[] = [];
        if (job.industry === candidateInfo.industry) { score+=40; reasons.push(`業種マッチ`); }
        const reqRank = JLPT_RANK[job.jlptMin] || 0;
        if (candidateJlptRank >= reqRank) { score+=30; reasons.push(`日本語レベル適合`); }
        if (candidateInfo.experienceYears >= 1) { score+=20; reasons.push(`経験あり`); }
        return { ...job, score, reasons, matchPct: Math.min(score,100) };
      })
      .sort((a,b) => b.score - a.score)
      .slice(0,3);

    return NextResponse.json({ candidate: candidateInfo, suggestions, fileName: file.name });

  } catch (err: any) {
    console.error("CV analysis error:", err);
    return NextResponse.json({ error: "Phân tích thất bại", details: err.message }, { status:500 });
  }
}