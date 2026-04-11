import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Client } from "pg";
import { signToken } from "@/lib/auth";

const DB_URL =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  "postgres://postgres.eftgkvtpvaixipazrjnf:hCobYi0zI7whYPlx@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true";

export async function POST(req: NextRequest) {
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  try {
    const { email, password } = await req.json();

    await client.connect();
    const result = await client.query(
      "SELECT id, email, password FROM admin_users WHERE email = $1 LIMIT 1",
      [email]
    );
    await client.end();

    const admin = result.rows[0];
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
    try { await client.end(); } catch {}
    console.error("login error:", err);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました", detail: String(err) },
      { status: 500 }
    );
  }
}
