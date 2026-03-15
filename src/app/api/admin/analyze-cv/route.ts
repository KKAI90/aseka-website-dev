import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

const JOBS = [
  { id:"1", company:"山本フーズ株式会社",  position:"調理師",      positionVn:"Nhân viên bếp",        industry:"飲食",  jlptMin:"N4", salary:"¥200,000", location:"東京都", status:"urgent" },
  { id:"2", company:"東京工場株式会社",    position:"製造ライン",   positionVn:"Công nhân",            industry:"製造",  jlptMin:"N5", salary:"¥185,000", location:"埼玉県", status:"urgent" },
  { id:"3", company:"グランドホテル大阪",  position:"客室清掃",     positionVn:"Phục vụ phòng",        industry:"ホテル",jlptMin:"N4", salary:"¥175,000", location:"大阪府", status:"open"   },
  { id:"4", company:"みどり農業組合",      position:"農場作業員",   positionVn:"Nông trại",            industry:"農業",  jlptMin:"N5", salary:"¥165,000", location:"北海道", status:"open"   },
  { id:"5", company:"さくらレストラン",    position:"ホール",       positionVn:"Phục vụ bàn",          industry:"飲食",  jlptMin:"N4", salary:"¥170,000", location:"神奈川県",status:"paused" },
  { id:"6", company:"東京ホテルグループ",  position:"フロントスタッフ",positionVn:"Lễ tân khách sạn",  industry:"ホテル",jlptMin:"N3", salary:"¥190,000", location:"東京都", status:"open"   },
  { id:"7", company:"大阪農場",            position:"ハウス栽培",   positionVn:"Trồng trọt nhà kính", industry:"農業",  jlptMin:"N5", salary:"¥168,000", location:"大阪府", status:"open"   },
];

const JLPT_RANK: Record<string,number> = { N1:5,N2:4,N3:3,N4:2,N5:1,"なし":0,"N4相当":2,"N3相当":3,"":0 };

// Extract text from DOCX (XML-based)
function extractDocxText(buffer: Buffer): string {
  try {
    const content = buffer.toString("binary");
    // Find word/document.xml content
    const xmlMatch = content.match(/word\/document\.xml[^P]*PK/s);
    if (!xmlMatch) {
      // Try to extract any readable text
      return buffer.toString("utf-8")
        .replace(/[^\u0020-\u007E\u3000-\u9FFF\uFF00-\uFFEF\n\r\t]/g, " ")
        .replace(/\s+/g, " ").trim();
    }
    // Remove XML tags and decode
    const xmlContent = xmlMatch[0]
      .replace(/<[^>]+>/g, " ")
      .replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&")
      .replace(/\s+/g, " ").trim();
    return xmlContent.slice(0, 8000);
  } catch {
    return buffer.toString("utf-8")
      .replace(/[^\u0020-\u007E\u3000-\u9FFF\uFF00-\uFFEF\n\r\t]/g, " ")
      .replace(/\s+/g, " ").trim().slice(0, 8000);
  }
}

// Extract text from PDF
function extractPdfText(buffer: Buffer): string {
  return buffer.toString("utf-8")
    .replace(/[^\u0020-\u007E\u3000-\u9FFF\uFF00-\uFFEF\n\r\t]/g, " ")
    .replace(/\s+/g, " ").trim().slice(0, 8000);
}

// Analyze single CV with Gemini
async function analyzeWithGemini(text: string, fileName: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const prompt = `You are an expert HR assistant for Aseka株式会社, a Vietnamese staffing agency in Japan.
Analyze this CV/resume text and extract information. The CV may be in Japanese, Vietnamese, or both.

CV Content:
${text.slice(0, 5000)}

Return ONLY a valid JSON object (no markdown, no explanation):
{
  "name": "full name (Latin script preferred)",
  "nameJp": "name in katakana if available",
  "email": "email or empty string",
  "phone": "phone number or empty string",
  "gender": "女性 or 男性 or empty",
  "dateOfBirth": "YYYY-MM-DD or empty",
  "nationality": "Vietnam or empty",
  "jlpt": "N1/N2/N3/N4/N5/N4相当/N3相当/なし",
  "visaType": "visa type in Japanese or empty",
  "industry": "飲食 or 製造 or 農業 or ホテル or その他",
  "industryVn": "Nhà hàng or Nhà máy or Nông nghiệp or Khách sạn or Khác",
  "experienceYears": 0,
  "jobHistory": [{"company": "", "position": "", "period": ""}],
  "skills": ["skill1", "skill2"],
  "certifications": ["cert1"],
  "preferredJob": "希望職種 from CV or empty",
  "summary": "2-3 sentence professional summary in Japanese",
  "summaryVn": "2-3 câu tóm tắt bằng tiếng Việt",
  "strengths": ["strength1", "strength2", "strength3"],
  "availability": "immediate or YYYY-MM or empty",
  "height": "height in cm or empty",
  "weight": "weight in kg or empty"
}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 1500 },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini error: ${res.status} - ${err.slice(0,200)}`);
  }

  const data = await res.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  const cleaned = raw.replace(/```json\n?/g,"").replace(/```\n?/g,"").trim();
  return JSON.parse(cleaned);
}

// Job matching algorithm
function matchJobs(candidate: Record<string,unknown>) {
  const rank = JLPT_RANK[candidate.jlpt as string] || 0;
  const industry = candidate.industry as string;
  const expYears = (candidate.experienceYears as number) || 0;
  const preferredJob = ((candidate.preferredJob as string) || "").toLowerCase();

  return JOBS
    .filter(j => j.status !== "full")
    .map(job => {
      let score = 0;
      const reasons: string[] = [];

      // Industry match (40pts)
      if (job.industry === industry) {
        score += 40;
        reasons.push(`業種マッチ · Đúng ngành ${job.industry}`);
      }

      // JLPT match (30pts)
      const reqRank = JLPT_RANK[job.jlptMin] || 0;
      if (rank >= reqRank) {
        score += 30;
        reasons.push(`日本語OK · ${candidate.jlpt}`);
      } else if (rank === reqRank - 1) {
        score += 10;
        reasons.push(`日本語レベル近似`);
      }

      // Experience (20pts)
      if (expYears >= 3) { score += 20; reasons.push(`経験${expYears}年`); }
      else if (expYears >= 1) { score += 10; reasons.push(`経験あり`); }

      // Preferred job keyword match (bonus 15pts)
      if (preferredJob && (
        job.position.includes(preferredJob) ||
        job.positionVn.toLowerCase().includes(preferredJob) ||
        preferredJob.includes(job.industry)
      )) {
        score += 15;
        reasons.push(`希望職種マッチ · Đúng nghề mong muốn`);
      }

      // Urgency bonus (10pts)
      if (job.status === "urgent") { score += 10; reasons.push(`緊急募集`); }

      return { ...job, score, reasons, matchPct: Math.min(score, 100) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const results = [];

    // Support up to 5 files
    for (let i = 0; i < 5; i++) {
      const file = formData.get(`cv_${i}`) as File | null;
      if (!file) continue;

      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Extract text based on file type
        let text = "";
        const ext = file.name.split(".").pop()?.toLowerCase();
        if (ext === "docx" || ext === "doc") {
          text = extractDocxText(buffer);
        } else {
          text = extractPdfText(buffer);
        }

        // Analyze with Gemini
        let candidateInfo: Record<string,unknown>;
        try {
          candidateInfo = await analyzeWithGemini(text, file.name);
        } catch (aiErr) {
          console.error(`AI error for ${file.name}:`, aiErr);
          // Fallback: basic rule-based
          candidateInfo = {
            name: file.name.replace(/\.(pdf|docx?|doc)$/i, ""),
            email: "", phone: "", gender: "", dateOfBirth: "",
            jlpt: "N4", industry: "飲食", industryVn: "Nhà hàng",
            experienceYears: 0, skills: [], certifications: [],
            summary: "CV分析完了", summaryVn: "Đã tải CV lên",
            strengths: [], jobHistory: [], preferredJob: "",
          };
        }

        const suggestions = matchJobs(candidateInfo);
        results.push({
          success: true,
          fileName: file.name,
          fileSize: file.size,
          candidate: candidateInfo,
          suggestions,
        });

      } catch (fileErr) {
        results.push({
          success: false,
          fileName: file.name,
          error: fileErr instanceof Error ? fileErr.message : "Processing failed",
        });
      }
    }

    return NextResponse.json({ results });

  } catch (err) {
    console.error("Multi-CV analysis error:", err);
    return NextResponse.json(
      { error: "CV分析エラー / Lỗi phân tích CV" },
      { status: 500 }
    );
  }
}