import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signMagicLinkToken } from "@/lib/mypageAuth";
import { transporter, mailerConfigured } from "@/lib/mailer";

// Always returns a generic success message regardless of whether the email
// exists — avoids leaking which addresses are registered.
const GENERIC_OK = { success: true, message: "ログイン用リンクを送信しました（登録済みの場合）/ Đã gửi link đăng nhập (nếu email đã đăng ký)" };

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "メールアドレスを入力してください / Nhập email" }, { status: 400 });

    const idNorm = String(email).trim().toLowerCase();
    const cand = await prisma.candidates.findFirst({
      where: { email: { equals: idNorm, mode: "insensitive" } },
      select: { id: true, name: true, email: true },
    });

    // Candidate not found — still respond OK (don't leak), just skip sending.
    if (!cand || !cand.email) return NextResponse.json(GENERIC_OK);

    const token = signMagicLinkToken(cand.id);
    const origin = new URL(req.url).origin;
    const link = `${origin}/mypage/magic?token=${encodeURIComponent(token)}`;

    if (!mailerConfigured()) {
      console.error("GMAIL_USER / GMAIL_APP_PASSWORD not set — cannot send magic link email. Link:", link);
      return NextResponse.json({ ...GENERIC_OK, _devLink: process.env.NODE_ENV !== "production" ? link : undefined });
    }

    await transporter.sendMail({
      from: `"ASEKA マイページ" <${process.env.GMAIL_USER}>`,
      to: cand.email,
      subject: "【ASEKA】マイページ ログイン用リンク / Link đăng nhập Mypage",
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#fff;border:1px solid #e5e7eb;">
          <h2 style="font-size:17px;color:#0B1F3A;margin-bottom:16px;">${cand.name} 様</h2>
          <p style="font-size:14px;color:#333;line-height:1.7;">
            下記のボタンをクリックしてマイページにログインしてください（15分間有効）。<br/>
            <span style="font-size:12px;color:#6b7280;">Nhấn nút bên dưới để đăng nhập vào Mypage (link có hiệu lực trong 15 phút).</span>
          </p>
          <div style="text-align:center;margin:28px 0;">
            <a href="${link}" style="display:inline-block;padding:12px 28px;background:#C8002A;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;">
              マイページへログイン / Đăng nhập
            </a>
          </div>
          <p style="font-size:11px;color:#9BA0AC;">
            このメールに心当たりがない場合は無視してください。<br/>
            Nếu bạn không yêu cầu email này, vui lòng bỏ qua.
          </p>
        </div>
      `,
    });

    return NextResponse.json(GENERIC_OK);
  } catch (err) {
    console.error("magic-link request error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
