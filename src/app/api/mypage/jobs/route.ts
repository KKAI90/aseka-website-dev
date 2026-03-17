import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// JLPT level → numeric rank (lower = higher skill)
const jlptRank: Record<string, number> = { N1:1, N2:2, N3:3, N4:4, N5:5 };

export async function GET(req: NextRequest) {
  const id = req.cookies.get("mypage-id")?.value;
  if (!id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = db();

  // Get candidate profile
  const { data: cand } = await supabase
    .from("candidates")
    .select("skill,jlpt,preferred_job")
    .eq("id", id)
    .single();

  if (!cand) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Get all active jobs
  const { data: jobs } = await supabase
    .from("job_listings")
    .select("id,company,position_ja,position_vn,industry,jlpt_min,salary,location,status,job_description,requirements,created_at,updated_at")
    .neq("status", "paused")
    .order("created_at", { ascending: false });

  const allJobs = jobs || [];

  // Score each job
  const candJlptRank = jlptRank[cand.jlpt] ?? 5;

  const scored = allJobs.map(j => {
    let score = 0;

    // JLPT: candidate must meet minimum requirement
    const reqRank = jlptRank[j.jlpt_min] ?? 5;
    if (candJlptRank <= reqRank) score += 30; // meets requirement
    if (candJlptRank < reqRank) score += 10;  // exceeds requirement (bonus)

    // Industry / skill match
    const candSkill = (cand.skill || "").toLowerCase();
    const jobInd   = (j.industry || "").toLowerCase();
    if (candSkill && jobInd && jobInd.includes(candSkill)) score += 40;
    else if (candSkill && jobInd && candSkill.includes(jobInd)) score += 20;

    // Preferred job keyword match
    const pref = (cand.preferred_job || "").toLowerCase();
    const pos  = (j.position_ja || "").toLowerCase();
    if (pref && pos && (pos.includes(pref) || pref.includes(pos))) score += 20;

    // Urgent bonus
    if (j.status === "urgent") score += 5;

    return { ...j, matchScore: score, isNew: isNewJob(j.created_at) };
  });

  // Sort: by score desc, then urgent, then newest
  scored.sort((a, b) => b.matchScore - a.matchScore || (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));

  return NextResponse.json({ jobs: scored });
}

function isNewJob(created_at: string) {
  const d = new Date(created_at);
  return (Date.now() - d.getTime()) < 1000 * 60 * 60 * 24 * 7; // within 7 days
}
