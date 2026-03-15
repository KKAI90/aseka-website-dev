import { NextRequest, NextResponse } from "next/server";

const JOBS = [
  { id: 1, company: "山本フーズ株式会社", position: "調理師・キッチンスタッフ", positionVn: "Nhân viên bếp", industry: "飲食", jlptMin: "N4", salary: "¥200,000", location: "東京都 新宿区", status: "urgent" },
  { id: 2, company: "東京工場株式会社",   position: "製造ラインスタッフ",       positionVn: "Công nhân dây chuyền", industry: "製造", jlptMin: "N5", salary: "¥185,000", location: "埼玉県 川口市", status: "urgent" },
  { id: 3, company: "グランドホテル大阪", position: "客室清掃スタッフ",         positionVn: "Phục vụ phòng", industry: "ホテル", jlptMin: "N4", salary: "¥175,000", location: "大阪府 難波", status: "open" },
  { id: 4, company: "みどり農業組合",     position: "農場作業員",               positionVn: "Nhân viên nông trại", industry: "農業", jlptMin: "N5", salary: "¥165,000", location: "北海道 札幌市", status: "open" },
  { id: 5, company: "さくらレストラン",   position: "ホールスタッフ",           positionVn: "Phục vụ bàn", industry: "飲食", jlptMin: "N4", salary: "¥170,000", location: "神奈川県 横浜市", status: "paused" },
];

const JLPT_RANK: Record<string, number> = { N1: 5, N2: 4, N3: 3, N4: 2, N5: 1, "なし": 0, "": 0 };

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("cv") as File | null;

    if (!file) {
      return NextResponse.json({ error: "CVファイルが必要です" }, { status: 400 });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = file.type || "application/pdf";

    // Call Claude API to analyze CV
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
        system: `You are an expert HR assistant for a Vietnamese staffing company in Japan (Aseka株式会社).
Analyze the CV/resume and extract structured information. The CV may be in Vietnamese, Japanese, or English.
Respond ONLY with a valid JSON object, no markdown, no explanation.
JSON structure:
{
  "name": "full name",
  "email": "email or empty string",
  "phone": "phone number or empty string",
  "dateOfBirth": "YYYY-MM-DD or empty string",
  "gender": "男性 or 女性 or empty string",
  "jlpt": "N1/N2/N3/N4/N5 or なし",
  "industry": "飲食 or 製造 or 農業 or ホテル or その他",
  "experienceYears": number,
  "skills": ["skill1", "skill2"],
  "certifications": ["cert1"],
  "summary": "2-3 sentence summary in Japanese",
  "summaryVn": "2-3 sentence summary in Vietnamese",
  "strengths": ["strength1", "strength2", "strength3"],
  "preferredLocation": "preferred work location or empty",
  "availability": "immediate or YYYY-MM or empty"
}`,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "document",
                source: {
                  type: "base64",
                  media_type: mimeType,
                  data: base64,
                },
              },
              {
                type: "text",
                text: "Please analyze this CV and extract all relevant information. Return only the JSON object.",
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const aiData = await response.json();
    const rawText = aiData.content?.[0]?.text || "{}";

    let candidateInfo;
    try {
      // Clean JSON - remove markdown if any
      const cleaned = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      candidateInfo = JSON.parse(cleaned);
    } catch {
      candidateInfo = { name: file.name.replace(/\.(pdf|docx|doc)$/i, ""), jlpt: "N4", industry: "飲食", experienceYears: 0, skills: [], strengths: [] };
    }

    // AI-powered job matching
    const candidateJlptRank = JLPT_RANK[candidateInfo.jlpt] || 0;
    const suggestions = JOBS
      .filter(job => job.status !== "full")
      .map(job => {
        let score = 0;
        let reasons: string[] = [];

        // Industry match (highest weight)
        if (job.industry === candidateInfo.industry) {
          score += 40;
          reasons.push(`業種マッチ · Đúng ngành ${job.industry}`);
        }

        // JLPT match
        const requiredRank = JLPT_RANK[job.jlptMin] || 0;
        if (candidateJlptRank >= requiredRank) {
          score += 30;
          reasons.push(`日本語レベル適合 · Tiếng Nhật phù hợp (${candidateInfo.jlpt})`);
        } else if (candidateJlptRank === requiredRank - 1) {
          score += 10;
          reasons.push(`日本語レベル近似 · Tiếng Nhật gần đủ`);
        }

        // Experience bonus
        if (candidateInfo.experienceYears >= 3) {
          score += 20;
          reasons.push(`経験${candidateInfo.experienceYears}年 · ${candidateInfo.experienceYears} năm kinh nghiệm`);
        } else if (candidateInfo.experienceYears >= 1) {
          score += 10;
          reasons.push(`経験あり · Có kinh nghiệm`);
        }

        // Urgency bonus
        if (job.status === "urgent") {
          score += 10;
          reasons.push(`緊急募集 · Tuyển khẩn cấp`);
        }

        return { ...job, score, reasons, matchPct: Math.min(score, 100) };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return NextResponse.json({
      candidate: candidateInfo,
      suggestions,
      fileName: file.name,
      fileSize: file.size,
    });

  } catch (err) {
    console.error("CV analysis error:", err);
    return NextResponse.json(
      { error: "CV分析中にエラーが発生しました / Lỗi phân tích CV" },
      { status: 500 }
    );
  }
}
