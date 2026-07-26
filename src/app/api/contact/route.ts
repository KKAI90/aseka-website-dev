import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

const SERVICE_LABELS: Record<string, string> = {
  brochure: "まずは資料だけ見てみたい",
  consult: "外国人財の採用について相談したい",
  hire: "今すぐ外国人財を採用したい",
  hr: "ビザ手続き等について相談したい",
  other: "その他",
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, name, furigana, company, email, phone, service, message } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "名前とメールアドレスは必須です" },
        { status: 400 }
      );
    }

    // Save to DB (non-blocking — don't fail if DB is down)
    prisma.contact_submissions.create({
      data: { type, name, company, email, phone, service, message },
    }).catch((err) => console.error("DB save failed (non-fatal):", err));

    await transporter.sendMail({
      from: `"ASEKA お問い合わせ" <${process.env.GMAIL_USER}>`,
      to: "info@aseka.co.jp",
      replyTo: email,
      subject: `【お問い合わせ】${name}様より`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#fff;border:1px solid #e5e7eb;">
          <h2 style="font-size:18px;color:#0C1F2E;margin-bottom:24px;border-bottom:2px solid #B8963E;padding-bottom:12px;">
            お問い合わせが届きました
          </h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr style="background:#FAF7F2;">
              <td style="padding:10px 14px;color:#6b7280;width:140px;font-weight:bold;">種別</td>
              <td style="padding:10px 14px;color:#0C1F2E;">${type === "business" ? "企業・採用担当者" : "個人・求職者"}</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;color:#6b7280;font-weight:bold;">お名前</td>
              <td style="padding:10px 14px;color:#0C1F2E;">${name}${furigana ? `（${furigana}）` : ""}</td>
            </tr>
            ${company ? `
            <tr style="background:#FAF7F2;">
              <td style="padding:10px 14px;color:#6b7280;font-weight:bold;">会社名</td>
              <td style="padding:10px 14px;color:#0C1F2E;">${company}</td>
            </tr>` : ""}
            <tr>
              <td style="padding:10px 14px;color:#6b7280;font-weight:bold;">メールアドレス</td>
              <td style="padding:10px 14px;"><a href="mailto:${email}" style="color:#B8963E;">${email}</a></td>
            </tr>
            <tr style="background:#FAF7F2;">
              <td style="padding:10px 14px;color:#6b7280;font-weight:bold;">電話番号</td>
              <td style="padding:10px 14px;color:#0C1F2E;">${phone || "-"}</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;color:#6b7280;font-weight:bold;">ご相談内容</td>
              <td style="padding:10px 14px;color:#0C1F2E;">${SERVICE_LABELS[service] || service}</td>
            </tr>
            <tr style="background:#FAF7F2;">
              <td style="padding:10px 14px;color:#6b7280;font-weight:bold;vertical-align:top;">メッセージ</td>
              <td style="padding:10px 14px;color:#0C1F2E;white-space:pre-line;">${message}</td>
            </tr>
          </table>
          <p style="margin-top:24px;font-size:12px;color:#9ca3af;">
            ※ このメールに返信すると ${email} 宛に送信されます。
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json(
      { error: "エラーが発生しました。しばらくしてから再度お試しください。" },
      { status: 500 }
    );
  }
}
