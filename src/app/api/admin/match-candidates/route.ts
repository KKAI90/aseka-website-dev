import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/adminAuth";

export const maxDuration = 60;

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function callGroq(prompt: string): Promise<unknown[]> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return [];
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 1000,
      }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || "[]";
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) return [];
    return JSON.parse(match[0]);
  } catch { return []; }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();

    // Match job → find best candidates
    if (body.job) {
      const { data: candidates } = await db().from("candidates").select("*").not("status","eq","quit");
      if (!candidates?.length) return NextResponse.json({ matches: [] });
      const jobInfo = `求人: ${body.job.company} / ${body.job.position_ja} / 業種:${body.job.industry} / 日本語:${body.job.jlpt_min}以上\n${body.job.job_description||""}\n${body.job.requirements||""}`;
      const candList = candidates.map((c,i) => `候補者${i+1}: ID=${c.id} 名前=${c.name} 業種=${c.skill} 日本語=${c.jlpt} 職歴${(c.work_history as unknown[])?.length||0}件`).join("\n");
      const prompt = `${jobInfo}\n\n候補者一覧:\n${candList}\n\nTOP3をJSONで(no markdown, only JSON array): [{"candidateId":"uuid","candidateName":"name","matchPct":85,"reasonJa":"理由","reasonVn":"Lý do","strengths":["s1"]}]`;
      const arr = await callGroq(prompt) as Array<{candidateId:string;candidateName:string;matchPct:number;reasonJa:string;reasonVn:string;strengths:string[]}>;
      const matches = arr.map(m => ({ ...m, candidate: candidates.find(c=>c.id===m.candidateId)||null })).filter(m=>m.candidate);
      return NextResponse.json({ matches });
    }

    // Match candidate → find best jobs
    if (body.candidateId) {
      const { data: cand } = await db().from("candidates").select("*").eq("id", body.candidateId).single();
      if (!cand) return NextResponse.json({ matches: [] });
      const { data: jobs } = await db().from("job_listings").select("*").not("status","eq","paused");
      if (!jobs?.length) return NextResponse.json({ matches: [] });
      const candInfo = `候補者: ${cand.name} / 業種:${cand.skill} / 日本語:${cand.jlpt} / 希望:${cand.preferred_job||""}\n職歴:${JSON.stringify(cand.work_history||[]).slice(0,200)}\n資格:${JSON.stringify(cand.certifications||[]).slice(0,100)}`;
      const jobList = jobs.map((j,i) => `求人${i+1}: ID=${j.id} 会社=${j.company} 職種=${j.position_ja} 業種=${j.industry} 日本語${j.jlpt_min}以上${j.status==="urgent"?" 緊急":""}`).join("\n");
      const prompt = `${candInfo}\n\n求人一覧:\n${jobList}\n\nこの候補者に最適なTOP3求人をJSONで(no markdown, only JSON array): [{"jobId":"uuid","company":"name","position_vn":"vn","location":"loc","salary":"sal","status":"open","matchPct":85,"reasonJa":"理由","reasonVn":"Lý do","strengths":["s1"],"reasons":["r1"]}]`;
      const arr = await callGroq(prompt) as Array<{jobId:string;company:string;position_vn:string;location:string;salary:string;status:string;matchPct:number;reasonJa:string;reasonVn:string;strengths:string[];reasons:string[]}>;
      const matches = arr.map(m => { const job = jobs.find(j=>j.id===m.jobId); return job ? {...job,...m,matchPct:m.matchPct,reasons:[m.reasonVn]} : null; }).filter(Boolean);
      return NextResponse.json({ matches });
    }

    return NextResponse.json({ matches: [] });
  } catch (err) {
    console.error("match error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
