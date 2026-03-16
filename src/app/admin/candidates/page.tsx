"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

/* ─── Types ─────────────────────────────────────────────── */
type Edu  = { year:string; month:string; school:string; event:string };
type Work = { year:string; month:string; company:string; position:string; event:string };
type Cert = { year:string; month:string; name:string; result:string };
type Job  = { id:string; company:string; position_ja:string; position_vn:string; industry:string; jlpt_min:string; salary:string; location:string; status:string; score:number; matchPct:number; reasons:string[] };

type Candidate = {
  id:string; name:string; name_kana:string; email:string; phone:string;
  gender:string; date_of_birth:string; nationality:string; address:string;
  visa_type:string; visa_expiry:string; jlpt:string; jlpt_actual:string;
  height_cm:number|null; weight_kg:number|null;
  skill:string; preferred_job:string; work_hours:string; availability:string;
  marital_status:string; dependents:number;
  education:Edu[]; work_history:Work[]; certifications:Cert[];
  motivation:string; self_pr:string;
  status:string; match_job_id:string|null; match_job_name:string;
  note:string; cv_filename:string|null; ai_data:Record<string,unknown>|null;
  created_at:string; updated_at:string;
};

type FileItem = {
  file:File; id:string;
  status:"waiting"|"analyzing"|"done"|"error";
  progress:number;
  result?:{ success:boolean; fileName:string; candidate?:Record<string,unknown>; suggestions?:Job[]; error?:string };
};

/* ─── Constants ──────────────────────────────────────────── */
const ST: Record<string,{ja:string;vn:string;tc:string;tb:string}> = {
  new:      {ja:"新規",   vn:"Mới",       tc:"#0C447C",tb:"#E6F1FB"},
  interview:{ja:"面接中", vn:"Phỏng vấn", tc:"#633806",tb:"#FAEEDA"},
  offered:  {ja:"内定済", vn:"Đã offer",  tc:"#534AB7",tb:"#EEEDFE"},
  working:  {ja:"就業中", vn:"Đang làm",  tc:"#27500A",tb:"#EAF3DE"},
  quit:     {ja:"退職",   vn:"Nghỉ",      tc:"#444441",tb:"#F1EFE8"},
};
const JC: Record<string,{tc:string;tb:string}> = {
  N1:{tc:"#A32D2D",tb:"#FCEBEB"},N2:{tc:"#633806",tb:"#FAEEDA"},
  N3:{tc:"#27500A",tb:"#EAF3DE"},N4:{tc:"#444441",tb:"#F1EFE8"},N5:{tc:"#6B6B6B",tb:"#F1EFE8"},
};
const navy="#0B1F3A";
const B={border:"0.5px solid rgba(11,31,58,0.1)"};
const fmt=(b:number)=>b>1048576?`${(b/1048576).toFixed(1)}MB`:`${(b/1024).toFixed(0)}KB`;
const fmtDate=(s:string)=>s?new Date(s).toLocaleDateString("ja-JP"):"—";

/* ─── Export CV as HTML ──────────────────────────────────── */
function exportCV(c: Candidate) {
  const html = `<!DOCTYPE html>
<html lang="ja"><head><meta charset="UTF-8"><title>履歴書 - ${c.name}</title>
<style>
body{font-family:'Noto Sans JP',sans-serif;max-width:800px;margin:0 auto;padding:24px;color:#0B1F3A}
h1{font-size:22px;text-align:center;margin-bottom:4px}
.sub{text-align:center;color:#6B6B6B;font-size:13px;margin-bottom:20px}
table{width:100%;border-collapse:collapse;margin-bottom:16px}
th,td{border:1px solid #ddd;padding:8px 12px;font-size:13px}
th{background:#F6F7F9;font-weight:600;width:180px;text-align:left}
.section{font-size:14px;font-weight:700;background:#0B1F3A;color:#fff;padding:6px 12px;margin:16px 0 8px;border-radius:4px}
.tag{display:inline-block;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600;margin:2px}
.timeline{font-size:12px;line-height:2}
.footer{margin-top:24px;text-align:center;font-size:11px;color:#999}
@media print{body{padding:0}}
</style></head>
<body>
<h1>履歴書 / Hồ sơ ứng viên</h1>
<div class="sub">作成日 ${new Date().toLocaleDateString("ja-JP")}</div>

<div class="section">基本情報 / Thông tin cơ bản</div>
<table>
<tr><th>氏名</th><td><strong>${c.name}</strong>${c.name_kana?` (${c.name_kana})`:""}</td></tr>
<tr><th>性別 / 生年月日</th><td>${c.gender||"—"} / ${c.date_of_birth?new Date(c.date_of_birth).toLocaleDateString("ja-JP"):"—"}</td></tr>
<tr><th>連絡先</th><td>${c.email||"—"} / ${c.phone||"—"}</td></tr>
<tr><th>住所</th><td>${c.address||"ベトナム"}</td></tr>
<tr><th>在留資格</th><td>${c.visa_type||"—"} ${c.visa_expiry?`（期限: ${new Date(c.visa_expiry).toLocaleDateString("ja-JP")}）`:""}</td></tr>
<tr><th>日本語能力</th><td><span class="tag" style="background:#EAF3DE;color:#27500A">${c.jlpt||"—"}</span> ${c.jlpt_actual?`(${c.jlpt_actual})`:""}</td></tr>
<tr><th>身長 / 体重</th><td>${c.height_cm?`${c.height_cm}cm`:"—"} / ${c.weight_kg?`${c.weight_kg}kg`:"—"}</td></tr>
<tr><th>婚姻 / 扶養</th><td>${c.marital_status||"—"} / ${c.dependents||0}人</td></tr>
<tr><th>希望職種</th><td>${c.preferred_job||"—"}</td></tr>
<tr><th>就業可能日</th><td>${c.availability||"即日"}</td></tr>
</table>

${(c.education||[]).length>0?`
<div class="section">学歴 / Học vấn</div>
<table>
<tr><th>年月</th><th>学校名</th><th>区分</th></tr>
${(c.education||[]).map(e=>`<tr><td>${e.year||""}年${e.month||""}月</td><td>${e.school||""}</td><td>${e.event||""}</td></tr>`).join("")}
</table>`:""}

${(c.work_history||[]).length>0?`
<div class="section">職歴 / Kinh nghiệm làm việc</div>
<table>
<tr><th>年月</th><th>会社名</th><th>職種</th><th>区分</th></tr>
${(c.work_history||[]).map(w=>`<tr><td>${w.year||""}年${w.month||""}月</td><td>${w.company||""}</td><td>${w.position||""}</td><td>${w.event||""}</td></tr>`).join("")}
</table>`:""}

${(c.certifications||[]).length>0?`
<div class="section">免許・資格 / Chứng chỉ</div>
<table>
<tr><th>年月</th><th>資格名</th><th>結果</th></tr>
${(c.certifications||[]).map(ct=>`<tr><td>${ct.year||""}年${ct.month||""}月</td><td>${ct.name||""}</td><td>${ct.result||""}</td></tr>`).join("")}
</table>`:""}

${c.motivation?`<div class="section">志望動機</div><p style="font-size:13px;line-height:1.8;padding:8px">${c.motivation}</p>`:""}
${c.self_pr?`<div class="section">自己PR</div><p style="font-size:13px;line-height:1.8;padding:8px">${c.self_pr}</p>`:""}

<div class="footer">Generated by Aseka株式会社 Back Office System</div>
</body></html>`;

  const blob = new Blob([html], { type:"text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `CV_${c.name.replace(/\s+/g,"_")}.html`;
  a.click(); URL.revokeObjectURL(url);
}

/* ─── Main Component ─────────────────────────────────────── */
export default function CandidatesPage() {
  const router = useRouter();
  const [cands, setCands] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Candidate|null>(null);
  const [detailTab, setDetailTab] = useState<"basic"|"history"|"pr"|"match">("basic");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list"|"import"|"review">("list");
  const [fileItems, setFileItems] = useState<FileItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentReview, setCurrentReview] = useState<{candidate:Record<string,unknown>;suggestions:Job[];fileName:string}|null>(null);
  const [editForm, setEditForm] = useState<Record<string,string>>({});
  const [selectedJobId, setSelectedJobId] = useState<string|null>(null);
  const [saving, setSaving] = useState(false);
  const [matchResults, setMatchResults] = useState<Job[]>([]);
  const [matching, setMatching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async (s?:string) => {
    const p = new URLSearchParams();
    if (filter!=="all") p.set("status",filter);
    const q = s!==undefined?s:search;
    if (q) p.set("search",q);
    const res = await fetch(`/api/admin/candidates?${p}`);
    if (res.status===401){router.push("/admin/login");return;}
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
    if (!confirm("削除しますか？/ Xóa ứng viên này?")) return;
    await fetch(`/api/admin/candidates?id=${id}`,{method:"DELETE"});
    setCands(p=>p.filter(c=>c.id!==id));
    setSelected(null);
  };

  const runMatch = async (cand: Candidate) => {
    setMatching(true); setMatchResults([]);
    try {
      const res = await fetch("/api/admin/match-candidates",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ candidateId: cand.id }),
      });
      const d = await res.json();
      setMatchResults((d.matches||[]) as Job[]);
    } catch { setMatchResults([]); }
    setMatching(false);
  };

  /* File handling */
  const addFiles = (files: FileList|File[]) => {
    const arr = Array.from(files).filter(f=>/\.(pdf|doc|docx)$/i.test(f.name));
    const toAdd = arr.slice(0, 5-fileItems.length).map(file=>({
      file, id:Math.random().toString(36).slice(2),
      status:"waiting" as const, progress:0,
    }));
    setFileItems(p=>[...p,...toAdd]);
  };

  const extractText = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const ab = await file.arrayBuffer();
    if (ext === "docx" || ext === "doc") {
      try {
        // Extract XML text from DOCX zip structure
        const bytes = new Uint8Array(ab);
        let xmlText = "";
        // Search for word/document.xml content in binary
        const marker = "word/document.xml";
        const markerBytes = marker.split("").map(c=>c.charCodeAt(0));
        for (let i=0; i<bytes.length-markerBytes.length; i++) {
          let match = true;
          for (let j=0; j<markerBytes.length; j++) {
            if (bytes[i+j] !== markerBytes[j]) { match=false; break; }
          }
          if (match) {
            const chunk = bytes.slice(i, Math.min(i+60000, bytes.length));
            xmlText = new TextDecoder("utf-8", {fatal:false}).decode(chunk);
            break;
          }
        }
        if (xmlText) {
          return xmlText.replace(/<[^>]+>/g," ").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&")
            .replace(/[^\u0020-\u007E\u00C0-\u024F\u3000-\u9FFF\uFF00-\uFFEF\n]/g," ")
            .replace(/\s+/g," ").trim().slice(0,5000);
        }
      } catch { /* fallback */ }
    }
    // PDF or fallback
    try {
      const text = new TextDecoder("utf-8", {fatal:false}).decode(new Uint8Array(ab));
      return text.replace(/[^\u0020-\u007E\u00C0-\u024F\u3000-\u9FFF\uFF00-\uFFEF\n]/g," ")
        .replace(/\s+/g," ").trim().slice(0,5000);
    } catch { return ""; }
  };

  const analyzeAll = async () => {
    if (!fileItems.length) return;
    setIsAnalyzing(true);
    setFileItems(p=>p.map(f=>({...f,status:"analyzing",progress:0})));
    const timers: Record<string,ReturnType<typeof setInterval>> = {};
    fileItems.forEach(item=>{
      timers[item.id] = setInterval(()=>{
        setFileItems(p=>p.map(f=>f.id===item.id&&f.status==="analyzing"?{...f,progress:Math.min(f.progress+8,85)}:f));
      },200);
    });
    try {
      // Extract text CLIENT-SIDE → send only text (avoid 413 error)
      const filesWithText = await Promise.all(
        fileItems.map(async item => ({
          fileName: item.file.name,
          fileSize: item.file.size,
          text: await extractText(item.file),
        }))
      );
      const res = await fetch("/api/admin/analyze-cv",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({files:filesWithText}),
      });
      const data = await res.json();
      Object.values(timers).forEach(t=>clearInterval(t));
      if (data.results) {
        setFileItems(p=>p.map((f,i)=>{
          const r = data.results[i];
          if (!r) return {...f,status:"error",progress:100};
          return {...f,status:r.success?"done":"error",progress:100,result:r};
        }));
      }
    } catch (err) {
      console.error("analyzeAll error:", err);
      Object.values(timers).forEach(t=>clearInterval(t));
      setFileItems(p=>p.map(f=>({...f,status:"error",progress:100})));
    }
    setIsAnalyzing(false);
  };


  const openReview = (item: FileItem) => {
    if (!item.result?.candidate) return;
    const c = item.result.candidate;
    setCurrentReview({ candidate:c, suggestions:(item.result.suggestions||[]) as Job[], fileName:item.result.fileName });
    setEditForm({
      name:        String(c.name||""),
      name_kana:   String(c.name_kana||""),
      email:       String(c.email||""),
      phone:       String(c.phone||""),
      gender:      String(c.gender||""),
      date_of_birth: String(c.date_of_birth||""),
      visa_type:   String(c.visa_type||""),
      visa_expiry: String(c.visa_expiry||""),
      jlpt:        String(c.jlpt||"N4"),
      jlpt_actual: String(c.jlpt_actual||""),
      height_cm:   String(c.height_cm||""),
      weight_kg:   String(c.weight_kg||""),
      skill:       String(c.skill||"飲食"),
      preferred_job: String(c.preferred_job||""),
      work_hours:  String(c.work_hours||""),
      availability:String(c.availability||""),
      marital_status: String(c.marital_status||""),
      dependents:  String(c.dependents||"0"),
      motivation:  String(c.motivation||""),
      self_pr:     String(c.self_pr||""),
      note:        String((c as Record<string,unknown>).summary_vn||""),
      cv_filename: item.result.fileName,
    });
    if (item.result.suggestions?.[0]) setSelectedJobId(item.result.suggestions[0].id);
    setView("review");
  };

  const saveCandidate = async () => {
    if (!editForm.name || !currentReview) return;
    setSaving(true);
    const job = currentReview.suggestions?.find(j=>j.id===selectedJobId);
    const c = currentReview.candidate;
    const res = await fetch("/api/admin/candidates",{
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        ...editForm,
        height_cm: editForm.height_cm ? Number(editForm.height_cm) : null,
        weight_kg: editForm.weight_kg ? Number(editForm.weight_kg) : null,
        dependents: Number(editForm.dependents)||0,
        status: "new",
        match_job_name: job?.company || "未定",
        education: c.education || [],
        work_history: c.work_history || [],
        certifications: c.certifications || [],
        ai_data: c,
      }),
    });
    if (res.ok) {
      setView("list");
      setFileItems(p=>p.filter(f=>f.result?.fileName!==editForm.cv_filename));
      setCurrentReview(null);
      await load();
    } else {
      const err = await res.json();
      alert("保存失敗: " + err.error);
    }
    setSaving(false);
  };

  /* ─── LIST VIEW ─────────────────────────────────────────── */
  if (view==="list") return (
    <div>
      <div style={{background:"#fff",...B,borderTop:"none",borderLeft:"none",borderRight:"none",padding:"0 20px",height:"52px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:"14px",fontWeight:700,color:navy}}>人材管理 / Quản lý Ứng viên</div>
          <div style={{fontSize:"10px",color:"#6B6B6B"}}>Supabase DB · Gemini AI · Export CV · Job Matching</div>
        </div>
        <div style={{display:"flex",gap:"8px"}}>
          <input type="text" placeholder="名前・メールで検索..." value={search}
            onChange={e=>{setSearch(e.target.value);load(e.target.value);}}
            style={{padding:"6px 10px",borderRadius:"6px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none",width:"180px"}}/>
          <button onClick={()=>setView("import")} style={{padding:"7px 14px",borderRadius:"6px",fontSize:"12px",fontWeight:700,background:"#C8002A",color:"#fff",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:"5px"}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            CV取込 (最大5件)
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

        <div style={{display:"grid",gridTemplateColumns:selected?"1fr 420px":"1fr",gap:"12px"}}>
          {/* Table */}
          <div style={{background:"#fff",...B,borderRadius:"10px",overflow:"hidden"}}>
            {loading?<div style={{padding:"40px",textAlign:"center",color:"#6B6B6B"}}>読み込み中...</div>
            :cands.length===0?<div style={{padding:"48px",textAlign:"center"}}>
              <div style={{fontSize:"32px",marginBottom:"12px"}}>👤</div>
              <div style={{fontSize:"14px",fontWeight:700,color:navy,marginBottom:"6px"}}>ứng viên chưa có</div>
              <button onClick={()=>setView("import")} style={{marginTop:"8px",padding:"8px 18px",borderRadius:"7px",fontSize:"12px",fontWeight:700,background:"#C8002A",color:"#fff",border:"none",cursor:"pointer"}}>CV取込で追加 →</button>
            </div>:(
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:"12px"}}>
                <thead><tr style={{background:"#F6F7F9"}}>
                  {["候補者","業種","日本語","希望職種","マッチ先","CV","ステータス","更新"].map(h=>(
                    <th key={h} style={{padding:"9px 10px",textAlign:"left",fontSize:"10px",color:"#6B6B6B",fontWeight:600,borderBottom:"0.5px solid rgba(11,31,58,0.1)",whiteSpace:"nowrap"}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {cands.map(c=>{
                    const st=ST[c.status]||ST.new; const jc=JC[c.jlpt]||JC["N5"];
                    const ini=c.name.split(" ").slice(-2).map((w:string)=>w[0]).join("").toUpperCase();
                    return(
                      <tr key={c.id} onClick={()=>setSelected(selected?.id===c.id?null:c)} style={{borderBottom:"0.5px solid rgba(11,31,58,0.05)",cursor:"pointer",background:selected?.id===c.id?"#E6F1FB":"transparent"}}>
                        <td style={{padding:"10px 10px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:"7px"}}>
                            <div style={{width:"28px",height:"28px",borderRadius:"50%",background:st.tb,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px",fontWeight:700,color:st.tc,flexShrink:0}}>{ini}</div>
                            <div>
                              <div style={{fontWeight:600,color:navy}}>{c.name}</div>
                              <div style={{fontSize:"10px",color:"#6B6B6B"}}>{c.email||c.phone||"—"}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{padding:"10px 10px"}}><span style={{background:"#E6F1FB",color:"#0C447C",fontSize:"10px",fontWeight:700,padding:"2px 6px",borderRadius:"4px"}}>{c.skill||"—"}</span></td>
                        <td style={{padding:"10px 10px"}}><span style={{background:jc.tb,color:jc.tc,fontSize:"10px",fontWeight:700,padding:"2px 6px",borderRadius:"4px"}}>{c.jlpt||"—"}</span></td>
                        <td style={{padding:"10px 10px",fontSize:"11px",color:"#444",maxWidth:"100px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.preferred_job||"—"}</td>
                        <td style={{padding:"10px 10px",fontSize:"11px",color:c.match_job_name&&c.match_job_name!=="未定"?"#185FA5":"#6B6B6B",fontWeight:600}}>{c.match_job_name||"未定"}</td>
                        <td style={{padding:"10px 10px"}}>{c.cv_filename?<span style={{fontSize:"10px",color:"#C8002A",fontWeight:700}}>📄</span>:<span style={{fontSize:"10px",color:"#B4B2A9"}}>—</span>}</td>
                        <td style={{padding:"10px 10px"}}><span style={{background:st.tb,color:st.tc,fontSize:"10px",fontWeight:700,padding:"2px 6px",borderRadius:"4px"}}>{st.ja}</span></td>
                        <td style={{padding:"10px 10px",fontSize:"10px",color:"#6B6B6B"}}>{c.updated_at?new Date(c.updated_at).toLocaleDateString("ja-JP"):"—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Detail panel */}
          {selected&&(
            <div style={{background:"#fff",...B,borderRadius:"10px",height:"fit-content",position:"sticky",top:"16px",overflow:"hidden"}}>
              {/* Header */}
              <div style={{padding:"14px 16px",borderBottom:"0.5px solid rgba(11,31,58,0.08)",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div>
                  <div style={{fontSize:"15px",fontWeight:700,color:navy}}>{selected.name}</div>
                  <div style={{fontSize:"10px",color:"#6B6B6B"}}>{selected.name_kana||""}</div>
                  <div style={{display:"flex",gap:"5px",marginTop:"5px",flexWrap:"wrap"}}>
                    <span style={{background:(JC[selected.jlpt]||JC["N5"]).tb,color:(JC[selected.jlpt]||JC["N5"]).tc,fontSize:"10px",fontWeight:700,padding:"2px 7px",borderRadius:"20px"}}>{selected.jlpt||"—"}</span>
                    <span style={{background:"#E6F1FB",color:"#0C447C",fontSize:"10px",fontWeight:700,padding:"2px 7px",borderRadius:"20px"}}>{selected.skill||"—"}</span>
                    {selected.visa_type&&<span style={{background:"#EEEDFE",color:"#534AB7",fontSize:"10px",fontWeight:700,padding:"2px 7px",borderRadius:"20px"}}>{selected.visa_type}</span>}
                  </div>
                </div>
                <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",cursor:"pointer",color:"#6B6B6B",fontSize:"18px"}}>×</button>
              </div>

              {/* Tabs */}
              <div style={{display:"flex",borderBottom:"0.5px solid rgba(11,31,58,0.08)"}}>
                {[{k:"basic",l:"基本情報"},{k:"history",l:"学歴・職歴"},{k:"pr",l:"PR・資格"},{k:"match",l:"マッチング"}].map(t=>(
                  <button key={t.k} onClick={()=>setDetailTab(t.k as "basic"|"history"|"pr"|"match")} style={{flex:1,padding:"8px 4px",fontSize:"10px",fontWeight:detailTab===t.k?700:400,color:detailTab===t.k?navy:"#6B6B6B",border:"none",background:detailTab===t.k?"#fff":"#F6F7F9",borderBottom:`2px solid ${detailTab===t.k?navy:"transparent"}`,cursor:"pointer"}}>
                    {t.l}
                  </button>
                ))}
              </div>

              <div style={{padding:"14px 16px",maxHeight:"480px",overflowY:"auto"}}>
                {/* Basic tab */}
                {detailTab==="basic"&&(
                  <div>
                    {[
                      {l:"氏名",v:`${selected.name} / ${selected.name_kana||"—"}`},
                      {l:"性別",v:selected.gender||"—"},
                      {l:"生年月日",v:selected.date_of_birth?new Date(selected.date_of_birth).toLocaleDateString("ja-JP"):"—"},
                      {l:"連絡先",v:selected.email||selected.phone||"—"},
                      {l:"電話",v:selected.phone||"—"},
                      {l:"住所",v:selected.address||"ベトナム"},
                      {l:"在留資格",v:selected.visa_type||"—"},
                      {l:"在留期限",v:fmtDate(selected.visa_expiry)},
                      {l:"日本語",v:`${selected.jlpt||"—"} (${selected.jlpt_actual||"—"})`},
                      {l:"身長/体重",v:`${selected.height_cm||"—"}cm / ${selected.weight_kg||"—"}kg`},
                      {l:"婚姻",v:selected.marital_status||"—"},
                      {l:"扶養家族",v:`${selected.dependents||0}人`},
                      {l:"希望職種",v:selected.preferred_job||"—"},
                      {l:"勤務時間",v:selected.work_hours||"—"},
                      {l:"就業可能日",v:selected.availability||"即日"},
                    ].map(r=>(
                      <div key={r.l} style={{display:"flex",gap:"8px",padding:"5px 0",borderBottom:"0.5px solid rgba(11,31,58,0.04)",fontSize:"12px"}}>
                        <span style={{color:"#6B6B6B",width:"80px",flexShrink:0,fontSize:"11px"}}>{r.l}</span>
                        <span style={{color:navy,fontWeight:500,flex:1,wordBreak:"break-word"}}>{r.v}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* History tab */}
                {detailTab==="history"&&(
                  <div>
                    {(selected.education||[]).length>0&&<>
                      <div style={{fontSize:"11px",fontWeight:700,color:navy,marginBottom:"6px"}}>学歴 / Học vấn</div>
                      {(selected.education||[]).map((e,i)=>(
                        <div key={i} style={{display:"flex",gap:"8px",fontSize:"11px",padding:"4px 0",borderBottom:"0.5px solid rgba(11,31,58,0.04)"}}>
                          <span style={{color:"#6B6B6B",width:"70px",flexShrink:0}}>{e.year}年{e.month}月</span>
                          <span style={{flex:1,color:navy}}>{e.school}</span>
                          <span style={{background:"#E6F1FB",color:"#0C447C",fontSize:"9px",padding:"1px 5px",borderRadius:"3px",flexShrink:0}}>{e.event}</span>
                        </div>
                      ))}
                    </>}
                    {(selected.work_history||[]).length>0&&<>
                      <div style={{fontSize:"11px",fontWeight:700,color:navy,margin:"12px 0 6px"}}>職歴 / Kinh nghiệm</div>
                      {(selected.work_history||[]).map((w,i)=>(
                        <div key={i} style={{display:"flex",gap:"8px",fontSize:"11px",padding:"4px 0",borderBottom:"0.5px solid rgba(11,31,58,0.04)"}}>
                          <span style={{color:"#6B6B6B",width:"70px",flexShrink:0}}>{w.year}年{w.month}月</span>
                          <span style={{flex:1,color:navy}}><strong>{w.company}</strong>{w.position?` — ${w.position}`:""}</span>
                          <span style={{background:"#EAF3DE",color:"#27500A",fontSize:"9px",padding:"1px 5px",borderRadius:"3px",flexShrink:0}}>{w.event}</span>
                        </div>
                      ))}
                    </>}
                  </div>
                )}

                {/* PR tab */}
                {detailTab==="pr"&&(
                  <div>
                    {(selected.certifications||[]).length>0&&<>
                      <div style={{fontSize:"11px",fontWeight:700,color:navy,marginBottom:"6px"}}>免許・資格</div>
                      {(selected.certifications||[]).map((ct,i)=>(
                        <div key={i} style={{display:"flex",gap:"8px",fontSize:"11px",padding:"4px 0",borderBottom:"0.5px solid rgba(11,31,58,0.04)"}}>
                          <span style={{color:"#6B6B6B",width:"70px",flexShrink:0}}>{ct.year}年{ct.month}月</span>
                          <span style={{flex:1,color:navy}}>{ct.name}</span>
                          <span style={{background:"#FAEEDA",color:"#633806",fontSize:"9px",padding:"1px 5px",borderRadius:"3px",flexShrink:0}}>{ct.result}</span>
                        </div>
                      ))}
                    </>}
                    {selected.motivation&&<>
                      <div style={{fontSize:"11px",fontWeight:700,color:navy,margin:"12px 0 6px"}}>志望動機</div>
                      <div style={{fontSize:"11px",color:"#444",lineHeight:1.7,background:"#F6F7F9",borderRadius:"6px",padding:"8px"}}>{selected.motivation}</div>
                    </>}
                    {selected.self_pr&&<>
                      <div style={{fontSize:"11px",fontWeight:700,color:navy,margin:"12px 0 6px"}}>自己PR</div>
                      <div style={{fontSize:"11px",color:"#444",lineHeight:1.7,background:"#F6F7F9",borderRadius:"6px",padding:"8px"}}>{selected.self_pr}</div>
                    </>}
                    {selected.ai_data&&(selected.ai_data.strengths as string[])?.length>0&&<>
                      <div style={{fontSize:"11px",fontWeight:700,color:navy,margin:"12px 0 6px"}}>AI分析 · Strengths</div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:"4px"}}>
                        {(selected.ai_data.strengths as string[]).map((s,i)=>(
                          <span key={i} style={{background:"#E6F1FB",color:"#0C447C",fontSize:"10px",padding:"2px 8px",borderRadius:"20px"}}>{s}</span>
                        ))}
                      </div>
                    </>}
                  </div>
                )}

                {/* Match tab */}
                {detailTab==="match"&&(
                  <div>
                    {matchResults.length===0&&!matching&&(
                      <div style={{textAlign:"center",padding:"20px"}}>
                        <div style={{fontSize:"11px",color:"#6B6B6B",marginBottom:"12px"}}>Gemini AIで求人マッチングを実行</div>
                        <button onClick={()=>runMatch(selected)} style={{padding:"8px 16px",borderRadius:"7px",fontSize:"12px",fontWeight:700,background:"#C8002A",color:"#fff",border:"none",cursor:"pointer"}}>AIマッチング開始</button>
                      </div>
                    )}
                    {matching&&<div style={{textAlign:"center",padding:"20px",color:"#6B6B6B",fontSize:"12px"}}>🤖 Gemini分析中...</div>}
                    {matchResults.map((job,i)=>(
                      <div key={job.id} style={{...B,borderRadius:"9px",padding:"10px",marginBottom:"8px",background:i===0?"#F0F7FF":"#fff"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"6px"}}>
                          <div>
                            <div style={{fontSize:"12px",fontWeight:700,color:navy}}>{job.company}</div>
                            <div style={{fontSize:"10px",color:"#6B6B6B"}}>{job.position_vn} · {job.location}</div>
                          </div>
                          <div style={{fontSize:"18px",fontWeight:700,color:job.matchPct>=70?"#27500A":"#633806"}}>{job.matchPct}%</div>
                        </div>
                        <div style={{background:"#F1EFE8",borderRadius:"3px",height:"4px",overflow:"hidden",marginBottom:"6px"}}>
                          <div style={{height:"100%",background:job.matchPct>=70?"#27500A":"#EF9F27",width:`${job.matchPct}%`}}/>
                        </div>
                        <div style={{display:"flex",flexWrap:"wrap",gap:"3px"}}>
                          {job.reasons.map((r,ri)=><span key={ri} style={{background:"#F6F7F9",color:navy,fontSize:"9px",padding:"2px 6px",borderRadius:"20px"}}>{r}</span>)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{padding:"12px 16px",borderTop:"0.5px solid rgba(11,31,58,0.08)"}}>
                <div style={{display:"flex",flexWrap:"wrap",gap:"4px",marginBottom:"8px"}}>
                  {Object.entries(ST).map(([k,v])=>(
                    <button key={k} onClick={()=>updateStatus(selected.id,k)} style={{padding:"4px 8px",borderRadius:"5px",fontSize:"10px",fontWeight:600,cursor:"pointer",background:selected.status===k?v.tc:v.tb,color:selected.status===k?"#fff":v.tc,border:`1px solid ${v.tc}`}}>{v.ja}</button>
                  ))}
                </div>
                <div style={{display:"flex",gap:"6px"}}>
                  <button onClick={()=>exportCV(selected)} style={{flex:1,padding:"7px",borderRadius:"7px",fontSize:"11px",fontWeight:600,background:"#EAF3DE",color:"#27500A",border:"0.5px solid #27500A",cursor:"pointer"}}>📄 Export CV</button>
                  {selected.email&&<a href={`mailto:${selected.email}`} style={{flex:1,padding:"7px",borderRadius:"7px",fontSize:"11px",fontWeight:600,textAlign:"center",background:navy,color:"#fff",textDecoration:"none"}}>メール送信</a>}
                  <button onClick={()=>deleteCandidate(selected.id)} style={{padding:"7px 10px",borderRadius:"7px",fontSize:"11px",fontWeight:600,background:"#FCEBEB",color:"#A32D2D",border:"0.5px solid #F09595",cursor:"pointer"}}>削除</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  /* ─── IMPORT VIEW ───────────────────────────────────────── */
  if (view==="import") return (
    <div>
      <div style={{background:"#fff",...B,borderTop:"none",borderLeft:"none",borderRight:"none",padding:"0 20px",height:"52px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div><div style={{fontSize:"14px",fontWeight:700,color:navy}}>CV AI取込 / Import CV</div><div style={{fontSize:"10px",color:"#6B6B6B"}}>最大5件同時 · PDF/Word · Gemini AI全情報抽出</div></div>
        <button onClick={()=>{setView("list");setFileItems([]);}} style={{padding:"7px 14px",borderRadius:"6px",fontSize:"12px",fontWeight:600,background:"transparent",color:navy,border:`0.5px solid ${navy}`,cursor:"pointer"}}>← 一覧へ</button>
      </div>
      <div style={{padding:"20px",maxWidth:"780px",margin:"0 auto"}}>
        {/* Drop zone */}
        <div
          onDragOver={e=>{e.preventDefault();}}
          onDrop={e=>{e.preventDefault();addFiles(e.dataTransfer.files);}}
          onClick={()=>fileItems.length<5&&fileInputRef.current?.click()}
          style={{border:"2px dashed rgba(11,31,58,0.2)",borderRadius:"14px",padding:"36px 24px",textAlign:"center",cursor:fileItems.length>=5?"not-allowed":"pointer",background:"#fff",marginBottom:"16px"}}>
          <div style={{width:"48px",height:"48px",borderRadius:"12px",background:"#E6F1FB",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={navy} strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </div>
          <div style={{fontSize:"14px",fontWeight:700,color:navy,marginBottom:"4px"}}>CVをドラッグ＆ドロップ / Kéo thả CV</div>
          <div style={{fontSize:"11px",color:"#6B6B6B",marginBottom:"12px"}}>PDF · Word (.doc/.docx) · 最大5件同時</div>
          <div style={{display:"inline-block",padding:"7px 18px",borderRadius:"7px",background:navy,color:"#fff",fontSize:"12px",fontWeight:600}}>ファイルを選択 ({fileItems.length}/5)</div>
        </div>
        <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" multiple style={{display:"none"}} onChange={e=>{if(e.target.files)addFiles(e.target.files);e.target.value="";}}/>

        {/* File list */}
        {fileItems.length>0&&(
          <div style={{display:"flex",flexDirection:"column",gap:"8px",marginBottom:"16px"}}>
            {fileItems.map(item=>(
              <div key={item.id} style={{background:"#fff",...B,borderRadius:"10px",padding:"12px 16px"}}>
                <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                  <div style={{width:"36px",height:"36px",borderRadius:"8px",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",background:item.status==="done"?"#EAF3DE":item.status==="error"?"#FCEBEB":"#E6F1FB"}}>
                    {item.status==="done"?<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#27500A" strokeWidth="2"><path d="M9 12l2 2 4-4M12 3a9 9 0 100 18 9 9 0 000-18z"/></svg>
                    :item.status==="error"?<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8002A" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                    :<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#185FA5" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}>
                      <span style={{fontSize:"12px",fontWeight:600,color:navy,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.file.name}</span>
                      <span style={{fontSize:"10px",color:"#6B6B6B",flexShrink:0,marginLeft:"8px"}}>{fmt(item.file.size)}</span>
                    </div>
                    {item.status!=="waiting"&&(
                      <div>
                        <div style={{background:"#F1EFE8",borderRadius:"3px",height:"4px",overflow:"hidden",marginBottom:"3px"}}>
                          <div style={{height:"100%",borderRadius:"3px",transition:"width 0.3s",background:item.status==="done"?"#27500A":item.status==="error"?"#C8002A":"#378ADD",width:`${item.progress}%`}}/>
                        </div>
                        <div style={{fontSize:"10px",color:item.status==="done"?"#27500A":item.status==="error"?"#C8002A":"#6B6B6B"}}>
                          {item.status==="analyzing"?`${item.progress}% — Gemini AI抽出中...`
                          :item.status==="done"?"✓ 分析完了 · Click「確認・保存」"
                          :`✗ エラー`}
                        </div>
                      </div>
                    )}
                    {item.status==="waiting"&&<div style={{fontSize:"10px",color:"#B4B2A9"}}>待機中...</div>}
                  </div>
                  <div style={{display:"flex",gap:"5px",flexShrink:0}}>
                    {item.status==="done"&&item.result?.candidate&&(
                      <button onClick={()=>openReview(item)} style={{padding:"5px 10px",borderRadius:"6px",fontSize:"11px",fontWeight:600,background:navy,color:"#fff",border:"none",cursor:"pointer"}}>確認・保存</button>
                    )}
                    {!isAnalyzing&&(
                      <button onClick={()=>setFileItems(p=>p.filter(f=>f.id!==item.id))} style={{padding:"5px 7px",borderRadius:"6px",fontSize:"11px",background:"transparent",color:"#6B6B6B",border:"0.5px solid rgba(11,31,58,0.15)",cursor:"pointer"}}>×</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {fileItems.length>0&&!isAnalyzing&&fileItems.some(f=>f.status==="waiting")&&(
          <button onClick={analyzeAll} style={{width:"100%",padding:"12px",borderRadius:"9px",fontSize:"14px",fontWeight:700,background:navy,color:"#fff",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px"}}>
            🤖 Gemini AIで全情報を抽出 · Phân tích toàn bộ ({fileItems.filter(f=>f.status==="waiting").length}件)
          </button>
        )}

        {fileItems.length===0&&(
          <div style={{background:"#F6F7F9",borderRadius:"10px",padding:"14px 16px"}}>
            <div style={{fontSize:"11px",fontWeight:700,color:navy,marginBottom:"8px"}}>💡 Gemini AIが抽出する情報 / AI tự động trích xuất:</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px"}}>
              {["氏名・フリガナ・連絡先","生年月日・性別","在留資格・期限","日本語能力 (JLPT)","身長・体重","学歴（入学・卒業年月）","職歴（会社名・期間）","免許・資格一覧","志望動機・自己PR","希望職種・勤務条件","婚姻・扶養家族","AIによる求人マッチング"].map((t,i)=>(
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

  /* ─── REVIEW VIEW ───────────────────────────────────────── */
  if (view==="review"&&currentReview) {
    const c = currentReview.candidate;
    return (
      <div>
        <div style={{background:"#fff",...B,borderTop:"none",borderLeft:"none",borderRight:"none",padding:"0 20px",height:"52px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div><div style={{fontSize:"14px",fontWeight:700,color:navy}}>確認・DB保存 / Xác nhận & Lưu DB</div><div style={{fontSize:"10px",color:"#6B6B6B"}}>{currentReview.fileName}</div></div>
          <button onClick={()=>setView("import")} style={{padding:"7px 14px",borderRadius:"6px",fontSize:"12px",fontWeight:600,background:"transparent",color:navy,border:`0.5px solid ${navy}`,cursor:"pointer"}}>← 戻る</button>
        </div>
        <div style={{padding:"16px 20px",maxWidth:"920px",margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>
          {/* Left: Edit form */}
          <div>
            <div style={{background:"#fff",...B,borderRadius:"10px",padding:"16px",marginBottom:"12px"}}>
              <div style={{fontSize:"12px",fontWeight:700,color:navy,marginBottom:"12px",display:"flex",alignItems:"center",gap:"7px"}}>
                <span style={{background:"#EAF3DE",color:"#27500A",fontSize:"10px",fontWeight:700,padding:"2px 8px",borderRadius:"20px"}}>Gemini AI抽出済</span>
                基本情報を確認・修正
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
                {[
                  {f:"name",l:"氏名 *",t:"text"},{f:"name_kana",l:"フリガナ",t:"text"},
                  {f:"email",l:"Email",t:"email"},{f:"phone",l:"電話",t:"text"},
                  {f:"gender",l:"性別",t:"text"},{f:"date_of_birth",l:"生年月日",t:"text"},
                  {f:"visa_type",l:"在留資格",t:"text"},{f:"visa_expiry",l:"在留期限",t:"text"},
                  {f:"height_cm",l:"身長(cm)",t:"number"},{f:"weight_kg",l:"体重(kg)",t:"number"},
                  {f:"preferred_job",l:"希望職種",t:"text"},{f:"work_hours",l:"勤務時間",t:"text"},
                ].map(x=>(
                  <div key={x.f}>
                    <label style={{display:"block",fontSize:"10px",color:"#6B6B6B",marginBottom:"3px",fontWeight:600}}>{x.l}</label>
                    <input type={x.t} value={editForm[x.f]||""} onChange={e=>setEditForm({...editForm,[x.f]:e.target.value})} style={{width:"100%",padding:"6px 10px",borderRadius:"6px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none"}}/>
                  </div>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginTop:"10px"}}>
                <div>
                  <label style={{display:"block",fontSize:"10px",color:"#6B6B6B",marginBottom:"3px",fontWeight:600}}>日本語 / Tiếng Nhật</label>
                  <select value={editForm.jlpt||"N4"} onChange={e=>setEditForm({...editForm,jlpt:e.target.value})} style={{width:"100%",padding:"6px 10px",borderRadius:"6px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none"}}>
                    {["N1","N2","N3","N4","N5","N3相当","N4相当","なし"].map(j=><option key={j}>{j}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{display:"block",fontSize:"10px",color:"#6B6B6B",marginBottom:"3px",fontWeight:600}}>業種 / Ngành</label>
                  <select value={editForm.skill||"飲食"} onChange={e=>setEditForm({...editForm,skill:e.target.value})} style={{width:"100%",padding:"6px 10px",borderRadius:"6px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none"}}>
                    {["飲食","製造","農業","ホテル","宿泊業","IT","その他"].map(i=><option key={i}>{i}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Extracted data preview */}
            {(()=>{
              const edu = c.education as Edu[]|null;
              const wh  = c.work_history as Work[]|null;
              const crt = c.certifications as Cert[]|null;
              if (!edu?.length && !wh?.length && !crt?.length) return null;
              return (
                <div style={{background:"#fff",...B,borderRadius:"10px",padding:"16px",marginBottom:"12px"}}>
                  <div style={{fontSize:"12px",fontWeight:700,color:navy,marginBottom:"10px"}}>抽出データ / Dữ liệu đã trích xuất</div>
                  {edu && edu.length>0&&<>
                    <div style={{fontSize:"10px",color:"#6B6B6B",fontWeight:600,marginBottom:"4px"}}>学歴 ({edu.length}件)</div>
                    {edu.map((e,i)=><div key={i} style={{fontSize:"11px",color:navy,padding:"3px 0",borderBottom:"0.5px solid rgba(11,31,58,0.04)"}}>{e.year}年{e.month}月 {e.school} {e.event}</div>)}
                  </>}
                  {wh && wh.length>0&&<>
                    <div style={{fontSize:"10px",color:"#6B6B6B",fontWeight:600,margin:"8px 0 4px"}}>職歴 ({wh.length}件)</div>
                    {wh.map((w,i)=><div key={i} style={{fontSize:"11px",color:navy,padding:"3px 0",borderBottom:"0.5px solid rgba(11,31,58,0.04)"}}>{w.year}年{w.month}月 <strong>{w.company}</strong> {w.position} {w.event}</div>)}
                  </>}
                  {crt && crt.length>0&&<>
                    <div style={{fontSize:"10px",color:"#6B6B6B",fontWeight:600,margin:"8px 0 4px"}}>資格 ({crt.length}件)</div>
                    {crt.map((ct,i)=><div key={i} style={{fontSize:"11px",color:navy,padding:"3px 0",borderBottom:"0.5px solid rgba(11,31,58,0.04)"}}>{ct.year}年{ct.month}月 {ct.name} {ct.result}</div>)}
                  </>}
                </div>
              );
            })()}

            {/* Motivation/PR */}
            {(()=>{
              const mot = c.motivation as string|null;
              const pr  = c.self_pr as string|null;
              if (!mot && !pr) return null;
              return (
                <div style={{background:"#fff",...B,borderRadius:"10px",padding:"16px"}}>
                  {mot&&<><div style={{fontSize:"10px",fontWeight:700,color:navy,marginBottom:"4px"}}>志望動機</div><div style={{fontSize:"11px",color:"#444",lineHeight:1.6,marginBottom:"10px",background:"#F6F7F9",borderRadius:"6px",padding:"8px"}}>{mot}</div></>}
                  {pr&&<><div style={{fontSize:"10px",fontWeight:700,color:navy,marginBottom:"4px"}}>自己PR</div><div style={{fontSize:"11px",color:"#444",lineHeight:1.6,background:"#F6F7F9",borderRadius:"6px",padding:"8px"}}>{pr}</div></>}
                </div>
              );
            })()}
          </div>

          {/* Right: Job matching */}
          <div>
            <div style={{background:"#fff",...B,borderRadius:"10px",padding:"16px",marginBottom:"12px"}}>
              <div style={{fontSize:"12px",fontWeight:700,color:navy,marginBottom:"4px"}}>🎯 Gemini AIマッチング求人</div>
              <div style={{fontSize:"10px",color:"#6B6B6B",marginBottom:"12px"}}>
                希望: <strong>{String(c.preferred_job||"未記入")}</strong> · 
                日本語: <strong>{String(c.jlpt||"—")}</strong> · 
                業種: <strong>{String(c.skill||"—")}</strong>
              </div>
              {currentReview.suggestions.length===0&&<div style={{padding:"16px",textAlign:"center",color:"#6B6B6B",fontSize:"12px"}}>求人データなし — 先に求人を登録してください</div>}
              {currentReview.suggestions.map((job,i)=>(
                <div key={job.id} onClick={()=>setSelectedJobId(job.id)} style={{border:`1.5px solid ${selectedJobId===job.id?navy:"rgba(11,31,58,0.1)"}`,borderRadius:"10px",padding:"12px",marginBottom:"8px",cursor:"pointer",background:selectedJobId===job.id?"#E6F1FB":"#fff",transition:"all 0.15s"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"6px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"7px"}}>
                      <div style={{width:"22px",height:"22px",borderRadius:"50%",background:i===0?navy:"#F1EFE8",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px",fontWeight:700,color:i===0?"#fff":navy,flexShrink:0}}>{i+1}</div>
                      <div>
                        <div style={{fontSize:"12px",fontWeight:700,color:navy}}>{job.company}</div>
                        <div style={{fontSize:"10px",color:"#6B6B6B"}}>{job.position_vn} · {job.location}</div>
                      </div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontSize:"18px",fontWeight:700,color:job.matchPct>=70?"#27500A":"#633806"}}>{job.matchPct}%</div>
                    </div>
                  </div>
                  <div style={{background:"#F1EFE8",borderRadius:"3px",height:"4px",overflow:"hidden",marginBottom:"6px"}}>
                    <div style={{height:"100%",background:job.matchPct>=70?"#27500A":"#EF9F27",borderRadius:"3px",width:`${job.matchPct}%`}}/>
                  </div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:"3px",marginBottom:"4px"}}>
                    {job.reasons.map((r,ri)=><span key={ri} style={{background:"#F6F7F9",color:navy,fontSize:"9px",padding:"2px 6px",borderRadius:"20px"}}>{r}</span>)}
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:"11px",fontWeight:700,color:"#27500A"}}>{job.salary}</span>
                    <span style={{background:job.status==="urgent"?"#FCEBEB":"#E6F1FB",color:job.status==="urgent"?"#A32D2D":"#0C447C",fontSize:"9px",fontWeight:700,padding:"2px 6px",borderRadius:"4px"}}>{job.status==="urgent"?"⚡ 緊急":"募集中"}</span>
                  </div>
                  {selectedJobId===job.id&&<div style={{marginTop:"6px",paddingTop:"6px",borderTop:"0.5px solid rgba(11,31,58,0.08)",fontSize:"10px",color:"#27500A",fontWeight:700}}>✓ この求人に登録します</div>}
                </div>
              ))}
              <button onClick={()=>setSelectedJobId(null)} style={{width:"100%",padding:"7px",borderRadius:"7px",fontSize:"11px",color:"#6B6B6B",border:"0.5px solid rgba(11,31,58,0.15)",background:"transparent",cursor:"pointer",marginTop:"4px"}}>
                マッチなし / Chưa match
              </button>
            </div>

            <button onClick={saveCandidate} disabled={!editForm.name||saving} style={{width:"100%",padding:"13px",borderRadius:"9px",fontSize:"14px",fontWeight:700,background:editForm.name&&!saving?navy:"#B4B2A9",color:"#fff",border:"none",cursor:editForm.name?"pointer":"not-allowed",transition:"background 0.2s"}}>
              {saving?"DB保存中...":"💾 DBに保存 / Lưu vào database"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
