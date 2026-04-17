"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
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
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
function fmtMonth(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function MessagesPage() {
  const router = useRouter();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<Msg | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showChart, setShowChart] = useState(true);

  const load = useCallback(async (spin = false) => {
    if (spin) setRefreshing(true);
    const res = await fetch("/api/admin/messages");
    if (res.status === 401) { router.push("/admin/login"); return; }
    const d = await res.json();
    setMsgs(d.data || []);
    setLoading(false);
    if (spin) setTimeout(() => setRefreshing(false), 400);
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/admin/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setMsgs(p => p.map(m => m.id === id ? { ...m, status } : m));
    setSelected(p => p?.id === id ? { ...p, status } : p);
  };

  const monthlyStats = useMemo(() => {
    const map: Record<string, number> = {};
    msgs.forEach(m => { const k = fmtMonth(m.created_at); map[k] = (map[k] || 0) + 1; });
    const months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i);
      months.push(`${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}`);
    }
    return months.map(m => ({ month: m, count: map[m] || 0, label: `${parseInt(m.slice(5))}月` }));
  }, [msgs]);

  const maxCount = Math.max(...monthlyStats.map(s => s.count), 1);

  const filtered = useMemo(() => msgs.filter(m => {
    if (filterStatus !== "all" && m.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!m.name.toLowerCase().includes(q) && !m.email.toLowerCase().includes(q) && !(m.company || "").toLowerCase().includes(q)) return false;
    }
    if (dateFrom && new Date(m.created_at) < new Date(dateFrom)) return false;
    if (dateTo && new Date(m.created_at) > new Date(dateTo + "T23:59:59")) return false;
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
    { key: "all",       icon: "📥", label: "合計",     sub: "すべての問い合わせ", color: "#374151", activeBg: "#1F2937",  activeBd: "#374151", idleBd: "#E5E7EB" },
    { key: "new",       icon: "🔔", label: "新規",     sub: "未対応",             color: "#1D4ED8", activeBg: "#1D4ED8",  activeBd: "#2563EB", idleBd: "#BFDBFE" },
    { key: "contacted", icon: "💬", label: "連絡済み", sub: "対応中",             color: "#065F46", activeBg: "#059669",  activeBd: "#10B981", idleBd: "#A7F3D0" },
    { key: "closed",    icon: "✅", label: "完了",     sub: "クローズ済み",       color: "#374151", activeBg: "#4B5563",  activeBd: "#6B7280", idleBd: "#D1D5DB" },
  ];

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideRight { from { opacity: 0; transform: translateX(12px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes barGrow { from { height: 0 !important; } to { } }
        .page-bg { background: #F0F2F5; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; }
        .topbar { position: sticky; top: 0; z-index: 100; background: #fff; border-bottom: 1px solid #E5E7EB; padding: 0 28px; height: 60px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
        .content { padding: 22px 28px; }
        .card { background: #fff; border: 1px solid #E5E7EB; border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .kpi-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 18px; }
        .kpi { border-radius: 14px; padding: 18px 20px; cursor: pointer; border: 1.5px solid; transition: transform 0.18s ease, box-shadow 0.18s ease; animation: fadeUp 0.3s ease both; }
        .kpi:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.1) !important; }
        .kpi-num { font-size: 34px; font-weight: 800; line-height: 1; letter-spacing: -0.03em; }
        .kpi-label { font-size: 13px; font-weight: 600; margin-top: 6px; }
        .kpi-sub { font-size: 10px; margin-top: 2px; opacity: 0.6; }
        .refresh-btn { padding: 7px 14px; border-radius: 8px; background: #F9FAFB; border: 1px solid #E5E7EB; font-size: 12px; cursor: pointer; color: #374151; font-weight: 500; display: flex; align-items: center; gap: 5px; transition: background 0.15s; }
        .refresh-btn:hover { background: #F3F4F6; }
        .spin-icon { display: inline-block; }
        .spinning { animation: spin 0.6s linear infinite; }
        .chart-wrap { padding: 20px 24px; margin-bottom: 16px; }
        .bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 5px; }
        .bar-track { width: 100%; height: 72px; display: flex; align-items: flex-end; background: #F3F4F6; border-radius: 8px; overflow: hidden; }
        .bar-fill { width: 100%; border-radius: 8px 8px 0 0; transition: height 0.6s cubic-bezier(0.34,1.56,0.64,1); animation: barGrow 0.6s ease both; }
        .toolbar { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; padding: 12px 16px; margin-bottom: 14px; }
        .search-wrap { position: relative; flex: 1 1 240px; }
        .search-wrap svg { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #9CA3AF; pointer-events: none; }
        .search-input { width: 100%; padding: 8px 12px 8px 32px; border-radius: 8px; border: 1px solid #E5E7EB; font-size: 13px; outline: none; background: #F9FAFB; color: #111827; transition: border-color 0.15s, box-shadow 0.15s; }
        .search-input:focus { border-color: #2563EB; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); background: #fff; }
        .date-input { padding: 7px 10px; border-radius: 8px; border: 1px solid #E5E7EB; font-size: 12px; outline: none; background: #F9FAFB; cursor: pointer; color: #374151; transition: border-color 0.15s; }
        .date-input:focus { border-color: #2563EB; }
        .clear-btn { padding: 7px 12px; border-radius: 8px; background: #FEF2F2; border: 1px solid #FECACA; font-size: 12px; color: #DC2626; cursor: pointer; font-weight: 500; white-space: nowrap; transition: background 0.15s; }
        .clear-btn:hover { background: #FEE2E2; }
        .table-layout { display: grid; gap: 14px; align-items: start; }
        .msg-table { width: 100%; border-collapse: collapse; }
        .msg-thead { background: #F9FAFB; border-bottom: 1px solid #E5E7EB; }
        .msg-th { padding: 11px 16px; text-align: left; font-size: 10px; font-weight: 700; color: #6B7280; letter-spacing: 0.06em; text-transform: uppercase; white-space: nowrap; }
        .msg-row { cursor: pointer; transition: background 0.1s; border-bottom: 1px solid #F3F4F6; }
        .msg-row:hover { background: #F8FAFC; }
        .msg-row-sel { background: #EFF6FF !important; }
        .msg-row:last-child { border-bottom: none; }
        .msg-td { padding: 13px 16px; }
        .badge { font-size: 10px; font-weight: 600; padding: 3px 9px; border-radius: 6px; border: 1px solid; white-space: nowrap; display: inline-flex; align-items: center; gap: 4px; }
        .dot { width: 5px; height: 5px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
        .detail-panel { border-radius: 14px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04); position: sticky; top: 76px; animation: slideRight 0.2s ease; }
        .detail-header { padding: 18px 20px; border-bottom: 1px solid #F3F4F6; display: flex; justify-content: space-between; align-items: flex-start; }
        .detail-body { padding: 18px 20px; }
        .close-btn { width: 28px; height: 28px; border-radius: 8px; background: #F3F4F6; border: none; cursor: pointer; color: #6B7280; font-size: 14px; display: flex; align-items: center; justify-content: center; font-weight: 700; transition: background 0.15s; flex-shrink: 0; }
        .close-btn:hover { background: #E5E7EB; }
        .info-row { display: flex; gap: 8px; align-items: flex-start; }
        .info-label { font-size: 11px; color: #9CA3AF; width: 70px; flex-shrink: 0; font-weight: 500; padding-top: 1px; }
        .info-val { font-size: 12px; color: #374151; font-weight: 500; word-break: break-all; }
        .msg-box { background: #F9FAFB; border-radius: 10px; padding: 12px 14px; font-size: 12px; color: #374151; line-height: 1.75; border: 1px solid #F3F4F6; max-height: 160px; overflow: auto; }
        .sec-title { font-size: 10px; color: #9CA3AF; font-weight: 700; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.06em; }
        .st-btn { flex: 1; padding: 8px 4px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer; border: 1.5px solid; transition: all 0.15s ease; }
        .st-btn:hover { filter: brightness(0.95); }
        .action-a { flex: 1; padding: 10px 8px; border-radius: 9px; font-size: 12px; font-weight: 600; text-align: center; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 5px; transition: opacity 0.15s; }
        .action-a:hover { opacity: 0.85; }
        .empty-state { padding: 64px; text-align: center; }
        .loader { width: 30px; height: 30px; border: 3px solid #E5E7EB; border-top-color: #2563EB; border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto 12px; }
        @media (max-width: 900px) {
          .kpi-grid { grid-template-columns: repeat(2,1fr); }
          .table-layout { grid-template-columns: 1fr !important; }
          .content { padding: 16px; }
          .topbar { padding: 0 16px; }
        }
      `}</style>

      <div className="page-bg">

        {/* ── Top Bar ── */}
        <div className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "34px", height: "34px", background: "linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", boxShadow: "0 2px 8px rgba(37,99,235,0.3)" }}>
              💬
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827", letterSpacing: "-0.01em" }}>メッセージ管理</div>
              <div style={{ fontSize: "11px", color: "#9CA3AF" }}>Webフォームからのお問い合わせ</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "12px", color: "#6B7280", background: "#F3F4F6", padding: "4px 12px", borderRadius: "20px", fontWeight: 500 }}>
              {msgs.length} 件
            </span>
            <button className="refresh-btn" onClick={() => load(true)}>
              <span className={`spin-icon ${refreshing ? "spinning" : ""}`} style={{ fontSize: "14px" }}>↻</span>
              更新
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
                <div key={c.key} className="kpi"
                  style={{
                    background: isActive ? c.activeBg : "#fff",
                    borderColor: isActive ? c.activeBd : c.idleBd,
                    boxShadow: isActive ? `0 4px 14px rgba(0,0,0,0.12)` : "0 1px 3px rgba(0,0,0,0.04)",
                    animationDelay: `${i * 0.05}s`,
                  }}
                  onClick={() => setFilterStatus(filterStatus === c.key && c.key !== "all" ? "all" : c.key)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div className="kpi-num" style={{ color: isActive ? "#fff" : c.color }}>{cnt}</div>
                      <div className="kpi-label" style={{ color: isActive ? "rgba(255,255,255,0.9)" : c.color }}>{c.label}</div>
                      <div className="kpi-sub" style={{ color: isActive ? "rgba(255,255,255,0.6)" : "#9CA3AF" }}>{c.sub}</div>
                    </div>
                    <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: isActive ? "rgba(255,255,255,0.15)" : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
                      {c.icon}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Monthly Chart ── */}
          <div className="card chart-wrap">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: showChart ? "18px" : "0" }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>月別メッセージ数</div>
                <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px" }}>直近6ヶ月のお問い合わせ推移</div>
              </div>
              <button onClick={() => setShowChart(!showChart)}
                style={{ fontSize: "11px", color: "#6B7280", background: "#F3F4F6", border: "none", borderRadius: "6px", padding: "5px 12px", cursor: "pointer", fontWeight: 500, transition: "background 0.15s" }}>
                {showChart ? "非表示" : "表示"}
              </button>
            </div>
            {showChart && (
              <div style={{ display: "flex", alignItems: "flex-end", gap: "10px", height: "104px" }}>
                {monthlyStats.map(({ month, count, label }) => (
                  <div key={month} className="bar-col">
                    <div style={{ fontSize: "11px", fontWeight: 700, color: count > 0 ? "#1E3A5F" : "transparent", minHeight: "16px" }}>{count}</div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{
                        height: count === 0 ? "0px" : `${Math.max(6, (count / maxCount) * 72)}px`,
                        background: count === 0 ? "transparent" : "linear-gradient(180deg, #60A5FA 0%, #1E3A5F 100%)",
                      }} />
                    </div>
                    <div style={{ fontSize: "10px", color: "#9CA3AF", fontWeight: 500 }}>{label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Toolbar ── */}
          <div className="card toolbar">
            <div className="search-wrap">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <path d="M17 17L13 13M15 8.5A6.5 6.5 0 112 8.5a6.5 6.5 0 0113 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input className="search-input" type="text" placeholder="名前・会社名・メールで検索..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "11px", color: "#6B7280", fontWeight: 500 }}>期間</span>
              <input className="date-input" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              <span style={{ fontSize: "12px", color: "#D1D5DB" }}>〜</span>
              <input className="date-input" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>

            {hasFilter && (
              <button className="clear-btn" onClick={() => { setSearch(""); setDateFrom(""); setDateTo(""); setFilterStatus("all"); }}>
                ✕ フィルター解除
              </button>
            )}

            <div style={{ marginLeft: "auto", fontSize: "12px", color: "#6B7280", fontWeight: 500, whiteSpace: "nowrap" }}>
              <span style={{ fontWeight: 700, color: "#111827" }}>{filtered.length}</span> 件表示
            </div>
          </div>

          {/* ── Table + Detail Panel ── */}
          <div className="table-layout" style={{ gridTemplateColumns: selected ? "1fr 400px" : "1fr" }}>

            {/* Table */}
            <div className="card" style={{ overflow: "hidden" }}>
              {loading ? (
                <div className="empty-state">
                  <div className="loader" />
                  <div style={{ fontSize: "13px", color: "#9CA3AF" }}>読み込み中...</div>
                </div>
              ) : filtered.length === 0 ? (
                <div className="empty-state">
                  <div style={{ fontSize: "44px", marginBottom: "10px", opacity: 0.3 }}>📭</div>
                  <div style={{ fontSize: "13px", color: "#6B7280", fontWeight: 600 }}>データが見つかりません</div>
                  {hasFilter && <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "4px" }}>フィルターを変更してください</div>}
                </div>
              ) : (
                <table className="msg-table">
                  <thead className="msg-thead">
                    <tr>
                      {["日時", "送信者", "サービス", "内容", "ステータス"].map((h, i) => (
                        <th key={h} className="msg-th" style={{ width: i === 0 ? "128px" : i === 2 ? "108px" : i === 4 ? "96px" : "auto" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(m => {
                      const st = ST[m.status] || ST.new;
                      const svc = SVC[m.service || ""];
                      const isSel = selected?.id === m.id;
                      return (
                        <tr key={m.id} className={`msg-row${isSel ? " msg-row-sel" : ""}`} onClick={() => setSelected(isSel ? null : m)}>
                          <td className="msg-td" style={{ color: "#6B7280", fontSize: "11px", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                            {fmt(m.created_at)}
                          </td>
                          <td className="msg-td">
                            <div style={{ fontWeight: 600, color: "#111827", fontSize: "13px" }}>{m.name}</div>
                            {m.company && <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px" }}>{m.company}</div>}
                          </td>
                          <td className="msg-td">
                            {svc
                              ? <span className="badge" style={{ color: svc.color, background: svc.bg, borderColor: svc.border }}>{svc.ja}</span>
                              : <span style={{ color: "#D1D5DB", fontSize: "12px" }}>—</span>}
                          </td>
                          <td className="msg-td" style={{ maxWidth: selected ? "90px" : "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "12px", color: "#6B7280" }}>
                            {m.message || <span style={{ color: "#D1D5DB" }}>—</span>}
                          </td>
                          <td className="msg-td">
                            <span className="badge" style={{ color: st.tc, background: st.tb, borderColor: st.border }}>
                              <span className="dot" style={{ background: st.dot }} />
                              {st.ja}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Detail Panel */}
            {selected && (() => {
              const st = ST[selected.status] || ST.new;
              const svc = SVC[selected.service || ""];
              return (
                <div className="card detail-panel" style={{ background: "#fff" }}>
                  {/* Header */}
                  <div className="detail-header" style={{ background: "linear-gradient(135deg, #F8FAFC, #fff)" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selected.name}</div>
                      {selected.company && <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>{selected.company}</div>}
                      <div style={{ marginTop: "8px" }}>
                        <span className="badge" style={{ color: st.tc, background: st.tb, borderColor: st.border, fontSize: "11px", padding: "4px 10px" }}>
                          <span className="dot" style={{ width: "6px", height: "6px", background: st.dot }} />
                          {st.ja} · {st.vn}
                        </span>
                      </div>
                    </div>
                    <button className="close-btn" onClick={() => setSelected(null)} style={{ marginLeft: "10px", marginTop: "2px" }}>✕</button>
                  </div>

                  <div className="detail-body">
                    {/* Info rows */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginBottom: "16px" }}>
                      {[
                        { icon: "✉️", label: "メール",   value: selected.email },
                        { icon: "📞", label: "電話番号", value: selected.phone || "—" },
                        { icon: "🏢", label: "種別",     value: selected.type === "business" ? "企業" : "個人" },
                        { icon: "📋", label: "サービス", value: svc?.ja || "—" },
                        { icon: "🕐", label: "受信日時", value: fmt(selected.created_at) },
                      ].map(r => (
                        <div key={r.label} className="info-row">
                          <span style={{ fontSize: "13px", width: "22px", textAlign: "center", flexShrink: 0 }}>{r.icon}</span>
                          <span className="info-label">{r.label}</span>
                          <span className="info-val">{r.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Message */}
                    {selected.message && (
                      <div style={{ marginBottom: "16px" }}>
                        <div className="sec-title">メッセージ内容</div>
                        <div className="msg-box">{selected.message}</div>
                      </div>
                    )}

                    {/* Divider */}
                    <div style={{ height: "1px", background: "#F3F4F6", margin: "0 -20px 16px" }} />

                    {/* Status */}
                    <div style={{ marginBottom: "14px" }}>
                      <div className="sec-title">ステータス変更</div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {Object.entries(ST).map(([k, v]) => {
                          const isActive = selected.status === k;
                          return (
                            <button key={k} className="st-btn" onClick={() => updateStatus(selected.id, k)}
                              style={{ background: isActive ? v.tc : v.tb, color: isActive ? "#fff" : v.tc, borderColor: isActive ? v.tc : v.border }}>
                              {v.ja}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: "8px" }}>
                      <a href={`mailto:${selected.email}`} className="action-a"
                        style={{ background: "linear-gradient(135deg, #1E3A5F, #2563EB)", color: "#fff", boxShadow: "0 2px 8px rgba(37,99,235,0.25)" }}>
                        ✉️ メール送信
                      </a>
                      {selected.phone && (
                        <a href={`tel:${selected.phone}`} className="action-a"
                          style={{ flex: "0 0 auto", padding: "10px 16px", background: "#ECFDF5", color: "#065F46", border: "1px solid #A7F3D0" }}>
                          📞 電話
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </>
  );
}
