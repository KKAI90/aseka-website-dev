import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;
  try {
    const [candidates, jobs, messages] = await Promise.all([
      prisma.candidates.findMany({ select: { id: true, name: true, status: true, skill: true, created_at: true, updated_at: true } }),
      prisma.job_listings.findMany({ select: { id: true, company: true, industry: true, status: true, created_at: true, updated_at: true } }),
      prisma.contact_submissions.findMany({ select: { id: true, created_at: true, status: true }, orderBy: { created_at: "desc" } }),
    ]);

    const STATUS_NORM: Record<string, string> = {
      new: "new", interview: "interview", offered: "offered", working: "working", quit: "quit",
      "新規": "new", "新規登録": "new",
      "面接中": "interview", "面接": "interview",
      "内定済み": "offered", "内定済": "offered", "内定": "offered",
      "就業中": "working", "就労中": "working",
      "退職": "quit", "退社": "quit",
    };
    const norm = (s: string | null | undefined): string => s ? (STATUS_NORM[s] ?? s) : "new";

    const rawStatuses = Array.from(new Set(candidates.map(c => c.status)));
    const cands = candidates.map(c => ({ ...c, status: norm(c.status), created_at: c.created_at.toISOString(), updated_at: c.updated_at.toISOString() }));
    const jobList = jobs.map(j => ({ ...j, created_at: j.created_at.toISOString(), updated_at: j.updated_at.toISOString() }));
    const msgs = messages.map(m => ({ ...m, created_at: m.created_at.toISOString() }));

    const interview  = cands.filter(c => c.status === "interview").length;
    const offered    = cands.filter(c => c.status === "offered").length;
    const activeJobs = jobList.filter(j => j.status !== "paused").length;
    const urgentJobs = jobList.filter(j => j.status === "urgent").length;
    const unreadMsgs = msgs.filter(m => !m.status || m.status === "new").length;

    const statusMap: Record<string, { ja: string; vn: string; color: string }> = {
      new:       { ja: "新規登録", vn: "Mới đăng ký",     color: "#378ADD" },
      interview: { ja: "面接中",   vn: "Đang phỏng vấn",  color: "#EF9F27" },
      offered:   { ja: "内定済み", vn: "Đã offer",         color: "#5DCAA5" },
      working:   { ja: "就業中",   vn: "Đang làm việc",    color: "#27500A" },
      quit:      { ja: "退職",     vn: "Nghỉ việc",        color: "#B4B2A9" },
    };
    const maxPipeline = Math.max(...Object.keys(statusMap).map(k => cands.filter(c => c.status === k).length), 1);
    const pipeline = Object.entries(statusMap).map(([k, v]) => {
      const val = cands.filter(c => c.status === k).length;
      return { ...v, val, pct: Math.round((val / maxPipeline) * 100) };
    });

    const industryMeta: Record<string, { vn: string; color: string }> = {
      "飲食":   { vn: "Nhà hàng",    color: "#378ADD" },
      "製造":   { vn: "Nhà máy",     color: "#5DCAA5" },
      "農業":   { vn: "Nông nghiệp", color: "#EF9F27" },
      "ホテル": { vn: "Khách sạn",   color: "#F09595" },
      "IT":     { vn: "IT",          color: "#7C6FF7" },
      "その他": { vn: "Khác",        color: "#B4B2A9" },
    };
    const indCount: Record<string, number> = {};
    jobList.filter(j => j.status !== "paused").forEach(j => {
      const key = Object.keys(industryMeta).find(k => j.industry?.includes(k)) || "その他";
      indCount[key] = (indCount[key] || 0) + 1;
    });
    const maxInd = Math.max(...Object.values(indCount), 1);
    const jobsByIndustry = Object.entries(indCount)
      .sort((a, b) => b[1] - a[1])
      .map(([k, val]) => ({ ja: k, vn: industryMeta[k]?.vn || k, val, pct: Math.round((val / maxInd) * 100), color: industryMeta[k]?.color || "#B4B2A9" }));

    const now = new Date();
    const fmtTime = (iso: string) => {
      const d = new Date(iso);
      const diffH = Math.floor((now.getTime() - d.getTime()) / 3600000);
      if (diffH < 24) return `本日 ${d.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}`;
      if (diffH < 48) return `昨日 ${d.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}`;
      return d.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
    };
    const recentCands = [...cands].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 4)
      .map(c => ({ time: fmtTime(c.updated_at), ja: "候補者情報更新", vn: "Cập nhật ứng viên", obj: c.name, tc: "#633806", tb: "#FAEEDA" }));
    const recentJobs = [...jobList].sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime()).slice(0, 2)
      .map(j => ({ time: fmtTime(j.updated_at || j.created_at), ja: j.status === "urgent" ? "緊急求人" : "求人更新", vn: j.status === "urgent" ? "Khẩn cấp" : "Cập nhật", obj: j.company, tc: j.status === "urgent" ? "#A32D2D" : "#534AB7", tb: j.status === "urgent" ? "#FCEBEB" : "#EEEDFE" }));
    const recentMsgs = msgs.slice(0, 2).map(m => ({ time: fmtTime(m.created_at), ja: "新規問い合わせ", vn: "Tin nhắn mới", obj: "Webサイト", tc: "#0C447C", tb: "#E6F1FB" }));
    const activity = [...recentCands, ...recentJobs, ...recentMsgs].slice(0, 6);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const cvThisMonth     = cands.filter(c => c.created_at >= monthStart).length;
    const jobsThisMonth   = jobList.filter(j => j.created_at >= monthStart).length;
    const offersThisMonth = cands.filter(c => c.status === "offered" && c.updated_at >= monthStart).length;

    // ── Monthly trend: last 6 months (oldest → newest, current month last) ──
    // "offers" here counts candidates whose status is CURRENTLY "offered" and whose
    // record was last touched in that month — same proxy the single-month figure above
    // already uses (there's no dedicated offered_at timestamp in the schema), kept
    // consistent rather than introducing a second, different definition of "offer".
    const MONTH_JA = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
    const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
      const idx = 5 - i;
      const start = new Date(now.getFullYear(), now.getMonth() - idx, 1);
      const end   = new Date(now.getFullYear(), now.getMonth() - idx + 1, 1);
      const startIso = start.toISOString(), endIso = end.toISOString();
      return {
        label: MONTH_JA[start.getMonth()],
        year: start.getFullYear(),
        month: start.getMonth() + 1,
        cv:     cands.filter(c => c.created_at >= startIso && c.created_at < endIso).length,
        jobs:   jobList.filter(j => j.created_at >= startIso && j.created_at < endIso).length,
        offers: cands.filter(c => c.status === "offered" && c.updated_at >= startIso && c.updated_at < endIso).length,
      };
    });
    const thisMonthIdx = monthlyTrend.length - 1;
    const lastMonth = monthlyTrend[thisMonthIdx - 1];
    // % change vs previous month — null (not 0 or ±100%) when the prior month had zero,
    // since a 0→N jump isn't meaningfully expressible as a percentage change.
    const pctDelta = (cur: number, prev: number): number | null => prev === 0 ? null : Math.round(((cur - prev) / prev) * 100);
    const trendDeltas = {
      cv:     pctDelta(cvThisMonth, lastMonth.cv),
      jobs:   pctDelta(jobsThisMonth, lastMonth.jobs),
      offers: pctDelta(offersThisMonth, lastMonth.offers),
    };

    return NextResponse.json({
      stats: { interview, offered, activeJobs, urgentJobs, unreadMsgs },
      pipeline, jobsByIndustry, activity,
      totals: { candidates: cands.length, jobs: jobList.length },
      monthly: { cv: cvThisMonth, jobs: jobsThisMonth, offers: offersThisMonth },
      monthlyTrend, trendDeltas,
      generatedAt: now.toISOString(),
      _debug: { rawStatuses },
    });
  } catch (err) {
    console.error("dashboard error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
