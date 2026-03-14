"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type Submission = {
  id: string;
  type: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  service: string | null;
  message: string | null;
  status: string;
  created_at: string;
};

const STATUS_LABELS: Record<string, { label: string; labelVn: string; color: string; bg: string }> = {
  new:       { label: "新規",    labelVn: "Mới",          color: "#0C447C", bg: "#E6F1FB" },
  contacted: { label: "連絡済み", labelVn: "Đã liên hệ",  color: "#27500A", bg: "#EAF3DE" },
  closed:    { label: "完了",    labelVn: "Hoàn thành",   color: "#444441", bg: "#F1EFE8" },
};

const SERVICE_LABELS: Record<string, string> = {
  hr:      "人材紹介",
  nenkin:  "年金・社会保険",
  visa:    "観光ビザ",
  zairyu:  "在留手続き",
  other:   "その他",
};

export default function AdminDashboard() {
  const router = useRouter();
  const [messages, setMessages] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchMessages = useCallback(async () => {
    const res = await fetch("/api/admin/messages");
    if (res.status === 401) { router.push("/admin/login"); return; }
    const data = await res.json();
    setMessages(data.data || []);
    setLoading(false);
  }, [router]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/admin/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, status } : m));
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, status } : null);
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const filtered = messages.filter((m) => {
    const matchFilter = filter === "all" || m.status === filter;
    const matchSearch = search === "" ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      (m.company || "").toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = {
    all: messages.length,
    new: messages.filter((m) => m.status === "new").length,
    contacted: messages.filter((m) => m.status === "contacted").length,
    closed: messages.filter((m) => m.status === "closed").length,
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F6F7F9", display: "flex", flexDirection: "column" }}>

      {/* TOP NAV */}
      <nav style={{ background: "#0B1F3A", padding: "0 24px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "30px", height: "30px", background: "rgba(255,255,255,0.12)", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M10 2L18 7V13L10 18L2 13V7Z" stroke="white" strokeWidth="1.4"/><circle cx="10" cy="10" r="3" fill="white"/></svg>
          </div>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: "14px", letterSpacing: "0.06em" }}>ASEKA</span>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>Back Office</span>
        </div>
        <button
          onClick={handleLogout}
          style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "rgba(255,255,255,0.65)", fontSize: "12px", padding: "6px 14px", borderRadius: "6px", cursor: "pointer" }}
        >
          ログアウト
        </button>
      </nav>

      <div style={{ flex: 1, maxWidth: "1200px", margin: "0 auto", width: "100%", padding: "24px", display: "grid", gridTemplateColumns: selected ? "1fr 380px" : "1fr", gap: "16px" }}>

        {/* LEFT — LIST */}
        <div>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px", marginBottom: "16px" }}>
            {[
              { key: "all",       label: "全件",    labelVn: "Tất cả",      color: "#0B1F3A" },
              { key: "new",       label: "新規",    labelVn: "Mới",         color: "#185FA5" },
              { key: "contacted", label: "連絡済み", labelVn: "Đã liên hệ", color: "#27500A" },
              { key: "closed",    label: "完了",    labelVn: "Hoàn thành",  color: "#444441" },
            ].map((s) => (
              <div
                key={s.key}
                onClick={() => setFilter(s.key)}
                style={{
                  background: filter === s.key ? s.color : "#fff",
                  border: `0.5px solid ${filter === s.key ? s.color : "rgba(11,31,58,0.1)"}`,
                  borderRadius: "10px", padding: "14px 16px", cursor: "pointer", transition: "all 0.15s",
                }}
              >
                <div style={{ fontSize: "22px", fontWeight: 700, color: filter === s.key ? "#fff" : s.color }}>
                  {counts[s.key as keyof typeof counts]}
                </div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: filter === s.key ? "rgba(255,255,255,0.85)" : s.color }}>{s.label}</div>
                <div style={{ fontSize: "10px", color: filter === s.key ? "rgba(255,255,255,0.55)" : "#6B6B6B", marginTop: "1px" }}>{s.labelVn}</div>
              </div>
            ))}
          </div>

          {/* Search + Filter */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
            <input
              type="text"
              placeholder="名前・メール・会社名で検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "0.5px solid rgba(11,31,58,0.15)", fontSize: "13px", outline: "none", background: "#fff" }}
            />
          </div>

          {/* Table */}
          <div style={{ background: "#fff", borderRadius: "12px", border: "0.5px solid rgba(11,31,58,0.1)", overflow: "hidden" }}>
            {loading ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#6B6B6B", fontSize: "13px" }}>
                読み込み中... / Đang tải...
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#6B6B6B", fontSize: "13px" }}>
                データがありません / Không có dữ liệu
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ borderBottom: "0.5px solid rgba(11,31,58,0.08)" }}>
                    {["日時 / Ngày", "名前 / Tên", "連絡先 / Liên hệ", "サービス / Dịch vụ", "ステータス"].map((h) => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "11px", color: "#6B6B6B", fontWeight: 600, background: "#F6F7F9", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => {
                    const st = STATUS_LABELS[m.status] || STATUS_LABELS.new;
                    return (
                      <tr
                        key={m.id}
                        onClick={() => setSelected(selected?.id === m.id ? null : m)}
                        style={{
                          borderBottom: "0.5px solid rgba(11,31,58,0.06)",
                          cursor: "pointer",
                          background: selected?.id === m.id ? "#E6F1FB" : "transparent",
                          transition: "background 0.1s",
                        }}
                      >
                        <td style={{ padding: "10px 14px", color: "#6B6B6B", fontSize: "11px", whiteSpace: "nowrap" }}>{formatDate(m.created_at)}</td>
                        <td style={{ padding: "10px 14px" }}>
                          <div style={{ fontWeight: 600, color: "#0B1F3A" }}>{m.name}</div>
                          {m.company && <div style={{ fontSize: "11px", color: "#6B6B6B" }}>{m.company}</div>}
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <div style={{ color: "#185FA5", fontSize: "12px" }}>{m.email}</div>
                          {m.phone && <div style={{ fontSize: "11px", color: "#6B6B6B" }}>{m.phone}</div>}
                        </td>
                        <td style={{ padding: "10px 14px", fontSize: "12px", color: "#6B6B6B" }}>
                          {SERVICE_LABELS[m.service || ""] || m.service || "—"}
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <span style={{ background: st.bg, color: st.color, fontSize: "11px", fontWeight: 600, padding: "3px 8px", borderRadius: "4px", whiteSpace: "nowrap" }}>
                            {st.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* RIGHT — DETAIL PANEL */}
        {selected && (
          <div style={{ background: "#fff", borderRadius: "12px", border: "0.5px solid rgba(11,31,58,0.1)", padding: "20px", height: "fit-content", position: "sticky", top: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#0B1F3A" }}>{selected.name}</div>
                {selected.company && <div style={{ fontSize: "12px", color: "#6B6B6B" }}>{selected.company}</div>}
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B6B6B", fontSize: "18px", lineHeight: 1 }}>×</button>
            </div>

            {/* Info rows */}
            {[
              { label: "Email", value: selected.email },
              { label: "電話 / SĐT", value: selected.phone || "—" },
              { label: "種別", value: selected.type === "business" ? "企業・採用担当者" : "個人・求職者" },
              { label: "サービス", value: SERVICE_LABELS[selected.service || ""] || selected.service || "—" },
              { label: "受信日時", value: formatDate(selected.created_at) },
            ].map((row) => (
              <div key={row.label} style={{ display: "flex", gap: "8px", marginBottom: "8px", fontSize: "13px" }}>
                <span style={{ color: "#6B6B6B", width: "90px", flexShrink: 0 }}>{row.label}</span>
                <span style={{ color: "#0B1F3A", fontWeight: 500 }}>{row.value}</span>
              </div>
            ))}

            {/* Message */}
            {selected.message && (
              <div style={{ marginTop: "12px", marginBottom: "16px" }}>
                <div style={{ fontSize: "11px", color: "#6B6B6B", marginBottom: "6px", fontWeight: 600 }}>メッセージ / Nội dung</div>
                <div style={{ background: "#F6F7F9", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", color: "#0B1F3A", lineHeight: 1.65 }}>
                  {selected.message}
                </div>
              </div>
            )}

            {/* Status update */}
            <div style={{ borderTop: "0.5px solid rgba(11,31,58,0.08)", paddingTop: "14px" }}>
              <div style={{ fontSize: "11px", color: "#6B6B6B", marginBottom: "8px", fontWeight: 600 }}>ステータス変更 / Đổi trạng thái</div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {Object.entries(STATUS_LABELS).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => updateStatus(selected.id, key)}
                    style={{
                      padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                      background: selected.status === key ? val.color : val.bg,
                      color: selected.status === key ? "#fff" : val.color,
                      border: `1px solid ${val.color}`,
                    }}
                  >
                    {val.label} · {val.labelVn}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div style={{ marginTop: "14px", display: "flex", gap: "8px" }}>
              <a
                href={`mailto:${selected.email}`}
                style={{ flex: 1, padding: "8px", borderRadius: "7px", fontSize: "12px", fontWeight: 600, textAlign: "center", background: "#0B1F3A", color: "#fff", textDecoration: "none" }}
              >
                メール送信 →
              </a>
              {selected.phone && (
                <a
                  href={`tel:${selected.phone}`}
                  style={{ flex: 1, padding: "8px", borderRadius: "7px", fontSize: "12px", fontWeight: 600, textAlign: "center", background: "#EAF3DE", color: "#27500A", textDecoration: "none", border: "0.5px solid #27500A" }}
                >
                  電話する
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
