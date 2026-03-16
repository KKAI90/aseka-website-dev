import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
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

    const cands = candidates || [];
    const jobList = jobs || [];
    const msgs = messages || [];

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

    return NextResponse.json({
      stats: { interview, offered, activeJobs, urgentJobs, unreadMsgs },
      pipeline,
      jobsByIndustry,
      activity,
      totals: { candidates: cands.length, jobs: jobList.length },
    });
  } catch (err) {
    console.error("dashboard error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
