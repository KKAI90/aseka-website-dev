"use client";
import { useState, useRef } from "react";

type Job = { id:number; company:string; position:string; positionVn:string; industry:string; jlptMin:string; salary:string; location:string; status:string; score:number; matchPct:number; reasons:string[] };
type CandidateAI = { name:string; email:string; phone:string; dateOfBirth:string; gender:string; jlpt:string; industry:string; experienceYears:number; skills:string[]; certifications:string[]; summary:string; summaryVn:string; strengths:string[]; preferredLocation:string; availability:string };
type Candidate = { id:number; name:string; email:string; phone:string; skill:string; jlpt:string; status:string; matchJob:string; matchJobId:number|null; note:string; updated:string; cvFileName?:string; aiData?:CandidateAI };

const INIT: Candidate[] = [
  { id:1, name:"Nguyen Thi Lan",  email:"ntlan@gmail.com",  phone:"090-1234-5678", skill:"飲食",  jlpt:"N3", status:"interview", matchJob:"山本フーズ", matchJobId:1, note:"3年の調理経験あり", updated:"本日", cvFileName:"NTLan_CV.pdf" },
  { id:2, name:"Pham Van Duc",    email:"pvduc@gmail.com",  phone:"090-2345-6789", skill:"製造",  jlpt:"N4", status:"interview", matchJob:"東京工場",   matchJobId:2, note:"溶接資格保有",     updated:"昨日" },
  { id:3, name:"Tran Van Duc",    email:"tvduc@gmail.com",  phone:"090-3456-7890", skill:"ホテル",jlpt:"N3", status:"offered",   matchJob:"グランドホテル大阪", matchJobId:3, note:"接客経験豊富", updated:"2日前" },
];

const ST: Record<string,{ja:string;vn:string;tc:string;tb:string}> = {
  new:      {ja:"新規登録",  vn:"Mới đăng ký",     tc:"#0C447C",tb:"#E6F1FB"},
  interview:{ja:"面接中",    vn:"Đang phỏng vấn",  tc:"#633806",tb:"#FAEEDA"},
  offered:  {ja:"内定済み",  vn:"Đã offer",         tc:"#534AB7",tb:"#EEEDFE"},
  working:  {ja:"就業中",    vn:"Đang làm việc",   tc:"#27500A",tb:"#EAF3DE"},
  quit:     {ja:"退職",      vn:"Nghỉ việc",        tc:"#444441",tb:"#F1EFE8"},
};
const JLPT_C: Record<string,{tc:string;tb:string}> = {
  N1:{tc:"#A32D2D",tb:"#FCEBEB"},N2:{tc:"#633806",tb:"#FAEEDA"},
  N3:{tc:"#27500A",tb:"#EAF3DE"},N4:{tc:"#444441",tb:"#F1EFE8"},N5:{tc:"#6B6B6B",tb:"#F1EFE8"},
};
const IND_C: Record<string,{tc:string;tb:string}> = {
  "飲食":{tc:"#0C447C",tb:"#E6F1FB"},"製造":{tc:"#27500A",tb:"#EAF3DE"},
  "農業":{tc:"#633806",tb:"#FAEEDA"},"ホテル":{tc:"#534AB7",tb:"#EEEDFE"},
};

export default function CandidatesPage() {
  const [cands, setCands] = useState<Candidate[]>(INIT);
  const [selected, setSelected] = useState<Candidate|null>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list"|"import">("list");

  // Import states
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [aiResult, setAiResult] = useState<{candidate:CandidateAI; suggestions:Job[]; fileName:string}|null>(null);
  const [editForm, setEditForm] = useState<Partial<Candidate>>({});
  const [selectedJobId, setSelectedJobId] = useState<number|null>(null);
  const [importStep, setImportStep] = useState<"upload"|"review"|"done">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = cands.filter(c => {
    const ok1=filter==="all"||c.status===filter;
    const ok2=search===""||c.name.toLowerCase().includes(search.toLowerCase())||c.email.includes(search)||(c.matchJob||"").includes(search);
    return ok1&&ok2;
  });
  const counts: Record<string,number> = {all:cands.length};
  Object.keys(ST).forEach(k=>{counts[k]=cands.filter(c=>c.status===k).length;});

  const updateStatus=(id:number,status:string)=>{
    setCands(p=>p.map(c=>c.id===id?{...c,status,updated:"たった今"}:c));
    setSelected(p=>p?.id===id?{...p,status}:p);
  };

  const handleFile = async (file: File) => {
    if (!file) return;
    const allowed = ["application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|doc|docx)$/i)) {
      alert("PDF または Word ファイルを選択してください / Vui lòng chọn file PDF hoặc Word");
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    setImportStep("upload");

    // Simulate progress
    const timer = setInterval(() => {
      setUploadProgress(p => { if(p>=85){clearInterval(timer);return 85;} return p+12; });
    }, 300);

    const fd = new FormData();
    fd.append("cv", file);

    try {
      const res = await fetch("/api/admin/analyze-cv", { method:"POST", body:fd });
      clearInterval(timer);
      setUploadProgress(100);

      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      setAiResult(data);
      setEditForm({
        name: data.candidate.name || "",
        email: data.candidate.email || "",
        phone: data.candidate.phone || "",
        skill: data.candidate.industry || "飲食",
        jlpt: data.candidate.jlpt || "N4",
        note: data.candidate.summaryVn || data.candidate.summary || "",
        cvFileName: data.fileName,
      });
      if (data.suggestions?.[0]) setSelectedJobId(data.suggestions[0].id);
      setTimeout(() => { setUploading(false); setImportStep("review"); }, 500);
    } catch {
      clearInterval(timer);
      setUploading(false);
      alert("AI分析に失敗しました / Phân tích AI thất bại. Vui lòng thử lại.");
    }
  };

  const saveCandidate = () => {
    const job = aiResult?.suggestions.find(j=>j.id===selectedJobId);
    const nc: Candidate = {
      id: Date.now(),
      name: editForm.name||"",
      email: editForm.email||"",
      phone: editForm.phone||"",
      skill: editForm.skill||"飲食",
      jlpt: editForm.jlpt||"N4",
      status: "new",
      matchJob: job?.company || "未定",
      matchJobId: selectedJobId,
      note: editForm.note||"",
      updated: "たった今",
      cvFileName: editForm.cvFileName,
      aiData: aiResult?.candidate,
    };
    setCands([nc, ...cands]);
    setImportStep("done");
    setTimeout(() => { setView("list"); setImportStep("upload"); setAiResult(null); setEditForm({}); setSelectedJobId(null); }, 2000);
  };

  const B = {border:"0.5px solid rgba(11,31,58,0.1)"};
  const navy = "#0B1F3A";

  // ─── LIST VIEW ───
  if (view === "list") return (
    <div>
      <div style={{background:"#fff",...B,borderTop:"none",borderLeft:"none",borderRight:"none",padding:"0 20px",height:"52px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:"14px",fontWeight:700,color:navy}}>人材管理 / Quản lý Ứng viên</div>
          <div style={{fontSize:"10px",color:"#6B6B6B"}}>CV AI分析・求人マッチング · Phân tích CV bằng AI</div>
        </div>
        <div style={{display:"flex",gap:"8px"}}>
          <input type="text" placeholder="名前・メールで検索..." value={search} onChange={e=>setSearch(e.target.value)} style={{padding:"6px 10px",borderRadius:"6px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none",width:"180px"}}/>
          <button onClick={()=>setView("import")} style={{padding:"7px 14px",borderRadius:"6px",fontSize:"12px",fontWeight:700,background:"#C8002A",color:"#fff",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:"5px"}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            CV AI取込 / Import CV
          </button>
        </div>
      </div>
      <div style={{padding:"16px 20px"}}>
        <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"14px"}}>
          {[{key:"all",ja:"全件",vn:"Tất cả"},...Object.entries(ST).map(([k,v])=>({key:k,ja:v.ja,vn:v.vn}))].map(t=>(
            <button key={t.key} onClick={()=>setFilter(t.key)} style={{padding:"5px 12px",borderRadius:"20px",fontSize:"11px",fontWeight:600,border:`1px solid ${filter===t.key?navy:"rgba(11,31,58,0.15)"}`,background:filter===t.key?navy:"#fff",color:filter===t.key?"#fff":"#6B6B6B",cursor:"pointer",whiteSpace:"nowrap"}}>
              {t.ja} · {t.vn} ({counts[t.key]||0})
            </button>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:selected?"1fr 360px":"1fr",gap:"12px"}}>
          <div style={{background:"#fff",...B,borderRadius:"10px",overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:"12px"}}>
              <thead><tr style={{background:"#F6F7F9"}}>
                {["候補者 / Ứng viên","業種","日本語","マッチ先 / Công việc","CV","ステータス","更新"].map(h=>(
                  <th key={h} style={{padding:"9px 12px",textAlign:"left",fontSize:"10px",color:"#6B6B6B",fontWeight:600,borderBottom:"0.5px solid rgba(11,31,58,0.1)",whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filtered.map(c=>{
                  const st=ST[c.status]; const jc=JLPT_C[c.jlpt]||JLPT_C["N5"]; const ic=IND_C[c.skill]||IND_C["飲食"];
                  const initials=c.name.split(" ").slice(-2).map((w:string)=>w[0]).join("").toUpperCase();
                  return(
                    <tr key={c.id} onClick={()=>setSelected(selected?.id===c.id?null:c)} style={{borderBottom:"0.5px solid rgba(11,31,58,0.05)",cursor:"pointer",background:selected?.id===c.id?"#E6F1FB":"transparent"}}>
                      <td style={{padding:"10px 12px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:"7px"}}>
                          <div style={{width:"30px",height:"30px",borderRadius:"50%",background:st.tb,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px",fontWeight:700,color:st.tc,flexShrink:0}}>{initials}</div>
                          <div>
                            <div style={{fontWeight:600,color:navy}}>{c.name}</div>
                            <div style={{fontSize:"10px",color:"#6B6B6B"}}>{c.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{padding:"10px 12px"}}><span style={{background:ic.tb,color:ic.tc,fontSize:"10px",fontWeight:700,padding:"2px 7px",borderRadius:"4px"}}>{c.skill}</span></td>
                      <td style={{padding:"10px 12px"}}><span style={{background:jc.tb,color:jc.tc,fontSize:"10px",fontWeight:700,padding:"2px 7px",borderRadius:"4px"}}>{c.jlpt}</span></td>
                      <td style={{padding:"10px 12px",fontSize:"11px",color:c.matchJob!=="未定"?"#185FA5":"#6B6B6B",fontWeight:c.matchJob!=="未定"?600:400}}>{c.matchJob}</td>
                      <td style={{padding:"10px 12px"}}>
                        {c.cvFileName ? (
                          <div style={{display:"flex",alignItems:"center",gap:"4px"}}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C8002A" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                            <span style={{fontSize:"10px",color:"#C8002A",fontWeight:600}}>CV</span>
                          </div>
                        ) : <span style={{fontSize:"10px",color:"#B4B2A9"}}>なし</span>}
                      </td>
                      <td style={{padding:"10px 12px"}}>
                        <div style={{background:st.tb,color:st.tc,fontSize:"10px",fontWeight:700,padding:"2px 7px",borderRadius:"4px",display:"inline-block"}}>{st.ja}</div>
                      </td>
                      <td style={{padding:"10px 12px",fontSize:"10px",color:"#6B6B6B"}}>{c.updated}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {selected && (
            <div style={{background:"#fff",...B,borderRadius:"10px",padding:"16px",height:"fit-content",position:"sticky",top:"16px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"12px"}}>
                <div>
                  <div style={{fontSize:"15px",fontWeight:700,color:navy}}>{selected.name}</div>
                  <div style={{fontSize:"10px",color:"#6B6B6B"}}>{selected.skill} · {selected.jlpt} · {ST[selected.status]?.ja}</div>
                </div>
                <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",cursor:"pointer",color:"#6B6B6B",fontSize:"18px"}}>×</button>
              </div>

              {/* CV Badge */}
              {selected.cvFileName && (
                <div style={{display:"flex",alignItems:"center",gap:"7px",background:"#FCEBEB",borderRadius:"7px",padding:"8px 12px",marginBottom:"12px"}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8002A" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                  <div style={{flex:1}}>
                    <div style={{fontSize:"11px",fontWeight:700,color:"#A32D2D"}}>CV登録済み / Đã có CV</div>
                    <div style={{fontSize:"10px",color:"#C8002A"}}>{selected.cvFileName}</div>
                  </div>
                  <span style={{background:"#C8002A",color:"#fff",fontSize:"9px",fontWeight:700,padding:"2px 6px",borderRadius:"3px"}}>AI分析済</span>
                </div>
              )}

              {/* AI Insights */}
              {selected.aiData && (
                <div style={{background:"#F6F7F9",borderRadius:"8px",padding:"10px 12px",marginBottom:"12px"}}>
                  <div style={{fontSize:"10px",fontWeight:700,color:navy,marginBottom:"6px",display:"flex",alignItems:"center",gap:"5px"}}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={navy} strokeWidth="2"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                    AI分析結果 / Kết quả phân tích AI
                  </div>
                  <div style={{fontSize:"11px",color:"#444441",lineHeight:1.55,marginBottom:"6px"}}>{selected.aiData.summaryVn}</div>
                  {selected.aiData.strengths?.length > 0 && (
                    <div style={{display:"flex",flexWrap:"wrap",gap:"4px"}}>
                      {selected.aiData.strengths.map((s,i)=>(
                        <span key={i} style={{background:"#fff",border:"0.5px solid rgba(11,31,58,0.15)",borderRadius:"20px",padding:"2px 8px",fontSize:"10px",color:"#444441"}}>{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Info */}
              {[{l:"Email",v:selected.email},{l:"電話",v:selected.phone},{l:"マッチ先",v:selected.matchJob},{l:"備考",v:selected.note}].map(r=>(
                <div key={r.l} style={{display:"flex",gap:"8px",marginBottom:"7px",fontSize:"12px"}}>
                  <span style={{color:"#6B6B6B",width:"70px",flexShrink:0}}>{r.l}</span>
                  <span style={{color:navy,fontWeight:500,flex:1,wordBreak:"break-word"}}>{r.v||"—"}</span>
                </div>
              ))}

              {/* Status */}
              <div style={{borderTop:"0.5px solid rgba(11,31,58,0.08)",paddingTop:"12px",marginTop:"8px"}}>
                <div style={{fontSize:"10px",color:"#6B6B6B",fontWeight:600,marginBottom:"7px"}}>ステータス変更 / Đổi trạng thái</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:"5px"}}>
                  {Object.entries(ST).map(([k,v])=>(
                    <button key={k} onClick={()=>updateStatus(selected.id,k)} style={{padding:"4px 8px",borderRadius:"5px",fontSize:"10px",fontWeight:600,cursor:"pointer",background:selected.status===k?v.tc:v.tb,color:selected.status===k?"#fff":v.tc,border:`1px solid ${v.tc}`}}>
                      {v.ja}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{display:"flex",gap:"7px",marginTop:"12px"}}>
                <a href={`mailto:${selected.email}`} style={{flex:1,padding:"8px",borderRadius:"7px",fontSize:"11px",fontWeight:600,textAlign:"center",background:navy,color:"#fff",textDecoration:"none"}}>メール送信</a>
                {selected.phone && <a href={`tel:${selected.phone}`} style={{flex:1,padding:"8px",borderRadius:"7px",fontSize:"11px",fontWeight:600,textAlign:"center",background:"#EAF3DE",color:"#27500A",textDecoration:"none",border:"0.5px solid #27500A"}}>電話する</a>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ─── IMPORT VIEW ───
  return (
    <div>
      <div style={{background:"#fff",...B,borderTop:"none",borderLeft:"none",borderRight:"none",padding:"0 20px",height:"52px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:"14px",fontWeight:700,color:navy}}>CV AI取込 / Import CV bằng AI</div>
          <div style={{fontSize:"10px",color:"#6B6B6B"}}>PDF・Wordアップロード → AI自動分析 → 求人マッチング</div>
        </div>
        <button onClick={()=>{setView("list");setImportStep("upload");setAiResult(null);}} style={{padding:"7px 14px",borderRadius:"6px",fontSize:"12px",fontWeight:600,background:"transparent",color:navy,border:`0.5px solid ${navy}`,cursor:"pointer"}}>
          ← 一覧へ / Danh sách
        </button>
      </div>

      <div style={{padding:"24px",maxWidth:"860px",margin:"0 auto"}}>
        {/* Steps */}
        <div style={{display:"flex",alignItems:"center",gap:"0",marginBottom:"28px"}}>
          {[{n:1,label:"CVアップロード",sub:"Upload"},{n:2,label:"AI分析・確認",sub:"Review"},{n:3,label:"登録完了",sub:"Done"}].map((s,i)=>{
            const done = (s.n===1&&importStep!=="upload") || (s.n===2&&importStep==="done");
            const active = (s.n===1&&importStep==="upload") || (s.n===2&&importStep==="review") || (s.n===3&&importStep==="done");
            return(
              <div key={s.n} style={{display:"flex",alignItems:"center",flex:i<2?1:"auto"}}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"4px"}}>
                  <div style={{width:"32px",height:"32px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",fontWeight:700,background:done?"#27500A":active?navy:"#F1EFE8",color:done||active?"#fff":"#B4B2A9",transition:"all 0.3s"}}>
                    {done ? "✓" : s.n}
                  </div>
                  <div style={{fontSize:"11px",fontWeight:active?700:400,color:active?navy:"#B4B2A9",whiteSpace:"nowrap"}}>{s.label}</div>
                  <div style={{fontSize:"9px",color:"#B4B2A9"}}>{s.sub}</div>
                </div>
                {i<2&&<div style={{flex:1,height:"1px",background:done?"#27500A":"#F1EFE8",margin:"0 8px",marginTop:"-20px",transition:"background 0.3s"}}/>}
              </div>
            );
          })}
        </div>

        {/* STEP 1: Upload */}
        {importStep === "upload" && (
          <div>
            <div
              onDragOver={e=>{e.preventDefault();setDragOver(true);}}
              onDragLeave={()=>setDragOver(false)}
              onDrop={e=>{e.preventDefault();setDragOver(false);const f=e.dataTransfer.files[0];if(f)handleFile(f);}}
              onClick={()=>!uploading&&fileInputRef.current?.click()}
              style={{border:`2px dashed ${dragOver?"#0B1F3A":"rgba(11,31,58,0.2)"}`,borderRadius:"14px",padding:"48px 24px",textAlign:"center",cursor:uploading?"default":"pointer",background:dragOver?"#E6F1FB":"#fff",transition:"all 0.2s",marginBottom:"20px"}}
            >
              {uploading ? (
                <div>
                  <div style={{fontSize:"13px",fontWeight:700,color:navy,marginBottom:"16px"}}>
                    AIがCVを分析中... / AI đang phân tích CV...
                  </div>
                  <div style={{background:"#F1EFE8",borderRadius:"6px",height:"8px",overflow:"hidden",maxWidth:"400px",margin:"0 auto 12px"}}>
                    <div style={{height:"100%",background:navy,borderRadius:"6px",width:`${uploadProgress}%`,transition:"width 0.3s"}}/>
                  </div>
                  <div style={{fontSize:"12px",color:"#6B6B6B"}}>{uploadProgress}% — {uploadProgress<40?"ファイル読み込み中...":uploadProgress<80?"テキスト抽出中...":"マッチング計算中..."}</div>
                </div>
              ) : (
                <div>
                  <div style={{width:"56px",height:"56px",borderRadius:"14px",background:"#E6F1FB",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={navy} strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  </div>
                  <div style={{fontSize:"14px",fontWeight:700,color:navy,marginBottom:"6px"}}>CVをドラッグ＆ドロップ / Kéo thả CV vào đây</div>
                  <div style={{fontSize:"12px",color:"#6B6B6B",marginBottom:"16px"}}>または / hoặc</div>
                  <div style={{display:"inline-block",padding:"8px 20px",borderRadius:"7px",background:navy,color:"#fff",fontSize:"12px",fontWeight:600}}>ファイルを選択 / Chọn file</div>
                  <div style={{fontSize:"10px",color:"#B4B2A9",marginTop:"14px"}}>対応形式 / Định dạng: PDF, Word (.doc, .docx) · 最大10MB</div>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" style={{display:"none"}} onChange={e=>{const f=e.target.files?.[0];if(f)handleFile(f);}}/>

            {/* Tips */}
            <div style={{background:"#F6F7F9",borderRadius:"10px",padding:"14px 16px"}}>
              <div style={{fontSize:"11px",fontWeight:700,color:navy,marginBottom:"8px"}}>💡 AIが自動で抽出します / AI tự động trích xuất:</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"5px"}}>
                {[
                  "氏名・連絡先 / Họ tên, liên hệ",
                  "日本語レベル / Trình độ tiếng Nhật",
                  "職歴・経験年数 / Kinh nghiệm làm việc",
                  "資格・スキル / Chứng chỉ, kỹ năng",
                  "希望業種 / Ngành nghề phù hợp",
                  "求人マッチング / Suggest công việc",
                ].map((t,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"11px",color:"#444441"}}>
                    <div style={{width:"5px",height:"5px",borderRadius:"50%",background:"#27500A",flexShrink:0}}/>
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Review */}
        {importStep === "review" && aiResult && (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>
            {/* Left: AI extracted info */}
            <div>
              <div style={{background:"#fff",...B,borderRadius:"10px",padding:"16px",marginBottom:"12px"}}>
                <div style={{display:"flex",alignItems:"center",gap:"7px",marginBottom:"14px"}}>
                  <div style={{width:"28px",height:"28px",borderRadius:"7px",background:"#E6F1FB",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={navy} strokeWidth="2"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                  </div>
                  <div>
                    <div style={{fontSize:"12px",fontWeight:700,color:navy}}>AI分析結果 / Kết quả AI</div>
                    <div style={{fontSize:"10px",color:"#6B6B6B"}}>{aiResult.fileName}</div>
                  </div>
                  <span style={{marginLeft:"auto",background:"#EAF3DE",color:"#27500A",fontSize:"9px",fontWeight:700,padding:"2px 7px",borderRadius:"20px"}}>分析完了 · Done</span>
                </div>

                {/* Editable fields */}
                {[
                  {f:"name",  l:"氏名 / Họ tên *",    t:"text"},
                  {f:"email", l:"Email",               t:"email"},
                  {f:"phone", l:"電話 / SĐT",          t:"text"},
                ].map(x=>(
                  <div key={x.f} style={{marginBottom:"10px"}}>
                    <label style={{display:"block",fontSize:"10px",color:"#6B6B6B",marginBottom:"3px",fontWeight:600}}>{x.l}</label>
                    <input type={x.t} value={(editForm as Record<string,string>)[x.f]||""} onChange={e=>setEditForm({...editForm,[x.f]:e.target.value})} style={{width:"100%",padding:"7px 10px",borderRadius:"6px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none"}}/>
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
                      {["N1","N2","N3","N4","N5","なし"].map(j=><option key={j}>{j}</option>)}
                    </select>
                  </div>
                </div>

                {/* AI summary */}
                {aiResult.candidate.summaryVn && (
                  <div style={{background:"#F6F7F9",borderRadius:"7px",padding:"10px 12px",marginBottom:"10px"}}>
                    <div style={{fontSize:"10px",color:"#6B6B6B",fontWeight:600,marginBottom:"4px"}}>AI要約 / Tóm tắt AI</div>
                    <div style={{fontSize:"11px",color:"#444441",lineHeight:1.6}}>{aiResult.candidate.summaryVn}</div>
                  </div>
                )}

                {/* Skills */}
                {aiResult.candidate.skills?.length > 0 && (
                  <div style={{marginBottom:"10px"}}>
                    <div style={{fontSize:"10px",color:"#6B6B6B",fontWeight:600,marginBottom:"5px"}}>スキル / Kỹ năng</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:"4px"}}>
                      {aiResult.candidate.skills.map((s,i)=>(
                        <span key={i} style={{background:"#E6F1FB",color:"#0C447C",fontSize:"10px",fontWeight:600,padding:"2px 8px",borderRadius:"20px"}}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label style={{display:"block",fontSize:"10px",color:"#6B6B6B",marginBottom:"3px",fontWeight:600}}>備考 / Ghi chú</label>
                  <textarea value={editForm.note||""} onChange={e=>setEditForm({...editForm,note:e.target.value})} rows={2} style={{width:"100%",padding:"7px 10px",borderRadius:"6px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none",resize:"vertical"}}/>
                </div>
              </div>
            </div>

            {/* Right: Job suggestions */}
            <div>
              <div style={{background:"#fff",...B,borderRadius:"10px",padding:"16px"}}>
                <div style={{fontSize:"12px",fontWeight:700,color:navy,marginBottom:"4px"}}>🎯 AIマッチング求人 / AI Suggest công việc</div>
                <div style={{fontSize:"10px",color:"#6B6B6B",marginBottom:"14px"}}>業種・日本語・経験から最適な求人を提案 · Dựa vào ngành, tiếng Nhật, kinh nghiệm</div>

                {aiResult.suggestions.map((job,i)=>(
                  <div key={job.id} onClick={()=>setSelectedJobId(job.id)} style={{border:`1.5px solid ${selectedJobId===job.id?navy:"rgba(11,31,58,0.1)"}`,borderRadius:"10px",padding:"12px",marginBottom:"10px",cursor:"pointer",background:selectedJobId===job.id?"#E6F1FB":"#fff",transition:"all 0.15s"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:"7px"}}>
                        <div style={{width:"24px",height:"24px",borderRadius:"50%",background:i===0?"#0B1F3A":i===1?"#E6F1FB":"#F1EFE8",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px",fontWeight:700,color:i===0?"#fff":navy,flexShrink:0}}>{i+1}</div>
                        <div>
                          <div style={{fontSize:"12px",fontWeight:700,color:navy}}>{job.company}</div>
                          <div style={{fontSize:"10px",color:"#6B6B6B"}}>{job.positionVn} · {job.location}</div>
                        </div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:"16px",fontWeight:700,color:job.matchPct>=70?"#27500A":job.matchPct>=40?"#633806":"#6B6B6B"}}>{job.matchPct}%</div>
                        <div style={{fontSize:"9px",color:"#6B6B6B"}}>マッチ度</div>
                      </div>
                    </div>

                    {/* Match bar */}
                    <div style={{background:"#F1EFE8",borderRadius:"4px",height:"4px",overflow:"hidden",marginBottom:"8px"}}>
                      <div style={{height:"100%",background:job.matchPct>=70?"#27500A":job.matchPct>=40?"#EF9F27":"#B4B2A9",borderRadius:"4px",width:`${job.matchPct}%`,transition:"width 0.5s"}}/>
                    </div>

                    {/* Reasons */}
                    <div style={{display:"flex",flexWrap:"wrap",gap:"3px",marginBottom:"6px"}}>
                      {job.reasons.map((r,ri)=>(
                        <span key={ri} style={{background:selectedJobId===job.id?"rgba(11,31,58,0.08)":"#F6F7F9",color:navy,fontSize:"9px",padding:"2px 7px",borderRadius:"20px"}}>{r}</span>
                      ))}
                    </div>

                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:"11px",fontWeight:700,color:"#27500A"}}>{job.salary}</span>
                      <span style={{background:job.status==="urgent"?"#FCEBEB":"#E6F1FB",color:job.status==="urgent"?"#A32D2D":"#0C447C",fontSize:"9px",fontWeight:700,padding:"2px 6px",borderRadius:"4px"}}>{job.status==="urgent"?"⚡ 緊急":job.status==="open"?"募集中":"停止中"}</span>
                    </div>

                    {selectedJobId===job.id && (
                      <div style={{marginTop:"8px",paddingTop:"8px",borderTop:"0.5px solid rgba(11,31,58,0.08)",display:"flex",alignItems:"center",gap:"5px"}}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#27500A" strokeWidth="2"><path d="M9 12l2 2 4-4M12 3a9 9 0 100 18 9 9 0 000-18z"/></svg>
                        <span style={{fontSize:"10px",color:"#27500A",fontWeight:700}}>この求人に登録します / Sẽ đăng ký công việc này</span>
                      </div>
                    )}
                  </div>
                ))}

                <button onClick={()=>setSelectedJobId(null)} style={{width:"100%",padding:"8px",borderRadius:"7px",fontSize:"11px",color:"#6B6B6B",border:"0.5px solid rgba(11,31,58,0.15)",background:"transparent",cursor:"pointer",marginTop:"4px"}}>
                  マッチなし / Chưa có công việc phù hợp
                </button>
              </div>

              <button onClick={saveCandidate} disabled={!editForm.name} style={{width:"100%",padding:"12px",borderRadius:"8px",fontSize:"13px",fontWeight:700,background:editForm.name?navy:"#B4B2A9",color:"#fff",border:"none",cursor:editForm.name?"pointer":"not-allowed",marginTop:"12px",transition:"background 0.2s"}}>
                ✓ 登録する · Lưu ứng viên vào hệ thống
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Done */}
        {importStep === "done" && (
          <div style={{textAlign:"center",padding:"48px 24px"}}>
            <div style={{width:"64px",height:"64px",borderRadius:"50%",background:"#EAF3DE",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#27500A" strokeWidth="2"><path d="M9 12l2 2 4-4M12 3a9 9 0 100 18 9 9 0 000-18z"/></svg>
            </div>
            <div style={{fontSize:"18px",fontWeight:700,color:navy,marginBottom:"6px"}}>登録完了！/ Đã lưu thành công!</div>
            <div style={{fontSize:"12px",color:"#6B6B6B"}}>一覧に戻ります... / Đang chuyển về danh sách...</div>
          </div>
        )}
      </div>
    </div>
  );
}