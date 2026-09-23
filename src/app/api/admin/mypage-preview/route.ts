import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, apiError } from "@/lib/adminAuth";
import { computeMypageJobList } from "@/lib/mypageJobMatching";

// Shows admin EXACTLY what a given candidate currently sees on their own mypage "紹介求人"
// list — same computeMypageJobList() the candidate-facing route calls, so there's no risk
// of this drifting from reality the way a separate AI-judged matching tool would.
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, ["superadmin"]);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const candidateId = searchParams.get("candidateId");
  if (!candidateId) return apiError("candidateId is required", 400);

  const result = await computeMypageJobList(candidateId, { limit: 10 });
  if (!result) return apiError("Candidate not found", 404);

  const shownIds = new Set(result.jobs.map(j => j.id));
  // Everything that scored but didn't make the cut — this is the pool an admin picks from
  // to manually force a job onto the candidate's list. Jobs the candidate would never see
  // anyway (paused, or "full" without being their own applied job) are already absent from
  // allScored's source query, except "full" ones specifically stay in allScored so staff can
  // still see/reference them here — just flagged via their own `status` field.
  const notShown = result.allScored.filter(j => !shownIds.has(j.id));

  return NextResponse.json({
    shownJobs: result.jobs,
    notShownJobs: notShown,
    candidateSummary: result.candidateSummary,
  });
}
