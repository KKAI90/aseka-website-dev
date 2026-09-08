import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/mypageAuth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "メールアドレスとパスワードを入力してください / Nhập email và mật khẩu" }, { status: 400 });
    }

    const idNorm = String(email).trim().toLowerCase();
    const cand = await prisma.candidates.findFirst({
      where: { email: { equals: idNorm, mode: "insensitive" } },
      select: { id: true, name: true, password_hash: true },
    });

    if (!cand) {
      return NextResponse.json({ error: "アカウントが見つかりません / Không tìm thấy tài khoản" }, { status: 401 });
    }
    if (!cand.password_hash) {
      return NextResponse.json({ error: "パスワード未設定です。マジックリンクでログインしてください / Chưa đặt mật khẩu, hãy đăng nhập bằng magic link" }, { status: 401 });
    }

    const ok = await verifyPassword(String(password), cand.password_hash);
    if (!ok) {
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
