import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPasswordResetToken } from "@/lib/mypageAuth";

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();
    if (!token) return NextResponse.json({ error: "トークンがありません / Thiếu token" }, { status: 400 });
    if (!newPassword || String(newPassword).length < 6) {
      return NextResponse.json({ error: "パスワードは6文字以上にしてください / Mật khẩu cần từ 6 ký tự" }, { status: 400 });
    }

    const decoded = verifyPasswordResetToken(token);
    if (!decoded) return NextResponse.json({ error: "リンクが無効か期限切れです / Link không hợp lệ hoặc đã hết hạn" }, { status: 401 });

    const cand = await prisma.candidates.findUnique({ where: { id: decoded.candidateId }, select: { id: true, name: true } });
    if (!cand) return NextResponse.json({ error: "アカウントが見つかりません / Không tìm thấy tài khoản" }, { status: 401 });

    const hash = await hashPassword(String(newPassword));
    await prisma.candidates.update({ where: { id: cand.id }, data: { password_hash: hash } });

    // Log the candidate straight in — they just proved email ownership and set a fresh
    // password in the same action, no reason to make them type it again immediately after.
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
    console.error("password-reset confirm error:", err);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
