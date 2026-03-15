"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

type CandidateAI = {name:string;email:string;phone:string;jlpt:string;industry:string;experienceYears:number;skills:string[];certifications:string[];summary:string;summaryVn:string;strengths:string[];gender:string};
type Job = {id:string;company:string;position_ja:string;position_vn:string;industry:string;jlpt_min:string;salary:string;location:string;status:string;score?:number;matchPct?:number;reasons?:string[]};
type Candidate = {id:string;name:string;email:string;phone:string;skill:string;jlpt:string;status:string;match_job_id:string|null;match_job_name:string;note:string;cv_filename:string|null;ai_data:CandidateAI|null;created_at:string;updated_at:string};

const ST: Record<string,{ja:string;vn:string;tc:string;tb:string}> = {
  new:      {ja:"新規",    vn:"Mới đăng ký",  tc:"#0C447C",tb:"#E6F1FB"},
  interview:{ja:"面接中",  vn:"Phỏng vấn",    tc:"#633806",tb:"#FAEEDA"},
  offered:  {ja:"内定済",  vn:"Đã offer",     tc:"#534AB7",tb:"#EEEDFE"},
  working:  {ja:"就業中",  vn:"Đang làm",     tc:"#27500A",tb:"#EAF3DE"},
  quit:     {ja:"退職",    vn:"Nghỉ việc",    tc:"#444441",tb:"#F1EFE8"},
};
const JC: Record<string,{tc:string;tb:string}> = {
  N1:{tc:"#A32D2D",tb:"#FCEBEB"},N2:{tc:"#633806",tb:"#FAEEDA"},
  N3:{tc:"#27500A",tb:"#EAF3DE"},N4:{tc:"#444441",tb:"#F1EFE8"},N5:{tc:"#6B6B6B",tb:"#F1EFE8"},
};

export default function CandidatesPage() {
  const router = useRouter();
  const [cands, setCands] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Candidate|null>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list"|"import">("list");
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [aiResult, setAiResult] = useState<{candidate:CandidateAI;suggestions:Job[];fileName:string}|null>(null);
  const [editForm, setEditForm] = useState<Record<string,string>>({});
  const [selectedJobId, setSelectedJobId] = useState<string|null>(null);
  const [importStep, setImportStep] = useState<"upload"|"review"|"done">("upload");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async (s?:string) => {
    const params = new URLSearchParams();
    if(filter!=="all") params.set("status",filter);
    const q = s!==undefined ? s : search;
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

  const updateStatus = async (id:string, status:string) => {
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

  const handleFile = async (file:File) => {
    setUploading(true);setUploadProgress(0);setImportStep("upload");
    const timer = setInterval(()=>setUploadProgress(p=>{if(p>=85){clearInterval(timer);return 85;}return p+15;}),250);
    const fd = new FormData(); fd.append("cv",file);
    try {
      const res = await fetch("/api/admin/analyze-cv",{method:"POST",body:fd});
      clearInterval(timer);setUploadProgress(100);
      if(!res.ok) throw new Error("failed");
      const data = await res.json();
      setAiResult(data);
      setEditForm({name:data.candidate.name||"",email:data.candidate.email||"",phone:data.candidate.phone||"",skill:data.candidate.industry||"飲食",jlpt:data.candidate.jlpt||"N4",note:data.candidate.summaryVn||"",cv_filename:data.fileName});
      if(data.suggestions?.[0]) setSelectedJobId(data.suggestions[0].id);
      setTimeout(()=>{setUploading(false);setImportStep("review");},400);
    } catch {
      clearInterval(timer);setUploading(false);
      alert("CV分析に失敗しました");
    }
  };

  const saveCandidate = async () => {
    if(!editForm.name) return;
    setSaving(true);
    const job = aiResult?.suggestions.find(j=>j.id===selectedJobId);
    const res = await fetch("/api/admin/candidates",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:editForm.name,email:editForm.email,phone:editForm.phone,skill:editForm.skill,jlpt:editForm.jlpt,status:"new",match_job_id:selectedJobId||null,match_job_name:job?.company||"未定",note:editForm.note,cv_filename:editForm.cv_filename,ai_data:aiResult?.candidate||null})});
    if(res.ok){setImportStep("done");setTimeout(()=>{setView("list");setImportStep("upload");setAiResult(null);setEditForm({});setSelectedJobId(null);load();},1800);}
    setSaving(false);
  };

  const B = {border:"0.5px solid rgba(11,31,58,0.1)"};

  if(view==="list") return (
    <div>
      <div style={{background:"#fff",...B,borderTop:"none",borderLeft:"none",borderRight:"none",padding:"0 20px",height:"52px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div><div style={{fontSize:"14px",fontWeight:700,color:"#0B1F3A"}}>人材管理 / Quản lý Ứng viên</div><div style={{fontSize:"10px",color:"#6B6B6B"}}>Supabase DB · CV AI分析</div></div>
        <div style={{display:"flex",gap:"8px"}}>
          <input type="text" placeholder="名前・メールで検索..." value={search} onChange={e=>{setSearch(e.target.value);load(e.target.value);}} style={{padding:"6px 10px",borderRadius:"6px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none",width:"180px"}}/>
          <button onClick={()=>setView("import")} style={{padding:"7px 14px",borderRadius:"6px",fontSize:"12px",fontWeight:700,background:"#C8002A",color:"#fff",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:"5px"}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            CV AI取込
          </button>
        </div>
      </div>
      <div style={{padding:"16px 20px"}}>
        <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"14px"}}>
          {[{key:"all",ja:"全件",vn:"Tất cả"},...Object.entries(ST).map(([k,v])=>({key:k,ja:v.ja,vn:v.vn}))].map(t=>(
            <button key={t.key} onClick={()=>setFilter(t.key)} style={{padding:"5px 12px",borderRadius:"20px",fontSize:"11px",fontWeight:600,border:`1px solid ${filter===t.key?"#0B1F3A":"rgba(11,31,58,0.15)"}`,background:filter===t.key?"#0B1F3A":"#fff",color:filter===t.key?"#fff":"#6B6B6B",cursor:"pointer",whiteSpace:"nowrap"}}>
              {t.ja}·{t.vn}({counts[t.key]||0})
            </button>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:selected?"1fr 360px":"1fr",gap:"12px"}}>
          <div style={{background:"#fff",...B,borderRadius:"10px",overflow:"hidden"}}>
            {loading?<div style={{padding:"40px",textAlign:"center",color:"#6B6B6B"}}>読み込み中...</div>:cands.length===0?(
              <div style={{padding:"40px",textAlign:"center",color:"#6B6B6B",fontSize:"13px"}}>
                データなし<br/>
                <button onClick={()=>setView("import")} style={{marginTop:"12px",padding:"8px 16px",borderRadius:"7px",fontSize:"12px",fontWeight:600,background:"#C8002A",color:"#fff",border:"none",cursor:"pointer"}}>CV取込で追加</button>
              </div>
            ):(
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:"12px"}}>
                <thead><tr style={{background:"#F6F7F9"}}>
                  {["候補者","業種","日本語","マッチ先","CV","ステータス","更新"].map(h=><th key={h} style={{padding:"9px 12px",textAlign:"left",fontSize:"10px",color:"#6B6B6B",fontWeight:600,borderBottom:"0.5px solid rgba(11,31,58,0.1)",whiteSpace:"nowrap"}}>{h}</th>)}
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
                            <div style={{width:"28px",height:"28px",borderRadius:"50%",background:st.tb,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px",fontWeight:700,color:st.tc,flexShrink:0}}>{ini}</div>
                            <div><div style={{fontWeight:600,color:"#0B1F3A"}}>{c.name}</div><div style={{fontSize:"10px",color:"#6B6B6B"}}>{c.email}</div></div>
                          </div>
                        </td>
                        <td style={{padding:"10px 12px"}}><span style={{background:"#E6F1FB",color:"#0C447C",fontSize:"10px",fontWeight:700,padding:"2px 7px",borderRadius:"4px"}}>{c.skill}</span></td>
                        <td style={{padding:"10px 12px"}}><span style={{background:jc.tb,color:jc.tc,fontSize:"10px",fontWeight:700,padding:"2px 7px",borderRadius:"4px"}}>{c.jlpt}</span></td>
                        <td style={{padding:"10px 12px",fontSize:"11px",color:c.match_job_name&&c.match_job_name!=="未定"?"#185FA5":"#6B6B6B",fontWeight:600}}>{c.match_job_name||"未定"}</td>
                        <td style={{padding:"10px 12px"}}>{c.cv_filename?<span style={{fontSize:"10px",color:"#C8002A",fontWeight:700}}>📄 CV</span>:<span style={{fontSize:"10px",color:"#B4B2A9"}}>なし</span>}</td>
                        <td style={{padding:"10px 12px"}}><span style={{background:st.tb,color:st.tc,fontSize:"10px",fontWeight:700,padding:"2px 7px",borderRadius:"4px"}}>{st.ja}</span></td>
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
                <div><div style={{fontSize:"15px",fontWeight:700,color:"#0B1F3A"}}>{selected.name}</div><div style={{fontSize:"10px",color:"#6B6B6B"}}>{selected.skill}·{selected.jlpt}·{ST[selected.status]?.ja}</div></div>
                <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",cursor:"pointer",color:"#6B6B6B",fontSize:"18px"}}>×</button>
              </div>
              {selected.cv_filename&&<div style={{display:"flex",alignItems:"center",gap:"7px",background:"#FCEBEB",borderRadius:"7px",padding:"8px 12px",marginBottom:"12px"}}><span>📄</span><div><div style={{fontSize:"11px",fontWeight:700,color:"#A32D2D"}}>CV登録済み</div><div style={{fontSize:"10px",color:"#C8002A"}}>{selected.cv_filename}</div></div></div>}
              {selected.ai_data?.summaryVn&&<div style={{background:"#F6F7F9",borderRadius:"8px",padding:"10px",marginBottom:"12px",fontSize:"11px",color:"#444",lineHeight:1.6}}>{selected.ai_data.summaryVn}</div>}
              {[{l:"Email",v:selected.email},{l:"電話",v:selected.phone},{l:"マッチ先",v:selected.match_job_name},{l:"備考",v:selected.note}].map(r=>(
                <div key={r.l} style={{display:"flex",gap:"8px",marginBottom:"7px",fontSize:"12px"}}>
                  <span style={{color:"#6B6B6B",width:"70px",flexShrink:0}}>{r.l}</span>
                  <span style={{color:"#0B1F3A",fontWeight:500,flex:1,wordBreak:"break-word"}}>{r.v||"—"}</span>
                </div>
              ))}
              <div style={{borderTop:"0.5px solid rgba(11,31,58,0.08)",paddingTop:"12px",marginTop:"8px"}}>
                <div style={{fontSize:"10px",color:"#6B6B6B",fontWeight:600,marginBottom:"7px"}}>ステータス変更</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:"5px"}}>
                  {Object.entries(ST).map(([k,v])=><button key={k} onClick={()=>updateStatus(selected.id,k)} style={{padding:"4px 8px",borderRadius:"5px",fontSize:"10px",fontWeight:600,cursor:"pointer",background:selected.status===k?v.tc:v.tb,color:selected.status===k?"#fff":v.tc,border:`1px solid ${v.tc}`}}>{v.ja}</button>)}
                </div>
              </div>
              <div style={{display:"flex",gap:"7px",marginTop:"12px"}}>
                <a href={`mailto:${selected.email}`} style={{flex:1,padding:"8px",borderRadius:"7px",fontSize:"11px",fontWeight:600,textAlign:"center",background:"#0B1F3A",color:"#fff",textDecoration:"none"}}>メール送信</a>
                <button onClick={()=>deleteCandidate(selected.id)} style={{padding:"8px 12px",borderRadius:"7px",fontSize:"11px",fontWeight:600,background:"#FCEBEB",color:"#A32D2D",border:"0.5px solid #F09595",cursor:"pointer"}}>削除</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{background:"#fff",...B,borderTop:"none",borderLeft:"none",borderRight:"none",padding:"0 20px",height:"52px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div><div style={{fontSize:"14px",fontWeight:700,color:"#0B1F3A"}}>CV AI取込 / Import CV</div><div style={{fontSize:"10px",color:"#6B6B6B"}}>PDF取込→分析→DB保存</div></div>
        <button onClick={()=>{setView("list");setImportStep("upload");setAiResult(null);}} style={{padding:"7px 14px",borderRadius:"6px",fontSize:"12px",fontWeight:600,background:"transparent",color:"#0B1F3A",border:"0.5px solid #0B1F3A",cursor:"pointer"}}>← 一覧へ</button>
      </div>
      <div style={{padding:"24px",maxWidth:"860px",margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",marginBottom:"28px"}}>
          {[{n:1,l:"CVアップロード"},{n:2,l:"AI分析・確認"},{n:3,l:"DB保存完了"}].map((s,i)=>{
            const done=(s.n===1&&importStep!=="upload")||(s.n===2&&importStep==="done");
            const active=(s.n===1&&importStep==="upload")||(s.n===2&&importStep==="review")||(s.n===3&&importStep==="done");
            return(<div key={s.n} style={{display:"flex",alignItems:"center",flex:i<2?1:"auto"}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"4px"}}>
                <div style={{width:"32px",height:"32px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",fontWeight:700,background:done?"#27500A":active?"#0B1F3A":"#F1EFE8",color:done||active?"#fff":"#B4B2A9"}}>{done?"✓":s.n}</div>
                <div style={{fontSize:"11px",fontWeight:active?700:400,color:active?"#0B1F3A":"#B4B2A9",whiteSpace:"nowrap"}}>{s.l}</div>
              </div>
              {i<2&&<div style={{flex:1,height:"1px",background:done?"#27500A":"#F1EFE8",margin:"0 8px",marginTop:"-16px"}}/>}
            </div>);
          })}
        </div>

        {importStep==="upload"&&(
          <div onDragOver={e=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)} onDrop={e=>{e.preventDefault();setDragOver(false);const f=e.dataTransfer.files[0];if(f)handleFile(f);}} onClick={()=>!uploading&&fileInputRef.current?.click()} style={{border:`2px dashed ${dragOver?"#0B1F3A":"rgba(11,31,58,0.2)"}`,borderRadius:"14px",padding:"48px 24px",textAlign:"center",cursor:uploading?"default":"pointer",background:dragOver?"#E6F1FB":"#fff"}}>
            {uploading?(<div><div style={{fontSize:"13px",fontWeight:700,color:"#0B1F3A",marginBottom:"16px"}}>分析中... / Đang phân tích...</div><div style={{background:"#F1EFE8",borderRadius:"6px",height:"8px",overflow:"hidden",maxWidth:"400px",margin:"0 auto 12px"}}><div style={{height:"100%",background:"#0B1F3A",borderRadius:"6px",width:`${uploadProgress}%`,transition:"width 0.3s"}}/></div><div style={{fontSize:"12px",color:"#6B6B6B"}}>{uploadProgress}%</div></div>):(
              <div>
                <div style={{width:"56px",height:"56px",borderRadius:"14px",background:"#E6F1FB",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0B1F3A" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></div>
                <div style={{fontSize:"14px",fontWeight:700,color:"#0B1F3A",marginBottom:"6px"}}>ドラッグ＆ドロップ / Kéo thả CV</div>
                <div style={{display:"inline-block",padding:"8px 20px",borderRadius:"7px",background:"#0B1F3A",color:"#fff",fontSize:"12px",fontWeight:600,marginTop:"8px"}}>ファイルを選択</div>
                <div style={{fontSize:"10px",color:"#B4B2A9",marginTop:"12px"}}>PDF, Word · 最大10MB</div>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" style={{display:"none"}} onChange={e=>{const f=e.target.files?.[0];if(f)handleFile(f);}}/>
          </div>
        )}

        {importStep==="review"&&aiResult&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>
            <div style={{background:"#fff",...B,borderRadius:"10px",padding:"16px"}}>
              <div style={{fontSize:"12px",fontWeight:700,color:"#0B1F3A",marginBottom:"12px"}}>AI抽出結果 · {aiResult.fileName}</div>
              {[{f:"name",l:"氏名 *",t:"text"},{f:"email",l:"Email",t:"email"},{f:"phone",l:"電話",t:"text"}].map(x=>(
                <div key={x.f} style={{marginBottom:"10px"}}>
                  <label style={{display:"block",fontSize:"10px",color:"#6B6B6B",marginBottom:"3px",fontWeight:600}}>{x.l}</label>
                  <input type={x.t} value={editForm[x.f]||""} onChange={e=>setEditForm({...editForm,[x.f]:e.target.value})} style={{width:"100%",padding:"7px 10px",borderRadius:"6px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none"}}/>
                </div>
              ))}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"10px"}}>
                <div><label style={{display:"block",fontSize:"10px",color:"#6B6B6B",marginBottom:"3px",fontWeight:600}}>業種</label><select value={editForm.skill||"飲食"} onChange={e=>setEditForm({...editForm,skill:e.target.value})} style={{width:"100%",padding:"7px 10px",borderRadius:"6px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none"}}>{["飲食","製造","農業","ホテル","その他"].map(i=><option key={i}>{i}</option>)}</select></div>
                <div><label style={{display:"block",fontSize:"10px",color:"#6B6B6B",marginBottom:"3px",fontWeight:600}}>日本語</label><select value={editForm.jlpt||"N4"} onChange={e=>setEditForm({...editForm,jlpt:e.target.value})} style={{width:"100%",padding:"7px 10px",borderRadius:"6px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none"}}>{["N1","N2","N3","N4","N5","なし"].map(j=><option key={j}>{j}</option>)}</select></div>
              </div>
              {aiResult.candidate.summaryVn&&<div style={{background:"#F6F7F9",borderRadius:"7px",padding:"10px",marginBottom:"10px",fontSize:"11px",color:"#444",lineHeight:1.6}}>{aiResult.candidate.summaryVn}</div>}
              <div><label style={{display:"block",fontSize:"10px",color:"#6B6B6B",marginBottom:"3px",fontWeight:600}}>備考</label><textarea value={editForm.note||""} onChange={e=>setEditForm({...editForm,note:e.target.value})} rows={2} style={{width:"100%",padding:"7px 10px",borderRadius:"6px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none",resize:"vertical"}}/></div>
            </div>
            <div style={{background:"#fff",...B,borderRadius:"10px",padding:"16px"}}>
              <div style={{fontSize:"12px",fontWeight:700,color:"#0B1F3A",marginBottom:"12px"}}>🎯 AIマッチング求人</div>
              {aiResult.suggestions.map((job)=>(
                <div key={job.id} onClick={()=>setSelectedJobId(job.id)} style={{border:`1.5px solid ${selectedJobId===job.id?"#0B1F3A":"rgba(11,31,58,0.1)"}`,borderRadius:"10px",padding:"10px",marginBottom:"8px",cursor:"pointer",background:selectedJobId===job.id?"#E6F1FB":"#fff"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}>
                    <div><div style={{fontSize:"12px",fontWeight:700,color:"#0B1F3A"}}>{job.company}</div><div style={{fontSize:"10px",color:"#6B6B6B"}}>{job.position_vn}</div></div>
                    <div style={{fontSize:"16px",fontWeight:700,color:(job.matchPct||0)>=70?"#27500A":"#633806"}}>{job.matchPct}%</div>
                  </div>
                  <div style={{background:"#F1EFE8",borderRadius:"3px",height:"4px",overflow:"hidden",marginBottom:"6px"}}><div style={{height:"100%",background:(job.matchPct||0)>=70?"#27500A":"#EF9F27",width:`${job.matchPct}%`}}/></div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:"3px"}}>{(job.reasons||[]).map((r,ri)=><span key={ri} style={{background:"#F6F7F9",color:"#0B1F3A",fontSize:"9px",padding:"2px 6px",borderRadius:"20px"}}>{r}</span>)}</div>
                </div>
              ))}
              <button onClick={saveCandidate} disabled={!editForm.name||saving} style={{width:"100%",padding:"12px",borderRadius:"8px",fontSize:"13px",fontWeight:700,background:editForm.name&&!saving?"#0B1F3A":"#B4B2A9",color:"#fff",border:"none",cursor:editForm.name?"pointer":"not-allowed",marginTop:"8px"}}>
                {saving?"DB保存中...":"✓ DBに保存 / Lưu vào DB"}
              </button>
            </div>
          </div>
        )}

        {importStep==="done"&&(
          <div style={{textAlign:"center",padding:"48px"}}>
            <div style={{width:"64px",height:"64px",borderRadius:"50%",background:"#EAF3DE",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#27500A" strokeWidth="2"><path d="M9 12l2 2 4-4M12 3a9 9 0 100 18 9 9 0 000-18z"/></svg></div>
            <div style={{fontSize:"18px",fontWeight:700,color:"#0B1F3A",marginBottom:"6px"}}>DBに保存完了！/ Đã lưu vào DB!</div>
            <div style={{fontSize:"12px",color:"#6B6B6B"}}>一覧に戻ります...</div>
          </div>
        )}
      </div>
    </div>
  );
}