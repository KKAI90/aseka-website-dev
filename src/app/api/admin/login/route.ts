import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

// Same cost factor bcryptjs uses for real password hashes — compared against on every
// "account not found" path below so that path takes about as long as a real bcrypt.compare,
// closing a timing side-channel that would otherwise let an attacker tell "no such admin"
// apart from "wrong password" just by measuring response latency, even though both cases
// already return the identical error message.
const DUMMY_HASH = "$2a$10$CwTycUXWue0Thq9StjUM0uJ8dqLzKvUKEZ.KzP4S6QzzZC5.pPkP2";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const admin = await prisma.admin_users.findUnique({ where: { email } });
    if (!admin) {
      await bcrypt.compare(password, DUMMY_HASH);
      return NextResponse.json(
        { error: "メールアドレスまたはパスワードが正しくありません" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      return NextResponse.json(
        { error: "メールアドレスまたはパスワードが正しくありません" },
        { status: 401 }
      );
    }

    const token = signToken({ email: admin.email });
    const res = NextResponse.json({ success: true });

    res.cookies.set("sb-access-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8,
      path: "/",
    });

    return res;
  } catch (err) {
    // Log the real error server-side only — echoing String(err) back to the client can leak
    // internal details (stack traces, DB connection info) to anyone who can trigger a 500.
    console.error("login error:", err);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
