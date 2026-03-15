import { NextRequest, NextResponse } from "next/server";

const JOBS = [
  { id:1, company:"山本フーズ株式会社", position:"調理師", positionVn:"Nhân viên bếp",        industry:"飲食",  jlptMin:"N4", salary:"¥200,000", location:"東京都", status:"urgent" },
  { id:2, company:"東京工場株式会社",   position:"製造ライン", positionVn:"Công nhân",        industry:"製造",  jlptMin:"N5", salary:"¥185,000", location:"埼玉県", status:"urgent" },
  { id:3, company:"グランドホテル大阪", position:"客室清掃", positionVn:"Phục vụ phòng",      industry:"ホテル",jlptMin:"N4", salary:"¥175,000", location:"大阪府", status:"open"   },
  { id:4, company:"みどり農業組合",     position:"農場作業員", positionVn:"Nông trại",        industry:"農業",  jlptMin:"N5", salary:"¥165,000", location:"北海道", status:"open"   },
  { id:5, company:"さくらレストラン",   position:"ホール", positionVn:"Phục vụ bàn",          industry:"飲食",  jlptMin:"N4", salary:"¥170,000", location:"神奈川県",status:"paused" },
];

const JLPT_RANK: Record<string,number> = { N1:5,N2:4,N3:3,N4:2,N5:1,"なし":0,"":0 };

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("cv") as File | null;
    if (!file) return NextResponse.json({ error: "CVファイルが必要です" }, { status:400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const rawText = buffer.toString("utf-8")
      .replace(/[^\u0020-\u007E\u3000-\u9FFF\uFF00-\uFFEF\n\r\t]/g," ")
      .replace(/\s+/g," ")
      .trim()
      .slice(0,6000);

    // ── Gemini API (gemini-2.0-flash — model mới nhất free) ──
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an HR assistant. Extract info from this CV and return ONLY valid JSON (no markdown, no explanation):
{
  "name": "full name",
  "email": "email or empty",
  "phone": "phone or empty",
  "gender": "男性 or 女性 or empty",
  "dateOfBirth": "YYYY-MM-DD or empty",
  "jlpt": "N1 or N2 or N3 or N4 or N5 or なし",
  "industry": "飲食 or 製造 or 農業 or ホテル or その他",
  "experienceYears": 0,
  "skills": ["skill1","skill2"],
  "certifications": ["cert1"],
  "summary": "2-3 sentences in Japanese",
  "summaryVn": "2-3 sentences in Vietnamese",
  "strengths": ["strength1","strength2","strength3"],
  "preferredLocation": "location or empty",
  "availability": "immediate or YYYY-MM or empty"
}

CV content:
${rawText}`
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1200,
          }
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      throw new Error(`Gemini API error: ${geminiRes.status} - ${errText}`);
    }

    const geminiData = await geminiRes.json();
    const rawResult = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    let candidateInfo;
    try {
      const cleaned = rawResult
        .replace(/```json\n?/g,"")
        .replace(/```\n?/g,"")
        .trim();
      candidateInfo = JSON.parse(cleaned);
    } catch {
      candidateInfo = {
        name: file.name.replace(/\.(pdf|docx?)$/i,""),
        jlpt:"N4", industry:"飲食", experienceYears:0,
        skills:[], strengths:[], certifications:[],
        summaryVn:"CV đã được tải lên thành công",
        summary:"CVのアップロードが完了しました",
      };
    }

    // ── Job matching ──
    const rank = JLPT_RANK[candidateInfo.jlpt] || 0;
    const suggestions = JOBS
      .filter(j => j.status !== "full")
      .map(job => {
        let score = 0;
        const reasons: string[] = [];
        if (job.industry === candidateInfo.industry) { score+=40; reasons.push(`業種マッチ · Đúng ngành ${job.industry}`); }
        const reqRank = JLPT_RANK[job.jlptMin] || 0;
        if (rank >= reqRank) { score+=30; reasons.push(`日本語OK · ${candidateInfo.jlpt}`); }
        else if (rank === reqRank-1) { score+=10; reasons.push(`日本語レベル近似`); }
        if (candidateInfo.experienceYears >= 3) { score+=20; reasons.push(`経験${candidateInfo.experienceYears}年`); }
        else if (candidateInfo.experienceYears >= 1) { score+=10; reasons.push(`経験あり`); }
        if (job.status === "urgent") { score+=10; reasons.push(`緊急募集`); }
        return { ...job, score, reasons, matchPct: Math.min(score,100) };
      })
      .sort((a,b) => b.score-a.score)
      .slice(0,3);

    return NextResponse.json({
      candidate: candidateInfo,
      suggestions,
      fileName: file.name,
      fileSize: file.size,
    });

  } catch(err) {
    console.error("CV analysis error:", err);
    return NextResponse.json({ error:"CV分析エラー / Lỗi phân tích CV" }, { status:500 });
  }
}