"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const navy  = "#0B1F3A";
const red   = "#C8002A";

type Candidate = {
  id:string; name:string; name_kana:string; email:string; phone:string;
  date_of_birth:string; gender:string; skill:string; jlpt:string;
  preferred_job:string; visa_type:string; status:string;
  match_job_name:string; motivation:string; availability:string; created_at:string;
};
type Job = {
  id:string; company:string; position_ja:string; position_vn:string;
  industry:string; jlpt_min:string; salary:string; location:string;
  status:string; matchScore:number; isNew:boolean; job_description:string;
};

const STATUS_STEPS = [
  { key:"new",       ja:"書類審査中",  vn:"Đang xét hồ sơ",   color:"#378ADD" },
  { key:"interview", ja:"面接調整中",  vn:"Đang phỏng vấn",   color:"#EF9F27" },
  { key:"offered",   ja:"内定",        vn:"Đã nhận offer",    color:"#5DCAA5" },
  { key:"working",   ja:"就業中",      vn:"Đang làm việc",    color:"#27500A" },
];

export default function Mypage() {
  const router = useRouter();
  const [tab, setTab]         = useState<"jobs"|"status"|"profile">("jobs");
  const [cand, setCand]       = useState<Candidate|null>(null);
  const [jobs, setJobs]       = useState<Job[]>([]);
  const [jobFilter, setJobFilter] = useState<"all"|"new">("all");
  const [selectedJob, setSelectedJob] = useState<Job|null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/mypage/me").then(r => r.ok ? r.json() : null),
      fetch("/api/mypage/jobs").then(r => r.ok ? r.json() : null),
    ]).then(([me, j]) => {
      if (!me) { router.push("/mypage/login"); return; }
      setCand(me.data);
      setJobs(j?.jobs || []);
      setLoading(false);
    });
  }, [router]);

  const logout = async () => {
    await fetch("/api/mypage/logout", { method:"POST" });
    router.push("/mypage/login");
  };

  const newCount  = jobs.filter(j => j.isNew).length;
  const allCount  = jobs.length;
  const displayed = jobFilter === "new" ? jobs.filter(j => j.isNew) : jobs;

  const currentStep = STATUS_STEPS.findIndex(s => s.key === cand?.status);

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Noto Sans JP',sans-serif" }}>
      <div style={{ textAlign:"center", color:"#9BA0AC" }}>
        <div style={{ fontSize:"28px", marginBottom:"8px" }}>⏳</div>
        <div>読み込み中...</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#F4F5F7", fontFamily:"'Noto Sans JP','Yu Gothic UI',sans-serif" }}>

      {/* ── TOP NAVBAR ─────────────────────────────────────── */}
      <header style={{ background:"#fff", borderBottom:"1px solid #E8EAF0", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ maxWidth:"1200px", margin:"0 auto", padding:"0 24px", height:"52px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <Link href="/" style={{ display:"flex", alignItems:"center", gap:"7px", textDecoration:"none" }}>
              <div style={{ width:"28px", height:"28px", background:navy, borderRadius:"6px", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M10 2L18 7V13L10 18L2 13V7Z" stroke="white" strokeWidth="1.4"/><circle cx="10" cy="10" r="3" fill="white"/></svg>
              </div>
              <span style={{ fontWeight:800, fontSize:"14px", color:navy, letterSpacing:"0.08em" }}>ASEKA</span>
            </Link>
            <span style={{ color:"#C8D0DB", fontSize:"12px" }}>|</span>
            <span style={{ fontSize:"12px", color:"#6B6B6B" }}>Asekaキャリア · マイページ</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
            <span style={{ fontSize:"12px", color:"#6B6B6B" }}>
              ようこそ、<strong style={{ color:navy }}>{cand?.name}</strong> さん
            </span>
            <button onClick={logout}
              style={{ padding:"5px 12px", borderRadius:"6px", fontSize:"12px", color:"#6B6B6B", background:"none", border:"1px solid #E0E3E9", cursor:"pointer" }}>
              ログアウト
            </button>
          </div>
        </div>

        {/* ── RED TAB BAR ── */}
        <div style={{ background:red }}>
          <div style={{ maxWidth:"1200px", margin:"0 auto", padding:"0 24px", display:"flex" }}>
            {[
              { key:"jobs",    label:`紹介求人`, count: allCount },
              { key:"status",  label:"選考状況", count: null },
              { key:"profile", label:"プロフィール", count: null },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
                style={{ padding:"12px 24px", fontSize:"13px", fontWeight: tab===t.key ? 700 : 400, color:"#fff", background: tab===t.key ? "rgba(255,255,255,0.18)" : "transparent", border:"none", cursor:"pointer", borderBottom: tab===t.key ? "3px solid #fff" : "3px solid transparent", display:"flex", alignItems:"center", gap:"6px" }}>
                {t.label}
                {t.count !== null && t.count > 0 && (
                  <span style={{ background:"#fff", color:red, borderRadius:"20px", fontSize:"11px", fontWeight:700, padding:"1px 7px" }}>{t.count}</span>
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

          {/* ── TAB: 紹介求人 ── */}
          {tab === "jobs" && (
            <div style={{ background:"#fff", borderRadius:"10px", overflow:"hidden", boxShadow:"0 1px 6px rgba(0,0,0,0.06)" }}>
              <div style={{ padding:"18px 20px", borderBottom:"1px solid #F0F1F4" }}>
                <h2 style={{ margin:"0 0 4px", fontSize:"16px", fontWeight:700, color:navy }}>ピックアップ求人</h2>
                <p style={{ margin:0, fontSize:"11px", color:"#9BA0AC" }}>
                  あなたのスキル（{cand?.skill}）· JLPT {cand?.jlpt} に合わせたおすすめ求人
                  · Việc làm phù hợp với hồ sơ của bạn
                </p>
              </div>

              {/* Sub-tabs */}
              <div style={{ borderBottom:"1px solid #F0F1F4", display:"flex", padding:"0 20px" }}>
                {[
                  { k:"all", l:"すべて", count: allCount },
                  { k:"new", l:"新着",   count: newCount },
                ].map(t => (
                  <button key={t.k} onClick={() => setJobFilter(t.k as "all"|"new")}
                    style={{ padding:"10px 0", marginRight:"24px", fontSize:"13px", fontWeight: jobFilter===t.k ? 700 : 400, color: jobFilter===t.k ? red : "#6B6B6B", background:"none", border:"none", borderBottom: jobFilter===t.k ? `2px solid ${red}` : "2px solid transparent", cursor:"pointer", display:"flex", alignItems:"center", gap:"5px" }}>
                    {t.l}
                    <span style={{ background: jobFilter===t.k ? red : "#E8EAF0", color: jobFilter===t.k ? "#fff" : "#6B6B6B", borderRadius:"20px", fontSize:"10px", fontWeight:700, padding:"1px 6px" }}>{t.count}</span>
                  </button>
                ))}
              </div>

              {/* Job table */}
              {displayed.length === 0
                ? <div style={{ padding:"40px", textAlign:"center", color:"#9BA0AC", fontSize:"13px" }}>
                    現在該当する求人はありません。<br/>Hiện chưa có việc làm phù hợp.
                  </div>
                : <>
                  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"13px" }}>
                    <thead>
                      <tr style={{ background:"#F8F9FB" }}>
                        {["企業名","求人ポジション","業種","JLPT","給与・待遇","検討する"].map(h => (
                          <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:"11px", color:"#9BA0AC", fontWeight:600, borderBottom:"1px solid #F0F1F4", whiteSpace:"nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {displayed.map(j => (
                        <tr key={j.id} onClick={() => setSelectedJob(selectedJob?.id===j.id ? null : j)}
                          style={{ borderBottom:"1px solid #F8F9FB", cursor:"pointer", background: selectedJob?.id===j.id ? "#FFF8F8" : "transparent" }}>
                          <td style={{ padding:"13px 14px", fontWeight:600, color:navy }}>
                            <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                              {j.isNew && <span style={{ background:red, color:"#fff", fontSize:"9px", fontWeight:700, padding:"1px 5px", borderRadius:"3px" }}>NEW</span>}
                              {j.status==="urgent" && <span style={{ background:"#FAEEDA", color:"#633806", fontSize:"9px", fontWeight:700, padding:"1px 5px", borderRadius:"3px" }}>⚡急募</span>}
                              {j.company}
                            </div>
                          </td>
                          <td style={{ padding:"13px 14px", color:navy }}>
                            <div>{j.position_ja}</div>
                            {j.position_vn && <div style={{ fontSize:"10px", color:"#9BA0AC" }}>{j.position_vn}</div>}
                          </td>
                          <td style={{ padding:"13px 14px" }}>
                            <span style={{ background:"#E6F1FB", color:"#185FA5", fontSize:"10px", fontWeight:600, padding:"3px 8px", borderRadius:"4px" }}>{j.industry}</span>
                          </td>
                          <td style={{ padding:"13px 14px", textAlign:"center" }}>
                            <span style={{ fontWeight:700, color: j.jlpt_min==="N1" ? "#A32D2D" : j.jlpt_min==="N2" ? "#633806" : "#27500A" }}>{j.jlpt_min}以上</span>
                          </td>
                          <td style={{ padding:"13px 14px", color:"#444", fontSize:"12px" }}>{j.salary||"要相談"}</td>
                          <td style={{ padding:"13px 14px", textAlign:"center" }}>
                            <button onClick={e => { e.stopPropagation(); setSelectedJob(selectedJob?.id===j.id ? null : j); }}
                              style={{ background:"none", border:`1.5px solid ${selectedJob?.id===j.id ? red : "#C8D0DB"}`, borderRadius:"50%", width:"28px", height:"28px", cursor:"pointer", fontSize:"14px", color: selectedJob?.id===j.id ? red : "#C8D0DB", display:"flex", alignItems:"center", justifyContent:"center" }}>
                              {selectedJob?.id===j.id ? "♥" : "♡"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Job detail expand */}
                  {selectedJob && (
                    <div style={{ borderTop:"2px solid #FFF0F0", padding:"20px", background:"#FFFAFA" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"12px" }}>
                        <div>
                          <div style={{ fontSize:"15px", fontWeight:700, color:navy }}>{selectedJob.company}</div>
                          <div style={{ fontSize:"13px", color:"#444", marginTop:"2px" }}>{selectedJob.position_ja}</div>
                        </div>
                        <button onClick={() => setSelectedJob(null)} style={{ background:"none", border:"none", fontSize:"18px", cursor:"pointer", color:"#9BA0AC" }}>✕</button>
                      </div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px", marginBottom:"12px" }}>
                        {[
                          { l:"勤務地", v: selectedJob.location||"要相談" },
                          { l:"給与",   v: selectedJob.salary||"要相談" },
                          { l:"業種",   v: selectedJob.industry },
                          { l:"日本語", v: `${selectedJob.jlpt_min}以上` },
                        ].map(d=>(
                          <div key={d.l} style={{ background:"#fff", borderRadius:"7px", padding:"8px 12px", border:"1px solid #F0F1F4" }}>
                            <div style={{ fontSize:"10px", color:"#9BA0AC" }}>{d.l}</div>
                            <div style={{ fontSize:"12px", fontWeight:600, color:navy, marginTop:"2px" }}>{d.v}</div>
                          </div>
                        ))}
                      </div>
                      {selectedJob.job_description && (
                        <p style={{ fontSize:"12px", color:"#444", lineHeight:1.7, margin:0, background:"#fff", padding:"12px", borderRadius:"7px", border:"1px solid #F0F1F4" }}>
                          {selectedJob.job_description.slice(0, 300)}{selectedJob.job_description.length > 300 ? "..." : ""}
                        </p>
                      )}
                      <div style={{ marginTop:"14px", display:"flex", gap:"8px" }}>
                        <Link href="/#contact" style={{ padding:"9px 20px", borderRadius:"8px", background:red, color:"#fff", textDecoration:"none", fontSize:"12px", fontWeight:700 }}>
                          この求人に応募する
                        </Link>
                        <button onClick={() => setSelectedJob(null)} style={{ padding:"9px 16px", borderRadius:"8px", background:"#fff", color:"#6B6B6B", border:"1px solid #E0E3E9", fontSize:"12px", cursor:"pointer" }}>
                          閉じる
                        </button>
                      </div>
                    </div>
                  )}
                </>
              }
            </div>
          )}

          {/* ── TAB: 選考状況 ── */}
          {tab === "status" && (
            <div style={{ background:"#fff", borderRadius:"10px", overflow:"hidden", boxShadow:"0 1px 6px rgba(0,0,0,0.06)" }}>
              <div style={{ padding:"18px 20px", borderBottom:"1px solid #F0F1F4" }}>
                <h2 style={{ margin:"0 0 4px", fontSize:"16px", fontWeight:700, color:navy }}>選考状況 / Trạng thái ứng tuyển</h2>
                <p style={{ margin:0, fontSize:"11px", color:"#9BA0AC" }}>現在の選考ステージ · Giai đoạn tuyển dụng hiện tại</p>
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
                            <div style={{ fontSize:"10px", fontWeight: active ? 700 : 500, color: active ? s.color : done2 ? "#27500A" : "#9BA0AC" }}>{s.ja}</div>
                            <div style={{ fontSize:"9px", color:"#C8D0DB" }}>{s.vn}</div>
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
                    現在のステータス: <span style={{ color: STATUS_STEPS[currentStep]?.color||"#9BA0AC" }}>
                      {STATUS_STEPS[currentStep]?.ja || cand?.status || "登録済み"}
                    </span>
                  </div>
                  {cand?.match_job_name && (
                    <div style={{ fontSize:"12px", color:"#444" }}>
                      紹介先: <strong>{cand.match_job_name}</strong>
                    </div>
                  )}
                  <div style={{ fontSize:"11px", color:"#6B6B6B", marginTop:"6px" }}>
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
                <p style={{ margin:0, fontSize:"11px", color:"#9BA0AC" }}>登録情報 · Thông tin đã đăng ký</p>
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
                    <div style={{ fontSize:"10px", color:"#9BA0AC", marginBottom:"2px" }}>{d.l}</div>
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
                <div style={{ fontSize:"10px", color:"#9BA0AC" }}>{cand?.email}</div>
              </div>
            </div>
            <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
              {[cand?.skill, cand?.jlpt, cand?.visa_type].filter(Boolean).map(t=>(
                <span key={t} style={{ background:"#E6F1FB", color:"#185FA5", fontSize:"10px", fontWeight:600, padding:"3px 8px", borderRadius:"4px" }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Contact advisor */}
          <div style={{ background:"#fff", borderRadius:"10px", padding:"16px", boxShadow:"0 1px 6px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize:"12px", fontWeight:700, color:navy, marginBottom:"8px" }}>担当スタッフ / Nhân viên phụ trách</div>
            <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"10px" }}>
              <div style={{ width:"36px", height:"36px", borderRadius:"50%", background:"#FAEEDA", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px" }}>👤</div>
              <div>
                <div style={{ fontSize:"12px", fontWeight:600, color:navy }}>Aseka キャリア</div>
                <div style={{ fontSize:"10px", color:"#185FA5" }}>contact@aseka.jp</div>
              </div>
            </div>
            <Link href="/#contact"
              style={{ display:"block", textAlign:"center", padding:"8px", borderRadius:"7px", background:navy, color:"#fff", textDecoration:"none", fontSize:"11px", fontWeight:600 }}>
              📩 相談する / Liên hệ
            </Link>
          </div>

          {/* LINE banner */}
          <div style={{ background:"linear-gradient(135deg,#06C755,#05A648)", borderRadius:"10px", padding:"16px", color:"#fff", boxShadow:"0 1px 6px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize:"18px", marginBottom:"4px" }}>💬 LINE</div>
            <div style={{ fontSize:"12px", fontWeight:700, marginBottom:"4px" }}>LINEで手軽に相談</div>
            <div style={{ fontSize:"10px", opacity:0.85, marginBottom:"10px" }}>Nhắn tin qua LINE dễ dàng hơn</div>
            <div style={{ background:"rgba(255,255,255,0.2)", borderRadius:"7px", padding:"8px", textAlign:"center", fontSize:"11px", fontWeight:600 }}>
              @ aseka_career
            </div>
          </div>

          {/* Register new */}
          <div style={{ background:"#fff", borderRadius:"10px", padding:"14px", boxShadow:"0 1px 6px rgba(0,0,0,0.06)", textAlign:"center" }}>
            <div style={{ fontSize:"11px", color:"#9BA0AC", marginBottom:"8px" }}>知人・友人の紹介 · Giới thiệu bạn bè</div>
            <Link href="/dang-ky"
              style={{ display:"inline-block", padding:"8px 16px", borderRadius:"7px", background:"#FAEEDA", color:"#633806", textDecoration:"none", fontSize:"11px", fontWeight:700 }}>
              🎁 新規登録はこちら
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
