import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import getConfig from "next/config";

const { serverRuntimeConfig } = getConfig() || {};

export const maxDuration = 60;

type GroqResult = { data: unknown[]; error: "no_key" | "rate_limited" | "failed" | null };

async function callGroq(prompt: string): Promise<GroqResult> {
  const apiKey = serverRuntimeConfig?.GROQ_API_KEY || process.env.GROQ_API_KEY;
  if (!apiKey) return { data: [], error: "no_key" };
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 3000,
        reasoning_effort: "low",
      }),
    });
    if (!res.ok) {
      const bodyText = await res.text();
      console.error("Groq matching call failed:", res.status, bodyText);
      return { data: [], error: res.status === 429 ? "rate_limited" : "failed" };
    }
    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || "[]";
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) {
      console.error("Groq matching response had no JSON array:", raw.slice(0, 300));
      return { data: [], error: "failed" };
    }
    try {
      return { data: JSON.parse(match[0]), error: null };
    } catch (e) {
      console.error("Groq matching JSON parse failed (likely truncated):", (e as Error).message, "finish_reason:", data.choices?.[0]?.finish_reason);
      return { data: [], error: "failed" };
    }
  } catch (e) {
    console.error("Groq matching call threw:", e);
    return { data: [], error: "failed" };
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();

    // Match job → find best candidates
    if (body.job) {
      const candidates = await prisma.candidates.findMany({
        where: { NOT: { status: "quit" } },
      });
      if (!candidates.length) return NextResponse.json({ matches: [] });
      const jobInfo = `求人: ${body.job.company} / ${body.job.position_ja} / 業種:${body.job.industry} / 日本語:${body.job.jlpt_min}以上\n${body.job.job_description || ""}\n${body.job.requirements || ""}`;
      const candList = candidates.map((c, i) => `候補者${i + 1}: ID=${c.id} 名前=${c.name} 業種=${c.skill} 日本語=${c.jlpt} 希望職種=${c.preferred_job || "-"} 職歴${(c.work_history as unknown[])?.length || 0}件`).join("\n");
      const topN = Math.min(10, candidates.length);
      // Vietnamese-only reasoning — the admin UI never displays a Japanese reason/note,
      // so asking the model for both languages was pure wasted completion tokens that
      // pushed calls toward Groq's 8000 TPM rate limit for no visible benefit.
      const prompt = `${jobInfo}\n\n候補者一覧(${candidates.length}名):\n${candList}\n\n` +
        `必ず上位${topN}名を、マッチ度が高い順にJSONで返してください(no markdown, only JSON array)。マッチ度が低い候補者も省略せず低いスコアのまま含めてください。件数は必ず${topN}件にしてください。理由・コメントはベトナム語のみで簡潔に。\n` +
        `各候補者について、業種(industry)・日本語レベル(language)・経験(experience)の3つの観点で0-100点の評価とひとことコメント(ベトナム語)を付けてください。\n` +
        `形式: [{"candidateId":"uuid","candidateName":"name","matchPct":85,"reasonVn":"Lý do tổng hợp ngắn gọn","strengths":["s1","s2"],"breakdown":[{"criterion":"業種","score":90,"noteVn":"..."},{"criterion":"日本語","score":100,"noteVn":"..."},{"criterion":"経験","score":60,"noteVn":"..."}]}]`;
      const { data: arr, error } = await callGroq(prompt) as { data: Array<{ candidateId: string; candidateName: string; matchPct: number; reasonVn: string; strengths: string[]; breakdown?: Array<{ criterion:string; score:number; noteVn:string }> }>; error: GroqResult["error"] };
      const matches = arr
        .map(m => ({ ...m, candidate: candidates.find(c => c.id === m.candidateId) || null }))
        .filter(m => m.candidate)
        .sort((a, b) => b.matchPct - a.matchPct)
        .slice(0, 10);
      return NextResponse.json({ matches, error: matches.length === 0 ? error : null });
    }

    // Match candidate → find best jobs
    if (body.candidateId) {
      const cand = await prisma.candidates.findUnique({ where: { id: body.candidateId } });
      if (!cand) return NextResponse.json({ matches: [] });
      const jobs = await prisma.job_listings.findMany({ where: { NOT: { status: "paused" } } });
      if (!jobs.length) return NextResponse.json({ matches: [] });
      const candInfo = `候補者: ${cand.name} / 業種:${cand.skill} / 日本語:${cand.jlpt} / 希望:${cand.preferred_job || ""}\n職歴:${JSON.stringify(cand.work_history || []).slice(0, 200)}\n資格:${JSON.stringify(cand.certifications || []).slice(0, 100)}`;
      const jobList = jobs.map((j, i) => `求人${i + 1}: ID=${j.id} 会社=${j.company} 職種=${j.position_ja} 業種=${j.industry} 日本語${j.jlpt_min}以上${j.status === "urgent" ? " 緊急" : ""}`).join("\n");
      const topN = Math.min(10, jobs.length);
      const prompt = `${candInfo}\n\n求人一覧(${jobs.length}件):\n${jobList}\n\n` +
        `必ず上位${topN}件を、マッチ度が高い順にJSONで返してください(no markdown, only JSON array)。マッチ度が低い求人も省略せず低いスコアのまま含めてください。件数は必ず${topN}件にしてください。理由・コメントはベトナム語のみで簡潔に。\n` +
        `各求人について、業種(industry)・日本語レベル(language)・経験(experience)の3つの観点で0-100点の評価とひとことコメント(ベトナム語)を付けてください。\n` +
        `形式: [{"jobId":"uuid","company":"name","position_vn":"vn","location":"loc","salary":"sal","status":"open","matchPct":85,"reasonVn":"Lý do tổng hợp ngắn gọn","strengths":["s1"],"breakdown":[{"criterion":"業種","score":90,"noteVn":"..."},{"criterion":"日本語","score":100,"noteVn":"..."},{"criterion":"経験","score":60,"noteVn":"..."}]}]`;
      const { data: arr, error } = await callGroq(prompt) as { data: Array<{ jobId: string; company: string; position_vn: string; location: string; salary: string; status: string; matchPct: number; reasonVn: string; strengths: string[]; breakdown?: Array<{ criterion:string; score:number; noteVn:string }> }>; error: GroqResult["error"] };
      const matches = arr
        .map(m => { const job = jobs.find(j => j.id === m.jobId); return job ? { ...job, ...m, matchPct: m.matchPct, reasons: [m.reasonVn] } : null; })
        .filter((m): m is NonNullable<typeof m> => m !== null)
        .sort((a, b) => b.matchPct - a.matchPct)
        .slice(0, 10);
      return NextResponse.json({ matches, error: matches.length === 0 ? error : null });
    }

    return NextResponse.json({ matches: [] });
  } catch (err) {
    console.error("match error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
