import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { verifyPassword, dobToDefaultPassword, normalizeDigits } from "@/lib/mypageAuth";

// Shared for both "no such email" and "wrong password" — those used to return distinct
// messages ("アカウントが見つかりません" vs "パスワードが正しくありません"), which let
// anyone check whether a given email address is a registered Aseka candidate just by
// reading which error came back. For a labor-recruitment agency handling visa/employment
// cases, "is this person registered with Aseka" can itself be sensitive — closed by making
// both cases indistinguishable.
const BAD_CREDENTIALS = "メールアドレスまたはパスワードが正しくありません / Sai email hoặc mật khẩu";
// bcryptjs cost-10 hash of a random string — compared against on the "no such email" path
// so it takes about as long as a real verifyPassword() call, closing the same oracle at the
// timing level (a nonexistent email would otherwise respond measurably faster).
const DUMMY_HASH = "$2a$10$CwTycUXWue0Thq9StjUM0uJ8dqLzKvUKEZ.KzP4S6QzzZC5.pPkP2";

export async function POST(req: NextRequest) {
  try {
    const { email, password, remember } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "メールアドレスとパスワードを入力してください / Nhập email và mật khẩu" }, { status: 400 });
    }

    const idNorm = String(email).trim().toLowerCase();
    const cand = await prisma.candidates.findFirst({
      where: { email: { equals: idNorm, mode: "insensitive" } },
      select: { id: true, name: true, password_hash: true, date_of_birth: true },
    });

    if (!cand) {
      await bcrypt.compare(String(password), DUMMY_HASH);
      return NextResponse.json({ error: BAD_CREDENTIALS }, { status: 401 });
    }

    if (cand.password_hash) {
      // Password already set — normal login.
      const ok = await verifyPassword(String(password), cand.password_hash);
      if (!ok) {
        return NextResponse.json({ error: BAD_CREDENTIALS }, { status: 401 });
      }
    } else {
      // First login — default password is the date of birth as DDMMYYYY.
      const defaultPw = dobToDefaultPassword(cand.date_of_birth);
      if (!defaultPw) {
        return NextResponse.json({ error: "生年月日が未登録のため初回ログインできません。担当者にご連絡ください / Chưa có ngày sinh nên không thể đăng nhập lần đầu, vui lòng liên hệ nhân viên phụ trách" }, { status: 401 });
      }
      if (normalizeDigits(String(password)) !== defaultPw) {
        return NextResponse.json({ error: "パスワードが正しくありません（初回は生年月日 DDMMYYYY）/ Sai mật khẩu (lần đầu dùng ngày sinh DDMMYYYY)" }, { status: 401 });
      }
    }

    const res = NextResponse.json({ success: true, name: cand.name });
    res.cookies.set("mypage-id", cand.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      // "次回から入力を省略する" checked -> stay signed in 30 days.
      // Unchecked -> session cookie, cleared when the browser closes.
      ...(remember !== false ? { maxAge: 60 * 60 * 24 * 30 } : {}),
    });
    return res;
  } catch (err) {
    // Log server-side only — echoing String(err) to the client can leak internal details.
    console.error("mypage login error:", err);
    return NextResponse.json({ error: "サーバーエラーが発生しました / Lỗi hệ thống" }, { status: 500 });
  }
}
