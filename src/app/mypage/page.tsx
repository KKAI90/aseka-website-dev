"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const navy  = "#0B1F3A";
const red   = "#C8002A";
// Absolute — this page runs on the mypage.* subdomain, where middleware redirects any
// path outside /mypage back to /mypage/login, so a relative href="/" would just bounce back.
const MAIN_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dev.aseka.co.jp";
// "未読" isn't tracked server-side (no per-candidate view-log table) — a job is marked read
// client-side, scoped per candidate id, the moment its detail page is opened. Simple and
// good enough for "have I looked at this yet", without a schema change for it.
const READ_KEY_PREFIX = "aseka_mypage_read_jobs_";

type Candidate = {
  id:string; name:string; name_kana:string; email:string; phone:string;
  date_of_birth:string; gender:string; skill:string; jlpt:string;
  preferred_job:string; visa_type:string; status:string;
  match_job_id:string|null; match_job_name:string; motivation:string; availability:string; created_at:string;
  hasPassword:boolean;
};
export type Job = {
  id:string; company:string; position_ja:string; position_vn:string;
  industry:string; jlpt_min:string; salary:string; location:string;
  status:string; matchScore:number; isNew:boolean; isFavorite:boolean; isApplied:boolean; job_description:string;
  osusume_point:string|null; position_name:string|null; position_note:string|null;
  requirements:string|null; qualifications:string|null; language_skills:string|null; education_req:string|null;
  work_location:string|null; selection_process:string|null; work_environment:string|null;
  annual_income:string|null; salary_type:string|null; salary_note:string|null;
  employment_type:string|null; visa_type:string|null; work_hours:string|null; trial_period:string|null;
  insurance:string|null; holidays:string|null; remarks:string|null; count:number|null;
};

const STATUS_STEPS = [
  { key:"new",       ja:"書類審査中",  vn:"Đang xét hồ sơ",   color:"#378ADD" },
  { key:"interview", ja:"面接調整中",  vn:"Đang phỏng vấn",   color:"#EF9F27" },
  { key:"offered",   ja:"内定",        vn:"Đã nhận offer",    color:"#5DCAA5" },
  { key:"working",   ja:"就業中",      vn:"Đang làm việc",    color:"#27500A" },
];

const countLabel = (n:number) => n > 99 ? "99+" : String(n);

export default function Mypage() {
  const router = useRouter();
  const [tab, setTab]         = useState<"jobs"|"favorites"|"status"|"profile">("jobs");
  const [cand, setCand]       = useState<Candidate|null>(null);
  const [jobs, setJobs]       = useState<Job[]>([]);
  const [jobFilter, setJobFilter] = useState<"all"|"unread"|"new">("all");
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [favBusy, setFavBusy] = useState<string|null>(null);

  // Password form (Profile tab)
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type:"ok"|"err"; text:string }|null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/mypage/me").then(r => r.ok ? r.json() : null),
      fetch("/api/mypage/jobs").then(r => r.ok ? r.json() : null),
    ]).then(([me, j]) => {
      if (!me) { router.push("/mypage/login"); return; }
      setCand(me.data);
      setJobs(j?.jobs || []);
      try {
        const raw = localStorage.getItem(READ_KEY_PREFIX + me.data.id);
        setReadIds(new Set<string>(raw ? JSON.parse(raw) : []));
      } catch { /* localStorage unavailable — everything just reads as unread, harmless */ }
      setLoading(false);
    });
  }, [router]);

  const logout = async () => {
    await fetch("/api/mypage/logout", { method:"POST" });
    router.push("/mypage/login");
  };

  const toggleFavorite = async (jobId: string) => {
    setFavBusy(jobId);
    try {
      const res = await fetch("/api/mypage/favorites", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const data = await res.json();
      if (res.ok) {
        setJobs(prev => prev.map(j => j.id === jobId ? { ...j, isFavorite: data.favorited } : j));
      }
    } finally {
      setFavBusy(null);
    }
  };

  const openJob = (jobId: string) => router.push(`/mypage/jobs/${jobId}`);

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwSaving(true); setPwMsg(null);
    const res = await fetch("/api/mypage/set-password", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: pwCurrent || undefined, newPassword: pwNew }),
    });
    const data = await res.json();
    setPwSaving(false);
    if (!res.ok) { setPwMsg({ type:"err", text: data.error }); return; }
    setPwMsg({ type:"ok", text:"パスワードを更新しました / Đã cập nhật mật khẩu" });
    setPwCurrent(""); setPwNew("");
    setCand(prev => prev ? { ...prev, hasPassword: true } : prev);
  };

  const allCount    = jobs.length;
  const unreadCount = jobs.filter(j => !readIds.has(j.id)).length;
  const newCount    = jobs.filter(j => j.isNew).length;
  const favCount    = jobs.filter(j => j.isFavorite).length;
  const displayed   = jobFilter==="unread" ? jobs.filter(j=>!readIds.has(j.id)) : jobFilter==="new" ? jobs.filter(j=>j.isNew) : jobs;
  const favorited   = jobs.filter(j => j.isFavorite);

  const currentStep = STATUS_STEPS.findIndex(s => s.key === cand?.status);

  /* Shared job table — used by both 紹介求人 and 検討中求人 tabs. Each row now navigates
     to its own detail page (/mypage/jobs/[id]) instead of expanding inline, matching how
     the reference design treats a job listing as a destination, not an accordion. */
  const renderJobTable = (list: Job[], emptyMsg: { ja:string; vn:string }) => (
    list.length === 0
      ? <div style={{ padding:"48px", textAlign:"center", color:"#64748B", fontSize:"13px" }}>
          {emptyMsg.ja}<br/>{emptyMsg.vn}
        </div>
      : <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"13px", minWidth:"640px" }}>
          <thead>
            <tr style={{ background:"#F8F9FB" }}>
              {["企業名","求人ポジション","年収","検討する"].map(h => (
                <th key={h} style={{ padding:"10px 14px", textAlign: h==="検討する" ? "center":"left", fontSize:"11px", color:"#64748B", fontWeight:600, borderBottom:"1px solid #F0F1F4", whiteSpace:"nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map(j => {
              const unread = !readIds.has(j.id);
              return (
              <tr key={j.id} onClick={() => openJob(j.id)} className="mp-row"
                style={{ borderBottom:"1px solid #F8F9FB", cursor:"pointer" }}>
                <td style={{ padding:"13px 14px", fontWeight:600, color:navy }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                    {j.isNew && <span style={{ background:red, color:"#fff", fontSize:"10px", fontWeight:700, padding:"1px 5px", borderRadius:"3px" }}>NEW</span>}
                    {unread && !j.isNew && <span style={{ width:"7px", height:"7px", borderRadius:"50%", background:"#378ADD", flexShrink:0 }} title="未読"/>}
                    {j.status==="urgent" && <span style={{ background:"#FAEEDA", color:"#633806", fontSize:"10px", fontWeight:700, padding:"1px 5px", borderRadius:"3px" }}>⚡急募</span>}
                    {j.isApplied && <span style={{ background:"#27500A", color:"#fff", fontSize:"10px", fontWeight:700, padding:"1px 5px", borderRadius:"3px" }}>✓応募済み</span>}
                    {j.company}
                  </div>
                </td>
                <td style={{ padding:"13px 14px", color:navy }}>
                  <div>{j.position_name || j.position_ja}</div>
                  {j.position_vn && <div style={{ fontSize:"11px", color:"#64748B", marginTop:"1px" }}>{j.position_vn}</div>}
                  <div style={{ display:"flex", gap:"4px", marginTop:"4px" }}>
                    <span style={{ background:"#E6F1FB", color:"#185FA5", fontSize:"10px", fontWeight:600, padding:"2px 6px", borderRadius:"4px" }}>{j.industry}</span>
                    <span style={{ fontSize:"10px", fontWeight:700, padding:"2px 6px", borderRadius:"4px", background:"#F6F7F9", color: j.jlpt_min==="N1" ? "#A32D2D" : j.jlpt_min==="N2" ? "#633806" : "#27500A" }}>{j.jlpt_min}以上</span>
                  </div>
                </td>
                <td style={{ padding:"13px 14px", color:"#444", fontSize:"12px" }}>{j.annual_income || j.salary || "要相談"}</td>
                <td style={{ padding:"13px 14px", textAlign:"center" }}>
                  <button onClick={e => { e.stopPropagation(); toggleFavorite(j.id); }} disabled={favBusy===j.id}
                    title={j.isFavorite ? "お気に入り解除 / Bỏ yêu thích" : "お気に入りに追加 / Thêm vào yêu thích"}
                    style={{ background:"none", border:`1.5px solid ${j.isFavorite ? red : "#C8D0DB"}`, borderRadius:"50%", width:"28px", height:"28px", cursor: favBusy===j.id ? "not-allowed" : "pointer", fontSize:"14px", color: j.isFavorite ? red : "#C8D0DB", display:"flex", alignItems:"center", justifyContent:"center", opacity: favBusy===j.id ? 0.5 : 1 }}>
                    {j.isFavorite ? "♥" : "♡"}
                  </button>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
  );

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Noto Sans JP',sans-serif" }}>
      <div style={{ textAlign:"center", color:"#64748B" }}>
        <div style={{ fontSize:"28px", marginBottom:"8px" }}>⏳</div>
        <div>読み込み中...</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#F4F5F7", fontFamily:"'Noto Sans JP','Yu Gothic UI',sans-serif" }}>
      <style>{`.mp-row:hover{background:#FFF8F8 !important;} .mp-subtab:hover{opacity:0.75;}`}</style>

      {/* ── TOP NAVBAR ─────────────────────────────────────── */}
      <header style={{ background:"#fff", borderBottom:"1px solid #E8EAF0", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ maxWidth:"1200px", margin:"0 auto", padding:"0 24px", height:"52px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <Link href={MAIN_SITE_URL} style={{ display:"flex", alignItems:"center", gap:"7px", textDecoration:"none" }}>
              <div style={{ width:"28px", height:"28px", background:"#fff", borderRadius:"7px", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, overflow:"hidden", border:"1px solid rgba(11,31,58,0.08)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/aseka-logo-icon.png" alt="ASEKA" style={{ width:"22px", height:"22px", objectFit:"contain", display:"block" }} />
              </div>
              <span style={{ fontWeight:800, fontSize:"14px", color:navy, letterSpacing:"0.08em" }}>ASEKA</span>
            </Link>
            <span style={{ color:"#C8D0DB", fontSize:"12px" }}>|</span>
            <span style={{ fontSize:"12px", color:"#52525B" }}>Asekaキャリア · マイページ</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
            <span style={{ fontSize:"12px", color:"#52525B" }}>
              ようこそ、<strong style={{ color:navy }}>{cand?.name}</strong> さん
            </span>
            <button onClick={logout}
              style={{ padding:"5px 12px", borderRadius:"6px", fontSize:"12px", color:"#52525B", background:"none", border:"1px solid #E0E3E9", cursor:"pointer" }}>
              ログアウト
            </button>
          </div>
        </div>

        {/* ── RED TAB BAR ── */}
        <div style={{ background:red }}>
          <div style={{ maxWidth:"1200px", margin:"0 auto", padding:"0 24px", display:"flex" }}>
            {[
              { key:"jobs",      label:"紹介求人",     count: allCount },
              { key:"favorites", label:"検討中求人",   count: favCount },
              { key:"status",    label:"選考状況",     count: null },
              { key:"profile",   label:"プロフィール", count: null },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
                style={{ padding:"12px 24px", fontSize:"13px", fontWeight: tab===t.key ? 700 : 400, color:"#fff", background: tab===t.key ? "rgba(255,255,255,0.18)" : "transparent", border:"none", cursor:"pointer", borderBottom: tab===t.key ? "3px solid #fff" : "3px solid transparent", display:"flex", alignItems:"center", gap:"6px" }}>
                {t.label}
                {t.count !== null && t.count > 0 && (
                  <span style={{ background:"#fff", color:red, borderRadius:"20px", fontSize:"11px", fontWeight:700, padding:"1px 7px" }}>{countLabel(t.count)}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── BODY ───────────────────────────────────────────── */}
      <div style={{ maxWidth:"1200px", margin:"0 auto", padding:"24px", display:"grid", gridTemplateColumns:"1fr 280px", gap:"20px", alignItems:"start" }}>

        {/* LEFT MAIN */}
        <div>

          {/* ── TAB: 紹介求人 (ピックアップ求人) ── */}
          {tab === "jobs" && (
            <div style={{ background:"#fff", borderRadius:"10px", overflow:"hidden", boxShadow:"0 1px 6px rgba(0,0,0,0.06)" }}>
              <div style={{ padding:"18px 20px", borderBottom:"1px solid #F0F1F4" }}>
                <h2 style={{ margin:"0 0 4px", fontSize:"16px", fontWeight:700, color:navy }}>ピックアップ求人</h2>
                <p style={{ margin:0, fontSize:"11px", color:"#64748B" }}>
                  あなたのスキル（{cand?.skill}）· JLPT {cand?.jlpt} に合わせたおすすめ求人
                  · Việc làm phù hợp với hồ sơ của bạn
                </p>
              </div>

              {/* Sub-tabs: すべて / 未読 / 新着 */}
              <div style={{ borderBottom:"1px solid #F0F1F4", display:"flex", padding:"0 20px" }}>
                {[
                  { k:"all",    l:"すべて", count: allCount },
                  { k:"unread", l:"未読",   count: unreadCount },
                  { k:"new",    l:"新着",   count: newCount },
                ].map(t => (
                  <button key={t.k} onClick={() => setJobFilter(t.k as "all"|"unread"|"new")} className="mp-subtab"
                    style={{ padding:"10px 0", marginRight:"24px", fontSize:"13px", fontWeight: jobFilter===t.k ? 700 : 400, color: jobFilter===t.k ? red : "#52525B", background:"none", border:"none", borderBottom: jobFilter===t.k ? `2px solid ${red}` : "2px solid transparent", cursor:"pointer", display:"flex", alignItems:"center", gap:"5px", transition:"opacity 0.15s" }}>
                    {t.l}
                    <span style={{ background: jobFilter===t.k ? red : "#E8EAF0", color: jobFilter===t.k ? "#fff" : "#52525B", borderRadius:"20px", fontSize:"11px", fontWeight:700, padding:"1px 6px" }}>{countLabel(t.count)}</span>
                  </button>
                ))}
              </div>

              <div style={{ padding:"10px 20px 0", fontSize:"11px", color:"#64748B" }}>
                検討する<span style={{ color:red }}>♡</span>をクリックすると、検討中求人に保存されます。
                <span style={{ marginLeft:"4px" }}>Nhấn ♡ &quot;Cân nhắc&quot; để lưu vào mục Việc đang cân nhắc. Nhấn vào một dòng để xem chi tiết.</span>
              </div>
              <div style={{ padding:"10px 0 0" }}>
                {renderJobTable(displayed, { ja:"現在該当する求人はありません。", vn:"Hiện chưa có việc làm phù hợp." })}
              </div>
            </div>
          )}

          {/* ── TAB: 検討中求人 ── */}
          {tab === "favorites" && (
            <div style={{ background:"#fff", borderRadius:"10px", overflow:"hidden", boxShadow:"0 1px 6px rgba(0,0,0,0.06)" }}>
              <div style={{ padding:"18px 20px", borderBottom:"1px solid #F0F1F4" }}>
                <h2 style={{ margin:"0 0 4px", fontSize:"16px", fontWeight:700, color:navy }}>検討中求人</h2>
                <p style={{ margin:0, fontSize:"11px", color:"#64748B" }}>
                  ♥ お気に入りに追加した求人 · Việc làm bạn đã đánh dấu để cân nhắc
                </p>
              </div>
              {renderJobTable(favorited, { ja:"まだ検討中の求人はありません。", vn:"Bạn chưa lưu việc làm nào để cân nhắc." })}
            </div>
          )}

          {/* ── TAB: 選考状況 ── */}
          {tab === "status" && (
            <div style={{ background:"#fff", borderRadius:"10px", overflow:"hidden", boxShadow:"0 1px 6px rgba(0,0,0,0.06)" }}>
              <div style={{ padding:"18px 20px", borderBottom:"1px solid #F0F1F4" }}>
                <h2 style={{ margin:"0 0 4px", fontSize:"16px", fontWeight:700, color:navy }}>選考状況 / Trạng thái ứng tuyển</h2>
                <p style={{ margin:0, fontSize:"11px", color:"#64748B" }}>現在の選考ステージ · Giai đoạn tuyển dụng hiện tại</p>
              </div>
              <div style={{ padding:"28px 24px" }}>
                {/* Progress steps */}
                <div style={{ display:"flex", alignItems:"center", marginBottom:"32px" }}>
                  {STATUS_STEPS.map((s, i) => {
                    const active  = currentStep === i;
                    const done2   = currentStep > i;
                    return (
                      <div key={s.key} style={{ display:"flex", alignItems:"center", flex: i < STATUS_STEPS.length-1 ? 1 : undefined }}>
                        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"6px" }}>
                          <div style={{ width:"40px", height:"40px", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", background: done2 ? "#EAF3DE" : active ? s.color : "#F0F1F4", border: active ? `3px solid ${s.color}` : done2 ? "3px solid #27500A" : "3px solid transparent", transition:"all 0.3s" }}>
                            {done2
                              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#27500A" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                              : <div style={{ width:"10px", height:"10px", borderRadius:"50%", background: active ? "#fff" : "#C8D0DB" }}/>
                            }
                          </div>
                          <div style={{ textAlign:"center" }}>
                            <div style={{ fontSize:"11px", fontWeight: active ? 700 : 500, color: active ? s.color : done2 ? "#27500A" : "#64748B" }}>{s.ja}</div>
                            <div style={{ fontSize:"10px", color:"#C8D0DB" }}>{s.vn}</div>
                          </div>
                        </div>
                        {i < STATUS_STEPS.length-1 && (
                          <div style={{ flex:1, height:"2px", background: done2 ? "#27500A" : "#E8EAF0", margin:"0 6px", marginBottom:"22px", transition:"background 0.3s" }}/>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Current status card */}
                <div style={{ background: currentStep >= 0 ? "#F8FFF8" : "#F8F9FB", border:`1px solid ${currentStep>=0?"#27500A22":"#E8EAF0"}`, borderRadius:"10px", padding:"16px 20px" }}>
                  <div style={{ fontSize:"12px", fontWeight:700, color:navy, marginBottom:"4px" }}>
                    現在のステータス: <span style={{ color: STATUS_STEPS[currentStep]?.color||"#64748B" }}>
                      {STATUS_STEPS[currentStep]?.ja || cand?.status || "登録済み"}
                    </span>
                  </div>
                  {cand?.match_job_name && (
                    <div style={{ fontSize:"12px", color:"#444" }}>
                      紹介先: <strong>{cand.match_job_name}</strong>
                    </div>
                  )}
                  <div style={{ fontSize:"11px", color:"#52525B", marginTop:"6px" }}>
                    ご不明な点は担当スタッフへお問い合わせください。
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: Profile ── */}
          {tab === "profile" && cand && (
            <div style={{ background:"#fff", borderRadius:"10px", overflow:"hidden", boxShadow:"0 1px 6px rgba(0,0,0,0.06)" }}>
              <div style={{ padding:"18px 20px", borderBottom:"1px solid #F0F1F4" }}>
                <h2 style={{ margin:"0 0 4px", fontSize:"16px", fontWeight:700, color:navy }}>プロフィール / Hồ sơ của bạn</h2>
                <p style={{ margin:0, fontSize:"11px", color:"#64748B" }}>登録情報 · Thông tin đã đăng ký</p>
              </div>
              <div style={{ padding:"20px 24px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                {[
                  { l:"氏名",       v: cand.name },
                  { l:"メール",     v: cand.email||"—" },
                  { l:"電話番号",   v: cand.phone||"—" },
                  { l:"生年月日",   v: cand.date_of_birth||"—" },
                  { l:"性別",       v: cand.gender||"—" },
                  { l:"日本語",     v: cand.jlpt||"—" },
                  { l:"希望業種",   v: cand.skill||"—" },
                  { l:"希望職種",   v: cand.preferred_job||"—" },
                  { l:"在留資格",   v: cand.visa_type||"—" },
                  { l:"来日可能時期",v: cand.availability||"—" },
                ].map(d => (
                  <div key={d.l} style={{ background:"#F8F9FB", borderRadius:"8px", padding:"10px 14px" }}>
                    <div style={{ fontSize:"11px", color:"#64748B", marginBottom:"2px" }}>{d.l}</div>
                    <div style={{ fontSize:"13px", fontWeight:600, color:navy }}>{d.v}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding:"0 24px 20px" }}>
                <Link href="/#contact"
                  style={{ display:"inline-flex", alignItems:"center", gap:"6px", padding:"9px 18px", borderRadius:"8px", background:"#fff", border:`1.5px solid ${navy}`, color:navy, textDecoration:"none", fontSize:"12px", fontWeight:600 }}>
                  ✏️ 情報を更新する · Cập nhật thông tin
                </Link>
              </div>

              {/* Password set/change */}
              <div style={{ borderTop:"1px solid #F0F1F4", padding:"20px 24px" }}>
                <h3 style={{ margin:"0 0 4px", fontSize:"13px", fontWeight:700, color:navy }}>
                  {cand.hasPassword ? "パスワード変更" : "パスワードを設定する"}
                </h3>
                <p style={{ margin:"0 0 14px", fontSize:"11px", color:"#64748B" }}>
                  {cand.hasPassword
                    ? "次回からパスワードでログインできます · Đổi mật khẩu đăng nhập"
                    : "設定すると次回からマジックリンク不要でログインできます · Đặt mật khẩu để lần sau đăng nhập nhanh hơn"}
                </p>
                <form onSubmit={changePassword} style={{ display:"flex", flexDirection:"column", gap:"8px", maxWidth:"320px" }}>
                  {cand.hasPassword && (
                    <input type="password" placeholder="現在のパスワード" value={pwCurrent} onChange={e=>setPwCurrent(e.target.value)} required
                      style={{ padding:"10px 12px", borderRadius:"7px", border:"1.5px solid #E0E3E9", fontSize:"13px", outline:"none", background:"#F7F8FA" }}/>
                  )}
                  <input type="password" placeholder="新しいパスワード（6文字以上）" value={pwNew} onChange={e=>setPwNew(e.target.value)} required minLength={6}
                    style={{ padding:"10px 12px", borderRadius:"7px", border:"1.5px solid #E0E3E9", fontSize:"13px", outline:"none", background:"#F7F8FA" }}/>
                  {pwMsg && (
                    <div style={{ fontSize:"11px", padding:"8px 10px", borderRadius:"6px", background: pwMsg.type==="ok" ? "#EAF3DE" : "#FCEBEB", color: pwMsg.type==="ok" ? "#27500A" : "#C8002A" }}>
                      {pwMsg.type==="ok" ? "✓ " : "⚠️ "}{pwMsg.text}
                    </div>
                  )}
                  <button type="submit" disabled={pwSaving}
                    style={{ padding:"9px 16px", borderRadius:"7px", background: pwSaving ? "#64748B" : navy, color:"#fff", border:"none", fontSize:"12px", fontWeight:700, cursor: pwSaving ? "not-allowed" : "pointer", alignSelf:"flex-start" }}>
                    {pwSaving ? "保存中..." : cand.hasPassword ? "パスワードを変更" : "パスワードを設定"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>

          {/* My info summary */}
          <div style={{ background:"#fff", borderRadius:"10px", padding:"16px", boxShadow:"0 1px 6px rgba(0,0,0,0.06)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"12px" }}>
              <div style={{ width:"40px", height:"40px", borderRadius:"50%", background:navy, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px", fontWeight:700, color:"#fff", flexShrink:0 }}>
                {cand?.name?.charAt(0)||"A"}
              </div>
              <div>
                <div style={{ fontSize:"13px", fontWeight:700, color:navy }}>{cand?.name}</div>
                <div style={{ fontSize:"11px", color:"#64748B" }}>{cand?.email}</div>
              </div>
            </div>
            <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
              {[cand?.skill, cand?.jlpt, cand?.visa_type].filter(Boolean).map(t=>(
                <span key={t} style={{ background:"#E6F1FB", color:"#185FA5", fontSize:"11px", fontWeight:600, padding:"3px 8px", borderRadius:"4px" }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Contact advisor */}
          <div style={{ background:"#fff", borderRadius:"10px", padding:"16px", boxShadow:"0 1px 6px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize:"12px", fontWeight:700, color:navy, marginBottom:"8px" }}>担当キャリアアドバイザー / Nhân viên phụ trách</div>
            <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"10px" }}>
              <div style={{ width:"36px", height:"36px", borderRadius:"50%", background:"#FAEEDA", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px" }}>👤</div>
              <div>
                <div style={{ fontSize:"12px", fontWeight:600, color:navy }}>Aseka キャリア</div>
                <div style={{ fontSize:"11px", color:"#185FA5" }}>contact@aseka.jp</div>
              </div>
            </div>
            <Link href="/#contact"
              style={{ display:"block", textAlign:"center", padding:"8px", borderRadius:"7px", background:navy, color:"#fff", textDecoration:"none", fontSize:"11px", fontWeight:600 }}>
              📩 相談する / Liên hệ
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
