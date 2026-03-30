import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export const maxDuration = 60;

async function analyzeWithGroq(text: string) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not set");

  const prompt = `You are an expert HR data extractor for Aseka株式会社.
Extract ALL information from this resume text (Japanese/Vietnamese/mixed).
Return ONLY valid JSON (no markdown, no explanation):
{
  "name": "Latin name",
  "name_kana": "Katakana if present",
  "email": "or empty",
  "phone": "or empty",
  "gender": "男性 or 女性 or empty",
  "date_of_birth": "YYYY-MM-DD or empty",
  "nationality": "Vietnam",
  "address": "or empty",
  "visa_type": "留学 or 技能実習 or 特定技能 or empty",
  "visa_expiry": "YYYY-MM-DD or empty",
  "jlpt": "N1/N2/N3/N4/N5/なし",
  "jlpt_actual": "as written in CV",
  "height_cm": null,
  "weight_kg": null,
  "skill": "飲食 or 製造 or 農業 or ホテル or 宿泊業 or IT or その他",
  "preferred_job": "希望職種 or empty",
  "work_hours": "or empty",
  "availability": "immediate or YYYY-MM or empty",
  "marital_status": "独身 or 既婚 or empty",
  "dependents": 0,
  "education": [{"year":"2015","month":"04","school":"name","event":"入学 or 卒業"}],
  "work_history": [{"year":"2020","month":"04","company":"name","position":"role","event":"入社 or 退社"}],
  "certifications": [{"year":"2021","month":"09","name":"cert name","result":"合格"}],
  "motivation": "志望動機 text or empty",
  "self_pr": "自己PR text or empty",
  "summary_ja": "2-3 sentences in Japanese",
  "summary_vn": "2-3 câu tiếng Việt",
  "strengths": ["s1","s2","s3"],
  "match_industry": "飲食 or 製造 or 農業 or ホテル or その他"
}

CV TEXT:
${text.slice(0, 5000)}`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 2000,
    }),
  });

  if (res.status === 429) {
    const body = await res.text();
    throw new Error(`RATE_LIMITED: ${body.slice(0, 100)}`);
  }
  if (!res.ok) throw new Error(`Groq ${res.status}: ${(await res.text()).slice(0, 200)}`);

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || "{}";
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Groq returned no JSON");
  return JSON.parse(match[0]);
}

async function matchJobs(candidate: Record<string, unknown>) {
  const jobs = await prisma.job_listings.findMany({
    where: { NOT: { status: "paused" } },
    select: { id: true, company: true, position_ja: true, position_vn: true, industry: true, jlpt_min: true, salary: true, location: true, status: true },
  });

  if (!jobs.length) return [];

  const JLPT: Record<string, number> = { N1: 5, N2: 4, N3: 3, N4: 2, N5: 1, "N3相当": 3, "N4相当": 2, "なし": 0, "": 0 };
  const candRank = JLPT[(candidate.jlpt as string) || ""] || 0;
  const normalizeInd = (s: string) => s?.includes("ホテル") || s?.includes("宿泊") ? "ホテル" : s;
  const candInd = normalizeInd((candidate.skill || candidate.match_industry) as string);

  return jobs.map(job => {
    let score = 0; const reasons: string[] = [];
    if (normalizeInd(job.industry ?? "") === candInd) { score += 40; reasons.push(`業種マッチ · Đúng ngành (${job.industry})`); }
    const reqRank = JLPT[job.jlpt_min ?? ""] || 0;
    if (candRank >= reqRank) { score += 30; reasons.push(`日本語OK · ${candidate.jlpt}≥${job.jlpt_min}`); }
    else if (candRank === reqRank - 1) { score += 15; reasons.push(`日本語近似`); }
    const expCount = (candidate.work_history as unknown[])?.length || 0;
    if (expCount >= 3) { score += 20; reasons.push(`経験${expCount}社`); }
    else if (expCount >= 1) { score += 10; reasons.push(`経験あり`); }
    const pref = (candidate.preferred_job as string || "").toLowerCase();
    if (pref && (job.position_ja?.toLowerCase().includes(pref) || (job.position_vn || "").toLowerCase().includes(pref))) { score += 15; reasons.push(`希望職種マッチ`); }
    if (job.status === "urgent") { score += 10; reasons.push(`緊急募集`); }
    return { ...job, score, reasons, matchPct: Math.min(score, 100) };
  }).sort((a, b) => b.score - a.score).slice(0, 3);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const results = [];

    for (const item of (body.files || [])) {
      try {
        const candidateInfo = await analyzeWithGroq(item.text || "");
        const suggestions = await matchJobs(candidateInfo);
        results.push({
          success: true,
          fileName: item.fileName,
          fileSize: item.fileSize || 0,
          candidate: candidateInfo,
          suggestions,
        });
      } catch (err) {
        const errStr = String(err);
        console.error(`analyze-cv error [${item.fileName}]:`, err);
        results.push({
          success: false,
          fileName: item.fileName,
          error: errStr,
          rateLimited: errStr.includes("RATE_LIMITED"),
        });
      }
    }

    return NextResponse.json({ results });
  } catch (err) {
    console.error("analyze-cv error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
