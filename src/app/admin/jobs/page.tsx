"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAdminLang, fieldLabel } from "@/lib/adminI18n";

type Job = {
  id: string; company: string; location: string;
  position_ja: string; position_vn: string; industry: string;
  count: number; salary: string; jlpt_min: string; status: string;
  // 求人概要
  osusume_point: string; position_name: string; position_note: string;
  job_description: string; requirements: string; qualifications: string;
  language_skills: string; education_req: string; work_location: string;
  selection_process: string; work_environment: string; annual_income: string;
  salary_type: string; salary_note: string; employment_type: string; visa_type: string;
  work_hours: string; trial_period: string; insurance: string;
  holidays: string; remarks: string; reference_url: string;
  created_at: string;
};

type MatchResult = {
  candidateId: string; candidateName: string; matchPct: number;
  reasonJa: string; reasonVn: string; strengths: string[];
  candidate: { id:string;name:string;skill:string;jlpt:string;status:string;email:string;phone:string };
};

const ST: Record<string,{ja:string;vn:string;tc:string;tb:string;labelKey:string}> = {
  urgent:{ja:"緊急募集",vn:"Khẩn cấp",tc:"#A32D2D",tb:"#FCEBEB",labelKey:"jobs.statusUrgent"},
  open:  {ja:"募集中",  vn:"Đang tuyển",tc:"#0C447C",tb:"#E6F1FB",labelKey:"jobs.statusOpen"},
  full:  {ja:"充足",    vn:"Đủ người",  tc:"#27500A",tb:"#EAF3DE",labelKey:"jobs.statusFull"},
  paused:{ja:"停止",    vn:"Tạm dừng",  tc:"#444441",tb:"#F1EFE8",labelKey:"jobs.statusPaused"},
};
const IND: Record<string,{tc:string;tb:string;icon:string}> = {
  "介護":            {tc:"#0F6E6E",tb:"#E0F7F7",icon:"🩺"},
  "ビルクリーニング": {tc:"#6B6B6B",tb:"#F6F7F9",icon:"🧹"},
  "工業製品製造業":   {tc:"#27500A",tb:"#EAF3DE",icon:"🏭"},
  "製造":            {tc:"#27500A",tb:"#EAF3DE",icon:"🏭"},
  "建設":            {tc:"#8A6800",tb:"#FFF4D6",icon:"🏗️"},
  "造船・舶用工業":   {tc:"#0369A1",tb:"#E0F2FE",icon:"🚢"},
  "自動車整備":       {tc:"#3730A3",tb:"#E8EAFD",icon:"🔧"},
  "航空":            {tc:"#0C447C",tb:"#E6F1FB",icon:"✈️"},
  "宿泊":            {tc:"#534AB7",tb:"#EEEDFE",icon:"🏨"},
  "ホテル":          {tc:"#534AB7",tb:"#EEEDFE",icon:"🏨"},
  "農業":            {tc:"#633806",tb:"#FAEEDA",icon:"🌾"},
  "漁業":            {tc:"#9F1239",tb:"#FFE4E6",icon:"🎣"},
  "飲食料品製造業":   {tc:"#4D6B0A",tb:"#F0F9DB",icon:"🍱"},
  "外食業":          {tc:"#0C447C",tb:"#E6F1FB",icon:"🍽️"},
  "飲食":            {tc:"#0C447C",tb:"#E6F1FB",icon:"🍽️"},
  "繊維業":          {tc:"#9D2467",tb:"#FDE7F3",icon:"🧵"},
  "印刷業":          {tc:"#6B6B6B",tb:"#F6F7F9",icon:"🖨️"},
  "鉄道":            {tc:"#0369A1",tb:"#E0F2FE",icon:"🚃"},
  "林業":            {tc:"#27500A",tb:"#EAF3DE",icon:"🌲"},
  "IT":              {tc:"#3730A3",tb:"#E8EAFD",icon:"💻"},
  "機械・電気電子":   {tc:"#534AB7",tb:"#EEEDFE",icon:"⚙️"},
  "国際業務":         {tc:"#0C447C",tb:"#E6F1FB",icon:"🌐"},
  "通訳・翻訳":       {tc:"#8A6800",tb:"#FFF4D6",icon:"🗣️"},
  "経理・会計":       {tc:"#9F1239",tb:"#FFE4E6",icon:"📊"},
  "その他":          {tc:"#6B6B6B",tb:"#F6F7F9",icon:"📁"},
};
const INDUSTRY_LIST = ["介護","ビルクリーニング","工業製品製造業","建設","造船・舶用工業","自動車整備","航空","宿泊","農業","漁業","飲食料品製造業","外食業","繊維業","印刷業","鉄道","林業","IT","機械・電気電子","国際業務","通訳・翻訳","経理・会計","その他"];
const VISA_LIST = ["特定技能1号","特定技能2号","技術・人文知識・国際業務","技能実習","特定活動","永住者","日本人配偶者等","定住者"];
const EMPLOYMENT_LIST = ["正社員","契約社員","パート・アルバイト","派遣社員"];

const FIELDS = [
  {key:"osusume_point",   ja:"おすすめポイント",    vn:"Điểm nổi bật",      rows:3},
  {key:"position_name",   ja:"ポジション名",        vn:"Tên vị trí",         rows:1},
  {key:"position_note",   ja:"ポジション備考",      vn:"Ghi chú vị trí",     rows:2},
  {key:"job_description", ja:"職務内容",             vn:"Nội dung công việc", rows:4},
  {key:"requirements",    ja:"応募要件",             vn:"Yêu cầu ứng tuyển", rows:3},
  {key:"qualifications",  ja:"資格",                 vn:"Bằng cấp/Chứng chỉ",rows:2},
  {key:"language_skills", ja:"語学力",               vn:"Ngôn ngữ yêu cầu",  rows:1},
  {key:"education_req",   ja:"学歴",                 vn:"Học vấn",            rows:1},
  {key:"work_location",   ja:"勤務地",               vn:"Địa điểm làm việc", rows:1},
  {key:"selection_process",ja:"選考内容",            vn:"Quy trình tuyển dụng",rows:2},
  {key:"work_environment",ja:"就業環境備考",         vn:"Môi trường làm việc",rows:2},
  {key:"annual_income",   ja:"年収",                 vn:"Thu nhập năm",       rows:1},
  {key:"salary_type",     ja:"給与形態",             vn:"Hình thức trả lương",rows:1},
  {key:"salary_note",     ja:"賃金備考",             vn:"Ghi chú lương",      rows:2},
  {key:"employment_type", ja:"雇用形態",             vn:"Hình thức hợp đồng",rows:1},
  {key:"visa_type",       ja:"在留資格",             vn:"Loại visa",         rows:1},
  {key:"work_hours",      ja:"勤務時間",             vn:"Giờ làm việc",       rows:1},
  {key:"trial_period",    ja:"試用期間",             vn:"Thời gian thử việc", rows:1},
  {key:"insurance",       ja:"各種保険",             vn:"Bảo hiểm",           rows:1},
  {key:"holidays",        ja:"休日・休暇",           vn:"Ngày nghỉ",          rows:2},
  {key:"remarks",         ja:"備考",                 vn:"Ghi chú khác",       rows:2},
  {key:"reference_url",   ja:"参考URL",              vn:"Link tham khảo",     rows:1},
];

const EMPTY_JOB = {
  company:"",location:"",position_ja:"",position_vn:"",industry:"その他",
  count:"1",salary:"",jlpt_min:"N4",status:"open",
  osusume_point:"",position_name:"",position_note:"",job_description:"",
  requirements:"",qualifications:"",language_skills:"",education_req:"",
  work_location:"",selection_process:"",work_environment:"",annual_income:"",
  salary_type:"月給",salary_note:"",employment_type:"正社員",visa_type:"特定技能1号",work_hours:"",
  trial_period:"3ヶ月",insurance:"健康保険・厚生年金・雇用保険・労災保険",
  holidays:"",remarks:"",reference_url:"",
};

export default function JobsPage() {
  const router = useRouter();
  const { lang, t } = useAdminLang();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [jlptFilter, setJlptFilter] = useState("all");
  const [visaFilter, setVisaFilter] = useState("all");
  const [employmentFilter, setEmploymentFilter] = useState("all");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;
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

  const filtered = jobs.filter(j=>{
    if (filter!=="all" && j.status!==filter) return false;
    if (industryFilter!=="all" && j.industry!==industryFilter) return false;
    if (jlptFilter!=="all" && j.jlpt_min!==jlptFilter) return false;
    if (visaFilter!=="all" && j.visa_type!==visaFilter) return false;
    if (employmentFilter!=="all" && j.employment_type!==employmentFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const hay = `${j.company} ${j.position_ja} ${j.position_vn} ${j.location}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  const activeFilterCount = (filter!=="all"?1:0) + (industryFilter!=="all"?1:0) + (jlptFilter!=="all"?1:0) + (visaFilter!=="all"?1:0) + (employmentFilter!=="all"?1:0) + (search?1:0);
  const clearFilters = () => { setFilter("all"); setIndustryFilter("all"); setJlptFilter("all"); setVisaFilter("all"); setEmploymentFilter("all"); setSearch(""); };

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagedJobs = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);
  useEffect(()=>{ setPage(1); }, [filter,industryFilter,jlptFilter,visaFilter,employmentFilter,search]);
  useEffect(()=>{ if (page>pageCount) setPage(pageCount); }, [pageCount, page]);
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
    if (!confirm(t("jobs.deleteConfirm"))) return;
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
      <style>{`
        @keyframes jobCardIn { from { opacity:0; transform:translateY(10px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes shimmer { 0%{background-position:-400px 0;} 100%{background-position:400px 0;} }
        @keyframes pageFade { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
        .job-card { transition: box-shadow 0.25s cubic-bezier(0.22,1,0.36,1), transform 0.25s cubic-bezier(0.22,1,0.36,1), border-color 0.2s; }
        .job-card:hover { box-shadow: 0 10px 26px rgba(11,31,58,0.14); transform: translateY(-3px); }
        .job-card:hover .job-card-link { gap:6px !important; color:#0C447C; }
        .job-card-link { transition: gap 0.2s ease, color 0.2s ease; }
        .jobs-input, .jobs-select { transition: border-color 0.15s, box-shadow 0.15s; }
        .jobs-input:focus, .jobs-select:focus { border-color:#0B1F3A !important; box-shadow: 0 0 0 3px rgba(11,31,58,0.08); }
      `}</style>
      <div style={{background:"#fff",...B,borderTop:"none",borderLeft:"none",borderRight:"none",padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"10px"}}>
        <div>
          <div style={{fontSize:"16px",fontWeight:700,color:navy,letterSpacing:"-0.01em"}}>{t("jobs.title")}</div>
          <div style={{fontSize:"10px",color:"#6B6B6B",marginTop:"2px"}}>{t("jobs.subtitle")}</div>
        </div>
        <button onClick={()=>openForm()} style={{padding:"9px 16px",borderRadius:"8px",fontSize:"12px",fontWeight:700,background:navy,color:"#fff",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:"6px",transition:"opacity 0.15s"}}
          onMouseEnter={e=>{e.currentTarget.style.opacity="0.85";}} onMouseLeave={e=>{e.currentTarget.style.opacity="1";}}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          {t("jobs.addJob")}
        </button>
      </div>
      <div style={{padding:"16px 20px"}}>
        {/* Search + advanced filters toolbar */}
        <div style={{background:"#fff",...B,borderRadius:"10px",padding:"12px 14px",marginBottom:"12px",display:"flex",gap:"10px",flexWrap:"wrap",alignItems:"center"}}>
          <div style={{position:"relative",flex:"1 1 220px",minWidth:"200px"}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B4B2A9" strokeWidth="2" style={{position:"absolute",left:"10px",top:"50%",transform:"translateY(-50%)"}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder={t("jobs.searchPlaceholder")} value={search} className="jobs-input"
              onChange={e=>setSearch(e.target.value)}
              style={{width:"100%",padding:"7px 10px 7px 30px",borderRadius:"7px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none",boxSizing:"border-box"}}/>
          </div>
          <select value={industryFilter} onChange={e=>setIndustryFilter(e.target.value)} className="jobs-select"
            style={{padding:"7px 10px",borderRadius:"7px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",color:navy,background:"#fff",cursor:"pointer",outline:"none"}}>
            <option value="all">{t("jobs.allIndustries")}</option>
            {INDUSTRY_LIST.map(i=><option key={i} value={i}>{IND[i]?.icon} {i}</option>)}
          </select>
          <select value={jlptFilter} onChange={e=>setJlptFilter(e.target.value)} className="jobs-select"
            style={{padding:"7px 10px",borderRadius:"7px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",color:navy,background:"#fff",cursor:"pointer",outline:"none"}}>
            <option value="all">{t("jobs.allJlpt")}</option>
            {["N1","N2","N3","N4","N5","なし"].map(j=><option key={j} value={j}>{j}</option>)}
          </select>
          <select value={visaFilter} onChange={e=>setVisaFilter(e.target.value)} className="jobs-select"
            style={{padding:"7px 10px",borderRadius:"7px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",color:navy,background:"#fff",cursor:"pointer",outline:"none"}}>
            <option value="all">{t("jobs.allVisa")}</option>
            {VISA_LIST.map(v=><option key={v} value={v}>{v}</option>)}
          </select>
          <select value={employmentFilter} onChange={e=>setEmploymentFilter(e.target.value)} className="jobs-select"
            style={{padding:"7px 10px",borderRadius:"7px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",color:navy,background:"#fff",cursor:"pointer",outline:"none"}}>
            <option value="all">{t("jobs.allEmployment")}</option>
            {EMPLOYMENT_LIST.map(e=><option key={e} value={e}>{e}</option>)}
          </select>
          {activeFilterCount>0&&(
            <button onClick={clearFilters} style={{padding:"7px 12px",borderRadius:"7px",fontSize:"11px",fontWeight:600,background:"#FCEBEB",color:"#A32D2D",border:"0.5px solid #F09595",cursor:"pointer",whiteSpace:"nowrap"}}>
              ✕ {t("common.clearFilters")} ({activeFilterCount})
            </button>
          )}
          <div style={{marginLeft:"auto",fontSize:"11px",color:"#6B6B6B",whiteSpace:"nowrap"}}>
            {loading?t("common.loading"):pageCount>1?`${filtered.length} ${t("common.results")} · ${t("jobs.pageOf",{page,total:pageCount})}`:`${filtered.length} ${t("common.results")}`}
          </div>
        </div>

        <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"14px"}}>
          {[{k:"all",lk:"common.all",n:counts.all},{k:"urgent",lk:"jobs.statusUrgent",n:counts.urgent},{k:"open",lk:"jobs.statusOpen",n:counts.open},{k:"full",lk:"jobs.statusFull",n:counts.full},{k:"paused",lk:"jobs.statusPaused",n:counts.paused}].map(f=>(
            <button key={f.k} onClick={()=>setFilter(f.k)} style={{padding:"5px 12px",borderRadius:"20px",fontSize:"11px",fontWeight:600,border:`1px solid ${filter===f.k?navy:"rgba(11,31,58,0.15)"}`,background:filter===f.k?navy:"#fff",color:filter===f.k?"#fff":"#6B6B6B",cursor:"pointer",whiteSpace:"nowrap",transition:"all 0.15s"}}>{t(f.lk)}({f.n})</button>
          ))}
        </div>

        {loading ? (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:"12px"}}>
            {Array.from({length:6}).map((_,i)=>(
              <div key={i} style={{background:"#fff",...B,borderRadius:"12px",padding:"16px",height:"172px"}}>
                <div style={{height:"14px",width:"70%",borderRadius:"4px",marginBottom:"10px",background:"linear-gradient(90deg,#F1EFE8 0px,#F8F7F3 40px,#F1EFE8 80px)",backgroundSize:"400px 100%",animation:"shimmer 1.4s infinite linear"}}/>
                <div style={{height:"10px",width:"40%",borderRadius:"4px",marginBottom:"18px",background:"linear-gradient(90deg,#F1EFE8 0px,#F8F7F3 40px,#F1EFE8 80px)",backgroundSize:"400px 100%",animation:"shimmer 1.4s infinite linear"}}/>
                <div style={{height:"10px",width:"90%",borderRadius:"4px",marginBottom:"8px",background:"linear-gradient(90deg,#F1EFE8 0px,#F8F7F3 40px,#F1EFE8 80px)",backgroundSize:"400px 100%",animation:"shimmer 1.4s infinite linear"}}/>
                <div style={{height:"10px",width:"60%",borderRadius:"4px",background:"linear-gradient(90deg,#F1EFE8 0px,#F8F7F3 40px,#F1EFE8 80px)",backgroundSize:"400px 100%",animation:"shimmer 1.4s infinite linear"}}/>
              </div>
            ))}
          </div>
        ) :
        filtered.length===0 ? (
          <div style={{padding:"48px",textAlign:"center",background:"#fff",...B,borderRadius:"10px"}}>
            <div style={{fontSize:"32px",marginBottom:"12px"}}>📋</div>
            <div style={{fontSize:"14px",fontWeight:700,color:navy,marginBottom:"6px"}}>{activeFilterCount>0?t("jobs.emptyFiltered"):t("jobs.empty")}</div>
            {activeFilterCount>0
              ? <button onClick={clearFilters} style={{marginTop:"8px",padding:"8px 18px",borderRadius:"7px",fontSize:"12px",fontWeight:700,background:"transparent",color:navy,border:`1px solid ${navy}`,cursor:"pointer"}}>{t("common.clearFilters")}</button>
              : <button onClick={()=>openForm()} style={{marginTop:"12px",padding:"8px 20px",borderRadius:"7px",fontSize:"12px",fontWeight:700,background:navy,color:"#fff",border:"none",cursor:"pointer"}}>{t("jobs.addFirstJob")}</button>}
          </div>
        ) : (
          <>
          <div key={page} style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:"12px",animation:"pageFade 0.25s ease both"}}>
            {pagedJobs.map((j,idx)=>{
              const st=ST[j.status]||ST.open;
              const ind=IND[j.industry]||IND["その他"];
              return(
                <div key={j.id} onClick={()=>openDetail(j)} className="job-card" style={{background:"#fff",...B,borderRadius:"12px",padding:"16px",cursor:"pointer",boxShadow:"0 1px 3px rgba(11,31,58,0.06)",animation:"jobCardIn 0.4s cubic-bezier(0.22,1,0.36,1) both",animationDelay:`${Math.min(idx*25,250)}ms`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"10px"}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:"13px",fontWeight:700,color:navy,marginBottom:"2px"}}>{j.company}</div>
                      <div style={{fontSize:"10px",color:"#6B6B6B"}}>{j.location}</div>
                    </div>
                    <span style={{background:st.tb,color:st.tc,fontSize:"10px",fontWeight:700,padding:"3px 8px",borderRadius:"20px",flexShrink:0,marginLeft:"8px"}}>{t(st.labelKey)}</span>
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
                    <span style={{background:"#EAF3DE",color:"#27500A",fontSize:"10px",fontWeight:700,padding:"2px 7px",borderRadius:"4px"}}>{t("jobs.jlptOrMore",{lvl:j.jlpt_min})}</span>
                    {j.visa_type && <span style={{background:"#EEEDFE",color:"#534AB7",fontSize:"10px",fontWeight:700,padding:"2px 7px",borderRadius:"4px"}}>{j.visa_type}</span>}
                    <span style={{background:"#F6F7F9",color:"#6B6B6B",fontSize:"10px",padding:"2px 7px",borderRadius:"4px"}}>{t("jobs.peopleWantedFull",{n:j.count})}</span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:"10px",borderTop:"0.5px solid rgba(11,31,58,0.08)"}}>
                    <span style={{fontSize:"12px",fontWeight:700,color:"#27500A"}}>{j.salary||j.annual_income||t("jobs.negotiable")}</span>
                    <span className="job-card-link" style={{fontSize:"10px",color:"#185FA5",fontWeight:600,display:"inline-flex",alignItems:"center",gap:"3px"}}>{t("jobs.viewDetail")}</span>
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

          {pageCount>1 && (
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"6px",marginTop:"20px"}}>
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1}
                style={{padding:"7px 14px",borderRadius:"7px",fontSize:"12px",fontWeight:600,background:"#fff",color:page<=1?"#C8D0DB":navy,border:"0.5px solid rgba(11,31,58,0.15)",cursor:page<=1?"not-allowed":"pointer",transition:"all 0.15s"}}>
                ← {t("jobs.prevPage")}
              </button>
              <div style={{display:"flex",gap:"4px"}}>
                {Array.from({length:pageCount},(_,i)=>i+1).map(p=>(
                  <button key={p} onClick={()=>setPage(p)}
                    style={{width:"30px",height:"30px",borderRadius:"7px",fontSize:"12px",fontWeight:700,border:`1px solid ${p===page?navy:"rgba(11,31,58,0.15)"}`,background:p===page?navy:"#fff",color:p===page?"#fff":"#6B6B6B",cursor:"pointer",transition:"all 0.15s"}}>
                    {p}
                  </button>
                ))}
              </div>
              <button onClick={()=>setPage(p=>Math.min(pageCount,p+1))} disabled={page>=pageCount}
                style={{padding:"7px 14px",borderRadius:"7px",fontSize:"12px",fontWeight:600,background:"#fff",color:page>=pageCount?"#C8D0DB":navy,border:"0.5px solid rgba(11,31,58,0.15)",cursor:page>=pageCount?"not-allowed":"pointer",transition:"all 0.15s"}}>
                {t("jobs.nextPage")} →
              </button>
            </div>
          )}
          </>
        )}
      </div>
    </div>
  );

  // ── DETAIL VIEW ────────────────────────────────────
  if (view==="detail" && selected) {
    const st=ST[selected.status]||ST.open;
    const ind=IND[selected.industry]||IND["その他"];
    return (
      <div>
        <div style={{background:"#fff",...B,borderTop:"none",borderLeft:"none",borderRight:"none",padding:"0 20px",height:"52px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
            <button onClick={()=>setView("list")} style={{background:"none",border:"none",cursor:"pointer",color:"#6B6B6B",display:"flex",alignItems:"center",gap:"4px",fontSize:"12px"}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              {t("common.backToList")}
            </button>
            <div style={{width:"1px",height:"20px",background:"rgba(11,31,58,0.1)"}}/>
            <div>
              <div style={{fontSize:"14px",fontWeight:700,color:navy}}>{selected.company}</div>
              <div style={{fontSize:"10px",color:"#6B6B6B"}}>{selected.position_ja}</div>
            </div>
          </div>
          <div style={{display:"flex",gap:"8px"}}>
            <button onClick={runMatch} disabled={matching} style={{padding:"7px 14px",borderRadius:"6px",fontSize:"12px",fontWeight:700,background:matching?"#888":"#C8002A",color:"#fff",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:"5px"}}>
              {matching?<>{t("jobs.matchingInProgress")}</>:<><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>{t("jobs.aiMatchBtn")}</>}
            </button>
            <button onClick={()=>openForm(selected)} style={{padding:"7px 14px",borderRadius:"6px",fontSize:"12px",fontWeight:600,background:"transparent",color:navy,border:`0.5px solid ${navy}`,cursor:"pointer"}}>✏️ {t("common.edit")}</button>
            <button onClick={()=>deleteJob(selected.id)} style={{padding:"7px 12px",borderRadius:"6px",fontSize:"12px",fontWeight:600,background:"#FCEBEB",color:"#A32D2D",border:"0.5px solid #F09595",cursor:"pointer"}}>{t("common.delete")}</button>
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
                    <span>👥 {t("jobs.peopleWantedFull",{n:selected.count})}</span>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{background:st.tb,color:st.tc,fontSize:"11px",fontWeight:700,padding:"4px 10px",borderRadius:"20px",marginBottom:"6px"}}>{t(st.labelKey)}</div>
                  <select value={selected.status} onChange={e=>updateStatus(selected.id,e.target.value)} style={{padding:"4px 8px",borderRadius:"5px",fontSize:"10px",border:"0.5px solid rgba(11,31,58,0.2)",background:"transparent",cursor:"pointer",outline:"none"}}>
                    {Object.entries(ST).map(([k,v])=><option key={k} value={k}>{t(v.labelKey)}</option>)}
                  </select>
                </div>
              </div>
              <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
                <span style={{background:ind.tb,color:ind.tc,fontSize:"11px",fontWeight:700,padding:"3px 10px",borderRadius:"20px"}}>{ind.icon} {selected.industry}</span>
                <span style={{background:"#EAF3DE",color:"#27500A",fontSize:"11px",fontWeight:700,padding:"3px 10px",borderRadius:"20px"}}>{t("jobs.jlptOrMore",{lvl:selected.jlpt_min})}</span>
                <span style={{background:"#E6F1FB",color:"#0C447C",fontSize:"11px",fontWeight:700,padding:"3px 10px",borderRadius:"20px"}}>{selected.employment_type||t("jobs.employmentTypeDefault")}</span>
                {selected.visa_type&&<span style={{background:"#EEEDFE",color:"#534AB7",fontSize:"11px",fontWeight:700,padding:"3px 10px",borderRadius:"20px"}}>🛂 {selected.visa_type}</span>}
                <span style={{background:"#F6F7F9",color:"#444",fontSize:"11px",padding:"3px 10px",borderRadius:"20px"}}>{selected.salary||selected.annual_income}</span>
              </div>
              {selected.osusume_point&&(
                <div style={{marginTop:"12px",background:"#FFFBEB",borderRadius:"8px",padding:"10px 14px",fontSize:"12px",color:"#92400E",borderLeft:"3px solid #F59E0B",lineHeight:1.7}}>
                  <div style={{fontWeight:700,marginBottom:"4px"}}>{t("jobs.osusumePointLabel")}</div>
                  {selected.osusume_point}
                </div>
              )}
            </div>

            {/* Tabs */}
            <div style={{display:"flex",gap:0,marginBottom:"12px",background:"#fff",borderRadius:"10px 10px 0 0",overflow:"hidden",border:"0.5px solid rgba(11,31,58,0.1)",borderBottom:"none"}}>
              {[{k:"info",l:t("jobs.tabInfo")},{k:"match",l:`${t("jobs.tabMatch")}${matches.length>0?` (${matches.length})`:""}`}].map(tb=>(
                <button key={tb.k} onClick={()=>setActiveTab(tb.k as "info"|"match")} style={{flex:1,padding:"12px",fontSize:"12px",fontWeight:activeTab===tb.k?700:400,color:activeTab===tb.k?navy:"#6B6B6B",border:"none",background:activeTab===tb.k?"#fff":"#F6F7F9",borderBottom:`2px solid ${activeTab===tb.k?navy:"transparent"}`,cursor:"pointer"}}>
                  {tb.l}
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
                        <div style={{fontSize:"11px",fontWeight:700,color:navy}}>{fieldLabel(field.key,lang)}</div>
                      </div>
                      <div style={{padding:"12px 14px",fontSize:"12px",color:"#333",lineHeight:1.7,whiteSpace:"pre-wrap"}}>{val}</div>
                    </div>
                  );
                })}
                {!FIELDS.some(f=>f.key!=="osusume_point"&&(selected as Record<string,unknown>)[f.key])&&(
                  <div style={{padding:"32px",textAlign:"center",color:"#6B6B6B",fontSize:"13px"}}>
                    {t("jobs.emptyDetail")}
                    <br/><button onClick={()=>openForm(selected)} style={{marginTop:"12px",padding:"8px 16px",borderRadius:"7px",fontSize:"12px",fontWeight:600,background:navy,color:"#fff",border:"none",cursor:"pointer"}}>{t("jobs.fillNow")}</button>
                  </div>
                )}
              </div>
            )}

            {activeTab==="match"&&(
              <div style={{background:"#fff",...B,borderRadius:"0 0 12px 12px",padding:"16px"}}>
                {matching&&(
                  <div style={{textAlign:"center",padding:"32px",color:"#6B6B6B"}}>
                    <div style={{fontSize:"24px",marginBottom:"12px"}}>🤖</div>
                    <div style={{fontSize:"13px",fontWeight:600,color:navy}}>{t("jobs.aiAnalyzing")}</div>
                    <div style={{fontSize:"11px",color:"#6B6B6B",marginTop:"4px"}}>{t("jobs.aiAnalyzingDesc")}</div>
                  </div>
                )}
                {!matching&&matches.length===0&&(
                  <div style={{textAlign:"center",padding:"32px"}}>
                    <div style={{fontSize:"24px",marginBottom:"12px"}}>🎯</div>
                    <div style={{fontSize:"13px",fontWeight:600,color:navy,marginBottom:"6px"}}>{t("jobs.runMatchTitle")}</div>
                    <div style={{fontSize:"11px",color:"#6B6B6B",marginBottom:"16px"}}>{t("jobs.runMatchDesc")}</div>
                    <button onClick={runMatch} style={{padding:"9px 20px",borderRadius:"8px",fontSize:"12px",fontWeight:700,background:"#C8002A",color:"#fff",border:"none",cursor:"pointer"}}>{t("candidates.startMatching")}</button>
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
                        <div style={{fontSize:"9px",color:"#6B6B6B"}}>{t("jobs.matchDegree")}</div>
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
                      <a href={`mailto:${m.candidate?.email}`} style={{flex:1,padding:"6px",borderRadius:"6px",fontSize:"11px",fontWeight:600,textAlign:"center",background:navy,color:"#fff",textDecoration:"none"}}>{t("common.sendEmail")}</a>
                      {m.candidate?.phone&&<a href={`tel:${m.candidate.phone}`} style={{flex:1,padding:"6px",borderRadius:"6px",fontSize:"11px",fontWeight:600,textAlign:"center",background:"#EAF3DE",color:"#27500A",textDecoration:"none",border:"0.5px solid #27500A"}}>{t("common.call")}</a>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Quick info */}
          <div>
            <div style={{background:"#fff",...B,borderRadius:"12px",padding:"16px",marginBottom:"12px"}}>
              <div style={{fontSize:"12px",fontWeight:700,color:navy,marginBottom:"12px"}}>{t("jobs.quickInfo")}</div>
              {[
                {lk:"jobs.location",v:selected.work_location||selected.location},
                {lk:"jobs.salary",v:selected.salary||selected.annual_income},
                {lk:"jobs.employmentType",v:selected.employment_type},
                {lk:"jobs.visaType",v:selected.visa_type},
                {lk:"jobs.workHours",v:selected.work_hours},
                {lk:"jobs.japaneseReq",v:selected.language_skills||t("jobs.jlptOrMore",{lvl:selected.jlpt_min})},
                {lk:"jobs.trialPeriod",v:selected.trial_period},
                {lk:"jobs.insurance",v:selected.insurance},
                {lk:"jobs.holidays",v:selected.holidays},
              ].filter(r=>r.v).map(r=>(
                <div key={r.lk} style={{display:"flex",gap:"8px",padding:"7px 0",borderBottom:"0.5px solid rgba(11,31,58,0.05)"}}>
                  <span style={{fontSize:"11px",color:"#6B6B6B",width:"70px",flexShrink:0}}>{t(r.lk)}</span>
                  <span style={{fontSize:"11px",color:navy,fontWeight:500,flex:1}}>{r.v}</span>
                </div>
              ))}
            </div>

            {selected.reference_url&&(
              <div style={{background:"#fff",...B,borderRadius:"12px",padding:"16px",marginBottom:"12px"}}>
                <div style={{fontSize:"12px",fontWeight:700,color:navy,marginBottom:"8px"}}>{t("jobs.refLink")}</div>
                <a href={selected.reference_url} target="_blank" style={{fontSize:"11px",color:"#185FA5",wordBreak:"break-all"}}>{selected.reference_url}</a>
              </div>
            )}

            <div style={{background:"#fff",...B,borderRadius:"12px",padding:"16px"}}>
              <div style={{fontSize:"12px",fontWeight:700,color:navy,marginBottom:"10px"}}>{t("jobs.registeredInfo")}</div>
              <div style={{fontSize:"10px",color:"#6B6B6B"}}>{t("jobs.createdAt")}: {new Date(selected.created_at).toLocaleDateString("ja-JP")}</div>
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
            {t("common.back")}
          </button>
          <div style={{width:"1px",height:"20px",background:"rgba(11,31,58,0.1)"}}/>
          <div style={{fontSize:"14px",fontWeight:700,color:navy}}>{form.id?t("jobs.formEdit"):t("jobs.formNew")}</div>
        </div>
        <button form="job-form" type="submit" disabled={saving} style={{padding:"7px 16px",borderRadius:"6px",fontSize:"12px",fontWeight:600,background:saving?"#888":navy,color:"#fff",border:"none",cursor:"pointer"}}>
          {saving?t("common.saving"):`💾 ${t("common.save")}`}
        </button>
      </div>

      <form id="job-form" onSubmit={saveJob} style={{padding:"16px 20px",maxWidth:"900px"}}>
        {/* Basic info */}
        <div style={{background:"#fff",...B,borderRadius:"12px",padding:"20px",marginBottom:"12px"}}>
          <div style={{fontSize:"13px",fontWeight:700,color:navy,marginBottom:"14px",paddingBottom:"10px",borderBottom:"0.5px solid rgba(11,31,58,0.08)"}}>{t("jobs.basicInfo")}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"12px"}}>
            {[
              {f:"company",     lk:"jobs.fieldCompany",     p:"山本フーズ株式会社",  req:true},
              {f:"location",    lk:"jobs.fieldLocation",    p:"東京都 新宿区",       req:false},
              {f:"position_ja", lk:"jobs.fieldPositionJa",  p:"調理師",              req:true},
              {f:"position_vn", lk:"jobs.fieldPositionVn",  p:"Nhân viên bếp",       req:false},
              {f:"salary",      lk:"jobs.fieldSalary",      p:"¥200,000〜",          req:false},
              {f:"count",       lk:"jobs.fieldCount",       p:"3",                   req:false},
            ].map(x=>(
              <div key={x.f}>
                <label style={{display:"block",fontSize:"10px",color:"#6B6B6B",marginBottom:"4px",fontWeight:600}}>{t(x.lk)}</label>
                <input required={x.req} type={x.f==="count"?"number":"text"} placeholder={x.p} value={form[x.f]||""} onChange={e=>setForm({...form,[x.f]:e.target.value})} style={{width:"100%",padding:"8px 10px",borderRadius:"7px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none"}}/>
              </div>
            ))}
            <div>
              <label style={{display:"block",fontSize:"10px",color:"#6B6B6B",marginBottom:"4px",fontWeight:600}}>{t("jobs.fieldIndustry")}</label>
              <select value={form.industry||"その他"} onChange={e=>setForm({...form,industry:e.target.value})} style={{width:"100%",padding:"8px 10px",borderRadius:"7px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none"}}>
                {INDUSTRY_LIST.map(i=><option key={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label style={{display:"block",fontSize:"10px",color:"#6B6B6B",marginBottom:"4px",fontWeight:600}}>{t("jobs.fieldJlptMin")}</label>
              <select value={form.jlpt_min||"N4"} onChange={e=>setForm({...form,jlpt_min:e.target.value})} style={{width:"100%",padding:"8px 10px",borderRadius:"7px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none"}}>
                {["N1","N2","N3","N4","N5","なし"].map(j=><option key={j}>{j}</option>)}
              </select>
            </div>
            <div>
              <label style={{display:"block",fontSize:"10px",color:"#6B6B6B",marginBottom:"4px",fontWeight:600}}>{t("jobs.fieldStatus")}</label>
              <select value={form.status||"open"} onChange={e=>setForm({...form,status:e.target.value})} style={{width:"100%",padding:"8px 10px",borderRadius:"7px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none"}}>
                {Object.entries(ST).map(([k,v])=><option key={k} value={k}>{t(v.labelKey)}</option>)}
              </select>
            </div>
            <div>
              <label style={{display:"block",fontSize:"10px",color:"#6B6B6B",marginBottom:"4px",fontWeight:600}}>{t("jobs.visaType")}</label>
              <select value={form.visa_type||"特定技能1号"} onChange={e=>setForm({...form,visa_type:e.target.value})} style={{width:"100%",padding:"8px 10px",borderRadius:"7px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none"}}>
                {VISA_LIST.map(v=><option key={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label style={{display:"block",fontSize:"10px",color:"#6B6B6B",marginBottom:"4px",fontWeight:600}}>{t("jobs.employmentType")}</label>
              <select value={form.employment_type||"正社員"} onChange={e=>setForm({...form,employment_type:e.target.value})} style={{width:"100%",padding:"8px 10px",borderRadius:"7px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none"}}>
                {EMPLOYMENT_LIST.map(e=><option key={e}>{e}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* 求人概要 fields */}
        <div style={{background:"#fff",...B,borderRadius:"12px",padding:"20px"}}>
          <div style={{fontSize:"13px",fontWeight:700,color:navy,marginBottom:"14px",paddingBottom:"10px",borderBottom:"0.5px solid rgba(11,31,58,0.08)"}}>{t("jobs.jobDetail")}</div>
          <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            {FIELDS.filter(field=>field.key!=="employment_type"&&field.key!=="visa_type").map(field=>{
              const label = fieldLabel(field.key,lang);
              return(
              <div key={field.key}>
                <label style={{display:"block",fontSize:"11px",color:navy,marginBottom:"4px",fontWeight:700}}>
                  {label}
                </label>
                {field.rows===1 ? (
                  <input type="text" placeholder={t("jobs.inputPlaceholder",{field:label})} value={form[field.key]||""} onChange={e=>setForm({...form,[field.key]:e.target.value})} style={{width:"100%",padding:"8px 10px",borderRadius:"7px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none"}}/>
                ) : (
                  <textarea rows={field.rows} placeholder={t("jobs.inputPlaceholder",{field:label})} value={form[field.key]||""} onChange={e=>setForm({...form,[field.key]:e.target.value})} style={{width:"100%",padding:"8px 10px",borderRadius:"7px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none",resize:"vertical",lineHeight:1.6}}/>
                )}
              </div>
              );
            })}
          </div>
        </div>
      </form>
    </div>
  );
}