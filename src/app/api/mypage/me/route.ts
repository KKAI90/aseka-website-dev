import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// candidates.status is stored inconsistently (Japanese labels like "新規"
// for most rows, English keys like "new" for a few) — normalize to the
// English keys the mypage pipeline UI expects.
const STATUS_NORM: Record<string, string> = {
  new: "new", interview: "interview", offered: "offered", working: "working", quit: "quit",
  "新規": "new", "新規登録": "new",
  "面接中": "interview", "面接": "interview",
  "内定済み": "offered", "内定済": "offered", "内定": "offered",
  "就業中": "working", "就労中": "working",
  "退職": "quit", "退社": "quit",
};
const normStatus = (s: string | null | undefined): string => s ? (STATUS_NORM[s] ?? s) : "new";

export async function GET(req: NextRequest) {
  const id = req.cookies.get("mypage-id")?.value;
  if (!id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await prisma.candidates.findUnique({
    where: { id },
    select: {
      id: true, name: true, name_kana: true, email: true, phone: true,
      date_of_birth: true, gender: true, skill: true, jlpt: true,
      preferred_job: true, visa_type: true, visa_expiry: true, status: true,
      match_job_id: true, match_job_name: true, motivation: true, availability: true,
      work_hours: true, address: true, nationality: true, created_at: true,
      password_hash: true,
    },
  });

  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { password_hash, ...rest } = data;
  return NextResponse.json({ data: { ...rest, status: normStatus(data.status), hasPassword: Boolean(password_hash) } });
}
