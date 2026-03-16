import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 30;

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function extractDocxText(buffer: Buffer): string {
  try {
    const str = buffer.toString("binary");
    const xmlStart = str.indexOf("word/document.xml");
    if (xmlStart === -1) throw new Error("no xml");
    const xmlSection = str.slice(xmlStart, xmlStart + 50000);
    return xmlSection
      .replace(/<[^>]+>/g, " ")
      .replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&")
      .replace(/[^\u0020-\u007E\u00C0-\u024F\u3000-\u9FFF\uFF00-\uFFEF\n]/g," ")
      .replace(/\s+/g," ").trim().slice(0, 8000);
  } catch {
    return buffer.toString("utf-8")
      .replace(/[^\u0020-\u007E\u00C0-\u024F\u3000-\u9FFF\uFF00-\uFFEF\n]/g," ")
      .replace(/\s+/g," ").trim().slice(0, 8000);
  }
}

async function analyzeCV(text: string, fileName: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const prompt = `You are an expert HR data extractor for Aseka株式会社, a Vietnamese staffing agency in Japan.
Extract ALL information from this resume/履歴書 (Japanese, Vietnamese, or mixed format).

CV TEXT:
${text.slice(0, 6000)}

Return ONLY valid JSON (no markdown, no explanation whatsoever):
{
  "name": "Latin name e.g. Nguyen Tien Thanh",
  "name_kana": "Katakana name if present",
  "email": "email or empty",
  "phone": "phone or empty",
  "gender": "男性 or 女性 or empty",
  "date_of_birth": "YYYY-MM-DD or empty",
  "nationality": "Vietnam",
  "address": "address or empty",
  "visa_type": "visa type e.g. 留学 or 技能実習 or 特定技能 or empty",
  "visa_expiry": "YYYY-MM-DD or empty",
  "jlpt": "highest JLPT level found: N1/N2/N3/N4/N5/なし",
  "jlpt_actual": "JLPT as written in CV e.g. JLPT N5 or N3相当",
  "height_cm": null or number,
  "weight_kg": null or number,
  "skill": "main industry: 飲食 or 製造 or 農業 or ホテル or 宿泊業 or IT or その他",
  "preferred_job": "希望職種 from CV or empty",
  "work_hours": "preferred hours or empty",
  "availability": "immediate or YYYY-MM or empty",
  "marital_status": "独身 or 既婚 or empty",
  "dependents": 0,
  "education": [
    {"year": "2015", "month": "04", "school": "School name", "event": "入学 or 卒業 or 在学中"}
  ],
  "work_history": [
    {"year": "2020", "month": "04", "company": "Company name", "position": "Position", "event": "入社 or 退社 or 在職中"}
  ],
  "certifications": [
    {"year": "2021", "month": "09", "name": "Certificate name", "result": "合格 or 取得"}
  ],
  "motivation": "志望動機 text or empty",
  "self_pr": "自己PR text or empty",
  "summary_ja": "2-3 sentence professional summary in Japanese",
  "summary_vn": "2-3 câu tóm tắt bằng tiếng Việt",
  "strengths": ["strength1", "strength2", "strength3"],
  "match_industry": "best matching industry for jobs: 飲食 or 製造 or 農業 or ホテル or その他"
}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 2000 },
      }),
    }
  );

  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text().then(t=>t.slice(0,200))}`);

  const data = await res.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  const cleaned = raw.replace(/```json\n?/g,"").replace(/```\n?/g,"").trim();
  return JSON.parse(cleaned);
}

async function matchJobs(candidate: Record<string, unknown>) {
  const { data: jobs } = await db()
    .from("job_listings")
    .select("id,company,position_ja,position_vn,industry,jlpt_min,salary,location,status,osusume_point,job_description,requirements")
    .not("status","eq","paused");

  if (!jobs || jobs.length === 0) return [];

  const JLPT: Record<string,number> = { N1:5,N2:4,N3:3,N4:2,N5:1,"N3相当":3,"N4相当":2,"なし":0,"":0 };
  const candRank = JLPT[(candidate.jlpt as string)||""] || 0;
  const industry = (candidate.skill as string) || (candidate.match_industry as string) || "";

  // Normalize hotel industry variants
  const normalizeInd = (s: string) => s.includes("ホテル")||s.includes("宿泊") ? "ホテル" : s;
  const candInd = normalizeInd(industry);

  return jobs.map((job: Record<string,string>) => {
    let score = 0;
    const reasons: string[] = [];

    if (normalizeInd(job.industry) === candInd) {
      score += 40; reasons.push(`業種マッチ · Đúng ngành (${job.industry})`);
    }
    const reqRank = JLPT[job.jlpt_min] || 0;
    if (candRank >= reqRank) {
      score += 30; reasons.push(`日本語OK · ${candidate.jlpt} ≥ ${job.jlpt_min}`);
    } else if (candRank === reqRank - 1) {
      score += 15; reasons.push(`日本語近似 · ${candidate.jlpt}`);
    }

    const exp = (candidate.work_history as unknown[])?.length || 0;
    if (exp >= 3) { score += 20; reasons.push(`経験豊富 · ${exp}社の職歴`); }
    else if (exp >= 1) { score += 10; reasons.push(`経験あり · ${exp}社`); }

    const prefJob = (candidate.preferred_job as string || "").toLowerCase();
    if (prefJob && (job.position_ja?.toLowerCase().includes(prefJob) || (job.position_vn||"").toLowerCase().includes(prefJob))) {
      score += 15; reasons.push(`希望職種マッチ · Đúng nghề mong muốn`);
    }
    if (job.status === "urgent") { score += 10; reasons.push(`緊急募集 · Tuyển gấp`); }

    return { ...job, score, reasons, matchPct: Math.min(score, 100) };
  }).sort((a: {score:number}, b: {score:number}) => b.score - a.score).slice(0, 3);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const results = [];

    for (let i = 0; i < 5; i++) {
      const file = formData.get(`cv_${i}`) as File | null;
      if (!file) continue;

      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const ext = file.name.split(".").pop()?.toLowerCase() || "";
        const text = (ext === "docx" || ext === "doc") ? extractDocxText(buffer)
          : buffer.toString("utf-8").replace(/[^\u0020-\u007E\u00C0-\u024F\u3000-\u9FFF\uFF00-\uFFEF\n]/g," ").replace(/\s+/g," ").trim().slice(0, 8000);

        const candidateInfo = await analyzeCV(text, file.name);
        const suggestions = await matchJobs(candidateInfo);

        results.push({ success: true, fileName: file.name, fileSize: file.size, candidate: candidateInfo, suggestions });
      } catch (err) {
        results.push({ success: false, fileName: file.name, error: String(err) });
      }
    }

    return NextResponse.json({ results });
  } catch (err) {
    console.error("analyze-cv error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}