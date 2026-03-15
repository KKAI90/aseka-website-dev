import { NextRequest, NextResponse } from "next/server";

const JOBS = [
  { id:1, company:"山本フーズ株式会社",   position:"調理師・キッチンスタッフ", positionVn:"Nhân viên bếp",        industry:"飲食",  jlptMin:"N4", salary:"¥200,000", location:"東京都 新宿区",  status:"urgent" },
  { id:2, company:"東京工場株式会社",     position:"製造ラインスタッフ",       positionVn:"Công nhân dây chuyền", industry:"製造",  jlptMin:"N5", salary:"¥185,000", location:"埼玉県 川口市",  status:"urgent" },
  { id:3, company:"グランドホテル大阪",   position:"客室清掃スタッフ",         positionVn:"Phục vụ phòng",        industry:"ホテル",jlptMin:"N4", salary:"¥175,000", location:"大阪府 難波",    status:"open"   },
  { id:4, company:"みどり農業組合",       position:"農場作業員",               positionVn:"Nhân viên nông trại",  industry:"農業",  jlptMin:"N5", salary:"¥165,000", location:"北海道 札幌市",  status:"open"   },
  { id:5, company:"さくらレストラン",     position:"ホールスタッフ",           positionVn:"Phục vụ bàn",          industry:"飲食",  jlptMin:"N4", salary:"¥170,000", location:"神奈川県 横浜市",status:"paused" },
];

const JLPT_RANK: Record<string,number> = { N1:5, N2:4, N3:3, N4:2, N5:1, "なし":0, "":0 };

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("cv") as File | null;
    if (!file) return NextResponse.json({ error: "CVファイルが必要です" }, { status:400 });

    // Read file as text (works for text-based PDFs)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Extract text from buffer - try UTF-8 first, then latin1
    let rawText = "";
    try {
      rawText = buffer.toString("utf-8");
    } catch {
      rawText = buffer.toString("latin1");
    }
    
    // Clean up binary/non-readable characters, keep Japanese + Latin
    const cleanText = rawText
      .replace(/[^\u0020-\u007E\u3000-\u9FFF\uFF00-\uFFEF\n\r\t]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 8000); // limit tokens

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        system: `You are an HR assistant for Aseka株式会社, a Vietnamese staffing company in Japan.
Extract information from this CV text (may be Japanese, Vietnamese, or English).
Respond ONLY with valid JSON, no markdown, no extra text:
{
  "name": "full name",
  "email": "email or empty string",
  "phone": "phone number or empty string",
  "dateOfBirth": "YYYY-MM-DD or empty",
  "gender": "男性 or 女性 or empty",
  "jlpt": "N1/N2/N3/N4/N5 or なし",
  "industry": "飲食 or 製造 or 農業 or ホテル or その他",
  "experienceYears": 0,
  "skills": ["skill1","skill2"],
  "certifications": ["cert1"],
  "summary": "2-3 sentence summary in Japanese",
  "summaryVn": "2-3 sentence summary in Vietnamese",
  "strengths": ["strength1","strength2","strength3"],
  "preferredLocation": "location or empty",
  "availability": "immediate or YYYY-MM or empty"
}`,
        messages: [{
          role: "user",
          content: `Please analyze this CV and extract information:\n\n${cleanText}`,
        }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${errText}`);
    }

    const aiData = await response.json();
    const rawResult = aiData.content?.[0]?.text || "{}";

    let candidateInfo;
    try {
      const cleaned = rawResult.replace(/```json\n?/g,"").replace(/```\n?/g,"").trim();
      candidateInfo = JSON.parse(cleaned);
    } catch {
      candidateInfo = {
        name: file.name.replace(/\.(pdf|docx|doc)$/i,""),
        jlpt:"N4", industry:"飲食", experienceYears:0, skills:[], strengths:[],
        summary:"CV分析完了", summaryVn:"Đã phân tích CV",
      };
    }

    // Job matching
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

    return NextResponse.json({ candidate: candidateInfo, suggestions, fileName: file.name, fileSize: file.size });

  } catch (err) {
    console.error("CV analysis error:", err);
    return NextResponse.json({ error: "CV分析中にエラーが発生しました" }, { status:500 });
  }
}