import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const id = req.cookies.get("mypage-id")?.value;
  if (!id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await prisma.candidates.findUnique({
    where: { id },
    select: {
      id: true, name: true, name_kana: true, email: true, phone: true,
      date_of_birth: true, gender: true, skill: true, jlpt: true,
      preferred_job: true, visa_type: true, visa_expiry: true, status: true,
      match_job_name: true, motivation: true, availability: true,
      work_hours: true, address: true, nationality: true, created_at: true,
    },
  });

  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data });
}
