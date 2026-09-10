import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const jlptRank: Record<string, number> = { N1: 1, N2: 2, N3: 3, N4: 4, N5: 5 };

export async function GET(req: NextRequest) {
  const id = req.cookies.get("mypage-id")?.value;
  if (!id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cand = await prisma.candidates.findUnique({
    where: { id },
    select: { skill: true, jlpt: true, preferred_job: true, match_job_id: true },
  });

  if (!cand) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [jobs, favs] = await Promise.all([
    prisma.job_listings.findMany({
      where: { NOT: { status: "paused" } },
      select: {
        id: true, company: true, position_ja: true, position_vn: true,
        industry: true, jlpt_min: true, salary: true, location: true,
        status: true, job_description: true, requirements: true,
        osusume_point: true, position_name: true, position_note: true,
        qualifications: true, language_skills: true, education_req: true,
        work_location: true, selection_process: true, work_environment: true,
        annual_income: true, salary_type: true, salary_note: true,
        employment_type: true, visa_type: true, work_hours: true, trial_period: true,
        insurance: true, holidays: true, remarks: true, count: true,
        created_at: true, updated_at: true,
      },
      orderBy: { created_at: "desc" },
    }),
    prisma.mypage_favorites.findMany({ where: { candidate_id: id }, select: { job_id: true } }),
  ]);
  const favSet = new Set(favs.map(f => f.job_id));

  const candJlptRank = jlptRank[cand.jlpt ?? ""] ?? 5;

  const scored = jobs.map(j => {
    let score = 0;
    const reqRank = jlptRank[j.jlpt_min ?? ""] ?? 5;
    if (candJlptRank <= reqRank) score += 30;
    if (candJlptRank < reqRank) score += 10;

    const candSkill = (cand.skill || "").toLowerCase();
    const jobInd = (j.industry || "").toLowerCase();
    if (candSkill && jobInd && jobInd.includes(candSkill)) score += 40;
    else if (candSkill && jobInd && candSkill.includes(jobInd)) score += 20;

    const pref = (cand.preferred_job || "").toLowerCase();
    const pos = (j.position_ja || "").toLowerCase();
    if (pref && pos && (pos.includes(pref) || pref.includes(pos))) score += 20;

    if (j.status === "urgent") score += 5;

    const isNew = (Date.now() - new Date(j.created_at).getTime()) < 1000 * 60 * 60 * 24 * 7;
    return { ...j, created_at: j.created_at.toISOString(), updated_at: j.updated_at?.toISOString() ?? null, matchScore: score, isNew, isFavorite: favSet.has(j.id), isApplied: cand.match_job_id === j.id };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore || (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));

  // TOP 10 best-matching jobs — "mới/tất cả" filters narrow within this set on the client.
  // The job an admin has explicitly assigned (match_job_id) must always be visible here —
  // otherwise a manually-pushed job could silently never appear if it didn't also score
  // well enough to land in a plain top-10-by-score slice. Pin it first, then fill the rest.
  const appliedJob = cand.match_job_id ? scored.find(j => j.id === cand.match_job_id) : undefined;
  const rest = scored.filter(j => j.id !== cand.match_job_id);
  const top10 = appliedJob ? [appliedJob, ...rest.slice(0, 9)] : rest.slice(0, 10);

  return NextResponse.json({ jobs: top10 });
}
