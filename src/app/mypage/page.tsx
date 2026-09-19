"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMypageLang, translateValue } from "@/lib/mypageI18n";
import MypageLangSwitcher from "@/components/MypageLangSwitcher";

const navy  = "#0B1F3A";
const red   = "#C8002A";
// Absolute — this page runs on the mypage.* subdomain, where middleware redirects any
// path outside /mypage back to /mypage/login (including bare "/" + a hash fragment like
// "/#contact"), so a relative link to the public site's contact section would silently
// bounce back to login instead of landing on the section. Same root cause already found
// and fixed for the login page's nav links earlier this project.
const MAIN_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dev.aseka.co.jp";
// "未読" isn't tracked server-side (no per-candidate view-log table) — a job is marked read
// client-side, scoped per candidate id, the moment its detail page is opened. Simple and
// good enough for "have I looked at this yet", without a schema change for it.
const READ_KEY_PREFIX = "aseka_mypage_read_jobs_";

type Candidate = {
  id:string; name:string; name_kana:string; email:string; phone:string;
  date_of_birth:string; gender:string; skill:string; jlpt:string;
  preferred_job:string; visa_type:string; visa_expiry:string; address:string; status:string;
  match_job_id:string|null; match_job_name:string; availability:string;
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
  translations?: Partial<Record<"en"|"vi", Record<string,string>>> | null;
};

const STATUS_STEP_KEYS = ["new","interview","offered","working"] as const;

const countLabel = (n:number) => n > 99 ? "99+" : String(n);

export default function Mypage() {
  const router = useRouter();
  const { t, lang } = useMypageLang();
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
      if (!me) { router.replace("/mypage/login"); return; }
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
    // replace, not push — see the matching comment in mypage/login/page.tsx. Same reasoning
    // here in the more serious direction: without this, pressing Back after logout can
    // restore this exact dashboard from Next's client router cache — a previously-rendered
    // authenticated page with the candidate's own data still in it — even though the
    // session cookie is already gone.
    router.replace("/mypage/login");
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
    setPwMsg({ type:"ok", text: t("profile.pwUpdated") });
    setPwCurrent(""); setPwNew("");
    setCand(prev => prev ? { ...prev, hasPassword: true } : prev);
  };

  const allCount    = jobs.length;
  const unreadCount = jobs.filter(j => !readIds.has(j.id)).length;
  const newCount    = jobs.filter(j => j.isNew).length;
  const favCount    = jobs.filter(j => j.isFavorite).length;
  const displayed   = jobFilter==="unread" ? jobs.filter(j=>!readIds.has(j.id)) : jobFilter==="new" ? jobs.filter(j=>j.isNew) : jobs;
  const favorited   = jobs.filter(j => j.isFavorite);

  const currentStep = STATUS_STEP_KEYS.findIndex(k => k === cand?.status);
  const stepColor = (key: typeof STATUS_STEP_KEYS[number]) =>
    key==="new" ? "#378ADD" : key==="interview" ? "#EF9F27" : key==="offered" ? "#5DCAA5" : "#27500A";

  /* Shared job table — used by both 紹介求人 and 検討中求人 tabs. Each row navigates
     to its own detail page (/mypage/jobs/[id]) instead of expanding inline. */
  // Vietnamese prefers the human-curated position_vn (admin already writes a real
  // Vietnamese title for most jobs) over a machine translation; English has no
  // human-curated equivalent, so it always uses the cached MyMemory translation.
  const positionTitle = (j: Job) => {
    if (lang === "vi" && j.position_vn) return j.position_vn;
    const cached = lang !== "ja" ? j.translations?.[lang]?.position_name : null;
    return cached || j.position_name || j.position_ja;
  };

  const renderJobTable = (list: Job[], emptyText: string) => (
    list.length === 0
      ? <div style={{ padding:"48px", textAlign:"center", color:"#64748B", fontSize:"13px" }}>
          {emptyText}
        </div>
      : <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"13px", minWidth:"640px" }}>
          <thead>
            <tr style={{ background:"#F8F9FB" }}>
              {[t("jobs.colCompany"), t("jobs.colPosition"), t("jobs.colIncome"), t("jobs.colConsider")].map(h => (
                <th key={h} style={{ padding:"10px 14px", textAlign: h===t("jobs.colConsider") ? "center":"left", fontSize:"11px", color:"#64748B", fontWeight:600, borderBottom:"1px solid #F0F1F4", whiteSpace:"nowrap" }}>{h}</th>
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
                    {j.isNew && <span style={{ background:red, color:"#fff", fontSize:"10px", fontWeight:700, padding:"1px 5px", borderRadius:"3px" }}>{t("jobs.badgeNew")}</span>}
                    {unread && !j.isNew && <span style={{ width:"7px", height:"7px", borderRadius:"50%", background:"#378ADD", flexShrink:0 }} title={t("jobs.unread")}/>}
                    {j.status==="urgent" && <span style={{ background:"#FAEEDA", color:"#633806", fontSize:"10px", fontWeight:700, padding:"1px 5px", borderRadius:"3px" }}>{t("jobs.badgeUrgent")}</span>}
                    {j.isApplied && <span style={{ background:"#27500A", color:"#fff", fontSize:"10px", fontWeight:700, padding:"1px 5px", borderRadius:"3px" }}>{t("jobs.badgeApplied")}</span>}
                    {j.company}
                  </div>
                </td>
                <td style={{ padding:"13px 14px", color:navy }}>
                  <div>{positionTitle(j)}</div>
                  <div style={{ display:"flex", gap:"4px", marginTop:"4px" }}>
                    <span style={{ background:"#E6F1FB", color:"#185FA5", fontSize:"10px", fontWeight:600, padding:"2px 6px", borderRadius:"4px" }}>{translateValue(j.industry, lang)}</span>
                    <span style={{ fontSize:"10px", fontWeight:700, padding:"2px 6px", borderRadius:"4px", background:"#F6F7F9", color: j.jlpt_min==="N1" ? "#A32D2D" : j.jlpt_min==="N2" ? "#633806" : "#27500A" }}>{t("jobs.jlptOrMore",{lvl:j.jlpt_min})}</span>
                  </div>
                </td>
                <td style={{ padding:"13px 14px", color:"#444", fontSize:"12px" }}>{j.annual_income || j.salary || t("jobs.negotiable")}</td>
                <td style={{ padding:"13px 14px", textAlign:"center" }}>
                  <button onClick={e => { e.stopPropagation(); toggleFavorite(j.id); }} disabled={favBusy===j.id}
                    title={j.isFavorite ? t("jobs.favRemove") : t("jobs.favAdd")}
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
        <div>{t("detail.loading")}</div>
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
            {/* Logo acts as "home" WITHIN mypage — links to /mypage itself, not out to the
               public marketing site, matching how a logged-in app/portal's logo usually
               behaves (stay in the app you're using). */}
            <Link href="/mypage" style={{ display:"flex", alignItems:"center", gap:"7px", textDecoration:"none" }}>
              <div style={{ width:"28px", height:"28px", background:"#fff", borderRadius:"7px", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, overflow:"hidden", border:"1px solid rgba(11,31,58,0.08)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/aseka-logo-icon.png" alt="ASEKA" style={{ width:"22px", height:"22px", objectFit:"contain", display:"block" }} />
              </div>
              <span style={{ fontWeight:800, fontSize:"14px", color:navy, letterSpacing:"0.08em" }}>ASEKA</span>
            </Link>
            <span style={{ color:"#C8D0DB", fontSize:"12px" }}>|</span>
            <span style={{ fontSize:"12px", color:"#52525B" }}>{t("nav.tagline")}</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
            <MypageLangSwitcher />
            <span style={{ fontSize:"12px", color:"#52525B" }}>
              {t("nav.welcome",{name:cand?.name||""})}
            </span>
            <button onClick={logout}
              style={{ padding:"5px 12px", borderRadius:"6px", fontSize:"12px", color:"#52525B", background:"none", border:"1px solid #E0E3E9", cursor:"pointer" }}>
              {t("nav.logout")}
            </button>
          </div>
        </div>

        {/* ── TAB BAR — navy, matching Aseka's own brand usage. ── */}
        <div style={{ background:navy }}>
          <div style={{ maxWidth:"1200px", margin:"0 auto", padding:"0 24px", display:"flex" }}>
            {[
              { key:"jobs",      label:t("nav.jobs"),      count: allCount },
              { key:"favorites", label:t("nav.favorites"), count: favCount },
              { key:"status",    label:t("nav.status"),    count: null },
              { key:"profile",   label:t("nav.profile"),   count: null },
            ].map(tb => (
              <button key={tb.key} onClick={() => setTab(tb.key as typeof tab)}
                style={{ padding:"12px 24px", fontSize:"13px", fontWeight: tab===tb.key ? 700 : 400, color:"#fff", background: tab===tb.key ? "rgba(255,255,255,0.12)" : "transparent", border:"none", cursor:"pointer", borderBottom: tab===tb.key ? `3px solid ${red}` : "3px solid transparent", display:"flex", alignItems:"center", gap:"6px" }}>
                {tb.label}
                {tb.count !== null && tb.count > 0 && (
                  <span style={{ background:red, color:"#fff", borderRadius:"20px", fontSize:"11px", fontWeight:700, padding:"1px 7px" }}>{countLabel(tb.count)}</span>
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
                <h2 style={{ margin:"0 0 4px", fontSize:"16px", fontWeight:700, color:navy }}>{t("jobs.pickupTitle")}</h2>
                <p style={{ margin:0, fontSize:"11px", color:"#64748B" }}>
                  {t("jobs.pickupDesc",{skill:translateValue(cand?.skill,lang)||"—",jlpt:cand?.jlpt||"—"})}
                </p>
              </div>

              {/* Sub-tabs: すべて / 未読 / 新着 */}
              <div style={{ borderBottom:"1px solid #F0F1F4", display:"flex", padding:"0 20px" }}>
                {[
                  { k:"all",    l:t("jobs.tabAll"),    count: allCount },
                  { k:"unread", l:t("jobs.tabUnread"), count: unreadCount },
                  { k:"new",    l:t("jobs.tabNew"),    count: newCount },
                ].map(st => (
                  <button key={st.k} onClick={() => setJobFilter(st.k as "all"|"unread"|"new")} className="mp-subtab"
                    style={{ padding:"10px 0", marginRight:"24px", fontSize:"13px", fontWeight: jobFilter===st.k ? 700 : 400, color: jobFilter===st.k ? red : "#52525B", background:"none", border:"none", borderBottom: jobFilter===st.k ? `2px solid ${red}` : "2px solid transparent", cursor:"pointer", display:"flex", alignItems:"center", gap:"5px", transition:"opacity 0.15s" }}>
                    {st.l}
                    <span style={{ background: jobFilter===st.k ? red : "#E8EAF0", color: jobFilter===st.k ? "#fff" : "#52525B", borderRadius:"20px", fontSize:"11px", fontWeight:700, padding:"1px 6px" }}>{countLabel(st.count)}</span>
                  </button>
                ))}
              </div>

              <div style={{ padding:"10px 20px 0", fontSize:"11px", color:"#64748B" }}>
                {t("jobs.favHint")}
              </div>
              <div style={{ padding:"10px 0 0" }}>
                {renderJobTable(displayed, t("jobs.emptyAll"))}
              </div>
            </div>
          )}

          {/* ── TAB: 検討中求人 ── */}
          {tab === "favorites" && (
            <div style={{ background:"#fff", borderRadius:"10px", overflow:"hidden", boxShadow:"0 1px 6px rgba(0,0,0,0.06)" }}>
              <div style={{ padding:"18px 20px", borderBottom:"1px solid #F0F1F4" }}>
                <h2 style={{ margin:"0 0 4px", fontSize:"16px", fontWeight:700, color:navy }}>{t("favorites.title")}</h2>
                <p style={{ margin:0, fontSize:"11px", color:"#64748B" }}>{t("favorites.desc")}</p>
              </div>
              {renderJobTable(favorited, t("favorites.empty"))}
            </div>
          )}

          {/* ── TAB: 選考状況 ── */}
          {tab === "status" && (
            <div style={{ background:"#fff", borderRadius:"10px", overflow:"hidden", boxShadow:"0 1px 6px rgba(0,0,0,0.06)" }}>
              <div style={{ padding:"18px 20px", borderBottom:"1px solid #F0F1F4" }}>
                <h2 style={{ margin:"0 0 4px", fontSize:"16px", fontWeight:700, color:navy }}>{t("status.title")}</h2>
                <p style={{ margin:0, fontSize:"11px", color:"#64748B" }}>{t("status.desc")}</p>
              </div>
              <div style={{ padding:"28px 24px" }}>
                {/* Progress steps */}
                <div style={{ display:"flex", alignItems:"center", marginBottom:"32px" }}>
                  {STATUS_STEP_KEYS.map((key, i) => {
                    const active  = currentStep === i;
                    const done2   = currentStep > i;
                    const color = stepColor(key);
                    return (
                      <div key={key} style={{ display:"flex", alignItems:"center", flex: i < STATUS_STEP_KEYS.length-1 ? 1 : undefined }}>
                        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"6px" }}>
                          <div style={{ width:"40px", height:"40px", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", background: done2 ? "#EAF3DE" : active ? color : "#F0F1F4", border: active ? `3px solid ${color}` : done2 ? "3px solid #27500A" : "3px solid transparent", transition:"all 0.3s" }}>
                            {done2
                              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#27500A" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                              : <div style={{ width:"10px", height:"10px", borderRadius:"50%", background: active ? "#fff" : "#C8D0DB" }}/>
                            }
                          </div>
                          <div style={{ textAlign:"center" }}>
                            <div style={{ fontSize:"11px", fontWeight: active ? 700 : 500, color: active ? color : done2 ? "#27500A" : "#64748B" }}>{t(`status.step.${key}`)}</div>
                          </div>
                        </div>
                        {i < STATUS_STEP_KEYS.length-1 && (
                          <div style={{ flex:1, height:"2px", background: done2 ? "#27500A" : "#E8EAF0", margin:"0 6px", marginBottom:"22px", transition:"background 0.3s" }}/>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Current status card. "quit" (退職) is a real, admin-settable status that
                   doesn't fit the linear 4-step pipeline above (it's a terminal state after
                   working, not a step within onboarding) — falling through to the currentStep
                   === -1 branch would have wrongly shown "Registered" for someone who has
                   actually left. Shown as its own explicit case instead. */}
                <div style={{ background: cand?.status==="quit" ? "#F6F7F9" : currentStep >= 0 ? "#F8FFF8" : "#F8F9FB", border:`1px solid ${cand?.status==="quit"?"#44444122":currentStep>=0?"#27500A22":"#E8EAF0"}`, borderRadius:"10px", padding:"16px 20px" }}>
                  <div style={{ fontSize:"12px", fontWeight:700, color:navy, marginBottom:"4px" }}>
                    {t("status.current")} <span style={{ color: cand?.status==="quit" ? "#444441" : currentStep>=0 ? stepColor(STATUS_STEP_KEYS[currentStep]) : "#64748B" }}>
                      {cand?.status==="quit" ? t("status.step.quit") : currentStep>=0 ? t(`status.step.${STATUS_STEP_KEYS[currentStep]}`) : t("status.registered")}
                    </span>
                  </div>
                  {cand?.match_job_name && (
                    <div style={{ fontSize:"12px", color:"#444" }}>
                      {t("status.introducedTo")} <strong>{cand.match_job_name}</strong>
                    </div>
                  )}
                  <div style={{ fontSize:"11px", color:"#52525B", marginTop:"6px" }}>
                    {t("status.contactNote")}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: Profile ── */}
          {tab === "profile" && cand && (
            <div style={{ background:"#fff", borderRadius:"10px", overflow:"hidden", boxShadow:"0 1px 6px rgba(0,0,0,0.06)" }}>
              <div style={{ padding:"18px 20px", borderBottom:"1px solid #F0F1F4" }}>
                <h2 style={{ margin:"0 0 4px", fontSize:"16px", fontWeight:700, color:navy }}>{t("profile.title")}</h2>
                <p style={{ margin:0, fontSize:"11px", color:"#64748B" }}>{t("profile.desc")}</p>
              </div>
              <div style={{ padding:"20px 24px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                {[
                  { l:t("profile.name"),          v: cand.name },
                  { l:t("profile.email"),         v: cand.email||t("unset") },
                  { l:t("profile.phone"),         v: cand.phone||t("unset") },
                  { l:t("profile.dob"),           v: cand.date_of_birth||t("unset") },
                  { l:t("profile.gender"),        v: cand.gender||t("unset") },
                  { l:t("profile.jlpt"),          v: cand.jlpt||t("unset") },
                  { l:t("profile.skill"),         v: cand.skill?translateValue(cand.skill,lang):t("unset") },
                  { l:t("profile.preferredJob"),  v: cand.preferred_job||t("unset") },
                  { l:t("profile.visaType"),      v: cand.visa_type?translateValue(cand.visa_type,lang):t("unset") },
                  { l:t("profile.visaExpiry"),    v: cand.visa_expiry||t("unset") },
                  { l:t("profile.address"),       v: cand.address||t("unset") },
                  { l:t("profile.availability"),  v: cand.availability||t("unset") },
                ].map(d => (
                  <div key={d.l} style={{ background:"#F8F9FB", borderRadius:"8px", padding:"10px 14px" }}>
                    <div style={{ fontSize:"11px", color:"#64748B", marginBottom:"2px" }}>{d.l}</div>
                    <div style={{ fontSize:"13px", fontWeight:600, color:navy }}>{d.v}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding:"0 24px 20px" }}>
                <Link href={`${MAIN_SITE_URL}/#contact`}
                  style={{ display:"inline-flex", alignItems:"center", gap:"6px", padding:"9px 18px", borderRadius:"8px", background:"#fff", border:`1.5px solid ${navy}`, color:navy, textDecoration:"none", fontSize:"12px", fontWeight:600 }}>
                  {t("profile.updateInfo")}
                </Link>
              </div>

              {/* Password set/change */}
              <div style={{ borderTop:"1px solid #F0F1F4", padding:"20px 24px" }}>
                <h3 style={{ margin:"0 0 4px", fontSize:"13px", fontWeight:700, color:navy }}>
                  {cand.hasPassword ? t("profile.pwChangeTitle") : t("profile.pwSetTitle")}
                </h3>
                <p style={{ margin:"0 0 14px", fontSize:"11px", color:"#64748B" }}>
                  {cand.hasPassword ? t("profile.pwChangeDesc") : t("profile.pwSetDesc")}
                </p>
                <form onSubmit={changePassword} style={{ display:"flex", flexDirection:"column", gap:"8px", maxWidth:"320px" }}>
                  {cand.hasPassword && (
                    <input type="password" placeholder={t("profile.pwCurrentPlaceholder")} value={pwCurrent} onChange={e=>setPwCurrent(e.target.value)} required
                      style={{ padding:"10px 12px", borderRadius:"7px", border:"1.5px solid #E0E3E9", fontSize:"13px", outline:"none", background:"#F7F8FA" }}/>
                  )}
                  <input type="password" placeholder={t("profile.pwNewPlaceholder")} value={pwNew} onChange={e=>setPwNew(e.target.value)} required minLength={6}
                    style={{ padding:"10px 12px", borderRadius:"7px", border:"1.5px solid #E0E3E9", fontSize:"13px", outline:"none", background:"#F7F8FA" }}/>
                  {pwMsg && (
                    <div style={{ fontSize:"11px", padding:"8px 10px", borderRadius:"6px", background: pwMsg.type==="ok" ? "#EAF3DE" : "#FCEBEB", color: pwMsg.type==="ok" ? "#27500A" : "#C8002A" }}>
                      {pwMsg.type==="ok" ? "✓ " : "⚠️ "}{pwMsg.text}
                    </div>
                  )}
                  <button type="submit" disabled={pwSaving}
                    style={{ padding:"9px 16px", borderRadius:"7px", background: pwSaving ? "#64748B" : navy, color:"#fff", border:"none", fontSize:"12px", fontWeight:700, cursor: pwSaving ? "not-allowed" : "pointer", alignSelf:"flex-start" }}>
                    {pwSaving ? t("profile.pwSave") : cand.hasPassword ? t("profile.pwChangeBtn") : t("profile.pwSetBtn")}
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
              {[translateValue(cand?.skill,lang), cand?.jlpt, translateValue(cand?.visa_type,lang)].filter(Boolean).map(tg=>(
                <span key={tg} style={{ background:"#E6F1FB", color:"#185FA5", fontSize:"11px", fontWeight:600, padding:"3px 8px", borderRadius:"4px" }}>{tg}</span>
              ))}
            </div>
          </div>

          {/* Contact advisor */}
          <div style={{ background:"#fff", borderRadius:"10px", padding:"16px", boxShadow:"0 1px 6px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize:"12px", fontWeight:700, color:navy, marginBottom:"8px" }}>{t("sidebar.advisor")}</div>
            <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"10px" }}>
              <div style={{ width:"36px", height:"36px", borderRadius:"50%", background:"#FAEEDA", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px" }}>👤</div>
              <div>
                <div style={{ fontSize:"12px", fontWeight:600, color:navy }}>{t("sidebar.advisorName")}</div>
                <div style={{ fontSize:"11px", color:"#185FA5" }}>contact@aseka.jp</div>
              </div>
            </div>
            <Link href={`${MAIN_SITE_URL}/#contact`}
              style={{ display:"block", textAlign:"center", padding:"8px", borderRadius:"7px", background:navy, color:"#fff", textDecoration:"none", fontSize:"11px", fontWeight:600 }}>
              {t("sidebar.contact")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
