"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import type { Job } from "../../page";

const navy = "#0B1F3A";
const red  = "#C8002A";
const MAIN_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dev.aseka.co.jp";
const READ_KEY_PREFIX = "aseka_mypage_read_jobs_";

type Candidate = { id:string; match_job_id:string|null; match_job_name:string };

/* Same fields, order, and labels as Admin's 求人概要 tab (src/app/admin/jobs/page.tsx
   FIELDS) and the DB's job_listings columns — grouped into the same section headings the
   reference rirekisho-style job page uses, so a candidate reads exactly what admin set,
   nothing re-worded or re-derived along the way. reference_url is intentionally excluded:
   that's admin's internal sourcing note, never shown to a candidate. */
const SECTIONS: { title:string; rows: { label:string; key:keyof Job; fallbackKey?:keyof Job }[] }[] = [
  { title:"雇用条件", rows:[
    { label:"雇用形態", key:"employment_type" },
    { label:"試用期間", key:"trial_period" },
  ]},
  { title:"職務内容", rows:[
    { label:"職務内容", key:"job_description" },
  ]},
  { title:"勤務地", rows:[
    { label:"勤務地", key:"work_location", fallbackKey:"location" },
    { label:"就業環境備考", key:"work_environment" },
  ]},
  { title:"要件", rows:[
    { label:"応募要件", key:"requirements" },
    { label:"資格", key:"qualifications" },
  ]},
  { title:"語学", rows:[
    { label:"語学力", key:"language_skills" },
  ]},
  { title:"学歴", rows:[
    { label:"学歴", key:"education_req" },
  ]},
  { title:"選考内容", rows:[
    { label:"選考内容", key:"selection_process" },
  ]},
  { title:"各種待遇", rows:[
    { label:"年収", key:"annual_income", fallbackKey:"salary" },
    { label:"給与形態", key:"salary_type" },
    { label:"賃金備考", key:"salary_note" },
    { label:"勤務時間", key:"work_hours" },
    { label:"休日・休暇", key:"holidays" },
    { label:"各種保険", key:"insurance" },
  ]},
  { title:"その他", rows:[
    { label:"備考", key:"remarks" },
  ]},
];

export default function MypageJobDetail() {
  const router = useRouter();
  const params = useParams();
  const jobId = String(params?.id || "");

  const [cand, setCand] = useState<Candidate|null>(null);
  const [job, setJob] = useState<Job|null>(null);
  const [notFound, setNotFound] = useState(false);
  const [detailTab, setDetailTab] = useState<"overview"|"company">("overview");
  const [loading, setLoading] = useState(true);
  const [favBusy, setFavBusy] = useState(false);
  const [applyBusy, setApplyBusy] = useState(false);
  const [applyMsg, setApplyMsg] = useState<{ type:"ok"|"err"; text:string }|null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/mypage/me").then(r => r.ok ? r.json() : null),
      fetch("/api/mypage/jobs").then(r => r.ok ? r.json() : null),
    ]).then(([me, j]) => {
      if (!me) { router.push("/mypage/login"); return; }
      setCand(me.data);
      const found = (j?.jobs || []).find((x: Job) => x.id === jobId) || null;
      if (!found) { setNotFound(true); setLoading(false); return; }
      setJob(found);
      setLoading(false);
      // Mark read — this page IS the "open it" action 未読 tracks against.
      try {
        const key = READ_KEY_PREFIX + me.data.id;
        const raw = localStorage.getItem(key);
        const ids = new Set<string>(raw ? JSON.parse(raw) : []);
        ids.add(jobId);
        localStorage.setItem(key, JSON.stringify(Array.from(ids)));
      } catch { /* non-fatal — read-state just resets */ }
    });
  }, [router, jobId]);

  const toggleFavorite = async () => {
    if (!job) return;
    setFavBusy(true);
    try {
      const res = await fetch("/api/mypage/favorites", {
        method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ jobId: job.id }),
      });
      const data = await res.json();
      if (res.ok) setJob(prev => prev ? { ...prev, isFavorite: data.favorited } : prev);
    } finally { setFavBusy(false); }
  };

  const applyToJob = async () => {
    if (!job) return;
    if (cand?.match_job_id && cand.match_job_id !== job.id) {
      const ok = window.confirm(
        `現在「${cand.match_job_name}」に応募中です。「${job.company}」に切り替えますか？\n` +
        `Bạn đang ứng tuyển "${cand.match_job_name}". Chuyển sang "${job.company}"?`
      );
      if (!ok) return;
    }
    setApplyBusy(true); setApplyMsg(null);
    try {
      const res = await fetch("/api/mypage/apply", {
        method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ jobId: job.id }),
      });
      const data = await res.json();
      if (!res.ok) { setApplyMsg({ type:"err", text: data.error || "エラーが発生しました" }); return; }
      setJob(prev => prev ? { ...prev, isApplied: true } : prev);
      setCand(prev => prev ? { ...prev, match_job_id: job.id, match_job_name: data.company } : prev);
      setApplyMsg({ type:"ok", text:`「${data.company}」に応募しました / Đã ứng tuyển "${data.company}"` });
    } finally { setApplyBusy(false); }
  };

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Noto Sans JP',sans-serif" }}>
      <div style={{ textAlign:"center", color:"#64748B" }}>
        <div style={{ fontSize:"28px", marginBottom:"8px" }}>⏳</div>
        <div>読み込み中...</div>
      </div>
    </div>
  );

  if (notFound || !job) return (
    <div style={{ minHeight:"100vh", background:"#F4F5F7", fontFamily:"'Noto Sans JP',sans-serif", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:"14px", color:navy, fontWeight:700, marginBottom:"10px" }}>この求人は見つかりませんでした / Không tìm thấy việc làm này</div>
        <Link href="/mypage" style={{ fontSize:"13px", color:red }}>← 求人一覧に戻る</Link>
      </div>
    </div>
  );

  const v = (key: keyof Job, fallbackKey?: keyof Job) => (job[key] as string) || (fallbackKey ? (job[fallbackKey] as string) : "") || "";

  return (
    <div style={{ minHeight:"100vh", background:"#F4F5F7", fontFamily:"'Noto Sans JP','Yu Gothic UI',sans-serif" }}>

      {/* ── TOP NAVBAR (same as list page) ── */}
      <header style={{ background:"#fff", borderBottom:"1px solid #E8EAF0", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ maxWidth:"1000px", margin:"0 auto", padding:"0 24px", height:"52px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <Link href={MAIN_SITE_URL} style={{ display:"flex", alignItems:"center", gap:"7px", textDecoration:"none" }}>
            <div style={{ width:"28px", height:"28px", background:"#fff", borderRadius:"7px", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, overflow:"hidden", border:"1px solid rgba(11,31,58,0.08)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/aseka-logo-icon.png" alt="ASEKA" style={{ width:"22px", height:"22px", objectFit:"contain", display:"block" }} />
            </div>
            <span style={{ fontWeight:800, fontSize:"14px", color:navy, letterSpacing:"0.08em" }}>ASEKA</span>
          </Link>
          <Link href="/mypage" style={{ fontSize:"12px", color:"#52525B", textDecoration:"none", border:"1px solid #E0E3E9", borderRadius:"6px", padding:"5px 12px" }}>
            ← 求人一覧に戻る
          </Link>
        </div>
      </header>

      <div style={{ maxWidth:"1000px", margin:"0 auto", padding:"24px" }}>

        {/* ── Job header card ── */}
        <div style={{ background:"#fff", borderRadius:"10px", boxShadow:"0 1px 6px rgba(0,0,0,0.06)", overflow:"hidden", marginBottom:"16px" }}>
          <div style={{ padding:"22px 24px 18px" }}>
            <div style={{ fontSize:"11px", color:"#64748B", marginBottom:"6px" }}>求人ID: {job.id.slice(0,8).toUpperCase()}</div>
            <div style={{ fontSize:"19px", fontWeight:700, color:navy, marginBottom:"4px" }}>{job.company}</div>
            <div style={{ fontSize:"15px", color:"#333", marginBottom:"12px" }}>{job.position_name || job.position_ja}</div>
            {job.position_vn && <div style={{ fontSize:"12px", color:"#64748B", marginTop:"-8px", marginBottom:"12px" }}>{job.position_vn}</div>}
            <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
              <span style={{ background:"#E6F1FB", color:"#185FA5", fontSize:"11px", fontWeight:600, padding:"3px 9px", borderRadius:"4px" }}>{job.industry}</span>
              <span style={{ fontSize:"11px", fontWeight:700, padding:"3px 9px", borderRadius:"4px", background:"#F6F7F9", color: job.jlpt_min==="N1" ? "#A32D2D" : job.jlpt_min==="N2" ? "#633806" : "#27500A" }}>{job.jlpt_min}以上</span>
              {job.employment_type && <span style={{ background:"#F1EFE8", color:"#444441", fontSize:"11px", fontWeight:600, padding:"3px 9px", borderRadius:"4px" }}>{job.employment_type}</span>}
              {job.count && <span style={{ background:"#F1EFE8", color:"#444441", fontSize:"11px", fontWeight:600, padding:"3px 9px", borderRadius:"4px" }}>採用{job.count}名</span>}
              {job.status==="urgent" && <span style={{ background:"#FAEEDA", color:"#633806", fontSize:"11px", fontWeight:700, padding:"3px 9px", borderRadius:"4px" }}>⚡急募</span>}
              {job.isNew && <span style={{ background:red, color:"#fff", fontSize:"11px", fontWeight:700, padding:"3px 9px", borderRadius:"4px" }}>NEW</span>}
              {job.isApplied && <span style={{ background:"#27500A", color:"#fff", fontSize:"11px", fontWeight:700, padding:"3px 9px", borderRadius:"4px" }}>✓ 応募済み</span>}
            </div>
          </div>

          {/* Tabs: 求人概要 / 企業情報 */}
          <div style={{ display:"flex", borderTop:"1px solid #F0F1F4", padding:"0 24px" }}>
            {[
              { k:"overview", l:"求人概要" },
              { k:"company",  l:"企業情報" },
            ].map(t => (
              <button key={t.k} onClick={() => setDetailTab(t.k as "overview"|"company")}
                style={{ padding:"12px 0", marginRight:"28px", fontSize:"13px", fontWeight: detailTab===t.k ? 700 : 400, color: detailTab===t.k ? red : "#52525B", background:"none", border:"none", borderBottom: detailTab===t.k ? `2px solid ${red}` : "2px solid transparent", cursor:"pointer" }}>
                {t.l}
              </button>
            ))}
          </div>
        </div>

        {detailTab === "overview" ? (
          <>
            {job.osusume_point && (
              <div style={{ marginBottom:"16px", background:"#FFFBEB", borderRadius:"10px", padding:"14px 18px", fontSize:"13px", color:"#92400E", borderLeft:"4px solid #F59E0B", lineHeight:1.8, boxShadow:"0 1px 6px rgba(0,0,0,0.06)" }}>
                <div style={{ fontWeight:700, marginBottom:"4px" }}>⭐ おすすめポイント</div>
                {job.osusume_point}
              </div>
            )}

            {SECTIONS.map(section => {
              const rows = section.rows.filter(r => v(r.key, r.fallbackKey));
              if (!rows.length) return null;
              return (
                <div key={section.title} style={{ background:"#fff", borderRadius:"10px", boxShadow:"0 1px 6px rgba(0,0,0,0.06)", overflow:"hidden", marginBottom:"14px" }}>
                  <div style={{ background:navy, color:"#fff", fontSize:"12px", fontWeight:700, padding:"8px 18px" }}>{section.title}</div>
                  {rows.map((r, i) => (
                    <div key={r.key} style={{ display:"grid", gridTemplateColumns:"140px 1fr", borderBottom: i<rows.length-1 ? "1px solid #F0F1F4" : "none" }}>
                      <div style={{ padding:"12px 18px", background:"#F8F9FB", fontSize:"11px", fontWeight:700, color:navy, borderRight:"1px solid #F0F1F4" }}>{r.label}</div>
                      <div style={{ padding:"12px 18px", fontSize:"13px", color:"#333", lineHeight:1.8, whiteSpace:"pre-wrap" }}>{v(r.key, r.fallbackKey)}</div>
                    </div>
                  ))}
                </div>
              );
            })}

            {applyMsg && (
              <div style={{ marginBottom:"14px", fontSize:"12px", padding:"10px 14px", borderRadius:"8px", background: applyMsg.type==="ok" ? "#EAF3DE" : "#FCEBEB", color: applyMsg.type==="ok" ? "#27500A" : "#C8002A" }}>
                {applyMsg.type==="ok" ? "✓ " : "⚠️ "}{applyMsg.text}
              </div>
            )}

            {/* ── Actions ── */}
            <div style={{ background:"#fff", borderRadius:"10px", boxShadow:"0 1px 6px rgba(0,0,0,0.06)", padding:"18px", display:"flex", gap:"10px", flexWrap:"wrap", justifyContent:"center" }}>
              <button onClick={applyToJob} disabled={applyBusy || job.isApplied}
                style={{ padding:"12px 32px", borderRadius:"8px", background: job.isApplied ? "#EAF3DE" : red, color: job.isApplied ? "#27500A" : "#fff", border:"none", fontSize:"13px", fontWeight:700, cursor: (applyBusy || job.isApplied) ? "default" : "pointer", opacity: applyBusy ? 0.6 : 1 }}>
                {job.isApplied ? "✓ 応募済み" : applyBusy ? "送信中..." : "応募する"}
              </button>
              <button onClick={toggleFavorite} disabled={favBusy}
                style={{ padding:"12px 20px", borderRadius:"8px", background:"#fff", color: job.isFavorite ? red : "#52525B", border:`1.5px solid ${job.isFavorite ? red : "#E0E3E9"}`, fontSize:"13px", fontWeight:600, cursor: favBusy ? "not-allowed" : "pointer", display:"flex", alignItems:"center", gap:"6px" }}>
                {job.isFavorite ? "♥" : "♡"} {job.isFavorite ? "検討中に追加済み" : "検討する"}
              </button>
              <Link href="/mypage"
                style={{ padding:"12px 20px", borderRadius:"8px", background:"#fff", color:"#52525B", border:"1.5px solid #E0E3E9", fontSize:"13px", fontWeight:600, textDecoration:"none", display:"flex", alignItems:"center" }}>
                求人一覧に戻る
              </Link>
            </div>
          </>
        ) : (
          /* ── 企業情報 tab — only what we actually know about the company from this
             listing; no fabricated company profile (headcount, founding year, etc. aren't
             in job_listings, so they're simply not shown rather than invented). ── */
          <div style={{ background:"#fff", borderRadius:"10px", boxShadow:"0 1px 6px rgba(0,0,0,0.06)", overflow:"hidden" }}>
            <div style={{ background:navy, color:"#fff", fontSize:"12px", fontWeight:700, padding:"8px 18px" }}>企業情報</div>
            {[
              { l:"企業名", v: job.company },
              { l:"業種", v: job.industry },
              { l:"勤務地", v: job.work_location || job.location || "—" },
            ].map((r,i,arr) => (
              <div key={r.l} style={{ display:"grid", gridTemplateColumns:"140px 1fr", borderBottom: i<arr.length-1 ? "1px solid #F0F1F4" : "none" }}>
                <div style={{ padding:"12px 18px", background:"#F8F9FB", fontSize:"11px", fontWeight:700, color:navy, borderRight:"1px solid #F0F1F4" }}>{r.l}</div>
                <div style={{ padding:"12px 18px", fontSize:"13px", color:"#333" }}>{r.v}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
