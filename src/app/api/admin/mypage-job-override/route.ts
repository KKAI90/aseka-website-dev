import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, apiError } from "@/lib/adminAuth";
import { setMypageJobOverride, clearMypageJobOverride, type OverrideType } from "@/lib/mypageJobMatching";

// "include": force this job onto the candidate's mypage list regardless of match score.
// "exclude": hide this job from the candidate's mypage list regardless of score — e.g.
// staff judges it unsuitable for a reason the scoring formula can't see.
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req, ["superadmin"]);
  if (auth instanceof NextResponse) return auth;
  const adminEmail = auth; // requireAdmin resolves to the caller's email on success

  try {
    const { candidateId, jobId, type, note } = await req.json();
    if (!candidateId || !jobId) return apiError("candidateId and jobId are required", 400);
    if (type !== "include" && type !== "exclude") return apiError("type must be \"include\" or \"exclude\"", 400);

    const data = await setMypageJobOverride(candidateId, jobId, type as OverrideType, {
      note: typeof note === "string" ? note : undefined,
      createdBy: adminEmail,
    });
    return NextResponse.json({ data });
  } catch (err) {
    console.error("mypage-job-override POST error:", err);
    return apiError("サーバーエラーが発生しました");
  }
}

// Removes an override — the job goes back to being ranked purely by its natural score,
// same as any other job.
export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req, ["superadmin"]);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const candidateId = searchParams.get("candidateId");
  const jobId = searchParams.get("jobId");
  if (!candidateId || !jobId) return apiError("candidateId and jobId are required", 400);

  await clearMypageJobOverride(candidateId, jobId);
  return NextResponse.json({ success: true });
}
