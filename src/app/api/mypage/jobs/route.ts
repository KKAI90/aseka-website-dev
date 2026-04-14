import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const jlptRank: Record<string, number> = { N1: 1, N2: 2, N3: 3, N4: 4, N5: 5 };

export async function GET(req: NextRequest) {
  const id = req.cookies.get("mypage-id")?.value;
  if (!id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cand = await prisma.candidates.findUnique({
    where: { id },
    select: { skill: true, jlpt: true, preferred_job: true },
  });

  if (!cand) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const jobs = await prisma.job_listings.findMany({
    where: { NOT: { status: "paused" } },
    select: {
      id: true, company: true, position_ja: true, position_vn: true,
      industry: true, jlpt_min: true, salary: true, location: true,
      status: true, job_description: true, requirements: true,
      created_at: true, updated_at: true,
    },
    orderBy: { created_at: "desc" },
  });

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
    return { ...j, created_at: j.created_at.toISOString(), updated_at: j.updated_at?.toISOString() ?? null, matchScore: score, isNew };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore || (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));

  return NextResponse.json({ jobs: scored });
}
