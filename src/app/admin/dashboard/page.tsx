"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAdminLang, dashLabel, dashTime, type AdminLang } from "@/lib/adminI18n";

type PipelineItem  = { ja:string; vn:string; val:number; pct:number; color:string };
type ActivityItem  = { time:string; ja:string; vn:string; obj:string; tc:string; tb:string };

type DashData = {
  stats: { interview:number; offered:number; activeJobs:number; urgentJobs:number; unreadMsgs:number };
  pipeline: PipelineItem[];
  jobsByIndustry: PipelineItem[];
  activity: ActivityItem[];
  totals: { candidates:number; jobs:number };
  monthly: { cv:number; jobs:number; offers:number };
};

const navy = "#0B1F3A";
const B = { border:"0.5px solid rgba(11,31,58,0.08)" };
const CARD = { background:"#fff", ...B, borderRadius:"14px", boxShadow:"0 1px 2px rgba(11,31,58,0.04)" } as React.CSSProperties;

/* ── Count-up number (respects prefers-reduced-motion) ── */
function CountUp({ value, duration = 900 }: { value:number; duration?:number }) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);
  useEffect(() => {
    const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { setDisplay(value); prevValue.current = value; return; }
    const from = prevValue.current;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else prevValue.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <>{display}</>;
}

function StatIcon({ name }: { name: string }) {
  const p = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", strokeWidth: "2" } as React.SVGProps<SVGSVGElement>;
  if (name === "interview") return <svg {...p}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
  if (name === "offered")   return <svg {...p}><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>;
  if (name === "jobs")      return <svg {...p}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>;
  if (name === "msgs")      return <svg {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>;
  return null;
}

/* ── Donut chart (SVG stroke-dasharray technique) ── */
function DonutChart({ items, lang, t }: { items: PipelineItem[]; lang: AdminLang; t: (key: string, vars?: Record<string,string|number>) => string }) {
  const total = items.reduce((s, p) => s + p.val, 0);
  const r = 62, cx = 80, cy = 80;
  const C = 2 * Math.PI * r;
  let cum = 0;
  const slices = items.map(p => {
    const frac = total > 0 ? p.val / total : 0;
    const el = { ...p, frac, dasharray: `${frac * C} ${C}`, dashoffset: -(cum * C) };
    cum += frac;
    return el;
  });

  return (
    <div style={{ display:"flex", alignItems:"center", gap:"20px" }}>
      <svg width="160" height="160" style={{ flexShrink:0 }}>
        {total === 0
          ? <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1EFE8" strokeWidth="20" />
          : slices.map((s, i) => (
              <circle key={i} cx={cx} cy={cy} r={r} fill="none"
                stroke={s.color} strokeWidth="20" strokeLinecap="butt"
                strokeDasharray={s.dasharray}
                strokeDashoffset={s.dashoffset}
                style={{ transform:"rotate(-90deg)", transformOrigin:`${cx}px ${cy}px`, transition:"stroke-dasharray 0.9s cubic-bezier(0.16,1,0.3,1)" }}
              />
            ))
        }
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize="26" fontWeight="700" fill={navy}><CountUp value={total} /></text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="10" fill="#52525B">{t("dashboard.registered")}</text>
        <text x={cx} y={cy + 24} textAnchor="middle" fontSize="9" fill="#52525B">{t("sidebar.candidates")}</text>
      </svg>

      {/* Legend */}
      <div style={{ flex:1 }}>
        {slices.map(s => (
          <div key={s.ja} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"9px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"7px" }}>
              <div style={{ width:"10px", height:"10px", borderRadius:"3px", background:s.color, flexShrink:0 }} />
              <div style={{ fontSize:"11px", fontWeight:600, color:navy }}>{dashLabel(s.ja, lang, s.vn)}</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:"13px", fontWeight:700, color:s.color }}>{s.val}</div>
              <div style={{ fontSize:"10px", color:"#52525B" }}>{total > 0 ? Math.round(s.frac * 100) : 0}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Bar chart (vertical grouped) ── */
function BarChart({ pipeline, monthly, lang, t }: { pipeline: PipelineItem[]; monthly: { cv:number; jobs:number; offers:number }; lang: AdminLang; t: (key: string, vars?: Record<string,string|number>) => string }) {
  const stages = [
    { key:"新規登録", color:"#378ADD" },
    { key:"面接中",   color:"#EF9F27" },
    { key:"内定済み", color:"#5DCAA5" },
    { key:"就業中",   color:"#27500A" },
    { key:"退職",     color:"#B4B2A9" },
  ];
  const data = stages.map(s => {
    const found = pipeline.find(p => p.ja === s.key);
    return { ...s, val: found?.val || 0 };
  });
  const maxVal = Math.max(...data.map(d => d.val), 1);
  const chartH = 140;

  return (
    <div>
      {/* Monthly summary badges */}
      <div style={{ display:"flex", gap:"8px", marginBottom:"16px" }}>
        {[
          { labelKey:"dashboard.cvThisMonth",     val:monthly.cv,     color:"#185FA5", bg:"#EBF4FF" },
          { labelKey:"dashboard.jobsThisMonth",   val:monthly.jobs,   color:"#7C6FF7", bg:"#F0EFFE" },
          { labelKey:"dashboard.offersThisMonth", val:monthly.offers, color:"#27A87A", bg:"#EAFAF5" },
        ].map(b => (
          <div key={b.labelKey} style={{ flex:1, background:b.bg, borderRadius:"10px", padding:"9px 8px", textAlign:"center", border:`0.5px solid ${b.color}22` }}>
            <div style={{ fontSize:"22px", fontWeight:800, color:b.color, lineHeight:1 }}><CountUp value={b.val} /></div>
            <div style={{ fontSize:"11px", fontWeight:600, color:navy, marginTop:"3px" }}>{t(b.labelKey)}</div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div style={{ display:"flex", alignItems:"flex-end", gap:"8px", height:`${chartH + 52}px`, padding:"0 4px" }}>
        {data.map((s) => {
          const barH = Math.max((s.val / maxVal) * chartH, s.val > 0 ? 12 : 4);
          const pct = maxVal > 0 ? Math.round((s.val / maxVal) * 100) : 0;
          return (
            <div key={s.key} className="dash-bar-col" style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:"4px" }}>
              {/* value label on top */}
              <div style={{ fontSize:"13px", fontWeight:700, color:s.val > 0 ? s.color : "#ccc", minHeight:"18px", display:"flex", alignItems:"center" }}>
                {s.val}
              </div>
              {/* % below value */}
              <div style={{ fontSize:"10px", color:"#52525B", minHeight:"12px" }}>{pct}%</div>
              {/* bar */}
              <div className="dash-bar" style={{ width:"100%", height:`${barH}px`, background:s.color, borderRadius:"6px 6px 3px 3px", opacity: s.val === 0 ? 0.2 : 1, transition:"height 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.2s ease", position:"relative", overflow:"hidden" }}>
                {/* shine overlay */}
                <div style={{ position:"absolute", top:0, left:0, right:0, height:"40%", background:"rgba(255,255,255,0.18)", borderRadius:"6px 6px 0 0" }} />
              </div>
              {/* x-axis label */}
              <div style={{ textAlign:"center", marginTop:"4px" }}>
                <div style={{ fontSize:"11px", fontWeight:600, color:navy, whiteSpace:"nowrap" }}>{dashLabel(s.key, lang)}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* X-axis baseline */}
      <div style={{ height:"1px", background:"rgba(11,31,58,0.1)", margin:"0 4px" }} />
    </div>
  );
}

function ActivityIcon({ ja }: { ja: string }) {
  const p = { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", strokeWidth: "2.2" } as React.SVGProps<SVGSVGElement>;
  if (ja.includes("候補者") || ja.includes("応募")) return <svg {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0112 0v1"/></svg>;
  if (ja.includes("求人")) return <svg {...p}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>;
  return <svg {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>;
}

export default function Dashboard() {
  const { lang, t } = useAdminLang();
  const [time, setTime] = useState("");
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingApplies, setPendingApplies] = useState(0);
  const [email, setEmail] = useState("");

  const loadData = (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    setTime(new Date().toLocaleString("ja-JP"));
    Promise.all([
      fetch("/api/admin/dashboard").then(r => r.json()),
      fetch("/api/admin/candidates/pending-count").then(r => r.ok ? r.json() : { count:0 }).catch(() => ({ count:0 })),
    ]).then(([d, p]) => {
      setData(d); setPendingApplies(p.count || 0); setLoading(false);
    }).catch(() => setLoading(false))
      .finally(() => { if (isRefresh) setTimeout(() => setRefreshing(false), 400); });
  };

  useEffect(() => {
    loadData();
    fetch("/api/admin/me").then(r => r.ok ? r.json() : null).then(d => { if (d?.email) setEmail(d.email); });
    const onVisible = () => { if (!document.hidden) loadData(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const d = data;
  const stats = d ? [
    { icon:"interview", val: d.stats.interview,  labelKey:"dashboard.statInterview",   sub: t("dashboard.subRegistered", { n: d.totals.candidates }), color:"#185FA5", bg:"#EBF4FF" },
    { icon:"offered",   val: d.stats.offered,    labelKey:"dashboard.statOffered",     sub: t("dashboard.subThisMonth", { n: d.stats.offered }),       color:"#27500A", bg:"#EAF3DE" },
    { icon:"jobs",      val: d.stats.activeJobs, labelKey:"dashboard.statActiveJobs",  sub: d.stats.urgentJobs > 0 ? t("dashboard.subUrgent", { n: d.stats.urgentJobs }) : t("dashboard.subRecruiting"), color:"#633806", bg:"#FAEEDA" },
    { icon:"msgs",      val: d.stats.unreadMsgs, labelKey:"dashboard.statUnreadMsgs",  sub: d.stats.unreadMsgs > 0 ? t("dashboard.subNewToday") : t("dashboard.subHandled"), color:"#C8002A", bg:"#FCEBEB" },
  ] : [];

  const greetName = email ? email.split("@")[0] : "";

  return (
    <div className="dash-root">
      {/* Header */}
      <div style={{ background:"#fff",...B,borderTop:"none",borderLeft:"none",borderRight:"none",padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"10px" }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
            <div style={{ fontSize:"16px",fontWeight:700,color:navy }}>{t("dashboard.greeting")}{greetName ? `, ${greetName}` : ""}</div>
            <span style={{ display:"inline-flex", alignItems:"center", gap:"4px", background:"#EAF3DE", color:"#27500A", fontSize:"10px", fontWeight:700, padding:"2px 7px", borderRadius:"20px" }}>
              <span className="dash-live-dot" style={{ width:"5px", height:"5px", borderRadius:"50%", background:"#27500A", display:"inline-block" }} />
              {t("dashboard.live")}
            </span>
          </div>
          <div style={{ fontSize:"11px",color:"#52525B", marginTop:"2px" }}>{t("dashboard.snapshotSub")} · {time}</div>
        </div>
        <div style={{ display:"flex",gap:"8px",alignItems:"center" }}>
          <button onClick={() => loadData(true)} title={t("dashboard.refresh")}
            style={{ width:"32px",height:"32px",borderRadius:"8px",border:"1px solid rgba(11,31,58,0.12)",background:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:navy,transition:"background 0.15s" }}
            onMouseEnter={e=>e.currentTarget.style.background="#F6F7F9"} onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
              style={{ transition:"transform 0.5s cubic-bezier(0.4,0,0.2,1)", transform: refreshing ? "rotate(360deg)" : "rotate(0deg)" }}>
              <path d="M21 2v6h-6M3 22v-6h6M3.51 9a9 9 0 0114.85-3.36L21 8M3 16l2.64 2.36A9 9 0 0020.49 15"/>
            </svg>
          </button>
          <Link href="/dang-ky" target="_blank" style={{ padding:"7px 12px",borderRadius:"8px",fontSize:"12px",fontWeight:600,background:"#E6F1FB",color:navy,textDecoration:"none",display:"flex",alignItems:"center",gap:"5px",border:"1px solid rgba(11,31,58,0.15)",transition:"background 0.15s" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
            {t("dashboard.registerFormLink")}
          </Link>
          <Link href="/admin/jobs" style={{ padding:"7px 14px",borderRadius:"8px",fontSize:"12px",fontWeight:600,background:navy,color:"#fff",textDecoration:"none",transition:"opacity 0.15s" }}
            onMouseEnter={e=>e.currentTarget.style.opacity="0.85"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>{t("dashboard.addNew")}</Link>
        </div>
      </div>

      <div style={{ padding:"16px 20px" }}>

        {/* Pending applies banner */}
        {!loading && pendingApplies > 0 && (
          <Link href="/admin/candidates" className="dash-fade-in" style={{
            display:"flex", alignItems:"center", gap:"10px", textDecoration:"none",
            background:"linear-gradient(90deg, #FCEBEB 0%, #FFF8E6 100%)", border:"1px solid #C8002A22",
            borderRadius:"12px", padding:"11px 16px", marginBottom:"14px",
          }}>
            <span style={{ width:"8px", height:"8px", borderRadius:"50%", background:"#C8002A", flexShrink:0, animation:"dashPulseDot 1.6s infinite" }} />
            <span style={{ fontSize:"12px", fontWeight:700, color:"#A32D2D" }}>🔔 {pendingApplies} {t("dashboard.pendingApplies")}</span>
            <span style={{ marginLeft:"auto", fontSize:"11px", color:"#A32D2D", fontWeight:600 }}>{t("dashboard.viewAll")}</span>
          </Link>
        )}

        {/* Stats */}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"12px",marginBottom:"14px" }} className="dash-stats-grid">
          {loading
            ? Array(4).fill(0).map((_,i) => (
                <div key={i} style={{ ...CARD,padding:"16px",height:"92px",animation:"pulse 1.5s infinite" }}>
                  <div style={{ height:"28px",width:"60px",background:"#F1EFE8",borderRadius:"4px",marginBottom:"6px" }}/>
                  <div style={{ height:"10px",width:"80px",background:"#F1EFE8",borderRadius:"3px" }}/>
                </div>
              ))
            : stats.map((s,i) => (
                <div key={s.labelKey} className="dash-card dash-fade-in" style={{ ...CARD, padding:"16px", position:"relative", overflow:"hidden", animationDelay:`${i*60}ms` }}>
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
                    <div>
                      <div style={{ fontSize:"26px",fontWeight:800,color:navy,lineHeight:1 }}><CountUp value={s.val} /></div>
                      <div style={{ fontSize:"12px",fontWeight:600,color:navy,margin:"6px 0 2px" }}>{t(s.labelKey)}</div>
                      <div style={{ fontSize:"11px",color:s.color,fontWeight:600 }}>{s.sub}</div>
                    </div>
                    <div style={{ width:"38px",height:"38px",borderRadius:"10px",background:s.bg,color:s.color,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                      <StatIcon name={s.icon} />
                    </div>
                  </div>
                  <div style={{ position:"absolute", left:0, top:0, bottom:0, width:"3px", background:s.color, opacity:0.6 }} />
                </div>
              ))
          }
        </div>

        {/* Pipeline + Jobs bars */}
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px" }} className="dash-2col">
          {[
            { titleKey:"dashboard.pipelineTitle", data: d?.pipeline||[], href:"/admin/candidates" },
            { titleKey:"dashboard.jobsByIndustryTitle", data: d?.jobsByIndustry||[], href:"/admin/jobs" },
          ].map((card,i) => (
            <div key={card.titleKey} className="dash-card dash-fade-in" style={{ ...CARD,overflow:"hidden",animationDelay:`${240+i*60}ms` }}>
              <div style={{ padding:"12px 16px",borderBottom:"0.5px solid rgba(11,31,58,0.08)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                <div style={{ fontSize:"12px",fontWeight:700,color:navy }}>{t(card.titleKey)}</div>
                <Link href={card.href} className="dash-link" style={{ fontSize:"11px",color:"#185FA5",textDecoration:"none" }}>{t("dashboard.viewAll")}</Link>
              </div>
              <div style={{ padding:"14px 16px" }}>
                {loading
                  ? Array(4).fill(0).map((_,i) => (
                      <div key={i} style={{ display:"flex",alignItems:"center",gap:"8px",marginBottom:"9px" }}>
                        <div style={{ width:"100px",height:"28px",background:"#F1EFE8",borderRadius:"3px",flexShrink:0 }}/>
                        <div style={{ flex:1,height:"5px",background:"#F1EFE8",borderRadius:"3px" }}/>
                      </div>
                    ))
                  : card.data.length === 0
                  ? <div style={{ textAlign:"center",padding:"20px",fontSize:"12px",color:"#52525B" }}>{t("dashboard.noData")}</div>
                  : card.data.map(p => (
                      <div key={p.ja} style={{ display:"flex",alignItems:"center",gap:"8px",marginBottom:"9px" }}>
                        <div style={{ width:"100px",flexShrink:0 }}>
                          <div style={{ fontSize:"11px",color:navy,fontWeight:500 }}>{dashLabel(p.ja, lang, p.vn)}</div>
                        </div>
                        <div style={{ flex:1,height:"6px",background:"#F6F7F9",borderRadius:"3px",overflow:"hidden" }}>
                          <div style={{ width:`${p.pct}%`,height:"100%",background:`linear-gradient(90deg, ${p.color}CC, ${p.color})`,borderRadius:"3px",transition:"width 0.7s cubic-bezier(0.16,1,0.3,1)" }}/>
                        </div>
                        <span style={{ fontSize:"11px",fontWeight:700,color:navy,width:"20px",textAlign:"right" }}>{p.val}</span>
                      </div>
                    ))
                }
              </div>
            </div>
          ))}
        </div>

        {/* ── Charts row: Donut + Funnel ── */}
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px" }} className="dash-2col">

          {/* Donut chart */}
          <div className="dash-card dash-fade-in" style={{ ...CARD,overflow:"hidden",animationDelay:"360ms" }}>
            <div style={{ padding:"12px 16px",borderBottom:"0.5px solid rgba(11,31,58,0.08)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <div>
                <div style={{ fontSize:"12px",fontWeight:700,color:navy }}>{t("dashboard.statusDistTitle")}</div>
                <div style={{ fontSize:"10px",color:"#52525B",marginTop:"1px" }}>{t("dashboard.donutSub")}</div>
              </div>
              <Link href="/admin/candidates" className="dash-link" style={{ fontSize:"11px",color:"#185FA5",textDecoration:"none" }}>{t("dashboard.viewAll")}</Link>
            </div>
            <div style={{ padding:"16px 20px" }}>
              {loading
                ? <div style={{ height:"160px",display:"flex",alignItems:"center",justifyContent:"center" }}>
                    <div style={{ width:"120px",height:"120px",borderRadius:"50%",background:"#F1EFE8",animation:"pulse 1.5s infinite" }}/>
                  </div>
                : <DonutChart items={d?.pipeline || []} lang={lang} t={t} />
              }
            </div>
          </div>

          {/* Bar chart */}
          <div className="dash-card dash-fade-in" style={{ ...CARD,overflow:"hidden",animationDelay:"420ms" }}>
            <div style={{ padding:"12px 16px",borderBottom:"0.5px solid rgba(11,31,58,0.08)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <div>
                <div style={{ fontSize:"12px",fontWeight:700,color:navy }}>{t("dashboard.stageMonthTitle")}</div>
                <div style={{ fontSize:"10px",color:"#52525B",marginTop:"1px" }}>{t("dashboard.barSub")}</div>
              </div>
              <Link href="/admin/candidates" className="dash-link" style={{ fontSize:"11px",color:"#185FA5",textDecoration:"none" }}>{t("dashboard.viewAll")}</Link>
            </div>
            <div style={{ padding:"16px 20px" }}>
              {loading
                ? <div style={{ display:"flex",alignItems:"flex-end",gap:"8px",height:"190px" }}>
                    {Array(5).fill(0).map((_,i) => (
                      <div key={i} style={{ flex:1,background:"#F1EFE8",borderRadius:"6px 6px 3px 3px",animation:"pulse 1.5s infinite",height:`${40 + i*20}px` }}/>
                    ))}
                  </div>
                : <BarChart pipeline={d?.pipeline || []} monthly={d?.monthly || { cv:0, jobs:0, offers:0 }} lang={lang} t={t} />
              }
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dash-card dash-fade-in" style={{ ...CARD,overflow:"hidden",animationDelay:"480ms" }}>
          <div style={{ padding:"12px 16px",borderBottom:"0.5px solid rgba(11,31,58,0.08)" }}>
            <div style={{ fontSize:"12px",fontWeight:700,color:navy }}>{t("dashboard.activityTitle")}</div>
          </div>
          {loading
            ? <div style={{ padding:"20px",textAlign:"center",color:"#52525B",fontSize:"12px" }}>{t("common.loading")}</div>
            : (d?.activity || []).length === 0
            ? <div style={{ padding:"32px 20px",textAlign:"center",color:"#64748B",fontSize:"12px" }}>
                <div style={{ fontSize:"22px", marginBottom:"6px" }}>📭</div>
                {t("dashboard.noActivity")}
              </div>
            : (
              <div>
                {(d?.activity || []).map((a, i) => (
                  <div key={i} className="dash-activity-row" style={{ display:"flex",alignItems:"center",gap:"12px",padding:"11px 16px",borderBottom: i < (d?.activity.length||0)-1 ? "0.5px solid rgba(11,31,58,0.05)" : "none" }}>
                    <div style={{ width:"30px",height:"30px",borderRadius:"9px",background:a.tb,color:a.tc,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                      <ActivityIcon ja={a.ja} />
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:"12px",color:navy,fontWeight:500 }}>
                        {dashLabel(a.ja, lang, a.vn)} · <span style={{ fontWeight:700 }}>{a.obj}</span>
                      </div>
                    </div>
                    <span style={{ background:a.tb,color:a.tc,fontSize:"10px",fontWeight:700,padding:"2px 7px",borderRadius:"20px",flexShrink:0 }}>{dashLabel(a.ja, lang, a.vn)}</span>
                    <div style={{ fontSize:"11px",color:"#64748B",whiteSpace:"nowrap",flexShrink:0,width:"64px",textAlign:"right" }}>{dashTime(a.time, lang)}</div>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes dashPulseDot { 0%,100%{ opacity:1; transform:scale(1); } 50%{ opacity:0.4; transform:scale(1.3); } }
        @keyframes dashFadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .dash-fade-in { animation: dashFadeIn 0.45s cubic-bezier(0.16,1,0.3,1) both; }
        .dash-card { transition: box-shadow 0.2s ease, transform 0.2s ease; }
        .dash-card:hover { box-shadow: 0 8px 24px rgba(11,31,58,0.08); transform: translateY(-2px); }
        .dash-link { transition: opacity 0.15s ease; }
        .dash-link:hover { opacity: 0.6; }
        .dash-activity-row { transition: background 0.15s ease; }
        .dash-activity-row:hover { background: #F9FAFB; }
        .dash-bar-col:hover .dash-bar { filter: brightness(1.08); transform: scaleY(1.01); }
        .dash-live-dot { animation: dashPulseDot 2s infinite; }
        @media (prefers-reduced-motion: reduce) {
          .dash-fade-in { animation: none; }
          .dash-card, .dash-bar, .dash-live-dot { animation: none !important; transition: none !important; }
        }
        @media (max-width: 900px) {
          .dash-stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .dash-2col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
