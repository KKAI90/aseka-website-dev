import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, name, company, email, phone, service, message } = body;

    // ── 1. Validate ───────────────────────────────────────────
    if (!name || !email) {
      return NextResponse.json(
        { error: "名前とメールアドレスは必須です" },
        { status: 400 }
      );
    }

    // ── 2. Save to Supabase ───────────────────────────────────
    // TODO: uncomment when Supabase is set up
    //
    // const { createClient } = await import("@supabase/supabase-js");
    // const supabase = createClient(
    //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
    //   process.env.SUPABASE_SERVICE_ROLE_KEY!
    // );
    // const { error: dbError } = await supabase
    //   .from("contact_submissions")
    //   .insert({ type, name, company, email, phone, service, message });
    // if (dbError) throw dbError;

    // ── 3. Send notification email via Resend ────────────────
    // TODO: uncomment when Resend is set up
    //
    // const { Resend } = await import("resend");
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: process.env.RESEND_FROM_EMAIL!,
    //   to: process.env.RESEND_TO_EMAIL!,
    //   subject: `[Aseka] 新しいお問い合わせ: ${name}`,
    //   html: `
    //     <h2>新しいお問い合わせ</h2>
    //     <table>
    //       <tr><td><b>種別</b></td><td>${type}</td></tr>
    //       <tr><td><b>お名前</b></td><td>${name}</td></tr>
    //       <tr><td><b>会社名</b></td><td>${company || "-"}</td></tr>
    //       <tr><td><b>Email</b></td><td>${email}</td></tr>
    //       <tr><td><b>電話</b></td><td>${phone || "-"}</td></tr>
    //       <tr><td><b>サービス</b></td><td>${service || "-"}</td></tr>
    //       <tr><td><b>メッセージ</b></td><td>${message || "-"}</td></tr>
    //     </table>
    //   `,
    // });

    // ── 4. Simulate success for now ───────────────────────────
    console.log("Contact submission:", { type, name, company, email, phone, service, message });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました。しばらくしてから再度お試しください。" },
      { status: 500 }
    );
  }
}
