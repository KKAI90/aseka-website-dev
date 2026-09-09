"use client";
import React from 'react';
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import JSZip from "jszip";
import { useAdminLang } from "@/lib/adminI18n";

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
  marital_status:string; dependents:string;
  education:Edu[]; work_history:Work[]; certifications:Cert[];
  motivation:string; self_pr:string;
  status:string; match_job_id:string|null; match_job_name:string;
  applied_via:string|null; applied_at:string|null;
  note:string; cv_filename:string|null; ai_data:Record<string,unknown>|null;
  created_at:string; updated_at:string;
};

type FileItem = {
  file:File; id:string;
  status:"waiting"|"analyzing"|"done"|"error";
  progress:number;
  result?:{ success:boolean; fileName:string; candidate?:Record<string,unknown>; suggestions?:Job[]; error?:string; rateLimited?:boolean };
};

/* ─── Constants ──────────────────────────────────────────── */
const ST: Record<string,{ja:string;vn:string;tc:string;tb:string;labelKey:string}> = {
  new:      {ja:"新規",   vn:"Mới",       tc:"#0C447C",tb:"#E6F1FB",labelKey:"candidates.statusNew"},
  interview:{ja:"面接中", vn:"Phỏng vấn", tc:"#633806",tb:"#FAEEDA",labelKey:"candidates.statusInterview"},
  offered:  {ja:"内定済", vn:"Đã offer",  tc:"#534AB7",tb:"#EEEDFE",labelKey:"candidates.statusOffered"},
  working:  {ja:"就業中", vn:"Đang làm",  tc:"#27500A",tb:"#EAF3DE",labelKey:"candidates.statusWorking"},
  quit:     {ja:"退職",   vn:"Nghỉ",      tc:"#444441",tb:"#F1EFE8",labelKey:"candidates.statusQuit"},
};
const JC: Record<string,{tc:string;tb:string}> = {
  N1:{tc:"#A32D2D",tb:"#FCEBEB"},N2:{tc:"#633806",tb:"#FAEEDA"},
  N3:{tc:"#27500A",tb:"#EAF3DE"},N4:{tc:"#444441",tb:"#F1EFE8"},N5:{tc:"#6B6B6B",tb:"#F1EFE8"},
};
const navy="#0B1F3A";
const B={border:"0.5px solid rgba(11,31,58,0.1)"};
const fmt=(b:number)=>b>1048576?`${(b/1048576).toFixed(1)}MB`:`${(b/1024).toFixed(0)}KB`;
const fmtDate=(s:string)=>s?new Date(s).toLocaleDateString("ja-JP"):"—";
const FORM_URL = typeof window !== "undefined"
  ? `${window.location.origin}/dang-ky`
  : "https://aseka-website-dev.vercel.app/dang-ky";

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
  const { t } = useAdminLang();
  const [cands, setCands] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Candidate|null>(null);
  const [detailTab, setDetailTab] = useState<"basic"|"history"|"pr"|"match">("basic");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [skillFilter, setSkillFilter] = useState("all");
  const [jlptFilter, setJlptFilter] = useState("all");
  const [sortKey, setSortKey] = useState<"name"|"jlpt"|"updated_at">("updated_at");
  const [sortDir, setSortDir] = useState<"asc"|"desc">("desc");
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout>|null>(null);
  const [view, setView] = useState<"list"|"import"|"review">("list");
  const [fileItems, setFileItems] = useState<FileItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentReview, setCurrentReview] = useState<{candidate:Record<string,unknown>;suggestions:Job[];fileName:string}|null>(null);
  const [editForm, setEditForm] = useState<Record<string,string>>({});
  const [selectedJobId, setSelectedJobId] = useState<string|null>(null);
  const [editingBasic, setEditingBasic] = useState(false);
  const [basicEditForm, setBasicEditForm] = useState<Record<string,string>>({});
  const [savingBasic, setSavingBasic] = useState(false);
  const [saving, setSaving] = useState(false);
  const [matchResults, setMatchResults] = useState<Job[]>([]);
  const [matching, setMatching] = useState(false);
  const [retryCountdown, setRetryCountdown] = useState(0);
  const [showFormPopup, setShowFormPopup] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const retryTimerRef = useRef<ReturnType<typeof setInterval>|null>(null);

  const load = useCallback(async () => {
    const p = new URLSearchParams();
    if (filter!=="all") p.set("status",filter);
    if (skillFilter!=="all") p.set("skill",skillFilter);
    if (jlptFilter!=="all") p.set("jlpt",jlptFilter);
    if (search) p.set("search",search);
    const res = await fetch(`/api/admin/candidates?${p}`);
    if (res.status===401){router.push("/admin/login");return;}
    const d = await res.json();
    setCands(d.data||[]);
    setLoading(false);
  },[filter,skillFilter,jlptFilter,search,router]);

  useEffect(()=>{load();},[load]);

  // Debounce search input → search (300ms)
  useEffect(()=>{
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(()=>setSearch(searchInput), 300);
    return ()=>{if(searchDebounceRef.current) clearTimeout(searchDebounceRef.current);};
  },[searchInput]);

  const counts: Record<string,number> = {all:cands.length};
  Object.keys(ST).forEach((k: string) => {counts[k] = cands.filter((c: Candidate) => c.status === k).length;});

  const activeFilterCount = (filter!=="all"?1:0) + (skillFilter!=="all"?1:0) + (jlptFilter!=="all"?1:0) + (search?1:0);
  const clearFilters = () => { setFilter("all"); setSkillFilter("all"); setJlptFilter("all"); setSearchInput(""); setSearch(""); };

  // Distinct skill values currently in data, for the dropdown
  const skillOptions = Array.from(new Set(cands.map(c=>c.skill).filter(Boolean))).sort();

  const sortedCands = [...cands].sort((a,b)=>{
    let cmp = 0;
    if (sortKey==="name") cmp = a.name.localeCompare(b.name, "ja");
    else if (sortKey==="jlpt") cmp = (a.jlpt||"").localeCompare(b.jlpt||"");
    else cmp = new Date(a.updated_at||0).getTime() - new Date(b.updated_at||0).getTime();
    return sortDir==="asc"?cmp:-cmp;
  });
  const toggleSort = (key: "name"|"jlpt"|"updated_at") => {
    if (sortKey===key) setSortDir(d=>d==="asc"?"desc":"asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const updateStatus = async (id:string, status:string) => {
    await fetch("/api/admin/candidates",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,status})});
    setCands((p: Candidate[]) => p.map((c: Candidate) => c.id === id ? {...c, status} : c));
    setSelected((p: Candidate | null) => p?.id === id ? {...p, status} : p);
  };

  const startEditBasic = (c: Candidate) => {
    setBasicEditForm({
      name: c.name||"", name_kana: c.name_kana||"", email: c.email||"", phone: c.phone||"",
      gender: c.gender||"", date_of_birth: c.date_of_birth||"", address: c.address||"",
      visa_type: c.visa_type||"", visa_expiry: c.visa_expiry||"",
      jlpt: c.jlpt||"", jlpt_actual: c.jlpt_actual||"",
      height_cm: c.height_cm?String(c.height_cm):"", weight_kg: c.weight_kg?String(c.weight_kg):"",
      marital_status: c.marital_status||"", dependents: c.dependents?String(c.dependents):"",
      preferred_job: c.preferred_job||"", work_hours: c.work_hours||"", availability: c.availability||"",
    });
    setEditingBasic(true);
  };

  const saveBasicInfo = async () => {
    if (!selected) return;
    setSavingBasic(true);
    const payload = {
      ...basicEditForm,
      height_cm: basicEditForm.height_cm ? Number(basicEditForm.height_cm) : null,
      weight_kg: basicEditForm.weight_kg ? Number(basicEditForm.weight_kg) : null,
      dependents: basicEditForm.dependents || null,
    };
    const res = await fetch("/api/admin/candidates",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:selected.id, ...payload})});
    setSavingBasic(false);
    if (!res.ok) { alert(t("common.saveFailed")); return; }
    const merged = { ...selected, ...payload } as Candidate;
    setCands((p: Candidate[]) => p.map((c: Candidate) => c.id === selected.id ? merged : c));
    setSelected(merged);
    setEditingBasic(false);
  };

  const deleteCandidate = async (id:string) => {
    if (!confirm(t("candidates.deleteConfirm"))) return;
    await fetch(`/api/admin/candidates?id=${id}`,{method:"DELETE"});
    setCands((p: Candidate[]) => p.filter((c: Candidate) => c.id !== id));
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
    setFileItems((p: FileItem[]) => [...p, ...toAdd]);
  };

  const extractText = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const ab = await file.arrayBuffer();
    if (ext === "docx" || ext === "doc") {
      try {
        // Use JSZip to properly decompress DOCX (ZIP format)
        const zip = await JSZip.loadAsync(ab);
        const xmlFile = zip.file("word/document.xml");
        if (xmlFile) {
          const xml = await xmlFile.async("string");
          return xml
            .replace(/<w:p[ >]/g, "\n<w:p>")  // newline before each paragraph
            .replace(/<[^>]+>/g, "")           // strip all XML tags
            .replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&").replace(/&nbsp;/g," ")
            .replace(/\s+/g," ").trim()
            .slice(0, 5000);
        }
      } catch { /* fallback to PDF path */ }
    }
    // PDF — use pdfjs-dist for proper text extraction
    if (ext === "pdf") {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
        const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(ab) }).promise;
        const pages: string[] = [];
        for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items
            .map((item) => ("str" in item ? item.str : ""))
            .join(" ");
          pages.push(pageText);
        }
        return pages.join("\n").replace(/\s+/g, " ").trim().slice(0, 5000);
      } catch { return ""; }
    }
    // Other fallback
    return "";
  };

  const analyzeAll = async () => {
    if (!fileItems.length) return;
    setIsAnalyzing(true);
    setFileItems((p: FileItem[]) => p.map((f: FileItem) => ({...f, status: "analyzing", progress: 0})));
    const timers: Record<string,ReturnType<typeof setInterval>> = {};
    fileItems.forEach((item: FileItem) => {
      timers[item.id] = setInterval(() => {
        setFileItems((p: FileItem[]) => p.map((f: FileItem) => f.id === item.id && f.status === "analyzing" ? {...f, progress: Math.min(f.progress + 8, 85)} : f));
      },200);
    });
    try {
      // Extract text CLIENT-SIDE → send only text (avoid 413 error)
      const filesWithText = await Promise.all(
        fileItems.map(async (item: FileItem) => ({
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
        setFileItems((p: FileItem[]) => p.map((f: FileItem, i: number) => {
          const r = data.results[i];
          if (!r) return {...f,status:"error",progress:100};
          return {...f,status:r.success?"done":"error",progress:100,result:r};
        }));
        // If any file hit rate limit, start countdown and auto-retry
        const hasRateLimit = data.results.some((r: {rateLimited?:boolean}) => r.rateLimited);
        if (hasRateLimit) {
          if (retryTimerRef.current) clearInterval(retryTimerRef.current);
          setRetryCountdown(60);
          retryTimerRef.current = setInterval(() => {
            setRetryCountdown(prev => {
              if (prev <= 1) {
                clearInterval(retryTimerRef.current!);
                retryTimerRef.current = null;
                setFileItems(p => p.map(f => f.result?.rateLimited ? {...f, status:"waiting", progress:0, result:undefined} : f));
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
      }
    } catch (err) {
      console.error("analyzeAll error:", err);
      Object.values(timers).forEach(t=>clearInterval(t));
      setFileItems((p: FileItem[]) => p.map((f: FileItem) => ({...f, status: "error", progress: 100})));
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
    const job = currentReview.suggestions?.find((j: Job) => j.id === selectedJobId);
    const c = currentReview.candidate;
    const res = await fetch("/api/admin/candidates",{
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        ...editForm,
        height_cm: editForm.height_cm ? Number(editForm.height_cm) : null,
        weight_kg: editForm.weight_kg ? Number(editForm.weight_kg) : null,
        dependents: editForm.dependents || "0",
        status: "new",
        match_job_id: job?.id || null,
        match_job_name: job?.company || "未定",
        applied_via: job ? "admin" : null,
        applied_at: job ? new Date().toISOString() : null,
        education: c.education || [],
        work_history: c.work_history || [],
        certifications: c.certifications || [],
        ai_data: c,
      }),
    });
    if (res.ok) {
      setView("list");
      setFileItems((p: FileItem[]) => p.filter((f: FileItem) => f.result?.fileName !== editForm.cv_filename));
      setCurrentReview(null);
      await load();
    } else {
      const err = await res.json();
      alert(t("common.saveFailed") + ": " + err.error);
    }
    setSaving(false);
  };

  /* ─── LIST VIEW ─────────────────────────────────────────── */
  if (view==="list") return (
    <div>
      <div style={{background:"#fff",...B,borderTop:"none",borderLeft:"none",borderRight:"none",padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"10px"}}>
        <div>
          <div style={{fontSize:"16px",fontWeight:700,color:navy,letterSpacing:"-0.01em"}}>{t("candidates.title")}</div>
          <div style={{fontSize:"10px",color:"#6B6B6B",marginTop:"2px"}}>{t("candidates.subtitle")}</div>
        </div>
        <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
          {/* Form share button + popup */}
          <div style={{position:"relative"}}>
            <button onClick={()=>setShowFormPopup(p=>!p)}
              style={{padding:"7px 12px",borderRadius:"6px",fontSize:"12px",fontWeight:600,background:showFormPopup?"#E6F1FB":"#fff",color:navy,border:`1px solid ${showFormPopup?navy:"rgba(11,31,58,0.2)"}`,cursor:"pointer",display:"flex",alignItems:"center",gap:"5px"}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
              {t("candidates.shareForm")}
            </button>

            {showFormPopup && (
              <div style={{position:"absolute",top:"calc(100% + 8px)",right:0,background:"#fff",borderRadius:"12px",padding:"16px",boxShadow:"0 8px 32px rgba(11,31,58,0.14)",zIndex:200,width:"300px",border:"0.5px solid rgba(11,31,58,0.1)"}}>
                <div style={{fontSize:"12px",fontWeight:700,color:navy,marginBottom:"6px"}}>📋 {t("candidates.shareFormDesc")}</div>
                <div style={{fontSize:"10px",color:"#6B6B6B",marginBottom:"10px"}}>
                  {t("candidates.shareFormHint")}
                </div>
                <div style={{background:"#F6F7F9",borderRadius:"8px",padding:"8px 10px",fontFamily:"monospace",fontSize:"10px",color:"#185FA5",wordBreak:"break-all",marginBottom:"10px",userSelect:"all"}}>
                  {FORM_URL}
                </div>
                <div style={{display:"flex",gap:"6px"}}>
                  <button onClick={()=>{navigator.clipboard.writeText(FORM_URL);setLinkCopied(true);setTimeout(()=>setLinkCopied(false),2000);}}
                    style={{flex:1,padding:"7px",borderRadius:"7px",fontSize:"11px",fontWeight:700,background:linkCopied?"#27500A":navy,color:"#fff",border:"none",cursor:"pointer"}}>
                    {linkCopied?`✓ ${t("candidates.linkCopied")}`:`🔗 ${t("candidates.copyLink")}`}
                  </button>
                  <a href={FORM_URL} target="_blank" rel="noreferrer"
                    style={{flex:1,padding:"7px",borderRadius:"7px",fontSize:"11px",fontWeight:700,background:"#E6F1FB",color:navy,border:"none",cursor:"pointer",textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:"4px"}}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    {t("candidates.openForm")}
                  </a>
                </div>
              </div>
            )}
          </div>

          <button onClick={()=>setView("import")} style={{padding:"7px 14px",borderRadius:"6px",fontSize:"12px",fontWeight:700,background:"#C8002A",color:"#fff",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:"5px"}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            {t("candidates.importCV")}
          </button>
        </div>
      </div>

      <div style={{padding:"16px 20px"}}>
        {/* Search + advanced filters toolbar */}
        <div style={{background:"#fff",...B,borderRadius:"10px",padding:"12px 14px",marginBottom:"12px",display:"flex",gap:"10px",flexWrap:"wrap",alignItems:"center"}}>
          <div style={{position:"relative",flex:"1 1 220px",minWidth:"200px"}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B4B2A9" strokeWidth="2" style={{position:"absolute",left:"10px",top:"50%",transform:"translateY(-50%)"}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder={t("candidates.searchPlaceholder")} value={searchInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
              style={{width:"100%",padding:"7px 10px 7px 30px",borderRadius:"7px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none",boxSizing:"border-box"}}/>
          </div>
          <select value={skillFilter} onChange={e=>setSkillFilter(e.target.value)}
            style={{padding:"7px 10px",borderRadius:"7px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",color:navy,background:"#fff",cursor:"pointer",outline:"none"}}>
            <option value="all">{t("candidates.allIndustries")}</option>
            {skillOptions.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
          <select value={jlptFilter} onChange={e=>setJlptFilter(e.target.value)}
            style={{padding:"7px 10px",borderRadius:"7px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",color:navy,background:"#fff",cursor:"pointer",outline:"none"}}>
            <option value="all">{t("candidates.allJlpt")}</option>
            {["N1","N2","N3","N4","N5"].map(j=><option key={j} value={j}>{j}</option>)}
          </select>
          {activeFilterCount>0&&(
            <button onClick={clearFilters} style={{padding:"7px 12px",borderRadius:"7px",fontSize:"11px",fontWeight:600,background:"#FCEBEB",color:"#A32D2D",border:"0.5px solid #F09595",cursor:"pointer",whiteSpace:"nowrap"}}>
              ✕ {t("common.clearFilters")} ({activeFilterCount})
            </button>
          )}
          <div style={{marginLeft:"auto",fontSize:"11px",color:"#6B6B6B",whiteSpace:"nowrap"}}>
            {loading?t("common.loading"):`${cands.length} ${t("common.results")}`}
          </div>
        </div>

        <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"14px"}}>
          {[{key:"all",labelKey:"common.all"},...Object.entries(ST).map(([k,v])=>({key:k,labelKey:v.labelKey}))].map(f=>(
            <button key={f.key} onClick={()=>setFilter(f.key)} style={{padding:"5px 12px",borderRadius:"20px",fontSize:"11px",fontWeight:600,border:`1px solid ${filter===f.key?navy:"rgba(11,31,58,0.15)"}`,background:filter===f.key?navy:"#fff",color:filter===f.key?"#fff":"#6B6B6B",cursor:"pointer",whiteSpace:"nowrap"}}>
              {t(f.labelKey)} ({counts[f.key]||0})
            </button>
          ))}
        </div>

        <div style={{display:"grid",gridTemplateColumns:selected?"1fr 420px":"1fr",gap:"12px"}}>
          {/* Table */}
          <div style={{background:"#fff",...B,borderRadius:"10px",overflow:"hidden"}}>
            {loading?<div style={{padding:"40px",textAlign:"center",color:"#6B6B6B"}}>{t("common.loading")}</div>
            :cands.length===0?<div style={{padding:"48px",textAlign:"center"}}>
              <div style={{fontSize:"32px",marginBottom:"12px"}}>👤</div>
              <div style={{fontSize:"14px",fontWeight:700,color:navy,marginBottom:"6px"}}>{t("candidates.empty")}</div>
              <button onClick={()=>setView("import")} style={{marginTop:"8px",padding:"8px 18px",borderRadius:"7px",fontSize:"12px",fontWeight:700,background:"#C8002A",color:"#fff",border:"none",cursor:"pointer"}}>{t("candidates.addViaImport")}</button>
            </div>:(
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:"12px"}}>
                <thead><tr style={{background:"#F6F7F9"}}>
                  {[
                    {h:t("candidates.colCandidate"),key:"name" as const},
                    {h:t("candidates.colIndustry"),key:null},
                    {h:t("candidates.colJlpt"),key:"jlpt" as const},
                    {h:t("candidates.colPreferredJob"),key:null},
                    {h:t("candidates.colMatch"),key:null},
                    {h:t("candidates.colCV"),key:null},
                    {h:t("candidates.colStatus"),key:null},
                    {h:t("candidates.colUpdated"),key:"updated_at" as const},
                  ].map(col=>(
                    <th key={col.h} onClick={col.key?()=>toggleSort(col.key!):undefined}
                      style={{padding:"9px 10px",textAlign:"left",fontSize:"10px",color:"#6B6B6B",fontWeight:600,borderBottom:"0.5px solid rgba(11,31,58,0.1)",whiteSpace:"nowrap",cursor:col.key?"pointer":"default",userSelect:"none"}}>
                      {col.h}{col.key&&sortKey===col.key?(sortDir==="asc"?" ▲":" ▼"):""}
                    </th>
                  ))}
                </tr></thead>
                <tbody>
                  {sortedCands.map(c=>{
                    const st=ST[c.status]||ST.new; const jc=JC[c.jlpt]||JC["N5"];
                    const ini=c.name.split(" ").slice(-2).map((w:string)=>w[0]).join("").toUpperCase();
                    return(
                      <tr key={c.id} onClick={()=>{setSelected(selected?.id===c.id?null:c);setEditingBasic(false);}}
                        onMouseEnter={e=>{if(selected?.id!==c.id)e.currentTarget.style.background="#FAFBFC";}}
                        onMouseLeave={e=>{if(selected?.id!==c.id)e.currentTarget.style.background="transparent";}}
                        style={{borderBottom:"0.5px solid rgba(11,31,58,0.05)",cursor:"pointer",background:selected?.id===c.id?"#E6F1FB":"transparent",transition:"background 0.12s"}}>
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
                        <td style={{padding:"10px 10px",fontSize:"11px",color:c.match_job_name&&c.match_job_name!=="未定"?"#185FA5":"#6B6B6B",fontWeight:600}}>{c.match_job_name&&c.match_job_name!=="未定"?c.match_job_name:t("candidates.noMatch")}</td>
                        <td style={{padding:"10px 10px"}}>{c.cv_filename?<span style={{fontSize:"10px",color:"#C8002A",fontWeight:700}}>📄</span>:<span style={{fontSize:"10px",color:"#B4B2A9"}}>—</span>}</td>
                        <td style={{padding:"10px 10px"}}><span style={{background:st.tb,color:st.tc,fontSize:"10px",fontWeight:700,padding:"2px 6px",borderRadius:"4px"}}>{t(st.labelKey)}</span></td>
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

              {/* Applied job banner */}
              {selected.match_job_name&&selected.match_job_name!=="未定"&&(
                <div style={{padding:"10px 16px",background:selected.applied_via==="self"?"#EAF3DE":"#E6F1FB",borderBottom:"0.5px solid rgba(11,31,58,0.08)"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"4px"}}>
                    <div style={{fontSize:"12px",color:navy}}>
                      <span style={{fontWeight:700}}>📋 {t("candidates.appliedTo")}:</span> {selected.match_job_name}
                    </div>
                    <span style={{fontSize:"9px",fontWeight:700,padding:"2px 7px",borderRadius:"20px",background:selected.applied_via==="self"?"#27500A":"#0C447C",color:"#fff"}}>
                      {selected.applied_via==="self"?t("candidates.appliedSelf"):t("candidates.appliedAdmin")}
                    </span>
                  </div>
                  {selected.applied_at&&(
                    <div style={{fontSize:"10px",color:"#6B6B6B",marginTop:"3px"}}>
                      {t("candidates.appliedAt")}: {new Date(selected.applied_at).toLocaleString("ja-JP")}
                    </div>
                  )}
                </div>
              )}

              {/* Tabs */}
              <div style={{display:"flex",borderBottom:"0.5px solid rgba(11,31,58,0.08)"}}>
                {[{k:"basic",lk:"candidates.tabBasic"},{k:"history",lk:"candidates.tabHistory"},{k:"pr",lk:"candidates.tabPr"},{k:"match",lk:"candidates.tabMatch"}].map(tb=>(
                  <button key={tb.k} onClick={()=>setDetailTab(tb.k as "basic"|"history"|"pr"|"match")} style={{flex:1,padding:"8px 4px",fontSize:"10px",fontWeight:detailTab===tb.k?700:400,color:detailTab===tb.k?navy:"#6B6B6B",border:"none",background:detailTab===tb.k?"#fff":"#F6F7F9",borderBottom:`2px solid ${detailTab===tb.k?navy:"transparent"}`,cursor:"pointer"}}>
                    {t(tb.lk)}
                  </button>
                ))}
              </div>

              <div style={{padding:"14px 16px",maxHeight:"480px",overflowY:"auto"}}>
                {/* Basic tab */}
                {detailTab==="basic"&&(
                  <div>
                    <div style={{display:"flex",justifyContent:"flex-end",marginBottom:"8px"}}>
                      {editingBasic ? (
                        <div style={{display:"flex",gap:"6px"}}>
                          <button onClick={()=>setEditingBasic(false)} disabled={savingBasic}
                            style={{padding:"5px 10px",borderRadius:"6px",fontSize:"11px",fontWeight:600,background:"transparent",color:"#6B6B6B",border:"0.5px solid rgba(11,31,58,0.15)",cursor:"pointer"}}>
                            {t("common.cancel")}
                          </button>
                          <button onClick={saveBasicInfo} disabled={savingBasic}
                            style={{padding:"5px 10px",borderRadius:"6px",fontSize:"11px",fontWeight:600,background:navy,color:"#fff",border:"none",cursor:savingBasic?"not-allowed":"pointer"}}>
                            {savingBasic?t("common.saving"):t("common.save")}
                          </button>
                        </div>
                      ) : (
                        <button onClick={()=>startEditBasic(selected)}
                          style={{padding:"5px 10px",borderRadius:"6px",fontSize:"11px",fontWeight:600,background:"#F6F7F9",color:navy,border:"0.5px solid rgba(11,31,58,0.15)",cursor:"pointer",display:"flex",alignItems:"center",gap:"4px"}}>
                          ✏️ {t("candidates.editInfo")}
                        </button>
                      )}
                    </div>

                    {editingBasic ? (
                      <div style={{display:"flex",flexDirection:"column",gap:"9px"}}>
                        {[
                          {k:"name",lk:"candidates.name",type:"text"},
                          {k:"name_kana",lk:"candidates.nameKana",type:"text"},
                          {k:"email",lk:"candidates.email",type:"email"},
                          {k:"phone",lk:"candidates.phone",type:"text"},
                          {k:"gender",lk:"candidates.gender",type:"text"},
                          {k:"date_of_birth",lk:"candidates.dob",type:"text"},
                          {k:"address",lk:"candidates.address",type:"text"},
                          {k:"visa_type",lk:"candidates.visaType",type:"text"},
                          {k:"visa_expiry",lk:"candidates.visaExpiry",type:"text"},
                          {k:"jlpt",lk:"candidates.colJlpt",type:"text"},
                          {k:"jlpt_actual",lk:"candidates.jlptActual",type:"text"},
                          {k:"height_cm",lk:"candidates.heightCm",type:"number"},
                          {k:"weight_kg",lk:"candidates.weightKg",type:"number"},
                          {k:"marital_status",lk:"candidates.marital",type:"text"},
                          {k:"dependents",lk:"candidates.dependents",type:"number"},
                          {k:"preferred_job",lk:"candidates.colPreferredJob",type:"text"},
                          {k:"work_hours",lk:"candidates.workHours",type:"text"},
                          {k:"availability",lk:"candidates.availability",type:"text"},
                        ].map(f=>(
                          <div key={f.k}>
                            <label style={{display:"block",fontSize:"10px",color:"#6B6B6B",marginBottom:"3px",fontWeight:600}}>{t(f.lk)}</label>
                            <input type={f.type} value={basicEditForm[f.k]||""} onChange={e=>setBasicEditForm({...basicEditForm,[f.k]:e.target.value})}
                              style={{width:"100%",padding:"6px 9px",borderRadius:"6px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none",boxSizing:"border-box"}}/>
                          </div>
                        ))}
                      </div>
                    ) : (
                      [
                        {lk:"candidates.name",v:`${selected.name} / ${selected.name_kana||"—"}`},
                        {lk:"candidates.gender",v:selected.gender||"—"},
                        {lk:"candidates.dob",v:selected.date_of_birth?new Date(selected.date_of_birth).toLocaleDateString("ja-JP"):"—"},
                        {lk:"candidates.contact",v:selected.email||selected.phone||"—"},
                        {lk:"candidates.phone",v:selected.phone||"—"},
                        {lk:"candidates.address",v:selected.address||"ベトナム"},
                        {lk:"candidates.visaType",v:selected.visa_type||"—"},
                        {lk:"candidates.visaExpiry",v:fmtDate(selected.visa_expiry)},
                        {lk:"candidates.colJlpt",v:`${selected.jlpt||"—"} (${selected.jlpt_actual||"—"})`},
                        {lk:"candidates.heightWeight",v:`${selected.height_cm||"—"}cm / ${selected.weight_kg||"—"}kg`},
                        {lk:"candidates.marital",v:selected.marital_status||"—"},
                        {lk:"candidates.dependents",v:`${selected.dependents||0}`},
                        {lk:"candidates.colPreferredJob",v:selected.preferred_job||"—"},
                        {lk:"candidates.workHours",v:selected.work_hours||"—"},
                        {lk:"candidates.availability",v:selected.availability||t("candidates.immediate")},
                      ].map(r=>(
                        <div key={r.lk} style={{display:"flex",gap:"8px",padding:"5px 0",borderBottom:"0.5px solid rgba(11,31,58,0.04)",fontSize:"12px"}}>
                          <span style={{color:"#6B6B6B",width:"80px",flexShrink:0,fontSize:"11px"}}>{t(r.lk)}</span>
                          <span style={{color:navy,fontWeight:500,flex:1,wordBreak:"break-word"}}>{r.v}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* History tab */}
                {detailTab==="history"&&(
                  <div>
                    {(selected.education||[]).length>0&&<>
                      <div style={{fontSize:"11px",fontWeight:700,color:navy,marginBottom:"6px"}}>{t("candidates.education")}</div>
                      {(selected.education||[]).map((e,i)=>(
                        <div key={i} style={{display:"flex",gap:"8px",fontSize:"11px",padding:"4px 0",borderBottom:"0.5px solid rgba(11,31,58,0.04)"}}>
                          <span style={{color:"#6B6B6B",width:"70px",flexShrink:0}}>{e.year}年{e.month}月</span>
                          <span style={{flex:1,color:navy}}>{e.school}</span>
                          <span style={{background:"#E6F1FB",color:"#0C447C",fontSize:"9px",padding:"1px 5px",borderRadius:"3px",flexShrink:0}}>{e.event}</span>
                        </div>
                      ))}
                    </>}
                    {(selected.work_history||[]).length>0&&<>
                      <div style={{fontSize:"11px",fontWeight:700,color:navy,margin:"12px 0 6px"}}>{t("candidates.workHistory")}</div>
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
                      <div style={{fontSize:"11px",fontWeight:700,color:navy,marginBottom:"6px"}}>{t("candidates.certifications")}</div>
                      {(selected.certifications||[]).map((ct,i)=>(
                        <div key={i} style={{display:"flex",gap:"8px",fontSize:"11px",padding:"4px 0",borderBottom:"0.5px solid rgba(11,31,58,0.04)"}}>
                          <span style={{color:"#6B6B6B",width:"70px",flexShrink:0}}>{ct.year}年{ct.month}月</span>
                          <span style={{flex:1,color:navy}}>{ct.name}</span>
                          <span style={{background:"#FAEEDA",color:"#633806",fontSize:"9px",padding:"1px 5px",borderRadius:"3px",flexShrink:0}}>{ct.result}</span>
                        </div>
                      ))}
                    </>}
                    {selected.motivation&&<>
                      <div style={{fontSize:"11px",fontWeight:700,color:navy,margin:"12px 0 6px"}}>{t("candidates.motivation")}</div>
                      <div style={{fontSize:"11px",color:"#444",lineHeight:1.7,background:"#F6F7F9",borderRadius:"6px",padding:"8px"}}>{selected.motivation}</div>
                    </>}
                    {selected.self_pr&&<>
                      <div style={{fontSize:"11px",fontWeight:700,color:navy,margin:"12px 0 6px"}}>{t("candidates.selfPr")}</div>
                      <div style={{fontSize:"11px",color:"#444",lineHeight:1.7,background:"#F6F7F9",borderRadius:"6px",padding:"8px"}}>{selected.self_pr}</div>
                    </>}
                    {selected.ai_data&&(selected.ai_data.strengths as string[])?.length>0&&<>
                      <div style={{fontSize:"11px",fontWeight:700,color:navy,margin:"12px 0 6px"}}>{t("candidates.aiStrengths")}</div>
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
                        <div style={{fontSize:"11px",color:"#6B6B6B",marginBottom:"12px"}}>{t("candidates.runMatching")}</div>
                        <button onClick={()=>runMatch(selected)} style={{padding:"8px 16px",borderRadius:"7px",fontSize:"12px",fontWeight:700,background:"#C8002A",color:"#fff",border:"none",cursor:"pointer"}}>{t("candidates.startMatching")}</button>
                      </div>
                    )}
                    {matching&&<div style={{textAlign:"center",padding:"20px",color:"#6B6B6B",fontSize:"12px"}}>{t("candidates.matching")}</div>}
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
                    <button key={k} onClick={()=>updateStatus(selected.id,k)} style={{padding:"4px 8px",borderRadius:"5px",fontSize:"10px",fontWeight:600,cursor:"pointer",background:selected.status===k?v.tc:v.tb,color:selected.status===k?"#fff":v.tc,border:`1px solid ${v.tc}`}}>{t(v.labelKey)}</button>
                  ))}
                </div>
                <div style={{display:"flex",gap:"6px"}}>
                  <button onClick={()=>exportCV(selected)} style={{flex:1,padding:"7px",borderRadius:"7px",fontSize:"11px",fontWeight:600,background:"#EAF3DE",color:"#27500A",border:"0.5px solid #27500A",cursor:"pointer"}}>📄 {t("common.export")}</button>
                  {selected.email&&<a href={`mailto:${selected.email}`} style={{flex:1,padding:"7px",borderRadius:"7px",fontSize:"11px",fontWeight:600,textAlign:"center",background:navy,color:"#fff",textDecoration:"none"}}>{t("common.sendEmail")}</a>}
                  <button onClick={()=>deleteCandidate(selected.id)} style={{padding:"7px 10px",borderRadius:"7px",fontSize:"11px",fontWeight:600,background:"#FCEBEB",color:"#A32D2D",border:"0.5px solid #F09595",cursor:"pointer"}}>{t("common.delete")}</button>
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
        <div><div style={{fontSize:"14px",fontWeight:700,color:navy}}>{t("candidates.importTitle")}</div><div style={{fontSize:"10px",color:"#6B6B6B"}}>{t("candidates.importSubtitle")}</div></div>
        <button onClick={()=>{setView("list");setFileItems([]);}} style={{padding:"7px 14px",borderRadius:"6px",fontSize:"12px",fontWeight:600,background:"transparent",color:navy,border:`0.5px solid ${navy}`,cursor:"pointer"}}>← {t("common.backToList")}</button>
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
          <div style={{fontSize:"14px",fontWeight:700,color:navy,marginBottom:"4px"}}>{t("candidates.dropzoneTitle")}</div>
          <div style={{fontSize:"11px",color:"#6B6B6B",marginBottom:"12px"}}>{t("candidates.dropzoneHint")}</div>
          <div style={{display:"inline-block",padding:"7px 18px",borderRadius:"7px",background:navy,color:"#fff",fontSize:"12px",fontWeight:600}}>{t("candidates.chooseFile")} ({fileItems.length}/5)</div>
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
                          {item.status==="analyzing"?`${item.progress}% — ${t("candidates.analyzing")}`
                          :item.status==="done"?t("candidates.done")
                          :`${t("candidates.errorPrefix")}${item.result?.error?` · ${item.result.error.slice(0,80)}`:""}`}
                        </div>
                      </div>
                    )}
                    {item.status==="waiting"&&<div style={{fontSize:"10px",color:"#B4B2A9"}}>{t("candidates.waiting")}</div>}
                  </div>
                  <div style={{display:"flex",gap:"5px",flexShrink:0}}>
                    {item.status==="done"&&item.result?.candidate&&(
                      <button onClick={()=>openReview(item)} style={{padding:"5px 10px",borderRadius:"6px",fontSize:"11px",fontWeight:600,background:navy,color:"#fff",border:"none",cursor:"pointer"}}>{t("candidates.reviewSave")}</button>
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

        {retryCountdown>0&&(
          <div style={{background:"#FAEEDA",border:"1px solid #EF9F27",borderRadius:"9px",padding:"12px 16px",marginBottom:"10px",display:"flex",alignItems:"center",gap:"10px"}}>
            <span style={{fontSize:"20px"}}>⏱</span>
            <div style={{flex:1}}>
              <div style={{fontSize:"13px",fontWeight:700,color:"#633806"}}>{t("candidates.rateLimited", { s: retryCountdown })}</div>
              <div style={{fontSize:"11px",color:"#633806",marginTop:"2px"}}>{t("candidates.rateLimitedDesc")}</div>
            </div>
            <div style={{width:"44px",height:"44px",borderRadius:"50%",background:"#fff",border:"2px solid #EF9F27",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",fontWeight:700,color:"#633806",flexShrink:0}}>{retryCountdown}</div>
          </div>
        )}

        {fileItems.length>0&&!isAnalyzing&&fileItems.some(f=>f.status==="waiting")&&retryCountdown===0&&(
          <button onClick={analyzeAll} style={{width:"100%",padding:"12px",borderRadius:"9px",fontSize:"14px",fontWeight:700,background:navy,color:"#fff",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px"}}>
            {t("candidates.runExtract")} ({fileItems.filter(f=>f.status==="waiting").length})
          </button>
        )}

        {fileItems.length===0&&(
          <div style={{background:"#F6F7F9",borderRadius:"10px",padding:"14px 16px"}}>
            <div style={{fontSize:"11px",fontWeight:700,color:navy,marginBottom:"8px"}}>{t("candidates.extractInfo")}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px"}}>
              {Array.from({length:12},(_,i)=>t(`candidates.extractItem${i+1}`)).map((it,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"11px",color:"#444"}}>
                  <div style={{width:"5px",height:"5px",borderRadius:"50%",background:"#27500A",flexShrink:0}}/>
                  {it}
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
          <div><div style={{fontSize:"14px",fontWeight:700,color:navy}}>{t("candidates.reviewHeaderTitle")}</div><div style={{fontSize:"10px",color:"#6B6B6B"}}>{currentReview.fileName}</div></div>
          <button onClick={()=>setView("import")} style={{padding:"7px 14px",borderRadius:"6px",fontSize:"12px",fontWeight:600,background:"transparent",color:navy,border:`0.5px solid ${navy}`,cursor:"pointer"}}>← {t("common.back")}</button>
        </div>
        <div style={{padding:"16px 20px",maxWidth:"920px",margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>
          {/* Left: Edit form */}
          <div>
            <div style={{background:"#fff",...B,borderRadius:"10px",padding:"16px",marginBottom:"12px"}}>
              <div style={{fontSize:"12px",fontWeight:700,color:navy,marginBottom:"12px",display:"flex",alignItems:"center",gap:"7px"}}>
                <span style={{background:"#EAF3DE",color:"#27500A",fontSize:"10px",fontWeight:700,padding:"2px 8px",borderRadius:"20px"}}>{t("candidates.groqExtracted")}</span>
                {t("candidates.reviewFormTitle")}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
                {[
                  {f:"name",lk:"candidates.name",req:true,t:"text"},{f:"name_kana",lk:"candidates.nameKana",t:"text"},
                  {f:"email",lk:"candidates.email",t:"email"},{f:"phone",lk:"candidates.phone",t:"text"},
                  {f:"gender",lk:"candidates.gender",t:"text"},{f:"date_of_birth",lk:"candidates.dob",t:"text"},
                  {f:"visa_type",lk:"candidates.visaType",t:"text"},{f:"visa_expiry",lk:"candidates.visaExpiry",t:"text"},
                  {f:"height_cm",lk:"candidates.heightCm",t:"number"},{f:"weight_kg",lk:"candidates.weightKg",t:"number"},
                  {f:"preferred_job",lk:"candidates.colPreferredJob",t:"text"},{f:"work_hours",lk:"candidates.workHours",t:"text"},
                ].map(x=>(
                  <div key={x.f}>
                    <label style={{display:"block",fontSize:"10px",color:"#6B6B6B",marginBottom:"3px",fontWeight:600}}>{t(x.lk)}{x.req?" *":""}</label>
                    <input type={x.t} value={editForm[x.f]||""} onChange={e=>setEditForm({...editForm,[x.f]:e.target.value})} style={{width:"100%",padding:"6px 10px",borderRadius:"6px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none"}}/>
                  </div>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginTop:"10px"}}>
                <div>
                  <label style={{display:"block",fontSize:"10px",color:"#6B6B6B",marginBottom:"3px",fontWeight:600}}>{t("candidates.colJlpt")}</label>
                  <select value={editForm.jlpt||"N4"} onChange={e=>setEditForm({...editForm,jlpt:e.target.value})} style={{width:"100%",padding:"6px 10px",borderRadius:"6px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none"}}>
                    {["N1","N2","N3","N4","N5","N3相当","N4相当","なし"].map(j=><option key={j}>{j}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{display:"block",fontSize:"10px",color:"#6B6B6B",marginBottom:"3px",fontWeight:600}}>{t("candidates.colIndustry")}</label>
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
                  <div style={{fontSize:"12px",fontWeight:700,color:navy,marginBottom:"10px"}}>{t("candidates.extractedData")}</div>
                  {edu && edu.length>0&&<>
                    <div style={{fontSize:"10px",color:"#6B6B6B",fontWeight:600,marginBottom:"4px"}}>{t("candidates.education")} ({edu.length})</div>
                    {edu.map((e,i)=><div key={i} style={{fontSize:"11px",color:navy,padding:"3px 0",borderBottom:"0.5px solid rgba(11,31,58,0.04)"}}>{e.year}年{e.month}月 {e.school} {e.event}</div>)}
                  </>}
                  {wh && wh.length>0&&<>
                    <div style={{fontSize:"10px",color:"#6B6B6B",fontWeight:600,margin:"8px 0 4px"}}>{t("candidates.workHistory")} ({wh.length})</div>
                    {wh.map((w,i)=><div key={i} style={{fontSize:"11px",color:navy,padding:"3px 0",borderBottom:"0.5px solid rgba(11,31,58,0.04)"}}>{w.year}年{w.month}月 <strong>{w.company}</strong> {w.position} {w.event}</div>)}
                  </>}
                  {crt && crt.length>0&&<>
                    <div style={{fontSize:"10px",color:"#6B6B6B",fontWeight:600,margin:"8px 0 4px"}}>{t("candidates.certifications")} ({crt.length})</div>
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
                  {mot&&<><div style={{fontSize:"10px",fontWeight:700,color:navy,marginBottom:"4px"}}>{t("candidates.motivation")}</div><div style={{fontSize:"11px",color:"#444",lineHeight:1.6,marginBottom:"10px",background:"#F6F7F9",borderRadius:"6px",padding:"8px"}}>{mot}</div></>}
                  {pr&&<><div style={{fontSize:"10px",fontWeight:700,color:navy,marginBottom:"4px"}}>{t("candidates.selfPr")}</div><div style={{fontSize:"11px",color:"#444",lineHeight:1.6,background:"#F6F7F9",borderRadius:"6px",padding:"8px"}}>{pr}</div></>}
                </div>
              );
            })()}
          </div>

          {/* Right: Job matching */}
          <div>
            <div style={{background:"#fff",...B,borderRadius:"10px",padding:"16px",marginBottom:"12px"}}>
              <div style={{fontSize:"12px",fontWeight:700,color:navy,marginBottom:"4px"}}>{t("candidates.aiMatchedJobs")}</div>
              <div style={{fontSize:"10px",color:"#6B6B6B",marginBottom:"12px"}}>
                {t("candidates.desiredLabel")}: <strong>{String(c.preferred_job||t("candidates.notFilled"))}</strong> ·
                {t("candidates.colJlpt")}: <strong>{String(c.jlpt||"—")}</strong> ·
                {t("candidates.colIndustry")}: <strong>{String(c.skill||"—")}</strong>
              </div>
              {currentReview.suggestions.length===0&&<div style={{padding:"16px",textAlign:"center",color:"#6B6B6B",fontSize:"12px"}}>{t("candidates.noJobData")}</div>}
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
                    <span style={{background:job.status==="urgent"?"#FCEBEB":"#E6F1FB",color:job.status==="urgent"?"#A32D2D":"#0C447C",fontSize:"9px",fontWeight:700,padding:"2px 6px",borderRadius:"4px"}}>{job.status==="urgent"?`⚡ ${t("jobs.statusUrgent")}`:t("dashboard.subRecruiting")}</span>
                  </div>
                  {selectedJobId===job.id&&<div style={{marginTop:"6px",paddingTop:"6px",borderTop:"0.5px solid rgba(11,31,58,0.08)",fontSize:"10px",color:"#27500A",fontWeight:700}}>{t("candidates.registerToThisJob")}</div>}
                </div>
              ))}
              <button onClick={()=>setSelectedJobId(null)} style={{width:"100%",padding:"7px",borderRadius:"7px",fontSize:"11px",color:"#6B6B6B",border:"0.5px solid rgba(11,31,58,0.15)",background:"transparent",cursor:"pointer",marginTop:"4px"}}>
                {t("candidates.noMatchOption")}
              </button>
            </div>

            <button onClick={saveCandidate} disabled={!editForm.name||saving} style={{width:"100%",padding:"13px",borderRadius:"9px",fontSize:"14px",fontWeight:700,background:editForm.name&&!saving?navy:"#B4B2A9",color:"#fff",border:"none",cursor:editForm.name?"pointer":"not-allowed",transition:"background 0.2s"}}>
              {saving?t("candidates.savingDb"):t("candidates.saveToDbBtn")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
