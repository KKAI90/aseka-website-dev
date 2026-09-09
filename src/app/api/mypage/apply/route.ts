import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Candidate applies to a job from mypage. Writes to the same
// match_job_id / match_job_name fields the admin Candidates page reads
// (colMatch / 選考状況 tab), so it shows up on the admin side immediately —
// this is the single active "pipeline" job for the candidate, matching
// the existing one-track-at-a-time recruiting model.
export async function POST(req: NextRequest) {
  const id = req.cookies.get("mypage-id")?.value;
  if (!id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { jobId } = await req.json();
    if (!jobId) return NextResponse.json({ error: "jobId is required" }, { status: 400 });

    const job = await prisma.job_listings.findUnique({ where: { id: jobId }, select: { id: true, company: true, status: true } });
    if (!job) return NextResponse.json({ error: "求人が見つかりません / Không tìm thấy việc làm" }, { status: 404 });
    if (job.status === "paused") return NextResponse.json({ error: "この求人は現在募集していません / Việc làm này hiện đã dừng tuyển" }, { status: 400 });

    await prisma.candidates.update({
      where: { id },
      data: { match_job_id: job.id, match_job_name: job.company },
    });

    return NextResponse.json({ success: true, company: job.company });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
