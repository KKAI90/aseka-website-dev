"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

type Msg = {
  id: string; type: string; name: string; company: string | null;
  email: string; phone: string | null; service: string | null;
  message: string | null; status: string; created_at: string;
};

const SVC: Record<string, { ja: string; vn: string; color: string; bg: string }> = {
  hr:     { ja: "人材紹介",   vn: "Nhân sự",  color: "#0C447C", bg: "#E6F1FB" },
  nenkin: { ja: "年金",       vn: "Nenkin",   color: "#6B3FA0", bg: "#F3EDFB" },
  visa:   { ja: "ビザ",       vn: "Visa",     color: "#B45309", bg: "#FEF3C7" },
  zairyu: { ja: "在留手続き", vn: "Lưu trú",  color: "#0F766E", bg: "#CCFBF1" },
  other:  { ja: "その他",     vn: "Khác",     color: "#6B6B6B", bg: "#F1EFE8" },
};
const ST: Record<string, { ja: string; vn: string; tc: string; tb: string }> = {
  new:       { ja: "新規",     vn: "Mới",        tc: "#0C447C", tb: "#E6F1FB" },
  contacted: { ja: "連絡済み", vn: "Đã liên hệ", tc: "#27500A", tb: "#EAF3DE" },
  closed:    { ja: "完了",     vn: "Xong",       tc: "#444441", tb: "#F1EFE8" },
};

function fmt(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}
function fmtMonth(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,"0")}`;
}

export default function MessagesPage() {
  const router = useRouter();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Msg | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showChart, setShowChart] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/messages");
    if (res.status === 401) { router.push("/admin/login"); return; }
    const d = await res.json();
    setMsgs(d.data || []);
    setLoading(false);
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

  // ── Monthly stats (last 6 months) ────────────────────────────
  const monthlyStats = useMemo(() => {
    const map: Record<string, number> = {};
    msgs.forEach(m => {
      const key = fmtMonth(m.created_at);
      map[key] = (map[key] || 0) + 1;
    });
    const months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,"0")}`;
      months.push(key);
    }
    return months.map(m => ({ month: m, count: map[m] || 0 }));
  }, [msgs]);

  const maxCount = Math.max(...monthlyStats.map(m => m.count), 1);

  // ── Filtered list ─────────────────────────────────────────────
  const filtered = useMemo(() => msgs.filter(m => {
    if (filterStatus !== "all" && m.status !== filterStatus) return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) &&
        !m.email.toLowerCase().includes(search.toLowerCase()) &&
        !(m.company || "").toLowerCase().includes(search.toLowerCase())) return false;
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

  const B = { border: "1px solid #EAECF0" };

  return (
    <div style={{ background: "#F8F9FB", minHeight: "100vh" }}>

      {/* ── Header ── */}
      <div style={{ background: "#fff", ...B, borderTop: "none", borderLeft: "none", borderRight: "none", padding: "0 24px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#0B1F3A" }}>メッセージ管理</div>
          <div style={{ fontSize: "11px", color: "#6B6B6B" }}>Webフォームからの問い合わせ</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "11px", color: "#6B6B6B" }}>合計 {msgs.length} 件</span>
          <button onClick={load} style={{ padding: "6px 12px", borderRadius: "6px", background: "#F1F5F9", border: "1px solid #E2E8F0", fontSize: "12px", cursor: "pointer", color: "#0B1F3A" }}>
            ↻ 更新
          </button>
        </div>
      </div>

      <div style={{ padding: "20px 24px" }}>

        {/* ── KPI Cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
          {[
            { key: "all",       label: "合計 / Tổng",         vn: "Tất cả",     color: "#0B1F3A", bg: "#fff",    border: filterStatus === "all" ? "#0B1F3A" : "#EAECF0" },
            { key: "new",       label: "新規 / Mới",           vn: ST.new.vn,    color: ST.new.tc, bg: filterStatus === "new" ? ST.new.tb : "#fff", border: filterStatus === "new" ? ST.new.tc : "#EAECF0" },
            { key: "contacted", label: "連絡済み / Đã liên hệ",vn: "",           color: ST.contacted.tc, bg: filterStatus === "contacted" ? ST.contacted.tb : "#fff", border: filterStatus === "contacted" ? ST.contacted.tc : "#EAECF0" },
            { key: "closed",    label: "完了 / Xong",          vn: "",           color: ST.closed.tc, bg: filterStatus === "closed" ? ST.closed.tb : "#fff", border: filterStatus === "closed" ? ST.closed.tc : "#EAECF0" },
          ].map(c => (
            <div key={c.key} onClick={() => setFilterStatus(filterStatus === c.key && c.key !== "all" ? "all" : c.key)}
              style={{ background: c.bg, border: `1.5px solid ${c.border}`, borderRadius: "10px", padding: "16px 18px", cursor: "pointer", transition: "all 0.15s" }}>
              <div style={{ fontSize: "28px", fontWeight: 700, color: c.color, lineHeight: 1 }}>
                {counts[c.key as keyof typeof counts]}
              </div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: c.color, marginTop: "6px" }}>{c.label}</div>
            </div>
          ))}
        </div>

        {/* ── Monthly Chart ── */}
        <div style={{ background: "#fff", ...B, borderRadius: "12px", padding: "18px 20px", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#0B1F3A" }}>月別メッセージ数 / Tin nhắn theo tháng</div>
              <div style={{ fontSize: "11px", color: "#6B6B6B", marginTop: "2px" }}>直近6ヶ月 / 6 tháng gần nhất</div>
            </div>
            <button onClick={() => setShowChart(!showChart)}
              style={{ fontSize: "11px", color: "#6B6B6B", background: "none", border: "1px solid #E2E8F0", borderRadius: "6px", padding: "4px 10px", cursor: "pointer" }}>
              {showChart ? "非表示" : "表示"}
            </button>
          </div>
          {showChart && (
            <div style={{ display: "flex", alignItems: "flex-end", gap: "10px", height: "120px" }}>
              {monthlyStats.map(({ month, count }) => (
                <div key={month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#0B1F3A" }}>{count > 0 ? count : ""}</div>
                  <div style={{ width: "100%", position: "relative", height: "80px", display: "flex", alignItems: "flex-end" }}>
                    <div style={{
                      width: "100%",
                      height: `${count === 0 ? 4 : Math.max(8, (count / maxCount) * 80)}px`,
                      background: count === 0 ? "#F1F5F9" : "linear-gradient(180deg, #0B1F3A 0%, #1e3a5f 100%)",
                      borderRadius: "4px 4px 0 0",
                      transition: "height 0.3s",
                    }} />
                  </div>
                  <div style={{ fontSize: "10px", color: "#6B6B6B", whiteSpace: "nowrap" }}>{month.slice(5)}月</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Toolbar: Search + Date Filter ── */}
        <div style={{ background: "#fff", ...B, borderRadius: "12px", padding: "14px 16px", marginBottom: "12px", display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          {/* Search */}
          <div style={{ position: "relative", flex: "1 1 220px" }}>
            <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", fontSize: "13px" }}>🔍</span>
            <input type="text" placeholder="名前・会社名・メールで検索..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: "100%", padding: "8px 10px 8px 30px", borderRadius: "7px", border: "1px solid #E2E8F0", fontSize: "12px", outline: "none", boxSizing: "border-box", background: "#F8F9FB" }} />
          </div>

          {/* Date From */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "11px", color: "#6B6B6B", whiteSpace: "nowrap" }}>From</span>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              style={{ padding: "7px 10px", borderRadius: "7px", border: "1px solid #E2E8F0", fontSize: "12px", outline: "none", background: "#F8F9FB", cursor: "pointer" }} />
          </div>

          {/* Date To */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "11px", color: "#6B6B6B", whiteSpace: "nowrap" }}>To</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              style={{ padding: "7px 10px", borderRadius: "7px", border: "1px solid #E2E8F0", fontSize: "12px", outline: "none", background: "#F8F9FB", cursor: "pointer" }} />
          </div>

          {/* Clear */}
          {(search || dateFrom || dateTo || filterStatus !== "all") && (
            <button onClick={() => { setSearch(""); setDateFrom(""); setDateTo(""); setFilterStatus("all"); }}
              style={{ padding: "7px 12px", borderRadius: "7px", background: "#FEF2F2", border: "1px solid #FECACA", fontSize: "11px", color: "#DC2626", cursor: "pointer", whiteSpace: "nowrap" }}>
              ✕ クリア / Xóa filter
            </button>
          )}

          <div style={{ marginLeft: "auto", fontSize: "11px", color: "#6B6B6B" }}>
            {filtered.length} 件表示 / Hiển thị {filtered.length} kết quả
          </div>
        </div>

        {/* ── Table + Detail Panel ── */}
        <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 380px" : "1fr", gap: "12px" }}>

          {/* Table */}
          <div style={{ background: "#fff", ...B, borderRadius: "12px", overflow: "hidden" }}>
            {loading ? (
              <div style={{ padding: "48px", textAlign: "center", color: "#6B6B6B", fontSize: "13px" }}>
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>⏳</div>
                読み込み中... / Đang tải...
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: "48px", textAlign: "center", color: "#6B6B6B", fontSize: "13px" }}>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>📭</div>
                データなし / Không có dữ liệu
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr style={{ background: "#F8F9FB", borderBottom: "1px solid #EAECF0" }}>
                    {[
                      { label: "日時 / Ngày",          w: "130px" },
                      { label: "送信者 / Người gửi",   w: "auto" },
                      { label: "サービス",              w: "100px" },
                      { label: "内容 / Nội dung",       w: "auto" },
                      { label: "ステータス",            w: "90px" },
                    ].map(h => (
                      <th key={h.label} style={{ padding: "10px 14px", textAlign: "left", fontSize: "11px", color: "#6B6B6B", fontWeight: 600, width: h.w, whiteSpace: "nowrap" }}>
                        {h.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m, i) => {
                    const st = ST[m.status] || ST.new;
                    const svc = SVC[m.service || ""];
                    const isSelected = selected?.id === m.id;
                    return (
                      <tr key={m.id} onClick={() => setSelected(isSelected ? null : m)}
                        style={{
                          borderBottom: i < filtered.length - 1 ? "1px solid #F1F5F9" : "none",
                          cursor: "pointer",
                          background: isSelected ? "#EFF6FF" : "transparent",
                          transition: "background 0.1s",
                        }}>
                        <td style={{ padding: "12px 14px", color: "#6B6B6B", fontSize: "11px", whiteSpace: "nowrap" }}>
                          {fmt(m.created_at)}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ fontWeight: 600, color: "#0B1F3A", fontSize: "13px" }}>{m.name}</div>
                          {m.company && <div style={{ fontSize: "11px", color: "#6B6B6B", marginTop: "2px" }}>{m.company}</div>}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          {svc ? (
                            <span style={{ background: svc.bg, color: svc.color, fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "5px", display: "inline-block", whiteSpace: "nowrap" }}>
                              {svc.ja}
                            </span>
                          ) : <span style={{ color: "#ccc" }}>—</span>}
                        </td>
                        <td style={{ padding: "12px 14px", maxWidth: selected ? "120px" : "240px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "12px", color: "#6B6B6B" }}>
                          {m.message || "—"}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ background: st.tb, color: st.tc, fontSize: "10px", fontWeight: 700, padding: "3px 9px", borderRadius: "5px", display: "inline-block", whiteSpace: "nowrap" }}>
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
          {selected && (
            <div style={{ background: "#fff", ...B, borderRadius: "12px", padding: "20px", height: "fit-content", position: "sticky", top: "16px" }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: "#0B1F3A" }}>{selected.name}</div>
                  {selected.company && <div style={{ fontSize: "12px", color: "#6B6B6B", marginTop: "2px" }}>{selected.company}</div>}
                  <div style={{ marginTop: "6px" }}>
                    <span style={{ background: (ST[selected.status] || ST.new).tb, color: (ST[selected.status] || ST.new).tc, fontSize: "10px", fontWeight: 700, padding: "3px 9px", borderRadius: "5px" }}>
                      {(ST[selected.status] || ST.new).ja} · {(ST[selected.status] || ST.new).vn}
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: "#F1F5F9", border: "none", cursor: "pointer", color: "#6B6B6B", fontSize: "14px", width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
              </div>

              {/* Info rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" }}>
                {[
                  { icon: "✉️", label: "Email",          value: selected.email },
                  { icon: "📞", label: "電話 / SĐT",     value: selected.phone || "—" },
                  { icon: "🏢", label: "種別",            value: selected.type === "business" ? "企業 / Doanh nghiệp" : "個人 / Cá nhân" },
                  { icon: "🔖", label: "サービス",        value: SVC[selected.service || ""] ? `${SVC[selected.service || ""].ja} · ${SVC[selected.service || ""].vn}` : "—" },
                  { icon: "🕐", label: "受信日時",        value: fmt(selected.created_at) },
                ].map(r => (
                  <div key={r.label} style={{ display: "flex", gap: "10px", fontSize: "12px", alignItems: "flex-start" }}>
                    <span style={{ width: "20px", textAlign: "center", flexShrink: 0 }}>{r.icon}</span>
                    <span style={{ color: "#6B6B6B", width: "80px", flexShrink: 0 }}>{r.label}</span>
                    <span style={{ color: "#0B1F3A", fontWeight: 500, wordBreak: "break-all" }}>{r.value}</span>
                  </div>
                ))}
              </div>

              {/* Message content */}
              {selected.message && (
                <div style={{ marginBottom: "14px" }}>
                  <div style={{ fontSize: "11px", color: "#6B6B6B", fontWeight: 600, marginBottom: "6px" }}>💬 メッセージ / Nội dung</div>
                  <div style={{ background: "#F8F9FB", borderRadius: "8px", padding: "12px", fontSize: "12px", color: "#0B1F3A", lineHeight: 1.7, border: "1px solid #EAECF0" }}>
                    {selected.message}
                  </div>
                </div>
              )}

              {/* Status change */}
              <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: "14px", marginBottom: "14px" }}>
                <div style={{ fontSize: "11px", color: "#6B6B6B", fontWeight: 600, marginBottom: "8px" }}>ステータス変更 / Đổi trạng thái</div>
                <div style={{ display: "flex", gap: "6px" }}>
                  {Object.entries(ST).map(([k, v]) => (
                    <button key={k} onClick={() => updateStatus(selected.id, k)}
                      style={{ flex: 1, padding: "7px 4px", borderRadius: "7px", fontSize: "10px", fontWeight: 700, cursor: "pointer", background: selected.status === k ? v.tc : v.tb, color: selected.status === k ? "#fff" : v.tc, border: `1.5px solid ${selected.status === k ? v.tc : "transparent"}`, transition: "all 0.15s" }}>
                      {v.ja}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: "8px" }}>
                <a href={`mailto:${selected.email}`}
                  style={{ flex: 1, padding: "9px 8px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, textAlign: "center", background: "#0B1F3A", color: "#fff", textDecoration: "none", display: "block" }}>
                  ✉️ メール送信
                </a>
                {selected.phone && (
                  <a href={`tel:${selected.phone}`}
                    style={{ flex: 1, padding: "9px 8px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, textAlign: "center", background: "#EAF3DE", color: "#27500A", textDecoration: "none", display: "block", border: "1px solid #BBF7D0" }}>
                    📞 電話
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
