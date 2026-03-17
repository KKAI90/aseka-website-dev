import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/adminAuth";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;
  try {
    const supabase = db();

    const [
      { data: candidates },
      { data: jobs },
      { data: messages },
    ] = await Promise.all([
      supabase.from("candidates").select("id,name,status,skill,created_at,updated_at"),
      supabase.from("job_listings").select("id,company,industry,status,created_at,updated_at"),
      supabase.from("contact_submissions").select("id,created_at,status").order("created_at", { ascending: false }),
    ]);

    // ── Normalize status: handle both English keys and Japanese values ──
    const STATUS_NORM: Record<string, string> = {
      // English keys (canonical — pass through unchanged)
      new: "new", interview: "interview", offered: "offered", working: "working", quit: "quit",
      // Japanese aliases
      "新規": "new", "新規登録": "new",
      "面接中": "interview", "面接": "interview",
      "内定済み": "offered", "内定済": "offered", "内定": "offered",
      "就業中": "working", "就労中": "working",
      "退職": "quit", "退社": "quit",
    };
    // Fallback: keep the original value as-is (never silently map to "new")
    const norm = (s: string | null | undefined): string =>
      s ? (STATUS_NORM[s] ?? s) : "new";

    const rawStatuses = Array.from(new Set((candidates || []).map(c => c.status)));
    console.log("[dashboard] distinct candidate statuses in DB:", rawStatuses);

    const cands    = (candidates || []).map(c => ({ ...c, status: norm(c.status) }));
    const jobList  = jobs || [];
    const msgs     = messages || [];

    // ── Stats ──────────────────────────────────────────────
    const interview  = cands.filter(c => c.status === "interview").length;
    const offered    = cands.filter(c => c.status === "offered").length;
    const activeJobs = jobList.filter(j => j.status !== "paused").length;
    const urgentJobs = jobList.filter(j => j.status === "urgent").length;
    const unreadMsgs = msgs.filter(m => !m.status || m.status === "new").length;

    // ── Pipeline (candidates by status) ───────────────────
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

    // ── Jobs by industry ───────────────────────────────────
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
      .map(([k, val]) => ({
        ja: k, vn: industryMeta[k]?.vn || k,
        val, pct: Math.round((val / maxInd) * 100),
        color: industryMeta[k]?.color || "#B4B2A9",
      }));

    // ── Recent activity (last 6 from candidates + jobs) ───
    const now = new Date();
    const fmtTime = (iso: string) => {
      const d = new Date(iso);
      const diffH = Math.floor((now.getTime() - d.getTime()) / 3600000);
      if (diffH < 24) return `本日 ${d.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}`;
      if (diffH < 48) return `昨日 ${d.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}`;
      return d.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
    };
    const recentCands = cands
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 4)
      .map(c => ({
        time: fmtTime(c.updated_at),
        ja: "候補者情報更新", vn: "Cập nhật ứng viên",
        obj: c.name, tc: "#633806", tb: "#FAEEDA",
      }));
    const recentJobs = jobList
      .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
      .slice(0, 2)
      .map(j => ({
        time: fmtTime(j.updated_at || j.created_at),
        ja: j.status === "urgent" ? "緊急求人" : "求人更新",
        vn: j.status === "urgent" ? "Khẩn cấp" : "Cập nhật",
        obj: j.company,
        tc: j.status === "urgent" ? "#A32D2D" : "#534AB7",
        tb: j.status === "urgent" ? "#FCEBEB" : "#EEEDFE",
      }));
    const recentMsgs = msgs.slice(0, 2).map(m => ({
      time: fmtTime(m.created_at),
      ja: "新規問い合わせ", vn: "Tin nhắn mới",
      obj: "Webサイト", tc: "#0C447C", tb: "#E6F1FB",
    }));
    const activity = [...recentCands, ...recentJobs, ...recentMsgs]
      .sort(() => 0) // keep order
      .slice(0, 6);

    // ── Monthly stats (this calendar month) ───────────────
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const cvThisMonth     = cands.filter(c => c.created_at >= monthStart).length;
    const jobsThisMonth   = jobList.filter(j => j.created_at >= monthStart).length;
    const offersThisMonth = cands.filter(c => c.status === "offered" && c.updated_at >= monthStart).length;

    return NextResponse.json({
      stats: { interview, offered, activeJobs, urgentJobs, unreadMsgs },
      pipeline,
      jobsByIndustry,
      activity,
      totals: { candidates: cands.length, jobs: jobList.length },
      monthly: { cv: cvThisMonth, jobs: jobsThisMonth, offers: offersThisMonth },
      _debug: { rawStatuses },
    });
  } catch (err) {
    console.error("dashboard error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
