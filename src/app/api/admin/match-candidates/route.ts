import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { calcExperienceMonths, formatExperienceJa } from "@/lib/experience";
import getConfig from "next/config";

const { serverRuntimeConfig } = getConfig() || {};

export const maxDuration = 60;

type GroqResult = { data: unknown[]; error: "no_key" | "rate_limited" | "failed" | null };
type Breakdown = { criterion: string; score: number; noteVn: string };

// Priority order requested: JLPT (日本語) → Kinh nghiệm (経験) → Ngành (業種) → Nội dung (内容).
// A decreasing-weight composite is the standard way to make a *ranking* actually respect a
// stated priority order — asking the model to "prioritize in this order" alone doesn't
// reliably produce a consistent sort, so we recompute matchPct ourselves from the model's
// own per-criterion scores instead of trusting its holistic matchPct for the final order.
const CRITERIA_WEIGHTS: Record<string, number> = { "日本語": 40, "経験": 30, "業種": 20, "内容": 10 };

function weightedScore(breakdown?: Breakdown[]): number | null {
  if (!breakdown || breakdown.length === 0) return null;
  let sum = 0, weightUsed = 0;
  for (const b of breakdown) {
    const w = CRITERIA_WEIGHTS[b.criterion];
    if (w === undefined) continue;
    sum += b.score * w;
    weightUsed += w;
  }
  if (weightUsed === 0) return null;
  // Re-normalize in case a criterion was missing from the model's response, so a partial
  // breakdown still yields a fair 0-100 score instead of one silently deflated by the gap.
  return Math.round(sum / weightUsed);
}

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

const PRIORITY_INSTRUCTION =
  "評価は必ず「日本語レベル → 経験 → 業種 → 内容」の優先順位で行ってください。" +
  "つまり日本語レベルの適合を最も重視し、次に実務経験、その次に業種一致、内容(職務内容/希望との一致)は最後の判断材料としてください。";

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
      const jobInfo = `求人: ${body.job.company} / ${body.job.position_ja} / 業種:${body.job.industry} / 日本語:${body.job.jlpt_min}以上\n内容: ${body.job.job_description || body.job.position_note || "(記載なし)"}\n要件: ${body.job.requirements || "(記載なし)"}`;
      const candList = candidates.map((c, i) => {
        const expJa = formatExperienceJa(calcExperienceMonths(c.work_history as { year?:string; month?:string; event?:string }[])) || "経験なし・未記載";
        return `候補者${i + 1}: ID=${c.id} 名前=${c.name} 日本語=${c.jlpt} 経験=${expJa} 業種=${c.skill} 希望職種=${c.preferred_job || "-"}`;
      }).join("\n");
      const topN = Math.min(10, candidates.length);
      // Vietnamese-only reasoning — the admin UI never displays a Japanese reason/note,
      // so asking the model for both languages was pure wasted completion tokens that
      // pushed calls toward Groq's 8000 TPM rate limit for no visible benefit.
      const prompt = `${jobInfo}\n\n候補者一覧(${candidates.length}名):\n${candList}\n\n` +
        `必ず上位${topN}名をJSONで返してください(no markdown, only JSON array)。マッチ度が低い候補者も省略せず低いスコアのまま含めてください。件数は必ず${topN}件にしてください。理由・コメントはベトナム語のみで簡潔に。\n` +
        `${PRIORITY_INSTRUCTION}\n` +
        `各候補者について、日本語レベル(criterion="日本語")・経験(criterion="経験")・業種(criterion="業種")・内容(criterion="内容")の4項目それぞれ0-100点の評価とひとことコメント(ベトナム語)を、この順番でbreakdown配列に入れてください。\n` +
        `形式: [{"candidateId":"uuid","candidateName":"name","matchPct":85,"reasonVn":"Lý do tổng hợp ngắn gọn","strengths":["s1","s2"],"breakdown":[{"criterion":"日本語","score":100,"noteVn":"..."},{"criterion":"経験","score":80,"noteVn":"..."},{"criterion":"業種","score":90,"noteVn":"..."},{"criterion":"内容","score":60,"noteVn":"..."}]}]`;
      const { data: arr, error } = await callGroq(prompt) as { data: Array<{ candidateId: string; candidateName: string; matchPct: number; reasonVn: string; strengths: string[]; breakdown?: Breakdown[] }>; error: GroqResult["error"] };
      const matches = arr
        .map(m => ({ ...m, matchPct: weightedScore(m.breakdown) ?? m.matchPct, candidate: candidates.find(c => c.id === m.candidateId) || null }))
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
      const expJa = formatExperienceJa(calcExperienceMonths(cand.work_history as { year?:string; month?:string; event?:string }[])) || "経験なし・未記載";
      const candInfo = `候補者: ${cand.name} / 日本語:${cand.jlpt} / 経験:${expJa} / 業種:${cand.skill} / 希望:${cand.preferred_job || ""}\n職歴:${JSON.stringify(cand.work_history || []).slice(0, 200)}\n資格:${JSON.stringify(cand.certifications || []).slice(0, 100)}`;
      const jobList = jobs.map((j, i) => `求人${i + 1}: ID=${j.id} 会社=${j.company} 職種=${j.position_ja} 業種=${j.industry} 日本語${j.jlpt_min}以上${j.status === "urgent" ? " 緊急" : ""} 内容:${(j.job_description || j.position_note || "").slice(0, 80)}`).join("\n");
      const topN = Math.min(10, jobs.length);
      const prompt = `${candInfo}\n\n求人一覧(${jobs.length}件):\n${jobList}\n\n` +
        `必ず上位${topN}件をJSONで返してください(no markdown, only JSON array)。マッチ度が低い求人も省略せず低いスコアのまま含めてください。件数は必ず${topN}件にしてください。理由・コメントはベトナム語のみで簡潔に。\n` +
        `${PRIORITY_INSTRUCTION}\n` +
        `各求人について、日本語レベル(criterion="日本語")・経験(criterion="経験")・業種(criterion="業種")・内容(criterion="内容")の4項目それぞれ0-100点の評価とひとことコメント(ベトナム語)を、この順番でbreakdown配列に入れてください。\n` +
        `形式: [{"jobId":"uuid","company":"name","position_vn":"vn","location":"loc","salary":"sal","status":"open","matchPct":85,"reasonVn":"Lý do tổng hợp ngắn gọn","strengths":["s1"],"breakdown":[{"criterion":"日本語","score":100,"noteVn":"..."},{"criterion":"経験","score":80,"noteVn":"..."},{"criterion":"業種","score":90,"noteVn":"..."},{"criterion":"内容","score":60,"noteVn":"..."}]}]`;
      const { data: arr, error } = await callGroq(prompt) as { data: Array<{ jobId: string; company: string; position_vn: string; location: string; salary: string; status: string; matchPct: number; reasonVn: string; strengths: string[]; breakdown?: Breakdown[] }>; error: GroqResult["error"] };
      const matches = arr
        .map(m => { const job = jobs.find(j => j.id === m.jobId); return job ? { ...job, ...m, matchPct: weightedScore(m.breakdown) ?? m.matchPct, reasons: [m.reasonVn] } : null; })
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
