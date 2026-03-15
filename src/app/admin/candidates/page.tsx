"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

type CandidateAI = {
  name:string; nameJp:string; email:string; phone:string; gender:string;
  dateOfBirth:string; nationality:string; jlpt:string; visaType:string;
  industry:string; industryVn:string; experienceYears:number;
  jobHistory:{company:string;position:string;period:string}[];
  skills:string[]; certifications:string[]; preferredJob:string;
  summary:string; summaryVn:string; strengths:string[];
  availability:string; height:string; weight:string;
};
type Job = {
  id:string; company:string; position:string; positionVn:string;
  industry:string; jlptMin:string; salary:string; location:string;
  status:string; score:number; matchPct:number; reasons:string[];
};
type FileResult = {
  success:boolean; fileName:string; fileSize?:number; error?:string;
  candidate?:CandidateAI; suggestions?:Job[];
};
type FileItem = {
  file: File; id: string;
  status: "waiting"|"analyzing"|"done"|"error";
  progress: number; result?: FileResult; error?: string;
};
type Candidate = {
  id:string; name:string; email:string; phone:string; skill:string;
  jlpt:string; status:string; match_job_id:string|null;
  match_job_name:string; note:string; cv_filename:string|null;
  ai_data:CandidateAI|null; created_at:string; updated_at:string;
};

const ST: Record<string,{ja:string;vn:string;tc:string;tb:string}> = {
  new:      {ja:"新規",   vn:"Mới",        tc:"#0C447C",tb:"#E6F1FB"},
  interview:{ja:"面接中", vn:"Phỏng vấn",  tc:"#633806",tb:"#FAEEDA"},
  offered:  {ja:"内定済", vn:"Đã offer",   tc:"#534AB7",tb:"#EEEDFE"},
  working:  {ja:"就業中", vn:"Đang làm",   tc:"#27500A",tb:"#EAF3DE"},
  quit:     {ja:"退職",   vn:"Nghỉ việc",  tc:"#444441",tb:"#F1EFE8"},
};
const JC: Record<string,{tc:string;tb:string}> = {
  N1:{tc:"#A32D2D",tb:"#FCEBEB"},N2:{tc:"#633806",tb:"#FAEEDA"},
  N3:{tc:"#27500A",tb:"#EAF3DE"},N4:{tc:"#444441",tb:"#F1EFE8"},
  N5:{tc:"#6B6B6B",tb:"#F1EFE8"},
};

function formatBytes(b:number){ return b>1024*1024?`${(b/1024/1024).toFixed(1)}MB`:`${(b/1024).toFixed(0)}KB`; }

export default function CandidatesPage() {
  const router = useRouter();
  const [cands, setCands] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Candidate|null>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list"|"import">("list");
  const [dragOver, setDragOver] = useState(false);
  const [fileItems, setFileItems] = useState<FileItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentReview, setCurrentReview] = useState<FileResult|null>(null);
  const [editForm, setEditForm] = useState<Record<string,string>>({});
  const [selectedJobId, setSelectedJobId] = useState<string|null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async (s?:string) => {
    const params = new URLSearchParams();
    if(filter!=="all") params.set("status",filter);
    const q = s!==undefined?s:search;
    if(q) params.set("search",q);
    const res = await fetch(`/api/admin/candidates?${params}`);
    if(res.status===401){router.push("/admin/login");return;}
    const d = await res.json();
    setCands(d.data||[]);
    setLoading(false);
  },[filter,search,router]);

  useEffect(()=>{load();},[load]);

  const counts: Record<string,number> = {all:cands.length};
  Object.keys(ST).forEach(k=>{counts[k]=cands.filter(c=>c.status===k).length;});

  const updateStatus = async (id:string,status:string) => {
    await fetch("/api/admin/candidates",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,status})});
    setCands(p=>p.map(c=>c.id===id?{...c,status}:c));
    setSelected(p=>p?.id===id?{...p,status}:p);
  };

  const deleteCandidate = async (id:string) => {
    if(!confirm("削除しますか？")) return;
    await fetch(`/api/admin/candidates?id=${id}`,{method:"DELETE"});
    setCands(p=>p.filter(c=>c.id!==id));
    setSelected(null);
  };

  // Add files
  const addFiles = (files: FileList|File[]) => {
    const arr = Array.from(files);
    const allowed = arr.filter(f => /\.(pdf|doc|docx)$/i.test(f.name));
    if(allowed.length < arr.length) alert(`PDF・Word以外はスキップされます / Chỉ nhận PDF và Word`);
    const remaining = 5 - fileItems.length;
    const toAdd = allowed.slice(0, remaining).map(file=>({
      file, id: Math.random().toString(36).slice(2),
      status: "waiting" as const, progress: 0,
    }));
    setFileItems(p=>[...p,...toAdd]);
  };

  // Analyze all files
  const analyzeAll = async () => {
    if(fileItems.length===0) return;
    setIsAnalyzing(true);

    // Update all to analyzing
    setFileItems(p=>p.map(f=>({...f,status:"analyzing",progress:0})));

    // Start progress animation for each
    const progressTimers: Record<string,NodeJS.Timeout> = {};
    fileItems.forEach(item=>{
      progressTimers[item.id] = setInterval(()=>{
        setFileItems(p=>p.map(f=>f.id===item.id&&f.status==="analyzing"?{...f,progress:Math.min(f.progress+8,85)}:f));
      },200);
    });

    try {
      const fd = new FormData();
      fileItems.forEach((item,i)=>fd.append(`cv_${i}`,item.file));

      const res = await fetch("/api/admin/analyze-cv",{method:"POST",body:fd});
      const data = await res.json();

      // Clear timers
      Object.values(progressTimers).forEach(t=>clearInterval(t));

      if(data.results) {
        setFileItems(p=>p.map((f,i)=>{
          const result = data.results[i];
          if(!result) return {...f,status:"error",progress:100,error:"No result"};
          return {
            ...f,
            status: result.success?"done":"error",
            progress: 100,
            result: result.success ? result : undefined,
            error: result.error,
          };
        }));
      }
    } catch(err) {
      Object.values(progressTimers).forEach(t=>clearInterval(t));
      setFileItems(p=>p.map(f=>({...f,status:"error",progress:100,error:"Network error"})));
    }
    setIsAnalyzing(false);
  };

  // Open review for a file
  const openReview = (item:FileItem) => {
    if(!item.result?.candidate) return;
    setCurrentReview(item.result);
    setEditForm({
      name: item.result.candidate.name||"",
      email: item.result.candidate.email||"",
      phone: item.result.candidate.phone||"",
      skill: item.result.candidate.industry||"飲食",
      jlpt: item.result.candidate.jlpt||"N4",
      note: item.result.candidate.summaryVn||"",
      cv_filename: item.result.fileName,
    });
    if(item.result.suggestions?.[0]) setSelectedJobId(item.result.suggestions[0].id);
  };

  const saveCandidate = async () => {
    if(!editForm.name||!currentReview) return;
    setSaving(true);
    const job = currentReview.suggestions?.find(j=>j.id===selectedJobId);
    const res = await fetch("/api/admin/candidates",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        name:editForm.name,email:editForm.email,phone:editForm.phone,
        skill:editForm.skill,jlpt:editForm.jlpt,status:"new",
        match_job_id:selectedJobId||null,
        match_job_name:job?.company||"未定",
        note:editForm.note,cv_filename:editForm.cv_filename,
        ai_data:currentReview.candidate||null,
      }),
    });
    if(res.ok){
      setCurrentReview(null);
      setFileItems(p=>p.filter(f=>f.result?.fileName!==editForm.cv_filename));
      load();
      if(fileItems.filter(f=>f.status==="done").length<=1) {
        setTimeout(()=>setView("list"),500);
      }
    }
    setSaving(false);
  };

  const B = {border:"0.5px solid rgba(11,31,58,0.1)"};
  const navy="#0B1F3A";

  // ── LIST VIEW ──────────────────────────────────────────────────
  if(view==="list") return (
    <div>
      <div style={{background:"#fff",...B,borderTop:"none",borderLeft:"none",borderRight:"none",padding:"0 20px",height:"52px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:"14px",fontWeight:700,color:navy}}>人材管理 / Quản lý Ứng viên</div>
          <div style={{fontSize:"10px",color:"#6B6B6B"}}>Supabase DB · AI CV分析 · 最大5件同時インポート</div>
        </div>
        <div style={{display:"flex",gap:"8px"}}>
          <input type="text" placeholder="名前・メールで検索..." value={search} onChange={e=>{setSearch(e.target.value);load(e.target.value);}} style={{padding:"6px 10px",borderRadius:"6px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none",width:"180px"}}/>
          <button onClick={()=>setView("import")} style={{padding:"7px 14px",borderRadius:"6px",fontSize:"12px",fontWeight:700,background:"#C8002A",color:"#fff",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:"5px"}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            CV AI取込 (最大5件)
          </button>
        </div>
      </div>
      <div style={{padding:"16px 20px"}}>
        <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"14px"}}>
          {[{key:"all",ja:"全件",vn:"Tất cả"},...Object.entries(ST).map(([k,v])=>({key:k,ja:v.ja,vn:v.vn}))].map(t=>(
            <button key={t.key} onClick={()=>setFilter(t.key)} style={{padding:"5px 12px",borderRadius:"20px",fontSize:"11px",fontWeight:600,border:`1px solid ${filter===t.key?navy:"rgba(11,31,58,0.15)"}`,background:filter===t.key?navy:"#fff",color:filter===t.key?"#fff":"#6B6B6B",cursor:"pointer",whiteSpace:"nowrap"}}>
              {t.ja}·{t.vn} ({counts[t.key]||0})
            </button>
          ))}
        </div>

        <div style={{display:"grid",gridTemplateColumns:selected?"1fr 380px":"1fr",gap:"12px"}}>
          <div style={{background:"#fff",...B,borderRadius:"10px",overflow:"hidden"}}>
            {loading?<div style={{padding:"40px",textAlign:"center",color:"#6B6B6B"}}>読み込み中...</div>:cands.length===0?(
              <div style={{padding:"48px",textAlign:"center"}}>
                <div style={{fontSize:"32px",marginBottom:"12px"}}>📂</div>
                <div style={{fontSize:"14px",fontWeight:700,color:navy,marginBottom:"6px"}}>ứng viên chưa có / 候補者なし</div>
                <div style={{fontSize:"12px",color:"#6B6B6B",marginBottom:"16px"}}>CVをインポートして候補者を追加しましょう</div>
                <button onClick={()=>setView("import")} style={{padding:"9px 20px",borderRadius:"8px",fontSize:"12px",fontWeight:700,background:"#C8002A",color:"#fff",border:"none",cursor:"pointer"}}>CV取込で追加する →</button>
              </div>
            ):(
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:"12px"}}>
                <thead><tr style={{background:"#F6F7F9"}}>
                  {["候補者 / Ứng viên","業種","日本語","マッチ先","CV","ステータス","更新"].map(h=>(
                    <th key={h} style={{padding:"9px 12px",textAlign:"left",fontSize:"10px",color:"#6B6B6B",fontWeight:600,borderBottom:"0.5px solid rgba(11,31,58,0.1)",whiteSpace:"nowrap"}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {cands.map(c=>{
                    const st=ST[c.status]||ST.new; const jc=JC[c.jlpt]||JC["N5"];
                    const ini=c.name.split(" ").slice(-2).map((w:string)=>w[0]).join("").toUpperCase();
                    const upd=c.updated_at?new Date(c.updated_at).toLocaleDateString("ja-JP"):"";
                    return(
                      <tr key={c.id} onClick={()=>setSelected(selected?.id===c.id?null:c)} style={{borderBottom:"0.5px solid rgba(11,31,58,0.05)",cursor:"pointer",background:selected?.id===c.id?"#E6F1FB":"transparent"}}>
                        <td style={{padding:"10px 12px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:"7px"}}>
                            <div style={{width:"30px",height:"30px",borderRadius:"50%",background:st.tb,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px",fontWeight:700,color:st.tc,flexShrink:0}}>{ini}</div>
                            <div><div style={{fontWeight:600,color:navy}}>{c.name}</div><div style={{fontSize:"10px",color:"#6B6B6B"}}>{c.email}</div></div>
                          </div>
                        </td>
                        <td style={{padding:"10px 12px"}}><span style={{background:"#E6F1FB",color:"#0C447C",fontSize:"10px",fontWeight:700,padding:"2px 7px",borderRadius:"4px"}}>{c.skill}</span></td>
                        <td style={{padding:"10px 12px"}}><span style={{background:jc.tb,color:jc.tc,fontSize:"10px",fontWeight:700,padding:"2px 7px",borderRadius:"4px"}}>{c.jlpt}</span></td>
                        <td style={{padding:"10px 12px",fontSize:"11px",color:c.match_job_name&&c.match_job_name!=="未定"?"#185FA5":"#6B6B6B",fontWeight:600}}>{c.match_job_name||"未定"}</td>
                        <td style={{padding:"10px 12px"}}>{c.cv_filename?<span style={{fontSize:"10px",color:"#C8002A",fontWeight:700}}>📄 CV</span>:<span style={{fontSize:"10px",color:"#B4B2A9"}}>なし</span>}</td>
                        <td style={{padding:"10px 12px"}}><span style={{background:st.tb,color:st.tc,fontSize:"10px",fontWeight:700,padding:"2px 7px",borderRadius:"4px"}}>{st.ja}·{st.vn}</span></td>
                        <td style={{padding:"10px 12px",fontSize:"10px",color:"#6B6B6B"}}>{upd}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {selected&&(
            <div style={{background:"#fff",...B,borderRadius:"10px",padding:"16px",height:"fit-content",position:"sticky",top:"16px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"12px"}}>
                <div><div style={{fontSize:"15px",fontWeight:700,color:navy}}>{selected.name}</div><div style={{fontSize:"10px",color:"#6B6B6B"}}>{selected.skill}·{selected.jlpt}·{ST[selected.status]?.ja}</div></div>
                <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",cursor:"pointer",color:"#6B6B6B",fontSize:"18px"}}>×</button>
              </div>
              {selected.cv_filename&&<div style={{display:"flex",alignItems:"center",gap:"7px",background:"#FCEBEB",borderRadius:"7px",padding:"8px 12px",marginBottom:"10px"}}><span>📄</span><div><div style={{fontSize:"11px",fontWeight:700,color:"#A32D2D"}}>CV登録済み</div><div style={{fontSize:"10px",color:"#C8002A"}}>{selected.cv_filename}</div></div></div>}
              {selected.ai_data?.summaryVn&&<div style={{background:"#F6F7F9",borderRadius:"8px",padding:"10px",marginBottom:"10px",fontSize:"11px",color:"#444",lineHeight:1.65}}>{selected.ai_data.summaryVn}</div>}
              {(selected.ai_data?.strengths?.length??0)>0&&(
                <div style={{display:"flex",flexWrap:"wrap",gap:"4px",marginBottom:"10px"}}>
                  {selected.ai_data?.strengths?.map((s,i)=><span key={i} style={{background:"#E6F1FB",color:"#0C447C",fontSize:"10px",padding:"2px 8px",borderRadius:"20px"}}>{s}</span>)}
                </div>
              )}
              {(selected.ai_data?.jobHistory?.length??0)>0&&(
                <div style={{marginBottom:"10px"}}>
                  <div style={{fontSize:"10px",color:"#6B6B6B",fontWeight:600,marginBottom:"5px"}}>職歴 / Kinh nghiệm</div>
                  {selected.ai_data?.jobHistory?.map((j,i)=>(
                    <div key={i} style={{fontSize:"11px",color:navy,padding:"4px 0",borderBottom:"0.5px solid rgba(11,31,58,0.06)"}}>
                      <span style={{fontWeight:600}}>{j.company}</span> — {j.position} <span style={{color:"#6B6B6B",fontSize:"10px"}}>{j.period}</span>
                    </div>
                  ))}
                </div>
              )}
              {[{l:"Email",v:selected.email},{l:"電話",v:selected.phone},{l:"マッチ先",v:selected.match_job_name},{l:"備考",v:selected.note}].map(r=>(
                <div key={r.l} style={{display:"flex",gap:"8px",marginBottom:"6px",fontSize:"12px"}}>
                  <span style={{color:"#6B6B6B",width:"70px",flexShrink:0}}>{r.l}</span>
                  <span style={{color:navy,fontWeight:500,flex:1,wordBreak:"break-word"}}>{r.v||"—"}</span>
                </div>
              ))}
              <div style={{borderTop:"0.5px solid rgba(11,31,58,0.08)",paddingTop:"11px",marginTop:"8px"}}>
                <div style={{fontSize:"10px",color:"#6B6B6B",fontWeight:600,marginBottom:"6px"}}>ステータス変更</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:"4px"}}>
                  {Object.entries(ST).map(([k,v])=>(
                    <button key={k} onClick={()=>updateStatus(selected.id,k)} style={{padding:"4px 8px",borderRadius:"5px",fontSize:"10px",fontWeight:600,cursor:"pointer",background:selected.status===k?v.tc:v.tb,color:selected.status===k?"#fff":v.tc,border:`1px solid ${v.tc}`}}>{v.ja}</button>
                  ))}
                </div>
              </div>
              <div style={{display:"flex",gap:"7px",marginTop:"12px"}}>
                <a href={`mailto:${selected.email}`} style={{flex:1,padding:"8px",borderRadius:"7px",fontSize:"11px",fontWeight:600,textAlign:"center",background:navy,color:"#fff",textDecoration:"none"}}>メール送信</a>
                <button onClick={()=>deleteCandidate(selected.id)} style={{padding:"8px 12px",borderRadius:"7px",fontSize:"11px",fontWeight:600,background:"#FCEBEB",color:"#A32D2D",border:"0.5px solid #F09595",cursor:"pointer"}}>削除</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ── IMPORT VIEW ────────────────────────────────────────────────
  if(!currentReview) return (
    <div>
      <div style={{background:"#fff",...B,borderTop:"none",borderLeft:"none",borderRight:"none",padding:"0 20px",height:"52px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:"14px",fontWeight:700,color:navy}}>CV AI取込 / Import CV bằng AI</div>
          <div style={{fontSize:"10px",color:"#6B6B6B"}}>最大5件同時 · PDF・Word対応 · Gemini AI分析</div>
        </div>
        <button onClick={()=>{setView("list");setFileItems([]);}} style={{padding:"7px 14px",borderRadius:"6px",fontSize:"12px",fontWeight:600,background:"transparent",color:navy,border:`0.5px solid ${navy}`,cursor:"pointer"}}>← 一覧へ</button>
      </div>

      <div style={{padding:"20px",maxWidth:"900px",margin:"0 auto"}}>
        {/* Drop zone */}
        <div
          onDragOver={e=>{e.preventDefault();setDragOver(true);}}
          onDragLeave={()=>setDragOver(false)}
          onDrop={e=>{e.preventDefault();setDragOver(false);addFiles(e.dataTransfer.files);}}
          onClick={()=>fileItems.length<5&&fileInputRef.current?.click()}
          style={{border:`2px dashed ${dragOver?navy:"rgba(11,31,58,0.2)"}`,borderRadius:"14px",padding:"32px 24px",textAlign:"center",cursor:fileItems.length>=5?"not-allowed":"pointer",background:dragOver?"#E6F1FB":"#fff",transition:"all 0.2s",marginBottom:"16px"}}
        >
          <div style={{width:"48px",height:"48px",borderRadius:"12px",background:"#E6F1FB",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={navy} strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </div>
          <div style={{fontSize:"14px",fontWeight:700,color:navy,marginBottom:"4px"}}>
            ドラッグ＆ドロップ / Kéo thả CV vào đây
          </div>
          <div style={{fontSize:"11px",color:"#6B6B6B",marginBottom:"12px"}}>最大5件同時・PDF・Word (.doc, .docx)</div>
          <div style={{display:"inline-flex",alignItems:"center",gap:"6px",padding:"7px 18px",borderRadius:"7px",background:navy,color:"#fff",fontSize:"12px",fontWeight:600}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            ファイルを選択 ({fileItems.length}/5)
          </div>
        </div>
        <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" multiple style={{display:"none"}}
          onChange={e=>{if(e.target.files)addFiles(e.target.files);e.target.value="";}}/>

        {/* File list */}
        {fileItems.length>0&&(
          <div style={{display:"flex",flexDirection:"column",gap:"8px",marginBottom:"16px"}}>
            {fileItems.map(item=>(
              <div key={item.id} style={{background:"#fff",...B,borderRadius:"10px",padding:"12px 16px"}}>
                <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                  {/* File icon */}
                  <div style={{width:"36px",height:"36px",borderRadius:"8px",background:item.status==="done"?"#EAF3DE":item.status==="error"?"#FCEBEB":"#E6F1FB",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    {item.status==="done"?<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#27500A" strokeWidth="2"><path d="M9 12l2 2 4-4M12 3a9 9 0 100 18 9 9 0 000-18z"/></svg>
                    :item.status==="error"?<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8002A" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                    :<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#185FA5" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
                  </div>

                  {/* File info */}
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"4px"}}>
                      <div style={{fontSize:"12px",fontWeight:600,color:navy,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.file.name}</div>
                      <div style={{fontSize:"10px",color:"#6B6B6B",flexShrink:0,marginLeft:"8px"}}>{formatBytes(item.file.size)}</div>
                    </div>
                    {/* Progress bar */}
                    {(item.status==="analyzing"||item.status==="done"||item.status==="error")&&(
                      <div>
                        <div style={{background:"#F1EFE8",borderRadius:"3px",height:"4px",overflow:"hidden",marginBottom:"3px"}}>
                          <div style={{height:"100%",borderRadius:"3px",transition:"width 0.3s",
                            background:item.status==="done"?"#27500A":item.status==="error"?"#C8002A":"#378ADD",
                            width:`${item.progress}%`}}/>
                        </div>
                        <div style={{fontSize:"10px",color:item.status==="done"?"#27500A":item.status==="error"?"#C8002A":"#6B6B6B"}}>
                          {item.status==="analyzing"?`${item.progress}% — AI分析中...`
                          :item.status==="done"?"✓ 分析完了 / Phân tích xong"
                          :`✗ エラー: ${item.error}`}
                        </div>
                      </div>
                    )}
                    {item.status==="waiting"&&<div style={{fontSize:"10px",color:"#B4B2A9"}}>待機中 / Đang chờ...</div>}
                  </div>

                  {/* Actions */}
                  <div style={{display:"flex",gap:"6px",flexShrink:0}}>
                    {item.status==="done"&&item.result?.candidate&&(
                      <button onClick={()=>openReview(item)} style={{padding:"5px 10px",borderRadius:"6px",fontSize:"11px",fontWeight:600,background:navy,color:"#fff",border:"none",cursor:"pointer"}}>
                        確認・保存
                      </button>
                    )}
                    {!isAnalyzing&&(
                      <button onClick={()=>setFileItems(p=>p.filter(f=>f.id!==item.id))} style={{padding:"5px 8px",borderRadius:"6px",fontSize:"11px",background:"transparent",color:"#6B6B6B",border:"0.5px solid rgba(11,31,58,0.15)",cursor:"pointer"}}>×</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Analyze button */}
        {fileItems.length>0&&!isAnalyzing&&fileItems.some(f=>f.status==="waiting")&&(
          <button onClick={analyzeAll} style={{width:"100%",padding:"13px",borderRadius:"9px",fontSize:"14px",fontWeight:700,background:navy,color:"#fff",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px"}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
            AI分析開始 · Bắt đầu phân tích AI ({fileItems.filter(f=>f.status==="waiting").length}件)
          </button>
        )}

        {/* Done summary */}
        {fileItems.length>0&&!isAnalyzing&&fileItems.every(f=>f.status==="done"||f.status==="error")&&(
          <div style={{background:"#EAF3DE",borderRadius:"10px",padding:"12px 16px",display:"flex",alignItems:"center",gap:"10px"}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#27500A" strokeWidth="2"><path d="M9 12l2 2 4-4M12 3a9 9 0 100 18 9 9 0 000-18z"/></svg>
            <div>
              <div style={{fontSize:"12px",fontWeight:700,color:"#27500A"}}>
                分析完了 · {fileItems.filter(f=>f.status==="done").length}件成功 / {fileItems.filter(f=>f.status==="error").length}件エラー
              </div>
              <div style={{fontSize:"10px",color:"#3B6D11"}}>各CVの「確認・保存」ボタンでDBに保存してください</div>
            </div>
          </div>
        )}

        {/* Tips */}
        {fileItems.length===0&&(
          <div style={{background:"#F6F7F9",borderRadius:"10px",padding:"14px 16px"}}>
            <div style={{fontSize:"11px",fontWeight:700,color:navy,marginBottom:"8px"}}>💡 Gemini AIが自動で抽出します / AI tự động trích xuất:</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"5px"}}>
              {["氏名・連絡先 / Họ tên, liên hệ","日本語レベル / Trình độ tiếng Nhật","職歴・在留資格 / Kinh nghiệm, visa","資格・スキル / Chứng chỉ, kỹ năng","希望職種 / Ngành nghề mong muốn","AIマッチング求人 / Suggest công việc"].map((t,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"11px",color:"#444"}}>
                  <div style={{width:"5px",height:"5px",borderRadius:"50%",background:"#27500A",flexShrink:0}}/>
                  {t}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ── REVIEW VIEW ────────────────────────────────────────────────
  return (
    <div>
      <div style={{background:"#fff",...B,borderTop:"none",borderLeft:"none",borderRight:"none",padding:"0 20px",height:"52px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:"14px",fontWeight:700,color:navy}}>確認・保存 / Xác nhận & Lưu</div>
          <div style={{fontSize:"10px",color:"#6B6B6B"}}>{currentReview.fileName}</div>
        </div>
        <button onClick={()=>setCurrentReview(null)} style={{padding:"7px 14px",borderRadius:"6px",fontSize:"12px",fontWeight:600,background:"transparent",color:navy,border:`0.5px solid ${navy}`,cursor:"pointer"}}>← 戻る</button>
      </div>

      <div style={{padding:"20px",maxWidth:"900px",margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>
        {/* Left: Edit form */}
        <div style={{background:"#fff",...B,borderRadius:"10px",padding:"16px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"14px"}}>
            <div style={{width:"28px",height:"28px",borderRadius:"7px",background:"#E6F1FB",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={navy} strokeWidth="2"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
            </div>
            <div>
              <div style={{fontSize:"12px",fontWeight:700,color:navy}}>AI抽出結果 / Kết quả AI</div>
              <div style={{fontSize:"10px",color:"#6B6B6B"}}>内容を確認・修正してください</div>
            </div>
            <span style={{marginLeft:"auto",background:"#EAF3DE",color:"#27500A",fontSize:"9px",fontWeight:700,padding:"2px 8px",borderRadius:"20px"}}>Gemini AI</span>
          </div>

          {/* Basic info */}
          {[{f:"name",l:"氏名 / Họ tên *",t:"text"},{f:"email",l:"Email",t:"email"},{f:"phone",l:"電話 / SĐT",t:"text"}].map(x=>(
            <div key={x.f} style={{marginBottom:"10px"}}>
              <label style={{display:"block",fontSize:"10px",color:"#6B6B6B",marginBottom:"3px",fontWeight:600}}>{x.l}</label>
              <input type={x.t} value={editForm[x.f]||""} onChange={e=>setEditForm({...editForm,[x.f]:e.target.value})} style={{width:"100%",padding:"7px 10px",borderRadius:"6px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none"}}/>
            </div>
          ))}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"10px"}}>
            <div>
              <label style={{display:"block",fontSize:"10px",color:"#6B6B6B",marginBottom:"3px",fontWeight:600}}>業種 / Ngành</label>
              <select value={editForm.skill||"飲食"} onChange={e=>setEditForm({...editForm,skill:e.target.value})} style={{width:"100%",padding:"7px 10px",borderRadius:"6px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none"}}>
                {["飲食","製造","農業","ホテル","その他"].map(i=><option key={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label style={{display:"block",fontSize:"10px",color:"#6B6B6B",marginBottom:"3px",fontWeight:600}}>日本語 / Tiếng Nhật</label>
              <select value={editForm.jlpt||"N4"} onChange={e=>setEditForm({...editForm,jlpt:e.target.value})} style={{width:"100%",padding:"7px 10px",borderRadius:"6px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none"}}>
                {["N1","N2","N3","N4","N5","N4相当","N3相当","なし"].map(j=><option key={j}>{j}</option>)}
              </select>
            </div>
          </div>

          {/* AI Summary */}
          {currentReview.candidate?.summaryVn&&(
            <div style={{background:"#F6F7F9",borderRadius:"7px",padding:"10px",marginBottom:"10px",fontSize:"11px",color:"#444",lineHeight:1.65}}>
              <div style={{fontSize:"10px",fontWeight:700,color:navy,marginBottom:"4px"}}>AI要約 / Tóm tắt</div>
              {currentReview.candidate.summaryVn}
            </div>
          )}

          {/* Skills & Certs */}
          {(currentReview.candidate?.skills?.length||0)>0&&(
            <div style={{marginBottom:"10px"}}>
              <div style={{fontSize:"10px",color:"#6B6B6B",fontWeight:600,marginBottom:"5px"}}>スキル・資格</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:"4px"}}>
                {[...(currentReview.candidate?.skills||[]),...(currentReview.candidate?.certifications||[])].map((s,i)=>(
                  <span key={i} style={{background:"#E6F1FB",color:"#0C447C",fontSize:"10px",fontWeight:600,padding:"2px 8px",borderRadius:"20px"}}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Job history */}
          {(currentReview.candidate?.jobHistory?.length||0)>0&&(
            <div style={{marginBottom:"10px"}}>
              <div style={{fontSize:"10px",color:"#6B6B6B",fontWeight:600,marginBottom:"5px"}}>職歴 / Kinh nghiệm</div>
              {currentReview.candidate?.jobHistory.map((j,i)=>(
                <div key={i} style={{fontSize:"11px",padding:"4px 0",borderBottom:"0.5px solid rgba(11,31,58,0.06)",color:navy}}>
                  <span style={{fontWeight:600}}>{j.company}</span> — {j.position}
                  {j.period&&<span style={{color:"#6B6B6B",fontSize:"10px"}}> · {j.period}</span>}
                </div>
              ))}
            </div>
          )}

          <div>
            <label style={{display:"block",fontSize:"10px",color:"#6B6B6B",marginBottom:"3px",fontWeight:600}}>備考 / Ghi chú</label>
            <textarea value={editForm.note||""} onChange={e=>setEditForm({...editForm,note:e.target.value})} rows={2} style={{width:"100%",padding:"7px 10px",borderRadius:"6px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none",resize:"vertical"}}/>
          </div>
        </div>

        {/* Right: Job matching */}
        <div>
          <div style={{background:"#fff",...B,borderRadius:"10px",padding:"16px",marginBottom:"12px"}}>
            <div style={{fontSize:"12px",fontWeight:700,color:navy,marginBottom:"4px"}}>🎯 AIマッチング求人 / Suggest công việc</div>
            <div style={{fontSize:"10px",color:"#6B6B6B",marginBottom:"12px"}}>
              希望職種: <span style={{color:navy,fontWeight:600}}>{currentReview.candidate?.preferredJob||"未記入"}</span>
            </div>

            {(currentReview.suggestions||[]).map((job,i)=>(
              <div key={job.id} onClick={()=>setSelectedJobId(job.id)} style={{border:`1.5px solid ${selectedJobId===job.id?navy:"rgba(11,31,58,0.1)"}`,borderRadius:"10px",padding:"12px",marginBottom:"8px",cursor:"pointer",background:selectedJobId===job.id?"#E6F1FB":"#fff",transition:"all 0.15s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"6px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"7px"}}>
                    <div style={{width:"22px",height:"22px",borderRadius:"50%",background:i===0?navy:"#F1EFE8",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px",fontWeight:700,color:i===0?"#fff":navy,flexShrink:0}}>{i+1}</div>
                    <div>
                      <div style={{fontSize:"12px",fontWeight:700,color:navy}}>{job.company}</div>
                      <div style={{fontSize:"10px",color:"#6B6B6B"}}>{job.positionVn} · {job.location}</div>
                    </div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:"16px",fontWeight:700,color:job.matchPct>=70?"#27500A":job.matchPct>=40?"#633806":"#6B6B6B"}}>{job.matchPct}%</div>
                    <div style={{fontSize:"9px",color:"#6B6B6B"}}>マッチ度</div>
                  </div>
                </div>
                <div style={{background:"#F1EFE8",borderRadius:"3px",height:"4px",overflow:"hidden",marginBottom:"6px"}}>
                  <div style={{height:"100%",background:job.matchPct>=70?"#27500A":job.matchPct>=40?"#EF9F27":"#B4B2A9",borderRadius:"3px",width:`${job.matchPct}%`}}/>
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:"3px",marginBottom:"6px"}}>
                  {job.reasons.map((r,ri)=><span key={ri} style={{background:selectedJobId===job.id?"rgba(11,31,58,0.08)":"#F6F7F9",color:navy,fontSize:"9px",padding:"2px 6px",borderRadius:"20px"}}>{r}</span>)}
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:"11px",fontWeight:700,color:"#27500A"}}>{job.salary}</span>
                  <span style={{background:job.status==="urgent"?"#FCEBEB":"#E6F1FB",color:job.status==="urgent"?"#A32D2D":"#0C447C",fontSize:"9px",fontWeight:700,padding:"2px 6px",borderRadius:"4px"}}>
                    {job.status==="urgent"?"⚡ 緊急":job.status==="open"?"募集中":"停止中"}
                  </span>
                </div>
                {selectedJobId===job.id&&(
                  <div style={{marginTop:"7px",paddingTop:"7px",borderTop:"0.5px solid rgba(11,31,58,0.08)",display:"flex",alignItems:"center",gap:"5px"}}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#27500A" strokeWidth="2"><path d="M9 12l2 2 4-4M12 3a9 9 0 100 18 9 9 0 000-18z"/></svg>
                    <span style={{fontSize:"10px",color:"#27500A",fontWeight:700}}>この求人に登録 / Đăng ký vào công việc này</span>
                  </div>
                )}
              </div>
            ))}

            <button onClick={()=>setSelectedJobId(null)} style={{width:"100%",padding:"7px",borderRadius:"7px",fontSize:"11px",color:"#6B6B6B",border:"0.5px solid rgba(11,31,58,0.15)",background:"transparent",cursor:"pointer"}}>
              マッチなし / Chưa có công việc phù hợp
            </button>
          </div>

          <button onClick={saveCandidate} disabled={!editForm.name||saving} style={{width:"100%",padding:"13px",borderRadius:"9px",fontSize:"14px",fontWeight:700,background:editForm.name&&!saving?navy:"#B4B2A9",color:"#fff",border:"none",cursor:editForm.name?"pointer":"not-allowed",transition:"background 0.2s"}}>
            {saving?"DB保存中... / Đang lưu...":"✓ DBに保存 / Lưu vào database"}
          </button>
        </div>
      </div>
    </div>
  );
}