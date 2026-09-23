import { prisma } from "@/lib/prisma";

// Single source of truth for "which jobs does this candidate see on their mypage
// dashboard" — used by BOTH the candidate-facing /api/mypage/jobs route AND the
// admin-facing preview route (/api/admin/mypage-preview). Extracted specifically so the
// two can never drift apart: before this, admin only had a *separate* AI-judged matching
// tool (Groq-based, different scoring entirely) with no way to see the real, live list a
// given candidate is actually looking at right now.

const jlptRank: Record<string, number> = { N1: 1, N2: 2, N3: 3, N4: 4, N5: 5 };

export type JobScoreBreakdown = {
  jlpt: number;
  industry: number;
  preferredPosition: number;
  urgent: number;
};

export type OverrideType = "include" | "exclude";

const JOB_SELECT = {
  id: true, company: true, position_ja: true, position_vn: true,
  industry: true, jlpt_min: true, salary: true, location: true,
  status: true, job_description: true, requirements: true,
  osusume_point: true, position_name: true, position_note: true,
  qualifications: true, language_skills: true, education_req: true,
  work_location: true, selection_process: true, work_environment: true,
  annual_income: true, salary_type: true, salary_note: true,
  employment_type: true, visa_type: true, work_hours: true, trial_period: true,
  insurance: true, holidays: true, remarks: true, count: true,
  translations: true,
  created_at: true, updated_at: true,
} as const;

/**
 * Computes the ranked job list for one candidate's mypage — same scoring formula that's
 * always driven this (JLPT fit, industry text match, preferred-position text match, urgent
 * bonus), now override-aware:
 *   - "include": staff forces this job into the list regardless of score, and regardless of
 *     "full" (充足) status — same treatment the candidate's own applied job already got.
 *   - "exclude": staff hides this job from this candidate specifically, regardless of score.
 * A job can only carry one override at a time (DB unique constraint on candidate+job), so
 * include/exclude can never contradict each other for the same pair.
 */
export async function computeMypageJobList(candidateId: string, opts?: { limit?: number }) {
  const limit = opts?.limit ?? 10;

  const cand = await prisma.candidates.findUnique({
    where: { id: candidateId },
    select: { skill: true, jlpt: true, preferred_job: true, match_job_id: true },
  });
  if (!cand) return null;

  const [jobs, favs, overrides] = await Promise.all([
    prisma.job_listings.findMany({
      where: { NOT: { status: "paused" } },
      select: JOB_SELECT,
      orderBy: { created_at: "desc" },
    }),
    prisma.mypage_favorites.findMany({ where: { candidate_id: candidateId }, select: { job_id: true } }),
    prisma.mypage_job_overrides.findMany({ where: { candidate_id: candidateId } }),
  ]);
  const favSet = new Set(favs.map(f => f.job_id));
  const overrideMap = new Map(overrides.map(o => [o.job_id, o.type as OverrideType]));

  const candJlptRank = jlptRank[cand.jlpt ?? ""] ?? 5;

  const scored = jobs.map(j => {
    const breakdown: JobScoreBreakdown = { jlpt: 0, industry: 0, preferredPosition: 0, urgent: 0 };

    const reqRank = jlptRank[j.jlpt_min ?? ""] ?? 5;
    if (candJlptRank <= reqRank) breakdown.jlpt += 30;
    if (candJlptRank < reqRank) breakdown.jlpt += 10;

    const candSkill = (cand.skill || "").toLowerCase();
    const jobInd = (j.industry || "").toLowerCase();
    if (candSkill && jobInd && jobInd.includes(candSkill)) breakdown.industry = 40;
    else if (candSkill && jobInd && candSkill.includes(jobInd)) breakdown.industry = 20;

    const pref = (cand.preferred_job || "").toLowerCase();
    const pos = (j.position_ja || "").toLowerCase();
    if (pref && pos && (pos.includes(pref) || pref.includes(pos))) breakdown.preferredPosition = 20;

    if (j.status === "urgent") breakdown.urgent = 5;

    const matchScore = breakdown.jlpt + breakdown.industry + breakdown.preferredPosition + breakdown.urgent;
    const isNew = (Date.now() - new Date(j.created_at).getTime()) < 1000 * 60 * 60 * 24 * 7;

    return {
      ...j,
      created_at: j.created_at.toISOString(),
      updated_at: j.updated_at?.toISOString() ?? null,
      matchScore,
      scoreBreakdown: breakdown,
      isNew,
      isFavorite: favSet.has(j.id),
      isApplied: cand.match_job_id === j.id,
      overrideType: overrideMap.get(j.id) ?? null,
    };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore || (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));

  const excludeSet = new Set(
    Array.from(overrideMap.entries()).filter(([, t]) => t === "exclude").map(([jid]) => jid)
  );
  const includeIds = Array.from(overrideMap.entries()).filter(([, t]) => t === "include").map(([jid]) => jid);

  // 1. The candidate's actual assigned/applied job — always shown first, bypasses "full"
  //    and exclude (this represents a real application already in motion).
  const appliedJob = cand.match_job_id ? scored.find(j => j.id === cand.match_job_id) : undefined;

  // 2. Staff-forced includes — bypass score and "full", but a "paused" job never reaches
  //    `scored` at all (filtered at the query), so pause still wins over a manual include.
  const manuallyIncluded = includeIds
    .map(jid => scored.find(j => j.id === jid))
    .filter((j): j is NonNullable<typeof j> => Boolean(j) && j!.id !== cand.match_job_id);

  // 3. The natural score-ranked pool fills whatever slots remain.
  const placedIds = new Set([cand.match_job_id, ...manuallyIncluded.map(j => j.id)].filter(Boolean));
  const rest = scored.filter(j => !placedIds.has(j.id) && j.status !== "full" && !excludeSet.has(j.id));

  const pinned = [appliedJob, ...manuallyIncluded].filter((j): j is NonNullable<typeof j> => Boolean(j));
  const fillCount = Math.max(0, limit - pinned.length);
  const list = [...pinned, ...rest.slice(0, fillCount)];

  return {
    jobs: list,
    // Full score-sorted pool (everything, not just the N slots that made the cut) — the
    // candidate-facing route ignores this, but the admin preview route uses it to build a
    // "these jobs did NOT make the list" picker for manually adding one.
    allScored: scored,
    candidateSummary: { skill: cand.skill, jlpt: cand.jlpt, preferred_job: cand.preferred_job },
  };
}

export async function setMypageJobOverride(
  candidateId: string,
  jobId: string,
  type: OverrideType,
  opts?: { note?: string; createdBy?: string }
) {
  return prisma.mypage_job_overrides.upsert({
    where: { candidate_id_job_id: { candidate_id: candidateId, job_id: jobId } },
    update: { type, note: opts?.note, created_by: opts?.createdBy },
    create: { candidate_id: candidateId, job_id: jobId, type, note: opts?.note, created_by: opts?.createdBy },
  });
}

export async function clearMypageJobOverride(candidateId: string, jobId: string) {
  return prisma.mypage_job_overrides.deleteMany({ where: { candidate_id: candidateId, job_id: jobId } });
}
