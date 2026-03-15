"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type Job = {
  id: string; company: string; location: string;
  position_ja: string; position_vn: string; industry: string;
  count: number; salary: string; jlpt_min: string; status: string;
  // 求人概要
  osusume_point: string; position_name: string; position_note: string;
  job_description: string; requirements: string; qualifications: string;
  language_skill: string; education: string; work_location: string;
  selection_process: string; work_environment: string; annual_income: string;
  salary_type: string; salary_note: string; employment_type: string;
  work_hours: string; trial_period: string; insurance: string;
  holidays: string; remarks: string; reference_url: string;
  created_at: string;
};

type MatchResult = {
  candidateId: string; candidateName: string; matchPct: number;
  reasonJa: string; reasonVn: string; strengths: string[];
  candidate: { id:string;name:string;skill:string;jlpt:string;status:string;email:string;phone:string };
};

const ST: Record<string,{ja:string;vn:string;tc:string;tb:string}> = {
  urgent:{ja:"緊急募集",vn:"Khẩn cấp",tc:"#A32D2D",tb:"#FCEBEB"},
  open:  {ja:"募集中",  vn:"Đang tuyển",tc:"#0C447C",tb:"#E6F1FB"},
  full:  {ja:"充足",    vn:"Đủ người",  tc:"#27500A",tb:"#EAF3DE"},
  paused:{ja:"停止",    vn:"Tạm dừng",  tc:"#444441",tb:"#F1EFE8"},
};
const IND: Record<string,{tc:string;tb:string;icon:string}> = {
  "飲食":  {tc:"#0C447C",tb:"#E6F1FB",icon:"🍽️"},
  "製造":  {tc:"#27500A",tb:"#EAF3DE",icon:"🏭"},
  "農業":  {tc:"#633806",tb:"#FAEEDA",icon:"🌾"},
  "ホテル":{tc:"#534AB7",tb:"#EEEDFE",icon:"🏨"},
};

const FIELDS = [
  {key:"osusume_point",   ja:"おすすめポイント",    vn:"Điểm nổi bật",      rows:3},
  {key:"position_name",   ja:"ポジション名",        vn:"Tên vị trí",         rows:1},
  {key:"position_note",   ja:"ポジション備考",      vn:"Ghi chú vị trí",     rows:2},
  {key:"job_description", ja:"職務内容",             vn:"Nội dung công việc", rows:4},
  {key:"requirements",    ja:"応募要件",             vn:"Yêu cầu ứng tuyển", rows:3},
  {key:"qualifications",  ja:"資格",                 vn:"Bằng cấp/Chứng chỉ",rows:2},
  {key:"language_skill",  ja:"語学力",               vn:"Ngôn ngữ yêu cầu",  rows:1},
  {key:"education",       ja:"学歴",                 vn:"Học vấn",            rows:1},
  {key:"work_location",   ja:"勤務地",               vn:"Địa điểm làm việc", rows:1},
  {key:"selection_process",ja:"選考内容",            vn:"Quy trình tuyển dụng",rows:2},
  {key:"work_environment",ja:"就業環境備考",         vn:"Môi trường làm việc",rows:2},
  {key:"annual_income",   ja:"年収",                 vn:"Thu nhập năm",       rows:1},
  {key:"salary_type",     ja:"給与形態",             vn:"Hình thức trả lương",rows:1},
  {key:"salary_note",     ja:"賃金備考",             vn:"Ghi chú lương",      rows:2},
  {key:"employment_type", ja:"雇用形態",             vn:"Hình thức hợp đồng",rows:1},
  {key:"work_hours",      ja:"勤務時間",             vn:"Giờ làm việc",       rows:1},
  {key:"trial_period",    ja:"試用期間",             vn:"Thời gian thử việc", rows:1},
  {key:"insurance",       ja:"各種保険",             vn:"Bảo hiểm",           rows:1},
  {key:"holidays",        ja:"休日・休暇",           vn:"Ngày nghỉ",          rows:2},
  {key:"remarks",         ja:"備考",                 vn:"Ghi chú khác",       rows:2},
  {key:"reference_url",   ja:"参考URL",              vn:"Link tham khảo",     rows:1},
];

const EMPTY_JOB = {
  company:"",location:"",position_ja:"",position_vn:"",industry:"飲食",
  count:"1",salary:"",jlpt_min:"N4",status:"open",
  osusume_point:"",position_name:"",position_note:"",job_description:"",
  requirements:"",qualifications:"",language_skill:"",education:"",
  work_location:"",selection_process:"",work_environment:"",annual_income:"",
  salary_type:"月給",salary_note:"",employment_type:"正社員",work_hours:"",
  trial_period:"3ヶ月",insurance:"健康保険・厚生年金・雇用保険・労災保険",
  holidays:"",remarks:"",reference_url:"",
};

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Job|null>(null);
  const [view, setView] = useState<"list"|"detail"|"form">("list");
  const [form, setForm] = useState<Record<string,string>>(EMPTY_JOB);
  const [saving, setSaving] = useState(false);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [matching, setMatching] = useState(false);
  const [activeTab, setActiveTab] = useState<"info"|"match">("info");
  const B = {border:"0.5px solid rgba(11,31,58,0.1)"};
  const navy = "#0B1F3A";

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/jobs");
    if (res.status===401){router.push("/admin/login");return;}
    const d = await res.json();
    setJobs(d.data||[]);
    setLoading(false);
  },[router]);

  useEffect(()=>{load();},[load]);

  const filtered = filter==="all" ? jobs : jobs.filter(j=>j.status===filter);
  const counts = {
    all:jobs.length,
    urgent:jobs.filter(j=>j.status==="urgent").length,
    open:jobs.filter(j=>j.status==="open").length,
    full:jobs.filter(j=>j.status==="full").length,
    paused:jobs.filter(j=>j.status==="paused").length,
  };

  const openDetail = async (job: Job) => {
    setSelected(job);
    setMatches([]);
    setActiveTab("info");
    setView("detail");
  };

  const openForm = (job?: Job) => {
    if (job) {
      const f: Record<string,string> = {};
      Object.keys(EMPTY_JOB).forEach(k => { f[k] = String((job as Record<string,unknown>)[k] || ""); });
      setForm(f);
    } else {
      setForm(EMPTY_JOB);
    }
    setView("form");
  };

  const saveJob = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const isEdit = form.id !== undefined && form.id !== "";
    const res = await fetch("/api/admin/jobs", {
      method: isEdit ? "PATCH" : "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({...form, count: Number(form.count)||1}),
    });
    if (res.ok) { await load(); setView("list"); }
    setSaving(false);
  };

  const updateStatus = async (id:string, status:string) => {
    await fetch("/api/admin/jobs",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,status})});
    setJobs(p=>p.map(j=>j.id===id?{...j,status}:j));
    if (selected?.id===id) setSelected(p=>p?{...p,status}:p);
  };

  const deleteJob = async (id:string) => {
    if (!confirm("削除しますか？")) return;
    await fetch(`/api/admin/jobs?id=${id}`,{method:"DELETE"});
    setJobs(p=>p.filter(j=>j.id!==id));
    setView("list");
  };

  const runMatch = async () => {
    if (!selected) return;
    setMatching(true); setMatches([]); setActiveTab("match");
    try {
      const res = await fetch("/api/admin/match-candidates",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({job:selected}),
      });
      const d = await res.json();
      setMatches(d.matches||[]);
    } catch { setMatches([]); }
    setMatching(false);
  };

  // ── LIST VIEW ──────────────────────────────────────
  if (view==="list") return (
    <div>
      <div style={{background:"#fff",...B,borderTop:"none",borderLeft:"none",borderRight:"none",padding:"0 20px",height:"52px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:"14px",fontWeight:700,color:navy}}>求人管理 / Quản lý Công việc</div>
          <div style={{fontSize:"10px",color:"#6B6B6B"}}>クリックで求人詳細・Geminiマッチング</div>
        </div>
        <button onClick={()=>openForm()} style={{padding:"7px 14px",borderRadius:"6px",fontSize:"12px",fontWeight:600,background:navy,color:"#fff",border:"none",cursor:"pointer"}}>
          + 求人追加
        </button>
      </div>
      <div style={{padding:"16px 20px"}}>
        <div style={{display:"flex",gap:0,borderBottom:"0.5px solid rgba(11,31,58,0.1)",marginBottom:"14px"}}>
          {[{k:"all",l:`全件(${counts.all})`},{k:"urgent",l:`緊急(${counts.urgent})`},{k:"open",l:`募集中(${counts.open})`},{k:"full",l:`充足(${counts.full})`},{k:"paused",l:`停止(${counts.paused})`}].map(t=>(
            <button key={t.k} onClick={()=>setFilter(t.k)} style={{padding:"8px 14px",fontSize:"11px",fontWeight:filter===t.k?700:400,color:filter===t.k?navy:"#6B6B6B",border:"none",background:"transparent",borderBottom:`2px solid ${filter===t.k?navy:"transparent"}`,cursor:"pointer",marginBottom:"-0.5px",whiteSpace:"nowrap"}}>{t.l}</button>
          ))}
        </div>

        {loading ? <div style={{padding:"40px",textAlign:"center",color:"#6B6B6B"}}>読み込み中...</div> :
        filtered.length===0 ? (
          <div style={{padding:"48px",textAlign:"center",background:"#fff",...B,borderRadius:"10px"}}>
            <div style={{fontSize:"32px",marginBottom:"12px"}}>📋</div>
            <div style={{fontSize:"14px",fontWeight:700,color:navy,marginBottom:"6px"}}>求人なし / Chưa có công việc</div>
            <button onClick={()=>openForm()} style={{marginTop:"12px",padding:"8px 20px",borderRadius:"7px",fontSize:"12px",fontWeight:700,background:navy,color:"#fff",border:"none",cursor:"pointer"}}>+ 求人を追加する</button>
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:"12px"}}>
            {filtered.map(j=>{
              const st=ST[j.status]||ST.open;
              const ind=IND[j.industry]||IND["飲食"];
              return(
                <div key={j.id} onClick={()=>openDetail(j)} style={{background:"#fff",...B,borderRadius:"12px",padding:"16px",cursor:"pointer",transition:"all 0.15s",boxShadow:"0 1px 3px rgba(11,31,58,0.06)"}}
                  onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.boxShadow="0 4px 12px rgba(11,31,58,0.12)";(e.currentTarget as HTMLDivElement).style.transform="translateY(-1px)";}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.boxShadow="0 1px 3px rgba(11,31,58,0.06)";(e.currentTarget as HTMLDivElement).style.transform="translateY(0)";}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"10px"}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:"13px",fontWeight:700,color:navy,marginBottom:"2px"}}>{j.company}</div>
                      <div style={{fontSize:"10px",color:"#6B6B6B"}}>{j.location}</div>
                    </div>
                    <span style={{background:st.tb,color:st.tc,fontSize:"10px",fontWeight:700,padding:"3px 8px",borderRadius:"20px",flexShrink:0,marginLeft:"8px"}}>{st.ja}</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"10px"}}>
                    <span style={{fontSize:"16px"}}>{ind.icon}</span>
                    <div>
                      <div style={{fontSize:"12px",fontWeight:600,color:navy}}>{j.position_ja}</div>
                      <div style={{fontSize:"10px",color:"#6B6B6B"}}>{j.position_vn}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"10px"}}>
                    <span style={{background:ind.tb,color:ind.tc,fontSize:"10px",fontWeight:700,padding:"2px 7px",borderRadius:"4px"}}>{j.industry}</span>
                    <span style={{background:"#EAF3DE",color:"#27500A",fontSize:"10px",fontWeight:700,padding:"2px 7px",borderRadius:"4px"}}>{j.jlpt_min}以上</span>
                    <span style={{background:"#F6F7F9",color:"#6B6B6B",fontSize:"10px",padding:"2px 7px",borderRadius:"4px"}}>{j.count}名募集</span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:"10px",borderTop:"0.5px solid rgba(11,31,58,0.08)"}}>
                    <span style={{fontSize:"12px",fontWeight:700,color:"#27500A"}}>{j.salary||j.annual_income||"応相談"}</span>
                    <span style={{fontSize:"10px",color:"#185FA5",fontWeight:600}}>詳細を見る →</span>
                  </div>
                  {j.osusume_point && (
                    <div style={{marginTop:"8px",background:"#FFFBEB",borderRadius:"6px",padding:"6px 10px",fontSize:"10px",color:"#92400E",borderLeft:"3px solid #F59E0B"}}>
                      ⭐ {j.osusume_point.slice(0,60)}{j.osusume_point.length>60?"...":""}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // ── DETAIL VIEW ────────────────────────────────────
  if (view==="detail" && selected) {
    const st=ST[selected.status]||ST.open;
    const ind=IND[selected.industry]||IND["飲食"];
    return (
      <div>
        <div style={{background:"#fff",...B,borderTop:"none",borderLeft:"none",borderRight:"none",padding:"0 20px",height:"52px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
            <button onClick={()=>setView("list")} style={{background:"none",border:"none",cursor:"pointer",color:"#6B6B6B",display:"flex",alignItems:"center",gap:"4px",fontSize:"12px"}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              一覧へ
            </button>
            <div style={{width:"1px",height:"20px",background:"rgba(11,31,58,0.1)"}}/>
            <div>
              <div style={{fontSize:"14px",fontWeight:700,color:navy}}>{selected.company}</div>
              <div style={{fontSize:"10px",color:"#6B6B6B"}}>{selected.position_ja}</div>
            </div>
          </div>
          <div style={{display:"flex",gap:"8px"}}>
            <button onClick={runMatch} disabled={matching} style={{padding:"7px 14px",borderRadius:"6px",fontSize:"12px",fontWeight:700,background:matching?"#888":"#C8002A",color:"#fff",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:"5px"}}>
              {matching?<>⏳ マッチング中...</>:<><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>AI候補者マッチング</>}
            </button>
            <button onClick={()=>openForm(selected)} style={{padding:"7px 14px",borderRadius:"6px",fontSize:"12px",fontWeight:600,background:"transparent",color:navy,border:`0.5px solid ${navy}`,cursor:"pointer"}}>✏️ 編集</button>
            <button onClick={()=>deleteJob(selected.id)} style={{padding:"7px 12px",borderRadius:"6px",fontSize:"12px",fontWeight:600,background:"#FCEBEB",color:"#A32D2D",border:"0.5px solid #F09595",cursor:"pointer"}}>削除</button>
          </div>
        </div>

        <div style={{padding:"16px 20px",display:"grid",gridTemplateColumns:"1fr 380px",gap:"16px",maxWidth:"1200px"}}>
          {/* Left: 求人概要 */}
          <div>
            {/* Header card */}
            <div style={{background:"#fff",...B,borderRadius:"12px",padding:"20px",marginBottom:"12px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"14px"}}>
                <div>
                  <div style={{fontSize:"20px",fontWeight:700,color:navy,marginBottom:"4px"}}>{selected.company}</div>
                  <div style={{fontSize:"12px",color:"#6B6B6B",display:"flex",alignItems:"center",gap:"8px"}}>
                    <span>📍 {selected.work_location||selected.location}</span>
                    <span>·</span>
                    <span>👥 {selected.count}名募集</span>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{background:st.tb,color:st.tc,fontSize:"11px",fontWeight:700,padding:"4px 10px",borderRadius:"20px",marginBottom:"6px"}}>{st.ja} · {st.vn}</div>
                  <select value={selected.status} onChange={e=>updateStatus(selected.id,e.target.value)} style={{padding:"4px 8px",borderRadius:"5px",fontSize:"10px",border:"0.5px solid rgba(11,31,58,0.2)",background:"transparent",cursor:"pointer",outline:"none"}}>
                    {Object.entries(ST).map(([k,v])=><option key={k} value={k}>{v.ja}</option>)}
                  </select>
                </div>
              </div>
              <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
                <span style={{background:ind.tb,color:ind.tc,fontSize:"11px",fontWeight:700,padding:"3px 10px",borderRadius:"20px"}}>{ind.icon} {selected.industry}</span>
                <span style={{background:"#EAF3DE",color:"#27500A",fontSize:"11px",fontWeight:700,padding:"3px 10px",borderRadius:"20px"}}>{selected.jlpt_min}以上</span>
                <span style={{background:"#E6F1FB",color:"#0C447C",fontSize:"11px",fontWeight:700,padding:"3px 10px",borderRadius:"20px"}}>{selected.employment_type||"正社員"}</span>
                <span style={{background:"#F6F7F9",color:"#444",fontSize:"11px",padding:"3px 10px",borderRadius:"20px"}}>{selected.salary||selected.annual_income}</span>
              </div>
              {selected.osusume_point&&(
                <div style={{marginTop:"12px",background:"#FFFBEB",borderRadius:"8px",padding:"10px 14px",fontSize:"12px",color:"#92400E",borderLeft:"3px solid #F59E0B",lineHeight:1.7}}>
                  <div style={{fontWeight:700,marginBottom:"4px"}}>⭐ おすすめポイント</div>
                  {selected.osusume_point}
                </div>
              )}
            </div>

            {/* Tabs */}
            <div style={{display:"flex",gap:0,borderBottom:"0.5px solid rgba(11,31,58,0.1)",marginBottom:"12px",background:"#fff",borderRadius:"10px 10px 0 0",overflow:"hidden",...B,borderBottom:"none"}}>
              {[{k:"info",l:"求人概要"},{k:"match",l:`AIマッチング${matches.length>0?` (${matches.length}名)`:""}`}].map(t=>(
                <button key={t.k} onClick={()=>setActiveTab(t.k as "info"|"match")} style={{flex:1,padding:"12px",fontSize:"12px",fontWeight:activeTab===t.k?700:400,color:activeTab===t.k?navy:"#6B6B6B",border:"none",background:activeTab===t.k?"#fff":"#F6F7F9",borderBottom:`2px solid ${activeTab===t.k?navy:"transparent"}`,cursor:"pointer"}}>
                  {t.l}
                </button>
              ))}
            </div>

            {activeTab==="info"&&(
              <div style={{background:"#fff",...B,borderRadius:"0 0 12px 12px",overflow:"hidden"}}>
                {FIELDS.filter(f=>f.key!=="osusume_point").map((field,i)=>{
                  const val = (selected as Record<string,unknown>)[field.key] as string;
                  if(!val) return null;
                  return(
                    <div key={field.key} style={{display:"grid",gridTemplateColumns:"160px 1fr",borderBottom:"0.5px solid rgba(11,31,58,0.06)",background:i%2===0?"#fff":"#FAFAFA"}}>
                      <div style={{padding:"12px 14px",background:"#F6F7F9",borderRight:"0.5px solid rgba(11,31,58,0.08)"}}>
                        <div style={{fontSize:"11px",fontWeight:700,color:navy}}>{field.ja}</div>
                        <div style={{fontSize:"10px",color:"#6B6B6B"}}>{field.vn}</div>
                      </div>
                      <div style={{padding:"12px 14px",fontSize:"12px",color:"#333",lineHeight:1.7,whiteSpace:"pre-wrap"}}>{val}</div>
                    </div>
                  );
                })}
                {!FIELDS.some(f=>f.key!=="osusume_point"&&(selected as Record<string,unknown>)[f.key])&&(
                  <div style={{padding:"32px",textAlign:"center",color:"#6B6B6B",fontSize:"13px"}}>
                    求人概要が未入力です。「編集」ボタンから詳細を入力してください。
                    <br/><button onClick={()=>openForm(selected)} style={{marginTop:"12px",padding:"8px 16px",borderRadius:"7px",fontSize:"12px",fontWeight:600,background:navy,color:"#fff",border:"none",cursor:"pointer"}}>✏️ 今すぐ入力する</button>
                  </div>
                )}
              </div>
            )}

            {activeTab==="match"&&(
              <div style={{background:"#fff",...B,borderRadius:"0 0 12px 12px",padding:"16px"}}>
                {matching&&(
                  <div style={{textAlign:"center",padding:"32px",color:"#6B6B6B"}}>
                    <div style={{fontSize:"24px",marginBottom:"12px"}}>🤖</div>
                    <div style={{fontSize:"13px",fontWeight:600,color:navy}}>Gemini AIが候補者を分析中...</div>
                    <div style={{fontSize:"11px",color:"#6B6B6B",marginTop:"4px"}}>全候補者との適合度を計算しています</div>
                  </div>
                )}
                {!matching&&matches.length===0&&(
                  <div style={{textAlign:"center",padding:"32px"}}>
                    <div style={{fontSize:"24px",marginBottom:"12px"}}>🎯</div>
                    <div style={{fontSize:"13px",fontWeight:600,color:navy,marginBottom:"6px"}}>AIマッチングを実行してください</div>
                    <div style={{fontSize:"11px",color:"#6B6B6B",marginBottom:"16px"}}>求人内容をもとにGemini AIが最適な候補者を提案します</div>
                    <button onClick={runMatch} style={{padding:"9px 20px",borderRadius:"8px",fontSize:"12px",fontWeight:700,background:"#C8002A",color:"#fff",border:"none",cursor:"pointer"}}>AIマッチング開始</button>
                  </div>
                )}
                {matches.map((m,i)=>(
                  <div key={m.candidateId} style={{...B,borderRadius:"10px",padding:"14px",marginBottom:"10px",background:i===0?"#F0F7FF":"#fff"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                        <div style={{width:"28px",height:"28px",borderRadius:"50%",background:i===0?navy:"#E6F1FB",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",fontWeight:700,color:i===0?"#fff":navy,flexShrink:0}}>{i+1}</div>
                        <div>
                          <div style={{fontSize:"13px",fontWeight:700,color:navy}}>{m.candidateName}</div>
                          <div style={{fontSize:"10px",color:"#6B6B6B"}}>{m.candidate?.skill} · {m.candidate?.jlpt} · {m.candidate?.status}</div>
                        </div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:"20px",fontWeight:700,color:m.matchPct>=70?"#27500A":m.matchPct>=50?"#633806":"#6B6B6B"}}>{m.matchPct}%</div>
                        <div style={{fontSize:"9px",color:"#6B6B6B"}}>マッチ度</div>
                      </div>
                    </div>
                    <div style={{background:"#F1EFE8",borderRadius:"4px",height:"5px",overflow:"hidden",marginBottom:"8px"}}>
                      <div style={{height:"100%",background:m.matchPct>=70?"#27500A":m.matchPct>=50?"#EF9F27":"#B4B2A9",borderRadius:"4px",width:`${m.matchPct}%`,transition:"width 0.8s"}}/>
                    </div>
                    <div style={{fontSize:"11px",color:"#444",lineHeight:1.6,marginBottom:"6px"}}>{m.reasonVn}</div>
                    {m.strengths?.length>0&&(
                      <div style={{display:"flex",flexWrap:"wrap",gap:"4px",marginBottom:"8px"}}>
                        {m.strengths.map((s,si)=><span key={si} style={{background:"#E6F1FB",color:"#0C447C",fontSize:"10px",padding:"2px 8px",borderRadius:"20px"}}>{s}</span>)}
                      </div>
                    )}
                    <div style={{display:"flex",gap:"6px"}}>
                      <a href={`mailto:${m.candidate?.email}`} style={{flex:1,padding:"6px",borderRadius:"6px",fontSize:"11px",fontWeight:600,textAlign:"center",background:navy,color:"#fff",textDecoration:"none"}}>メール送信</a>
                      {m.candidate?.phone&&<a href={`tel:${m.candidate.phone}`} style={{flex:1,padding:"6px",borderRadius:"6px",fontSize:"11px",fontWeight:600,textAlign:"center",background:"#EAF3DE",color:"#27500A",textDecoration:"none",border:"0.5px solid #27500A"}}>電話する</a>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Quick info */}
          <div>
            <div style={{background:"#fff",...B,borderRadius:"12px",padding:"16px",marginBottom:"12px"}}>
              <div style={{fontSize:"12px",fontWeight:700,color:navy,marginBottom:"12px"}}>⚡ クイック情報</div>
              {[
                {l:"勤務地",v:selected.work_location||selected.location},
                {l:"給与",v:selected.salary||selected.annual_income},
                {l:"雇用形態",v:selected.employment_type},
                {l:"勤務時間",v:selected.work_hours},
                {l:"日本語",v:selected.language_skill||`${selected.jlpt_min}以上`},
                {l:"試用期間",v:selected.trial_period},
                {l:"保険",v:selected.insurance},
                {l:"休日",v:selected.holidays},
              ].filter(r=>r.v).map(r=>(
                <div key={r.l} style={{display:"flex",gap:"8px",padding:"7px 0",borderBottom:"0.5px solid rgba(11,31,58,0.05)"}}>
                  <span style={{fontSize:"11px",color:"#6B6B6B",width:"70px",flexShrink:0}}>{r.l}</span>
                  <span style={{fontSize:"11px",color:navy,fontWeight:500,flex:1}}>{r.v}</span>
                </div>
              ))}
            </div>

            {selected.reference_url&&(
              <div style={{background:"#fff",...B,borderRadius:"12px",padding:"16px",marginBottom:"12px"}}>
                <div style={{fontSize:"12px",fontWeight:700,color:navy,marginBottom:"8px"}}>🔗 参考リンク</div>
                <a href={selected.reference_url} target="_blank" style={{fontSize:"11px",color:"#185FA5",wordBreak:"break-all"}}>{selected.reference_url}</a>
              </div>
            )}

            <div style={{background:"#fff",...B,borderRadius:"12px",padding:"16px"}}>
              <div style={{fontSize:"12px",fontWeight:700,color:navy,marginBottom:"10px"}}>📅 登録情報</div>
              <div style={{fontSize:"10px",color:"#6B6B6B"}}>作成日: {new Date(selected.created_at).toLocaleDateString("ja-JP")}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── FORM VIEW ──────────────────────────────────────
  return (
    <div>
      <div style={{background:"#fff",...B,borderTop:"none",borderLeft:"none",borderRight:"none",padding:"0 20px",height:"52px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
          <button onClick={()=>setView(selected?"detail":"list")} style={{background:"none",border:"none",cursor:"pointer",color:"#6B6B6B",fontSize:"12px",display:"flex",alignItems:"center",gap:"4px"}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            戻る
          </button>
          <div style={{width:"1px",height:"20px",background:"rgba(11,31,58,0.1)"}}/>
          <div style={{fontSize:"14px",fontWeight:700,color:navy}}>{form.id?"求人編集":"新規求人追加"} / {form.id?"Sửa":"Thêm mới"}</div>
        </div>
        <button form="job-form" type="submit" disabled={saving} style={{padding:"7px 16px",borderRadius:"6px",fontSize:"12px",fontWeight:600,background:saving?"#888":navy,color:"#fff",border:"none",cursor:"pointer"}}>
          {saving?"保存中...":"💾 保存 / Lưu"}
        </button>
      </div>

      <form id="job-form" onSubmit={saveJob} style={{padding:"16px 20px",maxWidth:"900px"}}>
        {/* Basic info */}
        <div style={{background:"#fff",...B,borderRadius:"12px",padding:"20px",marginBottom:"12px"}}>
          <div style={{fontSize:"13px",fontWeight:700,color:navy,marginBottom:"14px",paddingBottom:"10px",borderBottom:"0.5px solid rgba(11,31,58,0.08)"}}>📋 基本情報 / Thông tin cơ bản</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"12px"}}>
            {[
              {f:"company",     l:"企業名 *",          p:"山本フーズ株式会社",  req:true},
              {f:"location",    l:"勤務地（略称）",     p:"東京都 新宿区",       req:false},
              {f:"position_ja", l:"職種（日本語）*",    p:"調理師",              req:true},
              {f:"position_vn", l:"Vị trí (Việt)",     p:"Nhân viên bếp",       req:false},
              {f:"salary",      l:"給与（略称）",       p:"¥200,000〜",          req:false},
              {f:"count",       l:"募集人数",           p:"3",                   req:false},
            ].map(x=>(
              <div key={x.f}>
                <label style={{display:"block",fontSize:"10px",color:"#6B6B6B",marginBottom:"4px",fontWeight:600}}>{x.l}</label>
                <input required={x.req} type={x.f==="count"?"number":"text"} placeholder={x.p} value={form[x.f]||""} onChange={e=>setForm({...form,[x.f]:e.target.value})} style={{width:"100%",padding:"8px 10px",borderRadius:"7px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none"}}/>
              </div>
            ))}
            <div>
              <label style={{display:"block",fontSize:"10px",color:"#6B6B6B",marginBottom:"4px",fontWeight:600}}>業種</label>
              <select value={form.industry||"飲食"} onChange={e=>setForm({...form,industry:e.target.value})} style={{width:"100%",padding:"8px 10px",borderRadius:"7px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none"}}>
                {["飲食","製造","農業","ホテル","その他"].map(i=><option key={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label style={{display:"block",fontSize:"10px",color:"#6B6B6B",marginBottom:"4px",fontWeight:600}}>日本語要件</label>
              <select value={form.jlpt_min||"N4"} onChange={e=>setForm({...form,jlpt_min:e.target.value})} style={{width:"100%",padding:"8px 10px",borderRadius:"7px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none"}}>
                {["N1","N2","N3","N4","N5","なし"].map(j=><option key={j}>{j}</option>)}
              </select>
            </div>
            <div>
              <label style={{display:"block",fontSize:"10px",color:"#6B6B6B",marginBottom:"4px",fontWeight:600}}>ステータス</label>
              <select value={form.status||"open"} onChange={e=>setForm({...form,status:e.target.value})} style={{width:"100%",padding:"8px 10px",borderRadius:"7px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none"}}>
                {Object.entries(ST).map(([k,v])=><option key={k} value={k}>{v.ja} · {v.vn}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* 求人概要 fields */}
        <div style={{background:"#fff",...B,borderRadius:"12px",padding:"20px"}}>
          <div style={{fontSize:"13px",fontWeight:700,color:navy,marginBottom:"14px",paddingBottom:"10px",borderBottom:"0.5px solid rgba(11,31,58,0.08)"}}>📄 求人概要 / Chi tiết công việc</div>
          <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            {FIELDS.map(field=>(
              <div key={field.key}>
                <label style={{display:"block",fontSize:"11px",color:navy,marginBottom:"4px",fontWeight:700}}>
                  {field.ja} <span style={{fontWeight:400,color:"#6B6B6B"}}>/ {field.vn}</span>
                </label>
                {field.rows===1 ? (
                  <input type="text" placeholder={`${field.ja}を入力...`} value={form[field.key]||""} onChange={e=>setForm({...form,[field.key]:e.target.value})} style={{width:"100%",padding:"8px 10px",borderRadius:"7px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none"}}/>
                ) : (
                  <textarea rows={field.rows} placeholder={`${field.ja}を入力...`} value={form[field.key]||""} onChange={e=>setForm({...form,[field.key]:e.target.value})} style={{width:"100%",padding:"8px 10px",borderRadius:"7px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none",resize:"vertical",lineHeight:1.6}}/>
                )}
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}