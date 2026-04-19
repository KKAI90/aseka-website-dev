"use client";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";

type Msg = {
  id: string; type: string; name: string; company: string | null;
  email: string; phone: string | null; service: string | null;
  message: string | null; status: string; created_at: string;
};

const SVC: Record<string, { ja: string; color: string; bg: string; border: string }> = {
  hr:     { ja: "人材紹介",   color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
  nenkin: { ja: "年金",       color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
  visa:   { ja: "ビザ",       color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  zairyu: { ja: "在留手続き", color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
  other:  { ja: "その他",     color: "#6B7280", bg: "#F9FAFB", border: "#E5E7EB" },
};
const ST: Record<string, { ja: string; vn: string; tc: string; tb: string; border: string; dot: string }> = {
  new:       { ja: "新規",     vn: "Mới",        tc: "#1D4ED8", tb: "#EFF6FF", border: "#BFDBFE", dot: "#3B82F6" },
  contacted: { ja: "連絡済み", vn: "Đã liên hệ", tc: "#065F46", tb: "#ECFDF5", border: "#A7F3D0", dot: "#10B981" },
  closed:    { ja: "完了",     vn: "Xong",       tc: "#374151", tb: "#F9FAFB", border: "#D1D5DB", dot: "#9CA3AF" },
};

function fmt(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}
function fmtMonth(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,"0")}`;
}

// Animated counter hook
function useCountUp(target: number, duration = 600) {
  const [val, setVal] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const start = prev.current;
    const diff = target - start;
    if (diff === 0) return;
    const startTime = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(start + diff * ease));
      if (p < 1) requestAnimationFrame(tick);
      else prev.current = target;
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return val;
}

function KpiNum({ value }: { value: number }) {
  const v = useCountUp(value);
  return <>{v}</>;
}

export default function MessagesPage() {
  const router = useRouter();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<Msg | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [chartYear, setChartYear] = useState(new Date().getFullYear());
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showChart, setShowChart] = useState(true);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "info" } | null>(null);
  const [pageReady, setPageReady] = useState(false);

  const showToast = useCallback((msg: string, type: "success" | "info" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  }, []);

  const load = useCallback(async (spin = false) => {
    if (spin) setRefreshing(true);
    const res = await fetch("/api/admin/messages");
    if (res.status === 401) { router.push("/admin/login"); return; }
    const d = await res.json();
    setMsgs(d.data || []);
    setLoading(false);
    if (spin) {
      setTimeout(() => { setRefreshing(false); showToast("データを更新しました", "info"); }, 400);
    }
  }, [router, showToast]);

  useEffect(() => { load().then(() => setTimeout(() => setPageReady(true), 50)); }, [load]);

  // ESC key closes modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSelected(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    await fetch("/api/admin/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setMsgs(p => p.map(m => m.id === id ? { ...m, status } : m));
    setSelected(p => p?.id === id ? { ...p, status } : p);
    setUpdatingId(null);
    const label = ST[status]?.ja || status;
    showToast(`ステータスを「${label}」に変更しました`);
  };

  const monthlyStats = useMemo(() => {
    const map: Record<string, number> = {};
    msgs.forEach(m => { const k = fmtMonth(m.created_at); map[k] = (map[k] || 0) + 1; });
    return Array.from({ length: 12 }, (_, i) => {
      const key = `${chartYear}/${String(i+1).padStart(2,"0")}`;
      return { month: key, count: map[key] || 0, label: `${i+1}月` };
    });
  }, [msgs, chartYear]);

  const maxCount = Math.max(...monthlyStats.map(s => s.count), 1);
  const currentYear = new Date().getFullYear();
  const currentMonthKey = `${new Date().getFullYear()}/${String(new Date().getMonth()+1).padStart(2,"0")}`;

  const filtered = useMemo(() => msgs.filter(m => {
    if (filterStatus !== "all" && m.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!m.name.toLowerCase().includes(q) && !m.email.toLowerCase().includes(q) && !(m.company||"").toLowerCase().includes(q)) return false;
    }
    if (dateFrom && new Date(m.created_at) < new Date(dateFrom)) return false;
    if (dateTo && new Date(m.created_at) > new Date(dateTo+"T23:59:59")) return false;
    return true;
  }), [msgs, filterStatus, search, dateFrom, dateTo]);

  const counts = {
    all: msgs.length,
    new: msgs.filter(m => m.status === "new").length,
    contacted: msgs.filter(m => m.status === "contacted").length,
    closed: msgs.filter(m => m.status === "closed").length,
  };

  const hasFilter = !!(search || dateFrom || dateTo || filterStatus !== "all");

  const KPI_CARDS = [
    { key: "all",       icon: "📥", label: "合計",     sub: "すべての問い合わせ", color: "#374151", activeBg: "#1F2937", activeBd: "#374151", idleBd: "#E5E7EB",  pulse: false },
    { key: "new",       icon: "🔔", label: "新規",     sub: "未対応",             color: "#1D4ED8", activeBg: "#1D4ED8", activeBd: "#2563EB", idleBd: "#BFDBFE",  pulse: counts.new > 0 },
    { key: "contacted", icon: "💬", label: "連絡済み", sub: "対応中",             color: "#065F46", activeBg: "#059669", activeBd: "#10B981", idleBd: "#A7F3D0",  pulse: false },
    { key: "closed",    icon: "✅", label: "完了",     sub: "クローズ済み",       color: "#374151", activeBg: "#4B5563", activeBd: "#6B7280", idleBd: "#D1D5DB",  pulse: false },
  ];

  return (
    <>
      <style>{`
        * { box-sizing:border-box; }
        @keyframes spin      { to { transform:rotate(360deg); } }
        @keyframes fadeUp    { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes barGrow   { from { height:0 !important; } to {} }
        @keyframes skeletonShimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        @keyframes pulse     { 0%,100%{box-shadow:0 0 0 0 rgba(37,99,235,0.4)} 50%{box-shadow:0 0 0 6px rgba(37,99,235,0)} }
        @keyframes toastIn   { from{opacity:0;transform:translateY(12px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes rowFadeIn { from{opacity:0;transform:translateX(-4px)} to{opacity:1;transform:translateX(0)} }
        @keyframes dotPulse  { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.6);opacity:0.6} }
        @keyframes modalIn   { from{opacity:0;transform:scale(0.94) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes overlayIn { from{opacity:0} to{opacity:1} }

        .page-bg { background:#F0F2F5; min-height:100vh; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif; }
        .topbar { position:sticky; top:0; z-index:100; background:#fff; border-bottom:1px solid #E5E7EB; padding:0 28px; height:60px; display:flex; align-items:center; justify-content:space-between; box-shadow:0 1px 4px rgba(0,0,0,0.06); }
        .content { padding:22px 28px; }
        .card { background:#fff; border:1px solid #E5E7EB; border-radius:14px; box-shadow:0 1px 3px rgba(0,0,0,0.04); }

        /* KPI */
        .kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:18px; }
        .kpi { border-radius:14px; padding:18px 20px; cursor:pointer; border:1.5px solid; transition:transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease; user-select:none; }
        .kpi:hover { transform:translateY(-3px) scale(1.01); }
        .kpi:active { transform:translateY(0) scale(0.98); }
        .kpi-num { font-size:34px; font-weight:800; line-height:1; letter-spacing:-0.03em; }
        .kpi-label { font-size:13px; font-weight:600; margin-top:6px; }
        .kpi-sub { font-size:10px; margin-top:2px; opacity:0.6; }
        .kpi-pulse { animation:pulse 2s infinite; }

        /* Refresh */
        .refresh-btn { padding:7px 14px; border-radius:8px; background:#F9FAFB; border:1px solid #E5E7EB; font-size:12px; cursor:pointer; color:#374151; font-weight:500; display:flex; align-items:center; gap:5px; transition:all 0.15s; }
        .refresh-btn:hover { background:#EFF6FF; border-color:#BFDBFE; color:#1D4ED8; }
        .spin-icon { display:inline-block; transition:transform 0.3s; }
        .spinning { animation:spin 0.6s linear infinite; }

        /* Chart */
        .chart-wrap { padding:20px 24px; margin-bottom:16px; }
        .bar-col { flex:1; display:flex; flex-direction:column; align-items:center; gap:4px; cursor:pointer; border-radius:8px; padding:4px 2px; transition:background 0.15s; position:relative; }
        .bar-col:hover { background:rgba(37,99,235,0.04); }
        .bar-area { width:100%; height:88px; display:flex; align-items:flex-end; justify-content:center; }
        .bar-fill { width:60%; min-width:8px; border-radius:6px 6px 3px 3px; transition:height 0.55s cubic-bezier(0.34,1.56,0.64,1), filter 0.15s, width 0.15s; animation:barGrow 0.55s ease both; }
        .bar-col:hover .bar-fill { width:72%; filter:brightness(1.08); }
        .bar-tooltip { position:absolute; top:-36px; left:50%; transform:translateX(-50%); background:#1E3A5F; color:#fff; font-size:11px; font-weight:700; padding:4px 10px; border-radius:7px; white-space:nowrap; pointer-events:none; box-shadow:0 2px 8px rgba(0,0,0,0.2); }
        .bar-tooltip::after { content:""; position:absolute; top:100%; left:50%; transform:translateX(-50%); border:4px solid transparent; border-top-color:#1E3A5F; }

        /* Year nav */
        .year-nav { display:flex; align-items:center; gap:2px; background:#F3F4F6; border-radius:8px; padding:3px; }
        .year-btn { background:none; border:none; cursor:pointer; color:#6B7280; width:28px; height:28px; border-radius:6px; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700; transition:all 0.15s; }
        .year-btn:hover:not(:disabled) { background:#E5E7EB; color:#111827; }
        .year-btn:disabled { color:#D1D5DB; cursor:not-allowed; }

        /* Toolbar */
        .toolbar { display:flex; gap:0; align-items:stretch; padding:0; margin-bottom:14px; overflow:hidden; }
        .toolbar-search { position:relative; flex:1 1 200px; border-right:1px solid #E5E7EB; transition:background 0.15s; }
        .toolbar-search:focus-within { background:#FAFBFF; }
        .toolbar-search svg { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:#9CA3AF; pointer-events:none; transition:color 0.15s; }
        .toolbar-search:focus-within svg { color:#2563EB; }
        .search-input { width:100%; height:46px; padding:0 14px 0 38px; border:none; font-size:13px; outline:none; background:transparent; color:#111827; }
        .search-input::placeholder { color:#B0B7C3; }
        .toolbar-date-wrap { display:flex; align-items:center; border-right:1px solid #E5E7EB; flex-shrink:0; }
        .toolbar-date-label { font-size:11px; color:#9CA3AF; font-weight:600; padding:0 10px 0 14px; white-space:nowrap; letter-spacing:0.04em; }
        .date-input { height:46px; padding:0 10px; border:none; font-size:12px; outline:none; background:transparent; cursor:pointer; color:#374151; min-width:120px; }
        .date-sep { font-size:12px; color:#D1D5DB; }
        .toolbar-right { display:flex; align-items:center; gap:8px; padding:0 14px; flex-shrink:0; }
        .clear-btn { padding:5px 10px; border-radius:6px; background:#FEF2F2; border:1px solid #FECACA; font-size:11px; color:#DC2626; cursor:pointer; font-weight:600; white-space:nowrap; transition:all 0.15s; display:flex; align-items:center; gap:4px; }
        .clear-btn:hover { background:#FEE2E2; transform:scale(1.03); }

        /* Table */
        .msg-table { width:100%; border-collapse:collapse; }
        .msg-thead { background:#F9FAFB; border-bottom:1px solid #E5E7EB; }
        .msg-th { padding:11px 16px; text-align:left; font-size:10px; font-weight:700; color:#6B7280; letter-spacing:0.06em; text-transform:uppercase; white-space:nowrap; }
        .msg-row { cursor:pointer; transition:background 0.12s, box-shadow 0.12s; border-bottom:1px solid #F3F4F6; position:relative; animation:rowFadeIn 0.25s ease both; }
        .msg-row:hover { background:#F5F8FF; box-shadow:inset 3px 0 0 #3B82F6; }
        .msg-row-sel { background:#EFF6FF !important; box-shadow:inset 3px 0 0 #2563EB !important; }
        .msg-row:last-child { border-bottom:none; }
        .msg-td { padding:13px 16px; }
        .badge { font-size:10px; font-weight:600; padding:3px 9px; border-radius:6px; border:1px solid; white-space:nowrap; display:inline-flex; align-items:center; gap:4px; transition:all 0.2s; }
        .dot { width:5px; height:5px; border-radius:50%; display:inline-block; flex-shrink:0; }
        .dot-pulse { animation:dotPulse 1.8s ease-in-out infinite; }

        /* Skeleton */
        .skeleton { border-radius:6px; background:linear-gradient(90deg,#F3F4F6 25%,#E9EAEC 50%,#F3F4F6 75%); background-size:400px 100%; animation:skeletonShimmer 1.4s infinite; }

        /* Modal overlay */
        .modal-overlay { position:fixed; inset:0; z-index:400; background:rgba(10,20,40,0.55); backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; padding:20px; animation:overlayIn 0.2s ease; }
        .modal-box { background:#fff; border-radius:20px; width:100%; max-width:920px; max-height:90vh; display:flex; flex-direction:column; box-shadow:0 24px 80px rgba(0,0,0,0.22); animation:modalIn 0.28s cubic-bezier(0.34,1.56,0.64,1); overflow:hidden; }
        .modal-header { padding:20px 24px 18px; border-bottom:1px solid #F0F2F5; display:flex; align-items:flex-start; gap:14px; flex-shrink:0; background:linear-gradient(135deg,#F8FAFF 0%,#ffffff 100%); }
        .modal-avatar { width:48px; height:48px; border-radius:14px; background:linear-gradient(135deg,#1E3A5F,#3B82F6); display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:800; color:#fff; flex-shrink:0; box-shadow:0 4px 12px rgba(37,99,235,0.3); letter-spacing:-0.03em; }
        .modal-body { display:flex; flex:1; overflow:hidden; }
        .modal-left { width:268px; flex-shrink:0; border-right:1px solid #F0F2F5; padding:20px 18px; overflow-y:auto; background:#FAFBFD; }
        .modal-left::-webkit-scrollbar { width:3px; } .modal-left::-webkit-scrollbar-thumb { background:#E5E7EB; border-radius:3px; }
        .modal-right { flex:1; padding:22px 24px; overflow-y:auto; display:flex; flex-direction:column; gap:18px; }
        .modal-right::-webkit-scrollbar { width:4px; } .modal-right::-webkit-scrollbar-track { background:transparent; } .modal-right::-webkit-scrollbar-thumb { background:#E5E7EB; border-radius:4px; }
        .modal-footer { padding:14px 24px; border-top:1px solid #F0F2F5; display:flex; align-items:center; gap:8px; flex-shrink:0; background:#FAFBFD; }

        .close-btn { width:34px; height:34px; border-radius:10px; background:#F3F4F6; border:none; cursor:pointer; color:#6B7280; display:flex; align-items:center; justify-content:center; font-weight:700; transition:all 0.15s; flex-shrink:0; }
        .close-btn:hover { background:#FEE2E2; color:#DC2626; transform:scale(1.08); }
        .nav-btn { width:34px; height:34px; border-radius:10px; background:#F3F4F6; border:none; cursor:pointer; color:#374151; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:700; transition:all 0.15s; flex-shrink:0; }
        .nav-btn:hover:not(:disabled) { background:#EFF6FF; color:#1D4ED8; }
        .nav-btn:disabled { opacity:0.3; cursor:not-allowed; }
        .info-row { display:flex; gap:8px; align-items:flex-start; padding:7px 8px; border-radius:8px; transition:background 0.12s; }
        .info-row:hover { background:#F0F2F5; }
        .info-label { font-size:11px; color:#9CA3AF; width:62px; flex-shrink:0; font-weight:600; padding-top:2px; letter-spacing:0.02em; }
        .info-val { font-size:12.5px; color:#1E293B; font-weight:500; word-break:break-all; line-height:1.5; }
        .msg-box { position:relative; background:linear-gradient(160deg,#F8FAFF 0%,#EEF4FF 100%); border-radius:14px; padding:20px 22px 20px 26px; font-size:14px; color:#1E293B; line-height:1.9; border:1px solid #DBEAFE; border-left:4px solid #3B82F6; white-space:pre-wrap; word-break:break-word; flex:1; }
        .msg-box-quote { position:absolute; top:8px; right:14px; font-size:48px; color:#DBEAFE; line-height:1; pointer-events:none; font-family:Georgia,serif; }
        .sec-title { font-size:10px; color:#9CA3AF; font-weight:700; margin-bottom:10px; text-transform:uppercase; letter-spacing:0.07em; display:flex; align-items:center; gap:6px; }
        .sec-title::before { content:""; display:inline-block; width:3px; height:12px; background:linear-gradient(180deg,#3B82F6,#1D4ED8); border-radius:2px; }
        .st-btn { flex:1; padding:10px 6px; border-radius:10px; font-size:12px; font-weight:700; cursor:pointer; border:1.5px solid; transition:all 0.18s cubic-bezier(0.34,1.56,0.64,1); }
        .st-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 4px 12px rgba(0,0,0,0.12); }
        .st-btn:active:not(:disabled) { transform:scale(0.97); }
        .st-btn:disabled { opacity:0.5; cursor:not-allowed; transform:none; }
        .action-a { flex:1; padding:11px 10px; border-radius:11px; font-size:13px; font-weight:600; text-align:center; text-decoration:none; display:flex; align-items:center; justify-content:center; gap:6px; transition:all 0.18s; }
        .action-a:hover { transform:translateY(-1px); box-shadow:0 5px 16px rgba(0,0,0,0.15); opacity:0.92; }

        /* Empty / Loading */
        .empty-state { padding:64px; text-align:center; }

        /* Toast */
        .toast { position:fixed; bottom:24px; right:24px; z-index:999; padding:12px 18px; border-radius:12px; font-size:13px; font-weight:600; display:flex; align-items:center; gap:8px; box-shadow:0 8px 28px rgba(0,0,0,0.15); animation:toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        .toast-success { background:#0B1F3A; color:#fff; }
        .toast-info    { background:#2563EB; color:#fff; }

        /* Section fade-in */
        .section-appear { animation:fadeUp 0.4s ease both; }

        /* Responsive */
        @media (max-width:900px) {
          .kpi-grid { grid-template-columns:repeat(2,1fr); gap:10px; }
          .content { padding:14px 16px; }
          .topbar { padding:0 16px; }
          .chart-wrap { padding:16px; }
          .modal-box { max-width:100%; border-radius:16px; max-height:95vh; }
          .modal-left { width:220px; }
        }
        @media (max-width:660px) {
          .modal-body { flex-direction:column; }
          .modal-left { width:100%; border-right:none; border-bottom:1px solid #F0F2F5; padding:14px 16px; overflow-y:visible; }
          .modal-box { border-radius:16px 16px 0 0; max-height:96vh; position:fixed; bottom:0; left:0; right:0; max-width:100%; margin:0; }
          .modal-overlay { align-items:flex-end; padding:0; }
          .modal-right { padding:16px; }
          .modal-footer { padding:12px 16px; }
        }
        @media (max-width:600px) {
          .topbar { height:52px; }
          .topbar-title { font-size:13px !important; }
          .topbar-sub { display:none; }
          .content { padding:12px; }
          .kpi-grid { gap:8px; margin-bottom:12px; }
          .kpi { padding:14px; border-radius:12px; }
          .kpi-num { font-size:28px !important; }
          .kpi-label { font-size:12px !important; }
          .kpi-sub { display:none; }
          .chart-wrap { padding:14px 12px; margin-bottom:12px; }
          .toolbar { flex-direction:column; }
          .toolbar-search { border-right:none; border-bottom:1px solid #E5E7EB; width:100%; }
          .toolbar-date-wrap { border-right:none; border-bottom:1px solid #E5E7EB; width:100%; }
          .toolbar-date-label { padding-left:14px; }
          .date-input { flex:1; min-width:0; font-size:11px; }
          .toolbar-right { justify-content:space-between; padding:8px 14px; }
          .msg-table-wrap { overflow-x:auto; -webkit-overflow-scrolling:touch; }
          .msg-th { padding:10px; font-size:9px; }
          .msg-td { padding:11px 10px; }
          .msg-th-content,.msg-th-service { display:none; }
          .msg-td-content,.msg-td-service { display:none; }
          .empty-state { padding:40px 20px; }
          .refresh-btn span:last-child { display:none; }
          .toast { bottom:16px; right:16px; left:16px; }
        }
      `}</style>

      <div className="page-bg">

        {/* ── Top Bar ── */}
        <div className="topbar">
          <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
            <div style={{ width:"36px", height:"36px", background:"linear-gradient(135deg,#1E3A5F 0%,#2563EB 100%)", borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"17px", boxShadow:"0 2px 10px rgba(37,99,235,0.35)", flexShrink:0 }}>
              💬
            </div>
            <div>
              <div className="topbar-title" style={{ fontSize:"14px", fontWeight:700, color:"#111827", letterSpacing:"-0.01em" }}>メッセージ管理</div>
              <div className="topbar-sub" style={{ fontSize:"11px", color:"#9CA3AF" }}>Webフォームからのお問い合わせ</div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            {counts.new > 0 && (
              <span style={{ fontSize:"11px", color:"#1D4ED8", background:"#EFF6FF", border:"1px solid #BFDBFE", padding:"3px 10px", borderRadius:"20px", fontWeight:700 }}>
                未対応 {counts.new}件
              </span>
            )}
            <button className="refresh-btn" onClick={() => load(true)}>
              <span className={`spin-icon ${refreshing ? "spinning" : ""}`} style={{ fontSize:"15px" }}>↻</span>
              <span>更新</span>
            </button>
          </div>
        </div>

        <div className="content">

          {/* ── KPI Cards ── */}
          <div className="kpi-grid">
            {KPI_CARDS.map((c, i) => {
              const isActive = filterStatus === c.key;
              const cnt = counts[c.key as keyof typeof counts];
              return (
                <div key={c.key}
                  className={`kpi section-appear${c.pulse && !isActive ? " kpi-pulse" : ""}`}
                  style={{
                    background: isActive ? c.activeBg : "#fff",
                    borderColor: isActive ? c.activeBd : c.idleBd,
                    boxShadow: isActive ? `0 6px 20px rgba(0,0,0,0.14)` : "0 1px 3px rgba(0,0,0,0.04)",
                    animationDelay: `${i * 0.07}s`,
                  }}
                  onClick={() => setFilterStatus(filterStatus === c.key && c.key !== "all" ? "all" : c.key)}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <div>
                      <div className="kpi-num" style={{ color: isActive ? "#fff" : c.color }}>
                        <KpiNum value={cnt} />
                      </div>
                      <div className="kpi-label" style={{ color: isActive ? "rgba(255,255,255,0.9)" : c.color }}>{c.label}</div>
                      <div className="kpi-sub" style={{ color: isActive ? "rgba(255,255,255,0.6)" : "#9CA3AF" }}>{c.sub}</div>
                    </div>
                    <div style={{ width:"40px", height:"40px", borderRadius:"11px", background: isActive ? "rgba(255,255,255,0.15)" : "#F3F4F6", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"19px", transition:"transform 0.2s" }}>
                      {c.icon}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Monthly Chart ── */}
          <div className="card chart-wrap section-appear" style={{ animationDelay:"0.15s" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:showChart ? "20px" : "0", gap:"10px", flexWrap:"wrap" }}>
              <div>
                <div style={{ fontSize:"13px", fontWeight:700, color:"#111827" }}>月別メッセージ数</div>
                <div style={{ fontSize:"11px", color:"#9CA3AF", marginTop:"2px" }}>{chartYear}年のお問い合わせ推移</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                <div className="year-nav">
                  <button className="year-btn" onClick={() => setChartYear(y => y - 1)}>‹</button>
                  <span style={{ fontSize:"12px", fontWeight:700, color:"#374151", minWidth:"40px", textAlign:"center" }}>{chartYear}</span>
                  <button className="year-btn" onClick={() => setChartYear(y => y + 1)} disabled={chartYear >= currentYear}>›</button>
                </div>
                <button onClick={() => setShowChart(!showChart)}
                  style={{ fontSize:"11px", color:"#6B7280", background:"#F3F4F6", border:"none", borderRadius:"7px", padding:"6px 12px", cursor:"pointer", fontWeight:500, transition:"all 0.15s", whiteSpace:"nowrap" }}>
                  {showChart ? "非表示" : "表示"}
                </button>
              </div>
            </div>

            {showChart && (
              <div style={{ position:"relative" }}>
                {/* Grid lines */}
                <div style={{ position:"absolute", left:0, right:0, top:0, bottom:"22px", display:"flex", flexDirection:"column", justifyContent:"space-between", pointerEvents:"none", zIndex:0 }}>
                  {[0,1,2,3].map(i => (
                    <div key={i} style={{ height:"1px", background: i===3 ? "#E5E7EB" : "#F3F4F6" }} />
                  ))}
                </div>
                <div style={{ display:"flex", alignItems:"flex-end", gap:"2px", position:"relative", zIndex:1 }}>
                  {monthlyStats.map(({ month, count, label }, idx) => {
                    const isCurrent = month === currentMonthKey;
                    const isHovered = hoveredBar === idx;
                    return (
                      <div key={month} className="bar-col"
                        style={{ animationDelay:`${idx * 0.04}s` }}
                        onMouseEnter={() => setHoveredBar(idx)}
                        onMouseLeave={() => setHoveredBar(null)}>
                        {/* Tooltip */}
                        {isHovered && count > 0 && (
                          <div className="bar-tooltip">{count}件 · {label}</div>
                        )}
                        <div style={{ fontSize:"11px", fontWeight:700, color: count>0 ? "#1D4ED8" : "transparent", minHeight:"18px", textAlign:"center", transition:"color 0.15s" }}>
                          {count || ""}
                        </div>
                        <div className="bar-area">
                          <div className="bar-fill" style={{
                            height: count===0 ? "3px" : `${Math.max(10,(count/maxCount)*88)}px`,
                            background: count===0
                              ? "#EEF0F3"
                              : isCurrent
                                ? "linear-gradient(180deg,#93C5FD 0%,#1D4ED8 100%)"
                                : isHovered
                                  ? "linear-gradient(180deg,#93C5FD 0%,#2563EB 100%)"
                                  : "linear-gradient(180deg,#BFDBFE 0%,#3B82F6 100%)",
                            boxShadow: count>0 ? (isHovered ? "0 4px 16px rgba(37,99,235,0.35)" : "0 2px 8px rgba(37,99,235,0.15)") : "none",
                          }} />
                        </div>
                        <div style={{ fontSize:"10px", color: isCurrent ? "#2563EB" : "#9CA3AF", fontWeight: isCurrent ? 700 : 400, textAlign:"center", transition:"color 0.15s" }}>
                          {label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Toolbar ── */}
          <div className="card toolbar section-appear" style={{ marginBottom:"14px", animationDelay:"0.2s" }}>
            <div className="toolbar-search">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <path d="M17 17L13 13M15 8.5A6.5 6.5 0 112 8.5a6.5 6.5 0 0113 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input className="search-input" type="text" placeholder="名前・会社名・メールで検索..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="toolbar-date-wrap">
              <span className="toolbar-date-label">期間</span>
              <input className="date-input" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              <span className="date-sep">—</span>
              <input className="date-input" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
            <div className="toolbar-right">
              {hasFilter && (
                <button className="clear-btn" onClick={() => { setSearch(""); setDateFrom(""); setDateTo(""); setFilterStatus("all"); }}>
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                  クリア
                </button>
              )}
              <div style={{ fontSize:"12px", color:"#6B7280", fontWeight:500, whiteSpace:"nowrap" }}>
                <span style={{ fontWeight:700, color:"#111827" }}>{filtered.length}</span> 件
              </div>
            </div>
          </div>

          {/* ── Table (full width always) ── */}
          <div className="card section-appear" style={{ overflow:"hidden", animationDelay:"0.25s" }}>
            {loading ? (
              <div>
                <div style={{ padding:"11px 16px", background:"#F9FAFB", borderBottom:"1px solid #E5E7EB", display:"flex", gap:"24px" }}>
                  {[80,120,80,140,70].map((w,i) => <div key={i} className="skeleton" style={{ height:"10px", width:`${w}px`, borderRadius:"4px" }} />)}
                </div>
                {[1,2,3].map(i => (
                  <div key={i} style={{ padding:"16px", borderBottom:"1px solid #F3F4F6", display:"flex", gap:"24px", alignItems:"center" }}>
                    <div className="skeleton" style={{ height:"12px", width:"80px" }} />
                    <div style={{ flex:1 }}>
                      <div className="skeleton" style={{ height:"13px", width:"100px", marginBottom:"6px" }} />
                      <div className="skeleton" style={{ height:"10px", width:"70px" }} />
                    </div>
                    <div className="skeleton" style={{ height:"20px", width:"60px", borderRadius:"6px" }} />
                    <div className="skeleton" style={{ height:"11px", width:"120px" }} />
                    <div className="skeleton" style={{ height:"20px", width:"56px", borderRadius:"6px" }} />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <div style={{ fontSize:"48px", marginBottom:"12px", opacity:0.25 }}>📭</div>
                <div style={{ fontSize:"14px", color:"#6B7280", fontWeight:600 }}>データが見つかりません</div>
                {hasFilter && <div style={{ fontSize:"12px", color:"#9CA3AF", marginTop:"6px" }}>フィルターを変更してください</div>}
              </div>
            ) : (
              <div className="msg-table-wrap">
                <table className="msg-table">
                  <thead className="msg-thead">
                    <tr>
                      <th className="msg-th" style={{ width:"130px" }}>日時</th>
                      <th className="msg-th">送信者</th>
                      <th className="msg-th msg-th-service" style={{ width:"108px" }}>サービス</th>
                      <th className="msg-th msg-th-content">内容プレビュー</th>
                      <th className="msg-th" style={{ width:"96px" }}>ステータス</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((m, idx) => {
                      const st = ST[m.status] || ST.new;
                      const svc = SVC[m.service || ""];
                      const isSel = selected?.id === m.id;
                      return (
                        <tr key={m.id}
                          className={`msg-row${isSel ? " msg-row-sel" : ""}`}
                          style={{ animationDelay:`${idx * 0.04}s` }}
                          onClick={() => setSelected(m)}>
                          <td className="msg-td" style={{ color:"#6B7280", fontSize:"11px", whiteSpace:"nowrap", fontVariantNumeric:"tabular-nums" }}>
                            {fmt(m.created_at)}
                          </td>
                          <td className="msg-td">
                            <div style={{ fontWeight:600, color:"#111827", fontSize:"13px" }}>{m.name}</div>
                            {m.company && <div style={{ fontSize:"11px", color:"#9CA3AF", marginTop:"2px" }}>{m.company}</div>}
                          </td>
                          <td className="msg-td msg-td-service">
                            {svc
                              ? <span className="badge" style={{ color:svc.color, background:svc.bg, borderColor:svc.border }}>{svc.ja}</span>
                              : <span style={{ color:"#D1D5DB", fontSize:"12px" }}>—</span>}
                          </td>
                          <td className="msg-td msg-td-content" style={{ maxWidth:"260px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontSize:"12px", color:"#6B7280" }}>
                            {m.message || <span style={{ color:"#D1D5DB" }}>—</span>}
                          </td>
                          <td className="msg-td">
                            <span className="badge" style={{ color:st.tc, background:st.tb, borderColor:st.border }}>
                              <span className={`dot${m.status==="new" ? " dot-pulse" : ""}`} style={{ background:st.dot }} />
                              {st.ja}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Detail Modal ── */}
      {selected && (() => {
        const st = ST[selected.status] || ST.new;
        const svc = SVC[selected.service || ""];
        const selIdx = filtered.findIndex(m => m.id === selected.id);
        const hasPrev = selIdx > 0;
        const hasNext = selIdx < filtered.length - 1;
        const initials = selected.name.trim().slice(0, 2).toUpperCase();
        return (
          <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
            <div className="modal-box">

              {/* ── Modal Header ── */}
              <div className="modal-header">
                <div className="modal-avatar">{initials}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"10px", flexWrap:"wrap" }}>
                    <span style={{ fontSize:"17px", fontWeight:800, color:"#0F172A", letterSpacing:"-0.02em" }}>{selected.name}</span>
                    <span className="badge" style={{ color:st.tc, background:st.tb, borderColor:st.border, fontSize:"11px", padding:"4px 11px" }}>
                      <span className={`dot${selected.status==="new" ? " dot-pulse" : ""}`} style={{ width:"6px", height:"6px", background:st.dot }} />
                      {st.ja}
                    </span>
                  </div>
                  <div style={{ marginTop:"4px", display:"flex", gap:"12px", flexWrap:"wrap" }}>
                    {selected.company && <span style={{ fontSize:"12px", color:"#64748B", fontWeight:500 }}>{selected.company}</span>}
                    <span style={{ fontSize:"12px", color:"#94A3B8" }}>{fmt(selected.created_at)}</span>
                  </div>
                </div>
                <button className="close-btn" onClick={() => setSelected(null)} title="閉じる (ESC)">
                  <svg width="13" height="13" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                </button>
              </div>

              {/* ── Modal Body ── */}
              <div className="modal-body">

                {/* Left: Contact Info */}
                <div className="modal-left">
                  <div style={{ fontSize:"10px", fontWeight:700, color:"#94A3B8", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"12px" }}>連絡先情報</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:"2px" }}>
                    {[
                      { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, label:"メール", value:selected.email },
                      { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>, label:"電話番号", value:selected.phone||"—" },
                      { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>, label:"種別", value:selected.type==="business" ? "企業" : "個人" },
                      { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>, label:"サービス", value:svc?.ja||"—" },
                      { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>, label:"受信日時", value:fmt(selected.created_at) },
                    ].map(r => (
                      <div key={r.label} className="info-row">
                        <span style={{ width:"20px", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>{r.icon}</span>
                        <span className="info-label">{r.label}</span>
                        <span className="info-val">{r.value}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ height:"1px", background:"#EEF0F4", margin:"16px 0" }} />

                  {/* Status change in left panel */}
                  <div style={{ fontSize:"10px", fontWeight:700, color:"#94A3B8", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"10px" }}>ステータス変更</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
                    {Object.entries(ST).map(([k, v]) => {
                      const isAct = selected.status === k;
                      const isLoading = updatingId === selected.id;
                      return (
                        <button key={k} className="st-btn"
                          disabled={isLoading}
                          onClick={() => updateStatus(selected.id, k)}
                          style={{ display:"flex", alignItems:"center", gap:"8px", textAlign:"left", background: isAct ? v.tc : v.tb, color: isAct ? "#fff" : v.tc, borderColor: isAct ? v.tc : v.border, boxShadow: isAct ? `0 3px 10px ${v.tc}44` : "none", flex:"unset" }}>
                          <span style={{ width:"8px", height:"8px", borderRadius:"50%", background: isAct ? "rgba(255,255,255,0.7)" : v.dot, flexShrink:0 }} />
                          {isLoading && isAct ? "更新中…" : v.ja}
                          {isAct && <svg style={{ marginLeft:"auto" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Message content */}
                <div className="modal-right">
                  <div>
                    <div className="sec-title">
                      メッセージ内容
                      <span style={{ marginLeft:"auto", fontSize:"10px", color:"#94A3B8", fontWeight:400, textTransform:"none", letterSpacing:0 }}>
                        {selected.message ? `${selected.message.length}文字` : ""}
                      </span>
                    </div>
                    {selected.message ? (
                      <div className="msg-box">
                        <span className="msg-box-quote">&ldquo;</span>
                        {selected.message}
                      </div>
                    ) : (
                      <div style={{ padding:"32px", textAlign:"center", color:"#D1D5DB", fontSize:"13px" }}>メッセージなし</div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Modal Footer: actions + navigation ── */}
              <div className="modal-footer">
                <a href={`mailto:${selected.email}`} className="action-a"
                  style={{ flex:"none", padding:"10px 20px", background:"linear-gradient(135deg,#1E3A5F,#2563EB)", color:"#fff", boxShadow:"0 2px 10px rgba(37,99,235,0.3)", borderRadius:"11px" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  メール送信
                </a>
                {selected.phone && (
                  <a href={`tel:${selected.phone}`} className="action-a"
                    style={{ flex:"none", padding:"10px 18px", background:"#ECFDF5", color:"#065F46", border:"1px solid #A7F3D0", borderRadius:"11px" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                    電話
                  </a>
                )}
                <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:"6px" }}>
                  <span style={{ fontSize:"11px", color:"#94A3B8", marginRight:"4px" }}>
                    {selIdx + 1} / {filtered.length}
                  </span>
                  <button className="nav-btn" disabled={!hasPrev} onClick={() => setSelected(filtered[selIdx - 1])} title="前へ">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="15 18 9 12 15 6"/></svg>
                  </button>
                  <button className="nav-btn" disabled={!hasNext} onClick={() => setSelected(filtered[selIdx + 1])} title="次へ">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Toast notification ── */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === "success"
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          }
          {toast.msg}
        </div>
      )}
    </>
  );
}
