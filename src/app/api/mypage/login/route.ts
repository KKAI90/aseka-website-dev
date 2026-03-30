import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { loginId, password } = await req.json();
    if (!loginId || !password) {
      return NextResponse.json({ error: "IDとパスワードを入力してください" }, { status: 400 });
    }

    const idNorm = loginId.trim();
    const pwNorm = password.replace(/[-\/]/g, "").trim();

    const SELECT = {
      id: true, name: true, email: true, phone: true,
      date_of_birth: true, status: true, skill: true,
      jlpt: true, preferred_job: true, visa_type: true, match_job_name: true,
    };

    const byEmail = await prisma.candidates.findFirst({
      where: { email: idNorm },
      select: SELECT,
    });

    const cand = byEmail ?? await prisma.candidates.findFirst({
      where: { phone: idNorm },
      select: SELECT,
    });

    if (!cand) {
      return NextResponse.json({ error: "IDが見つかりません / Không tìm thấy tài khoản" }, { status: 401 });
    }

    const dobNorm = (cand.date_of_birth || "").replace(/[-\/]/g, "");
    if (!dobNorm || dobNorm !== pwNorm) {
      return NextResponse.json({ error: "パスワードが正しくありません / Sai mật khẩu" }, { status: 401 });
    }

    const res = NextResponse.json({ success: true, name: cand.name });
    res.cookies.set("mypage-id", cand.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return res;
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
