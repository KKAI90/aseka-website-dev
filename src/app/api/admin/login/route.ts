import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const dbUrl = process.env.DATABASE_URL;
    console.log("[login] DATABASE_URL set:", !!dbUrl, dbUrl ? dbUrl.substring(0, 30) + "..." : "MISSING");
    const { email, password } = await req.json();

    const admin = await prisma.admin_users.findUnique({ where: { email } });
    if (!admin) {
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
    console.error("login error:", err);
    return NextResponse.json({ error: "サーバーエラーが発生しました", detail: String(err) }, { status: 500 });
  }
}
