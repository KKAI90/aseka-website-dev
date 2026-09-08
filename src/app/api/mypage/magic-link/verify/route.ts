import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyMagicLinkToken } from "@/lib/mypageAuth";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) return NextResponse.json({ error: "トークンがありません / Thiếu token" }, { status: 400 });

    const decoded = verifyMagicLinkToken(token);
    if (!decoded) return NextResponse.json({ error: "リンクが無効か期限切れです / Link không hợp lệ hoặc đã hết hạn" }, { status: 401 });

    const cand = await prisma.candidates.findUnique({ where: { id: decoded.candidateId }, select: { id: true, name: true, password_hash: true } });
    if (!cand) return NextResponse.json({ error: "アカウントが見つかりません / Không tìm thấy tài khoản" }, { status: 401 });

    const res = NextResponse.json({ success: true, name: cand.name, hasPassword: Boolean(cand.password_hash) });
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
