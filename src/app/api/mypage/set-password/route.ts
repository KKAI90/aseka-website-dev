import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/mypageAuth";

export async function POST(req: NextRequest) {
  const id = req.cookies.get("mypage-id")?.value;
  if (!id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { currentPassword, newPassword } = await req.json();
    if (!newPassword || String(newPassword).length < 6) {
      return NextResponse.json({ error: "パスワードは6文字以上にしてください / Mật khẩu cần từ 6 ký tự" }, { status: 400 });
    }

    const cand = await prisma.candidates.findUnique({ where: { id }, select: { id: true, password_hash: true } });
    if (!cand) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // If a password is already set, require the current one to change it.
    if (cand.password_hash) {
      if (!currentPassword) {
        return NextResponse.json({ error: "現在のパスワードを入力してください / Nhập mật khẩu hiện tại" }, { status: 400 });
      }
      const ok = await verifyPassword(String(currentPassword), cand.password_hash);
      if (!ok) return NextResponse.json({ error: "現在のパスワードが正しくありません / Mật khẩu hiện tại không đúng" }, { status: 401 });
    }

    const hash = await hashPassword(String(newPassword));
    await prisma.candidates.update({ where: { id }, data: { password_hash: hash } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
