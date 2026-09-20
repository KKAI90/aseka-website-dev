import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, ["superadmin"]);
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

    // Covers the full 22-category vocabulary Jobs/dang-ky actually write to `industry`
    // (see INDUSTRY_LIST in admin/jobs/page.tsx) — colors reused from that same file's IND
    // dict for visual consistency. The old version only recognized 6 categories and matched
    // by substring, so 18 of 22 real jobs (each with a perfectly valid specific industry —
    // 介護, 建設, 宿泊, 航空...) silently fell into a meaningless "その他" catch-all,
    // making this widget report "82% Other" regardless of the real distribution (caught via
    // live DB audit against a real dashboard screenshot). Exact match now — a job's industry
    // either is one of these 22 known values, or it genuinely renders under its own raw
    // label rather than being swallowed into "その他".
    const industryMeta: Record<string, { vn: string; color: string }> = {
      "介護":            { vn: "Chăm sóc điều dưỡng",     color: "#0F6E6E" },
      "ビルクリーニング": { vn: "Vệ sinh toà nhà",          color: "#52525B" },
      "工業製品製造業":   { vn: "Sản xuất công nghiệp",    color: "#27500A" },
      "建設":            { vn: "Xây dựng",                color: "#8A6800" },
      "造船・舶用工業":   { vn: "Đóng tàu",                color: "#0369A1" },
      "自動車整備":       { vn: "Sửa chữa ô tô",           color: "#3730A3" },
      "航空":            { vn: "Hàng không",              color: "#0C447C" },
      "宿泊":            { vn: "Lưu trú / Khách sạn",     color: "#534AB7" },
      "農業":            { vn: "Nông nghiệp",             color: "#633806" },
      "漁業":            { vn: "Ngư nghiệp",              color: "#9F1239" },
      "飲食料品製造業":   { vn: "Sản xuất thực phẩm",      color: "#4D6B0A" },
      "外食業":          { vn: "Dịch vụ ăn uống",         color: "#0C447C" },
      "繊維業":          { vn: "Ngành dệt may",           color: "#9D2467" },
      "印刷業":          { vn: "Ngành in ấn",             color: "#52525B" },
      "鉄道":            { vn: "Đường sắt",               color: "#0369A1" },
      "林業":            { vn: "Lâm nghiệp",              color: "#27500A" },
      "IT":              { vn: "CNTT",                    color: "#7C6FF7" },
      "機械・電気電子":   { vn: "Cơ khí điện tử",          color: "#534AB7" },
      "国際業務":         { vn: "Nghiệp vụ quốc tế",       color: "#0C447C" },
      "通訳・翻訳":       { vn: "Phiên dịch - Biên dịch",  color: "#8A6800" },
      "経理・会計":       { vn: "Kế toán",                 color: "#9F1239" },
      "その他":          { vn: "Khác",                    color: "#B4B2A9" },
    };
    const indCount: Record<string, number> = {};
    jobList.filter(j => j.status !== "paused").forEach(j => {
      const key = j.industry && industryMeta[j.industry] ? j.industry : (j.industry || "その他");
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
    });
  } catch (err) {
    console.error("dashboard error:", err);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
