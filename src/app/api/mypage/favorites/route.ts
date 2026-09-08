import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const id = req.cookies.get("mypage-id")?.value;
  if (!id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const favs = await prisma.mypage_favorites.findMany({
    where: { candidate_id: id },
    select: { job_id: true },
  });
  return NextResponse.json({ jobIds: favs.map(f => f.job_id) });
}

// Toggle a job's favorite state for the logged-in candidate.
export async function POST(req: NextRequest) {
  const id = req.cookies.get("mypage-id")?.value;
  if (!id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { jobId } = await req.json();
    if (!jobId) return NextResponse.json({ error: "jobId is required" }, { status: 400 });

    const existing = await prisma.mypage_favorites.findUnique({
      where: { candidate_id_job_id: { candidate_id: id, job_id: jobId } },
    });

    if (existing) {
      await prisma.mypage_favorites.delete({ where: { id: existing.id } });
      return NextResponse.json({ favorited: false });
    } else {
      await prisma.mypage_favorites.create({ data: { candidate_id: id, job_id: jobId } });
      return NextResponse.json({ favorited: true });
    }
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
