import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { transporter, mailerConfigured } from "@/lib/mailer";

// Candidate applies to a job from mypage. Writes to the same
// match_job_id / match_job_name fields the admin Candidates page reads
// (colMatch / 選考状況 tab), so it shows up on the admin side immediately —
// this is the single active "pipeline" job for the candidate, matching
// the existing one-track-at-a-time recruiting model.
export async function POST(req: NextRequest) {
  const id = req.cookies.get("mypage-id")?.value;
  if (!id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { jobId } = await req.json();
    if (!jobId) return NextResponse.json({ error: "jobId is required" }, { status: 400 });

    const job = await prisma.job_listings.findUnique({ where: { id: jobId }, select: { id: true, company: true, status: true } });
    if (!job) return NextResponse.json({ error: "求人が見つかりません / Không tìm thấy việc làm" }, { status: 404 });
    if (job.status === "paused") return NextResponse.json({ error: "この求人は現在募集していません / Việc làm này hiện đã dừng tuyển" }, { status: 400 });

    const cand = await prisma.candidates.update({
      where: { id },
      data: { match_job_id: job.id, match_job_name: job.company, applied_via: "self", applied_at: new Date(), applied_reviewed: false },
      select: { name: true },
    });

    notifyStaff(cand.name || "候補者", job.company || "").catch(err => console.error("apply notification failed (non-fatal):", err));

    return NextResponse.json({ success: true, company: job.company });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

async function notifyStaff(candidateName: string, company: string) {
  if (!mailerConfigured()) {
    console.error("GMAIL not configured — skipping apply notification email.");
    return;
  }
  const staff = await prisma.admin_users.findMany({ select: { email: true } });
  if (!staff.length) return;

  const origin = process.env.NEXT_PUBLIC_ADMIN_URL || "https://admin.dev.aseka.co.jp";
  const results = await Promise.allSettled(
    staff.map(s => transporter.sendMail({
      from: `"ASEKA Back Office" <${process.env.GMAIL_USER}>`,
      to: s.email,
      subject: `【本人応募】${candidateName} さんが「${company}」に応募しました`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:28px;background:#fff;border:1px solid #e5e7eb;">
          <h2 style="font-size:16px;color:#0B1F3A;margin-bottom:14px;">新しい本人応募があります</h2>
          <p style="font-size:14px;color:#333;line-height:1.7;">
            <strong>${candidateName}</strong> さんがマイページから<br/>
            <strong>${company}</strong> に応募しました。
          </p>
          <div style="text-align:center;margin:24px 0;">
            <a href="${origin}/admin/candidates" style="display:inline-block;padding:11px 24px;background:#C8002A;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:13px;">
              管理画面で確認する
            </a>
          </div>
          <p style="font-size:11px;color:#9BA0AC;">候補者一覧の「本人応募」タブから確認・対応済みにできます。</p>
        </div>
      `,
    }))
  );
  results.forEach((r, i) => { if (r.status === "rejected") console.error(`apply notification to ${staff[i].email} failed:`, r.reason); });
}
