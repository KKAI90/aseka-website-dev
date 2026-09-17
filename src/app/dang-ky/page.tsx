"use client";
import { useState, useMemo } from "react";
import Link from "next/link";

const navy = "#0B1F3A";

/* ─── Canonical option lists — reused from the same lists Admin/Jobs already use, so a
   candidate's "現在職種"/visa selections line up with job_listings.industry / visa_type
   for AI matching instead of drifting into a second, incompatible vocabulary. ─── */
const INDUSTRY_LIST = ["介護","ビルクリーニング","工業製品製造業","建設","造船・舶用工業","自動車整備","航空","宿泊","農業","漁業","飲食料品製造業","外食業","繊維業","印刷業","鉄道","林業","IT","機械・電気電子","国際業務","通訳・翻訳","経理・会計","その他"];
const VISA_LIST = [
  { v:"技能実習", l:"技能実習 · Thực tập kỹ năng" },
  { v:"特定技能1号", l:"特定技能1号" },
  { v:"特定技能2号", l:"特定技能2号" },
  { v:"技術・人文知識・国際業務", l:"技術・人文知識・国際業務（技人国）" },
  { v:"家族滞在", l:"家族滞在 · Visa gia đình" },
  { v:"特定活動", l:"特定活動" },
  { v:"永住者", l:"永住者 · Thường trú" },
  { v:"定住者", l:"定住者" },
  { v:"留学", l:"留学 · Du học" },
  { v:"未取得", l:"未取得 · Chưa có" },
];
const JLPT_LEVELS = ["N5相当","JLPT N5","N4相当","JLPT N4","N3相当","JLPT N3","N2相当","JLPT N2","N1相当","JLPT N1"];

const YEARS_BIRTH = Array.from({ length: 60 }, (_, i) => String(new Date().getFullYear() - 16 - i));
const YEARS_FUTURE = Array.from({ length: 15 }, (_, i) => String(new Date().getFullYear() + i));
const YEARS_PAST40 = Array.from({ length: 45 }, (_, i) => String(new Date().getFullYear() - i));
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));

type WorkEntry = { company:string; content:string; start_year:string; start_month:string; end_year:string; end_month:string };
const EMPTY_WORK_ENTRY: WorkEntry = { company:"", content:"", start_year:"", start_month:"", end_year:"", end_month:"" };

type FileKey = "photo_url"|"id_front_url"|"id_back_url"|"jlpt_cert_url"|"senmonkyu_url"|"other_cert_url";

type Form = {
  photo_url:string; id_front_url:string; id_back_url:string;
  jlpt_cert_url:string; senmonkyu_url:string; other_cert_url:string;
  name:string; name_kana:string; email:string; phone:string;
  gender:string; marital_status:string;
  dob_year:string; dob_month:string; dob_day:string;
  address:string;
  visa_type:string; visa_exp_year:string; visa_exp_month:string; visa_exp_day:string;
  height_cm:string; weight_kg:string; dependents:string; skill:string;
  jlpt:string; jlpt_exam_year:string; jlpt_exam_month:string; jlpt_exam_status:string;
  hs_name:string; hs_enroll_year:string; hs_enroll_month:string; hs_grad_year:string; hs_grad_month:string;
  univ_name:string; univ_enroll_year:string; univ_enroll_month:string; univ_grad_year:string; univ_grad_month:string;
  motivation:string; self_pr:string; preferred_location:string;
};

const EMPTY: Form = {
  photo_url:"", id_front_url:"", id_back_url:"", jlpt_cert_url:"", senmonkyu_url:"", other_cert_url:"",
  name:"", name_kana:"", email:"", phone:"",
  gender:"", marital_status:"",
  dob_year:"", dob_month:"", dob_day:"",
  address:"",
  visa_type:"", visa_exp_year:"", visa_exp_month:"", visa_exp_day:"",
  height_cm:"", weight_kg:"", dependents:"0", skill:"",
  jlpt:"", jlpt_exam_year:"", jlpt_exam_month:"", jlpt_exam_status:"",
  hs_name:"", hs_enroll_year:"", hs_enroll_month:"", hs_grad_year:"", hs_grad_month:"",
  univ_name:"", univ_enroll_year:"", univ_enroll_month:"", univ_grad_year:"", univ_grad_month:"",
  motivation:"", self_pr:"", preferred_location:"",
};

const steps = [
  { id:1, ja:"添付書類", vn:"Ảnh & giấy tờ",     icon:"📎" },
  { id:2, ja:"基本情報", vn:"Thông tin cá nhân",  icon:"👤" },
  { id:3, ja:"在留資格", vn:"Visa & thể trạng",   icon:"🛂" },
  { id:4, ja:"日本語能力", vn:"Trình độ tiếng Nhật", icon:"🇯🇵" },
  { id:5, ja:"学歴",     vn:"Học vấn",            icon:"🎓" },
  { id:6, ja:"職歴",     vn:"Kinh nghiệm làm việc", icon:"💼" },
  { id:7, ja:"志望動機",  vn:"Nguyện vọng",        icon:"✍️" },
];

function Label({ ja, vn, required }: { ja:string; vn:string; required?:boolean }) {
  return (
    <div style={{ marginBottom:"5px" }}>
      <span style={{ fontSize:"13px", fontWeight:600, color:navy }}>{ja}</span>
      {required && <span style={{ color:"#C8002A", marginLeft:"3px", fontSize:"11px" }}>*</span>}
      <span style={{ fontSize:"11px", color:"#64748B", marginLeft:"6px" }}>{vn}</span>
    </div>
  );
}

const inputStyle = {
  width:"100%", padding:"10px 13px", borderRadius:"8px",
  border:"1px solid rgba(11,31,58,0.18)", fontSize:"13px",
  outline:"none", background:"#fff", color:navy,
  transition:"border-color 0.2s", boxSizing:"border-box",
} as React.CSSProperties;
const selectStyle = { ...inputStyle, cursor:"pointer" } as React.CSSProperties;

function Select({ value, onChange, options, placeholder, style }: {
  value:string; onChange:(v:string)=>void;
  options:{v:string;l:string}[]; placeholder:string; style?:React.CSSProperties;
}) {
  return (
    <select value={value} onChange={e=>onChange(e.target.value)} style={style||selectStyle}>
      <option value="">{placeholder}</option>
      {options.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  );
}

/* Năm / Tháng / Ngày — three dropdowns matching the reference Google Form's date style. */
function DateYMD({ y, m, d, onY, onM, onD, years }: {
  y:string; m:string; d:string; onY:(v:string)=>void; onM:(v:string)=>void; onD:(v:string)=>void; years:string[];
}) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"8px" }}>
      <Select value={y} onChange={onY} placeholder="年" options={years.map(x=>({v:x,l:`${x}年`}))} />
      <Select value={m} onChange={onM} placeholder="月" options={MONTHS.map(x=>({v:x,l:`${x}月`}))} />
      <Select value={d} onChange={onD} placeholder="日" options={DAYS.map(x=>({v:x,l:`${x}日`}))} />
    </div>
  );
}
function DateYM({ y, m, onY, onM, years }: { y:string; m:string; onY:(v:string)=>void; onM:(v:string)=>void; years:string[] }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
      <Select value={y} onChange={onY} placeholder="年" options={years.map(x=>({v:x,l:`${x}年`}))} />
      <Select value={m} onChange={onM} placeholder="月" options={MONTHS.map(x=>({v:x,l:`${x}月`}))} />
    </div>
  );
}

function FileUpload({ ja, vn, required, fieldKey, value, onUploaded }: {
  ja:string; vn:string; required?:boolean; fieldKey:FileKey; value:string; onUploaded:(key:string)=>void;
}) {
  const [status, setStatus] = useState<"idle"|"uploading"|"done"|"error">(value ? "done" : "idle");
  const [fileName, setFileName] = useState("");
  const [errMsg, setErrMsg] = useState("");

  const handleFile = async (file: File) => {
    setFileName(file.name); setStatus("uploading"); setErrMsg("");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("fieldKey", fieldKey);
    try {
      const res = await fetch("/api/upload-candidate-file", { method:"POST", body: fd });
      const d = await res.json();
      if (!res.ok) {
        setStatus("error");
        setErrMsg(d.error === "upload_not_configured" ? "Tính năng tải file đang được thiết lập, vui lòng thử lại sau." : "Tải file thất bại, thử lại.");
        return;
      }
      onUploaded(d.key);
      setStatus("done");
    } catch {
      setStatus("error"); setErrMsg("Tải file thất bại, thử lại.");
    }
  };

  return (
    <div>
      <Label ja={ja} vn={vn} required={required} />
      <label style={{
        display:"flex", alignItems:"center", gap:"10px", padding:"11px 14px", borderRadius:"8px",
        border:`1.5px dashed ${status==="error"?"#C8002A":status==="done"?"#27500A":"rgba(11,31,58,0.25)"}`,
        background: status==="done" ? "#EAF3DE" : "#F9FAFB", cursor:"pointer",
      }}>
        <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" style={{ display:"none" }}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        <span style={{ fontSize:"16px" }}>{status==="uploading" ? "⏳" : status==="done" ? "✅" : status==="error" ? "⚠️" : "📤"}</span>
        <span style={{ fontSize:"12px", color: status==="done" ? "#27500A" : navy, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {status==="uploading" ? "Đang tải lên..." : status==="done" ? fileName || "Đã tải lên" : status==="error" ? errMsg : "Bấm để chọn file (JPG/PNG/PDF, tối đa 15MB)"}
        </span>
      </label>
    </div>
  );
}

export default function DangKy() {
  const [step, setStep]   = useState(1);
  const [form, setForm]   = useState<Form>(EMPTY);
  const [workEntries, setWorkEntries] = useState<WorkEntry[]>([{ ...EMPTY_WORK_ENTRY }]);
  const [loading, setLoading] = useState(false);
  const [done, setDone]   = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));
  const setV = (k: keyof Form) => (v: string) => setForm(p => ({ ...p, [k]: v }));

  const age = useMemo(() => {
    if (!form.dob_year || !form.dob_month || !form.dob_day) return null;
    const today = new Date();
    let a = today.getFullYear() - Number(form.dob_year);
    const hadBirthdayThisYear = (today.getMonth()+1 > Number(form.dob_month)) ||
      (today.getMonth()+1 === Number(form.dob_month) && today.getDate() >= Number(form.dob_day));
    if (!hadBirthdayThisYear) a -= 1;
    return a >= 0 ? a : null;
  }, [form.dob_year, form.dob_month, form.dob_day]);

  const updateWork = (i:number, patch: Partial<WorkEntry>) =>
    setWorkEntries(p => p.map((w,idx) => idx===i ? { ...w, ...patch } : w));
  const addWork = () => setWorkEntries(p => [...p, { ...EMPTY_WORK_ENTRY }]);
  const removeWork = (i:number) => setWorkEntries(p => p.filter((_,idx)=>idx!==i));

  const next = () => {
    if (step === 1 && (!form.photo_url || !form.id_front_url || !form.id_back_url)) {
      setError("Vui lòng tải lên đủ 3 ảnh bắt buộc (chân dung, mặt trước/sau giấy tờ)"); return;
    }
    if (step === 2 && (!form.name.trim() || !form.name_kana.trim() || !form.email.trim() || !form.gender || !form.dob_year || !form.address.trim())) {
      setError("Vui lòng điền đầy đủ các trường bắt buộc (*)"); return;
    }
    if (step === 3 && (!form.visa_type || !form.height_cm || !form.weight_kg || !form.skill)) {
      setError("Vui lòng điền đầy đủ các trường bắt buộc (*)"); return;
    }
    if (step === 4 && !form.jlpt) { setError("Vui lòng chọn trình độ tiếng Nhật"); return; }
    if (step === 5 && !form.hs_name.trim()) { setError("Vui lòng nhập tên trường cấp 3"); return; }
    setError(""); setStep(s => s + 1);
  };
  const back = () => { setError(""); setStep(s => s - 1); };

  const submit = async () => {
    if (!form.motivation.trim() || !form.self_pr.trim()) { setError("志望動機・自己PR là bắt buộc"); return; }
    setLoading(true); setError("");

    const dob = form.dob_year && form.dob_month && form.dob_day ? `${form.dob_year}-${form.dob_month}-${form.dob_day}` : "";
    const visaExpiry = form.visa_exp_year && form.visa_exp_month && form.visa_exp_day ? `${form.visa_exp_year}-${form.visa_exp_month}-${form.visa_exp_day}` : "";

    // JLPT_LEVELS shows the candidate a descriptive choice ("N3相当" / "JLPT N3") to match
    // the reference form, but every consumer downstream — Admin's filter dropdown and
    // colored badge (JC["N1".."N5"]), mypage's own job-recommendation ranking
    // (jlptRank["N1".."N5"]), and CV-import's match scoring — does an exact match against
    // the bare level only. Sending form.jlpt as-is silently fell through every one of those
    // lookups (defaulting a real N1/N2 candidate to "lowest possible" in their own mypage
    // recommendations), since "JLPT N3" and "N3相当" never equal "N3". `jlpt` now carries
    // the canonical bare level every other part of the system keys off; the full label the
    // candidate actually picked is preserved in `jlpt_actual` instead of being dropped.
    const jlptBare = (form.jlpt.match(/N[1-5]/) || [])[0] || "";

    // Education/work_history reuse the exact {year,month,...,event} shape Admin already
    // renders — 入学/卒業 (enrolled/graduated) and 入社/退社 (joined/left) pairs — so
    // this data shows up correctly in Admin's 学歴・職歴 tab and feeds the same
    // calcExperienceMonths() used for AI matching, not a second incompatible format.
    const education = [
      form.hs_name && form.hs_enroll_year ? { year:form.hs_enroll_year, month:form.hs_enroll_month, school:form.hs_name, event:"入学" } : null,
      form.hs_name && form.hs_grad_year ? { year:form.hs_grad_year, month:form.hs_grad_month, school:form.hs_name, event:"卒業" } : null,
      form.univ_name && form.univ_enroll_year ? { year:form.univ_enroll_year, month:form.univ_enroll_month, school:form.univ_name, event:"入学" } : null,
      form.univ_name && form.univ_grad_year ? { year:form.univ_grad_year, month:form.univ_grad_month, school:form.univ_name, event:"卒業" } : null,
    ].filter(Boolean);

    const work_history = workEntries.filter(w => w.company.trim()).flatMap(w => [
      w.start_year ? { year:w.start_year, month:w.start_month, company:w.company, position:w.content, event:"入社" } : null,
      w.end_year ? { year:w.end_year, month:w.end_month, company:w.company, position:w.content, event:"退社" } : null,
    ]).filter(Boolean);

    try {
      const res = await fetch("/api/admin/candidates?public=1", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          name: form.name, name_kana: form.name_kana, email: form.email, phone: form.phone,
          gender: form.gender, date_of_birth: dob, marital_status: form.marital_status, address: form.address,
          visa_type: form.visa_type, visa_expiry: visaExpiry,
          height_cm: form.height_cm, weight_kg: form.weight_kg, dependents: form.dependents,
          skill: form.skill,
          jlpt: jlptBare, jlpt_actual: form.jlpt, jlpt_exam_year: form.jlpt_exam_year, jlpt_exam_month: form.jlpt_exam_month, jlpt_exam_status: form.jlpt_exam_status,
          preferred_location: form.preferred_location,
          motivation: form.motivation, self_pr: form.self_pr,
          photo_url: form.photo_url, id_front_url: form.id_front_url, id_back_url: form.id_back_url,
          jlpt_cert_url: form.jlpt_cert_url, senmonkyu_url: form.senmonkyu_url, other_cert_url: form.other_cert_url,
          nationality: "Vietnam", status: "new",
          education, work_history, certifications: [],
          match_job_name: null,
          cv_filename: `web-form-${Date.now()}`,
        }),
      });
      if (res.ok) { setDone(true); }
      else { const d = await res.json(); setError(d.error || "エラーが発生しました"); }
    } catch { setError("送信失敗。再試行してください。"); }
    setLoading(false);
  };

  /* ── SUCCESS ─────────────────────────────────────────── */
  if (done) return (
    <div style={{ minHeight:"100vh", background:"#F6F7F9", display:"flex", flexDirection:"column" }}>
      <header style={{ background:"#fff", borderBottom:"0.5px solid rgba(11,31,58,0.1)", padding:"0 24px", height:"60px", display:"flex", alignItems:"center" }}>
        <Link href="/" style={{ display:"flex", alignItems:"center", gap:"8px", textDecoration:"none" }}>
          <div style={{ width:"32px", height:"32px", background:"#fff", borderRadius:"8px", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, overflow:"hidden", border:"1px solid rgba(11,31,58,0.08)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/aseka-logo-icon.png" alt="ASEKA" style={{ width:"26px", height:"26px", objectFit:"contain", display:"block" }} />
          </div>
          <span style={{ fontWeight:700, fontSize:"16px", color:navy }}>ASEKA</span>
        </Link>
      </header>
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 20px" }}>
        <div style={{ background:"#fff", borderRadius:"20px", padding:"48px 40px", textAlign:"center", maxWidth:"460px", width:"100%", boxShadow:"0 4px 40px rgba(11,31,58,0.08)" }}>
          <div style={{ width:"72px", height:"72px", borderRadius:"50%", background:"#EAF3DE", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", fontSize:"32px" }}>✅</div>
          <h2 style={{ fontSize:"22px", fontWeight:700, color:navy, margin:"0 0 8px" }}>登録完了！</h2>
          <p style={{ fontSize:"15px", fontWeight:600, color:"#27500A", margin:"0 0 16px" }}>Đăng ký thành công!</p>
          <p style={{ fontSize:"13px", color:"#64748B", lineHeight:1.7, margin:"0 0 28px" }}>
            ご登録ありがとうございます。<br/>
            担当者より24時間以内にご連絡いたします。<br/><br/>
            Cảm ơn bạn đã đăng ký. Nhân viên Aseka sẽ liên hệ trong vòng 24 giờ.
          </p>
          <Link href="/" style={{ padding:"11px 24px", borderRadius:"9px", background:navy, color:"#fff", textDecoration:"none", fontSize:"13px", fontWeight:600 }}>
            トップへ戻る / Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );

  /* ── MAIN FORM ───────────────────────────────────────── */
  return (
    <div style={{ minHeight:"100vh", background:"#F6F7F9", fontFamily:"'Noto Sans JP','Yu Gothic UI',sans-serif" }}>
      <header style={{ background:"#fff", borderBottom:"0.5px solid rgba(11,31,58,0.1)", padding:"0 24px", height:"60px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
        <Link href="/" style={{ display:"flex", alignItems:"center", gap:"8px", textDecoration:"none" }}>
          <div style={{ width:"32px", height:"32px", background:"#fff", borderRadius:"8px", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, overflow:"hidden", border:"1px solid rgba(11,31,58,0.08)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/aseka-logo-icon.png" alt="ASEKA" style={{ width:"26px", height:"26px", objectFit:"contain", display:"block" }} />
          </div>
          <span style={{ fontWeight:700, fontSize:"16px", color:navy }}>ASEKA</span>
        </Link>
        <div style={{ fontSize:"12px", color:"#64748B" }}>特定技能 応募フォーム · Form đăng ký đơn hàng Tokutei</div>
      </header>

      <div style={{ maxWidth:"680px", margin:"0 auto", padding:"32px 20px 60px" }}>

        <div style={{ background:`linear-gradient(135deg, ${navy} 0%, #1a3a6b 100%)`, borderRadius:"16px", padding:"26px 32px", marginBottom:"28px", color:"#fff" }}>
          <div style={{ fontSize:"11px", fontWeight:600, letterSpacing:"0.1em", opacity:0.6, marginBottom:"8px" }}>ASEKA · 特定技能 求人応募</div>
          <h1 style={{ fontSize:"20px", fontWeight:700, margin:"0 0 6px" }}>FORM KHAI HỒ SƠ ĐĂNG KÝ THAM GIA ĐƠN HÀNG TOKUTEI</h1>
          <p style={{ fontSize:"13px", opacity:0.8, margin:0, lineHeight:1.6 }}>
            Vui lòng khai chính xác thông tin để phù hợp với công việc hiện tại —担当者より24時間以内にご連絡いたします。
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display:"flex", gap:"5px", marginBottom:"24px", overflowX:"auto", paddingBottom:"2px" }}>
          {steps.map(s => {
            const active = step === s.id;
            const done2  = step > s.id;
            return (
              <div key={s.id} style={{ flex:"1 0 80px" }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"4px", padding:"8px 4px", borderRadius:"10px", background: active ? "#fff" : done2 ? "#EAF3DE" : "#F0F1F4", border: active ? `1.5px solid ${navy}` : "1px solid transparent" }}>
                  <div style={{ width:"22px", height:"22px", borderRadius:"50%", background: done2 ? "#27500A" : active ? navy : "#D0D3DA", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    {done2
                      ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      : <span style={{ color:"#fff", fontSize:"10px", fontWeight:700 }}>{s.id}</span>}
                  </div>
                  <div style={{ fontSize:"9px", fontWeight:700, color: active ? navy : done2 ? "#27500A" : "#9BA0AC", whiteSpace:"nowrap" }}>{s.ja}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ background:"#fff", borderRadius:"16px", padding:"28px 28px", boxShadow:"0 2px 20px rgba(11,31,58,0.06)", border:"0.5px solid rgba(11,31,58,0.08)" }}>

          <div style={{ marginBottom:"24px", paddingBottom:"16px", borderBottom:"0.5px solid rgba(11,31,58,0.08)" }}>
            <div style={{ fontSize:"20px", marginBottom:"4px" }}>{steps[step-1].icon}</div>
            <div style={{ fontSize:"16px", fontWeight:700, color:navy }}>{steps[step-1].ja}</div>
            <div style={{ fontSize:"12px", color:"#64748B" }}>{steps[step-1].vn}</div>
          </div>

          {/* ── STEP 1: Files ── */}
          {step === 1 && (
            <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
              <FileUpload ja="ファイル画像（証明写真4x6、白背景）" vn="Ảnh chân dung (4x6, nền trắng)" required fieldKey="photo_url" value={form.photo_url} onUploaded={setV("photo_url")} />
              <FileUpload ja="在留カード表面" vn="Ảnh mặt trước giấy tờ tuỳ thân" required fieldKey="id_front_url" value={form.id_front_url} onUploaded={setV("id_front_url")} />
              <FileUpload ja="在留カード裏面" vn="Ảnh mặt sau giấy tờ tuỳ thân" required fieldKey="id_back_url" value={form.id_back_url} onUploaded={setV("id_back_url")} />
              <FileUpload ja="日本語能力試験証明書" vn="Chứng chỉ tiếng Nhật (nếu có)" fieldKey="jlpt_cert_url" value={form.jlpt_cert_url} onUploaded={setV("jlpt_cert_url")} />
              <FileUpload ja="専門級評価調書" vn="Senmonkyu / Giấy đánh giá (nếu có)" fieldKey="senmonkyu_url" value={form.senmonkyu_url} onUploaded={setV("senmonkyu_url")} />
              <FileUpload ja="その他資格証明書" vn="Bằng cấp, chứng chỉ khác (nếu có)" fieldKey="other_cert_url" value={form.other_cert_url} onUploaded={setV("other_cert_url")} />
            </div>
          )}

          {/* ── STEP 2: Personal ── */}
          {step === 2 && (
            <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
              <div>
                <Label ja="氏名（ローマ字大文字）" vn="Họ và tên (viết hoa không dấu)" required />
                <input style={inputStyle} placeholder="VD: NGUYEN VAN A" value={form.name} onChange={set("name")} />
              </div>
              <div>
                <Label ja="フリガナ（カタカナ）" vn="Tên bằng katakana" required />
                <input style={inputStyle} placeholder="例: グエン バン エー" value={form.name_kana} onChange={set("name_kana")} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                <div>
                  <Label ja="メールアドレス" vn="Email" required />
                  <input style={inputStyle} type="email" placeholder="example@email.com" value={form.email} onChange={set("email")} />
                </div>
                <div>
                  <Label ja="電話番号" vn="Số điện thoại" />
                  <input style={inputStyle} placeholder="090-xxxx-xxxx" value={form.phone} onChange={set("phone")} />
                </div>
              </div>
              <div>
                <Label ja="性別" vn="Giới tính" required />
                <div style={{ display:"flex", gap:"16px" }}>
                  {[{v:"男性",l:"男性 · Nam"},{v:"女性",l:"女性 · Nữ"},{v:"その他",l:"その他 · Khác"}].map(o=>(
                    <label key={o.v} style={{ display:"flex", alignItems:"center", gap:"6px", fontSize:"12px", color:navy, cursor:"pointer" }}>
                      <input type="radio" name="gender" checked={form.gender===o.v} onChange={()=>setV("gender")(o.v)} /> {o.l}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <Label ja="結婚 [Kết hôn]" vn="Tình trạng hôn nhân" />
                <div style={{ display:"flex", gap:"16px", flexWrap:"wrap" }}>
                  {[{v:"独身",l:"独身 · Độc thân"},{v:"既婚",l:"既婚 · Đã kết hôn"},{v:"離婚",l:"離婚 · Đã ly hôn"}].map(o=>(
                    <label key={o.v} style={{ display:"flex", alignItems:"center", gap:"6px", fontSize:"12px", color:navy, cursor:"pointer" }}>
                      <input type="radio" name="marital" checked={form.marital_status===o.v} onChange={()=>setV("marital_status")(o.v)} /> {o.l}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <Label ja="生年月日" vn="Ngày tháng năm sinh" required />
                <DateYMD y={form.dob_year} m={form.dob_month} d={form.dob_day} years={YEARS_BIRTH}
                  onY={setV("dob_year")} onM={setV("dob_month")} onD={setV("dob_day")} />
                {age !== null && <div style={{ fontSize:"11px", color:"#64748B", marginTop:"5px" }}>年齢 (Tuổi): <strong style={{color:navy}}>{age}</strong></div>}
              </div>
              <div>
                <Label ja="現住所（外国人カード記載の住所を日本語で）" vn="Địa chỉ hiện tại (theo thẻ ngoại kiều, tiếng Nhật)" required />
                <input style={inputStyle} placeholder="例: 愛知県名古屋市..." value={form.address} onChange={set("address")} />
              </div>
            </div>
          )}

          {/* ── STEP 3: Visa & thể trạng ── */}
          {step === 3 && (
            <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
              <div>
                <Label ja="在留資格（今現在）" vn="Tư cách lưu trú hiện tại" required />
                <Select value={form.visa_type} onChange={setV("visa_type")} placeholder="選択 / Chọn" options={VISA_LIST.map(o=>({v:o.v,l:o.l}))} />
              </div>
              <div>
                <Label ja="在留期限" vn="Hạn lưu trú" />
                <DateYMD y={form.visa_exp_year} m={form.visa_exp_month} d={form.visa_exp_day} years={YEARS_FUTURE}
                  onY={setV("visa_exp_year")} onM={setV("visa_exp_month")} onD={setV("visa_exp_day")} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                <div>
                  <Label ja="身長 cm" vn="Chiều cao (cm)" required />
                  <input style={inputStyle} type="number" min="100" max="230" value={form.height_cm} onChange={set("height_cm")} />
                </div>
                <div>
                  <Label ja="体重 kg" vn="Cân nặng (kg)" required />
                  <input style={inputStyle} type="number" min="30" max="200" value={form.weight_kg} onChange={set("weight_kg")} />
                </div>
              </div>
              <div>
                <Label ja="扶養控除人数" vn="Số người phụ thuộc / đang nuôi dưỡng" />
                <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"6px" }}>
                  {["0","1","2","3","4","5","6"].map(n => (
                    <button key={n} type="button" onClick={()=>setV("dependents")(n)}
                      style={{ padding:"9px 4px", borderRadius:"7px", fontWeight:700, fontSize:"12px", cursor:"pointer", border: form.dependents===n ? `2px solid ${navy}` : "1.5px solid rgba(11,31,58,0.15)", background: form.dependents===n ? navy : "#fff", color: form.dependents===n ? "#fff" : navy }}>
                      {n}人
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label ja="現在職種" vn="Ngành nghề / Công việc đang làm hiện tại" required />
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"7px" }}>
                  {INDUSTRY_LIST.map(s=>(
                    <button key={s} type="button" onClick={()=>setV("skill")(s)}
                      style={{ padding:"9px 6px", borderRadius:"8px", cursor:"pointer", textAlign:"center", fontSize:"11px", fontWeight:600, border: form.skill===s ? `2px solid ${navy}` : "1.5px solid rgba(11,31,58,0.15)", background: form.skill===s ? "#E6F1FB" : "#fff", color:navy }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 4: JLPT ── */}
          {step === 4 && (
            <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
              <div>
                <Label ja="日本語能力試験（JLPT）" vn="Chứng chỉ đã có (tích ô tương đương nếu chưa thi)" required />
                <div style={{ display:"flex", flexDirection:"column", gap:"7px" }}>
                  {JLPT_LEVELS.map(lv => (
                    <label key={lv} style={{ display:"flex", alignItems:"center", gap:"8px", fontSize:"12px", color:navy, cursor:"pointer", padding:"7px 10px", borderRadius:"7px", background: form.jlpt===lv ? "#E6F1FB" : "transparent" }}>
                      <input type="radio" name="jlpt" checked={form.jlpt===lv} onChange={()=>setV("jlpt")(lv)} /> {lv}
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                <div>
                  <Label ja="受験年度" vn="Năm dự thi" />
                  <Select value={form.jlpt_exam_year} onChange={setV("jlpt_exam_year")} placeholder="選択" options={YEARS_PAST40.map(x=>({v:x,l:`${x}年`}))} />
                </div>
                <div>
                  <Label ja="受験月" vn="Tháng dự thi" />
                  <Select value={form.jlpt_exam_month} onChange={setV("jlpt_exam_month")} placeholder="選択" options={MONTHS.map(x=>({v:x,l:`${x}月`}))} />
                </div>
              </div>
              <div>
                <Label ja="試験の状況" vn="Tình trạng kỳ thi tiếng Nhật" />
                <div style={{ display:"flex", gap:"16px", flexWrap:"wrap" }}>
                  {[{v:"合格",l:"合格 · Đậu"},{v:"受験予定",l:"受験予定 · Dự định thi"},{v:"結果待ち",l:"結果待ち · Chờ kết quả"}].map(o=>(
                    <label key={o.v} style={{ display:"flex", alignItems:"center", gap:"6px", fontSize:"12px", color:navy, cursor:"pointer" }}>
                      <input type="radio" name="jlptStatus" checked={form.jlpt_exam_status===o.v} onChange={()=>setV("jlpt_exam_status")(o.v)} /> {o.l}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 5: Education ── */}
          {step === 5 && (
            <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
              <div style={{ fontSize:"12px", fontWeight:700, color:navy }}>高校 [Trường cấp 3]</div>
              <div>
                <Label ja="高校名（ローマ字大文字）" vn="Tên trường cấp 3 (viết hoa không dấu)" required />
                <input style={inputStyle} placeholder="例: MINH KHAI 高校学校" value={form.hs_name} onChange={set("hs_name")} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                <div><Label ja="入学年月" vn="Nhập học" required /><DateYM y={form.hs_enroll_year} m={form.hs_enroll_month} onY={setV("hs_enroll_year")} onM={setV("hs_enroll_month")} years={YEARS_PAST40} /></div>
                <div><Label ja="卒業年月" vn="Tốt nghiệp" required /><DateYM y={form.hs_grad_year} m={form.hs_grad_month} onY={setV("hs_grad_year")} onM={setV("hs_grad_month")} years={YEARS_PAST40} /></div>
              </div>

              <div style={{ fontSize:"12px", fontWeight:700, color:navy, marginTop:"6px" }}>専門学校・短期大学・大学 [Nếu có]</div>
              <div>
                <Label ja="学校名（ローマ字大文字）" vn="Tên trường đại học/cao đẳng — bỏ trống nếu không học" />
                <input style={inputStyle} value={form.univ_name} onChange={set("univ_name")} />
              </div>
              {form.univ_name && (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                  <div><Label ja="入学年月" vn="Nhập học" /><DateYM y={form.univ_enroll_year} m={form.univ_enroll_month} onY={setV("univ_enroll_year")} onM={setV("univ_enroll_month")} years={YEARS_PAST40} /></div>
                  <div><Label ja="卒業年月" vn="Tốt nghiệp" /><DateYM y={form.univ_grad_year} m={form.univ_grad_month} onY={setV("univ_grad_year")} onM={setV("univ_grad_month")} years={YEARS_PAST40} /></div>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 6: Work history (repeatable) ── */}
          {step === 6 && (
            <div style={{ display:"flex", flexDirection:"column", gap:"18px" }}>
              <p style={{ fontSize:"11px", color:"#64748B", margin:0, lineHeight:1.7, background:"#F6F7F9", padding:"10px 12px", borderRadius:"8px" }}>
                Trình bày công ty đang và đã làm (kể cả tại Nhật Bản). Bấm &quot;+ Thêm kinh nghiệm&quot; nếu có nhiều hơn 1 nơi.
              </p>
              {workEntries.map((w, i) => (
                <div key={i} style={{ border:"1px solid rgba(11,31,58,0.1)", borderRadius:"10px", padding:"16px", position:"relative" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px" }}>
                    <div style={{ fontSize:"12px", fontWeight:700, color:navy }}>職歴{i+1} [Quá trình làm việc {i+1}]</div>
                    {workEntries.length > 1 && (
                      <button type="button" onClick={()=>removeWork(i)} style={{ background:"none", border:"none", color:"#C8002A", fontSize:"11px", cursor:"pointer" }}>✕ Xoá</button>
                    )}
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                    <div>
                      <Label ja="会社名（ローマ字大文字）" vn="Tên công ty/tổ chức" required={i===0} />
                      <input style={inputStyle} placeholder="VD: SAKURA株式会社" value={w.company} onChange={e=>updateWork(i,{company:e.target.value})} />
                    </div>
                    <div>
                      <Label ja="仕事内容" vn="Nội dung công việc" required={i===0} />
                      <input style={inputStyle} value={w.content} onChange={e=>updateWork(i,{content:e.target.value})} />
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                      <div><Label ja="入社年月" vn="Bắt đầu" /><DateYM y={w.start_year} m={w.start_month} onY={v=>updateWork(i,{start_year:v})} onM={v=>updateWork(i,{start_month:v})} years={YEARS_PAST40} /></div>
                      <div><Label ja="退社年月" vn="Kết thúc" /><DateYM y={w.end_year} m={w.end_month} onY={v=>updateWork(i,{end_year:v})} onM={v=>updateWork(i,{end_month:v})} years={YEARS_PAST40} /></div>
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addWork} style={{ padding:"10px", borderRadius:"8px", border:`1.5px dashed ${navy}`, background:"#fff", color:navy, fontSize:"12px", fontWeight:700, cursor:"pointer" }}>
                + 職歴を追加する / Thêm kinh nghiệm khác
              </button>
            </div>
          )}

          {/* ── STEP 7: Motivation ── */}
          {step === 7 && (
            <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
              <div>
                <Label ja="希望勤務地（都道府県）" vn="Tỉnh/thành phố nguyện vọng làm việc" />
                <input style={inputStyle} placeholder="例: 愛知県、大阪府..." value={form.preferred_location} onChange={set("preferred_location")} />
              </div>
              <div>
                <Label ja="志望動機" vn="Động cơ ứng tuyển / Lý do chuyển việc" required />
                <textarea style={{ ...inputStyle, minHeight:"130px", resize:"vertical" }}
                  placeholder="日本語で記入いただけると採用担当者に良い印象を与えます。&#10;Viết bằng tiếng Nhật nếu có thể, viết đầy đủ sẽ gây ấn tượng tốt với nhà tuyển dụng."
                  value={form.motivation} onChange={set("motivation")} />
              </div>
              <div>
                <Label ja="自己PR" vn="Giới thiệu bản thân / Điểm mạnh" required />
                <textarea style={{ ...inputStyle, minHeight:"110px", resize:"vertical" }}
                  placeholder="日本語で記入いただけると採用担当者に良い印象を与えます。"
                  value={form.self_pr} onChange={set("self_pr")} />
              </div>
              <div style={{ background:"#F6F7F9", borderRadius:"10px", padding:"14px 16px", fontSize:"11px", color:"#64748B", lineHeight:1.7 }}>
                <strong style={{ color:navy }}>個人情報の取り扱いについて</strong><br/>
                ご記入いただいた個人情報は、求人紹介目的のみに使用し、第三者に提供することはありません。<br/>
                <span style={{ opacity:0.8 }}>Thông tin cá nhân chỉ dùng cho mục đích giới thiệu việc làm, không chia sẻ cho bên thứ ba.</span>
              </div>
            </div>
          )}

          {error && (
            <div style={{ marginTop:"14px", padding:"10px 14px", background:"#FCEBEB", borderRadius:"8px", fontSize:"12px", color:"#C8002A", border:"1px solid #C8002A22" }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display:"flex", justifyContent:"space-between", marginTop:"24px", paddingTop:"20px", borderTop:"0.5px solid rgba(11,31,58,0.08)" }}>
            {step > 1
              ? <button onClick={back} style={{ padding:"10px 20px", borderRadius:"9px", border:`1.5px solid rgba(11,31,58,0.2)`, background:"#fff", color:navy, fontSize:"13px", fontWeight:600, cursor:"pointer" }}>← 戻る / Quay lại</button>
              : <div />}
            {step < steps.length
              ? <button onClick={next} style={{ padding:"10px 28px", borderRadius:"9px", background:navy, color:"#fff", fontSize:"13px", fontWeight:600, cursor:"pointer", border:"none" }}>次へ / Tiếp theo →</button>
              : <button onClick={submit} disabled={loading}
                  style={{ padding:"11px 32px", borderRadius:"9px", background: loading ? "#9BA0AC" : "#C8002A", color:"#fff", fontSize:"13px", fontWeight:700, cursor: loading ? "not-allowed" : "pointer", border:"none", display:"flex", alignItems:"center", gap:"8px" }}>
                  {loading ? "送信中..." : "📨 応募する / Gửi đăng ký"}
                </button>}
          </div>
        </div>

        <p style={{ textAlign:"center", fontSize:"11px", color:"#9BA0AC", marginTop:"20px" }}>
          ご不明な点は{" "}
          <Link href="/#contact" style={{ color:"#185FA5" }}>お問い合わせ</Link>
          {" "}よりご連絡ください。 · Mọi thắc mắc liên hệ{" "}
          <Link href="/#contact" style={{ color:"#185FA5" }}>tại đây</Link>.
        </p>
      </div>
    </div>
  );
}
