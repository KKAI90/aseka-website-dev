"use client";
import { useState } from "react";
import Link from "next/link";

const navy = "#0B1F3A";

type Form = {
  name: string; name_kana: string;
  email: string; phone: string;
  gender: string; date_of_birth: string;
  address: string;
  visa_type: string; visa_expiry: string;
  jlpt: string;
  skill: string; preferred_job: string;
  work_hours: string; availability: string;
  marital_status: string; dependents: string;
  motivation: string; self_pr: string;
};

const EMPTY: Form = {
  name:"", name_kana:"", email:"", phone:"",
  gender:"", date_of_birth:"", address:"",
  visa_type:"", visa_expiry:"", jlpt:"N4",
  skill:"", preferred_job:"", work_hours:"", availability:"",
  marital_status:"", dependents:"0",
  motivation:"", self_pr:"",
};

const steps = [
  { id:1, ja:"個人情報", vn:"Thông tin cá nhân",  icon:"👤" },
  { id:2, ja:"日本語・ビザ", vn:"Tiếng Nhật & Visa", icon:"🇯🇵" },
  { id:3, ja:"希望業種",   vn:"Ngành nghề",         icon:"💼" },
  { id:4, ja:"志望動機",   vn:"Lý do & Giới thiệu", icon:"✍️" },
];

function Label({ ja, vn, required }: { ja:string; vn:string; required?:boolean }) {
  return (
    <div style={{ marginBottom:"5px" }}>
      <span style={{ fontSize:"13px", fontWeight:600, color:navy }}>{ja}</span>
      {required && <span style={{ color:"#C8002A", marginLeft:"3px", fontSize:"11px" }}>*</span>}
      <span style={{ fontSize:"11px", color:"#6B6B6B", marginLeft:"6px" }}>{vn}</span>
    </div>
  );
}

const inputStyle = {
  width:"100%", padding:"10px 13px", borderRadius:"8px",
  border:"1px solid rgba(11,31,58,0.18)", fontSize:"13px",
  outline:"none", background:"#fff", color:navy,
  transition:"border-color 0.2s",
} as React.CSSProperties;

const selectStyle = { ...inputStyle, cursor:"pointer" } as React.CSSProperties;

function Select({ value, onChange, options, placeholder }: {
  value:string; onChange:(v:string)=>void;
  options:{v:string;l:string}[]; placeholder:string;
}) {
  return (
    <select value={value} onChange={e=>onChange(e.target.value)} style={selectStyle}>
      <option value="">{placeholder}</option>
      {options.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  );
}

export default function DangKy() {
  const [step, setStep]   = useState(1);
  const [form, setForm]   = useState<Form>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [done, setDone]   = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const next = () => {
    if (step === 1 && !form.name.trim()) { setError("氏名 / Họ tên là bắt buộc"); return; }
    setError(""); setStep(s => s + 1);
  };
  const back = () => { setError(""); setStep(s => s - 1); };

  const submit = async () => {
    if (!form.motivation.trim()) { setError("志望動機 / Lý do là bắt buộc"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/admin/candidates", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          ...form,
          height_cm: null, weight_kg: null,
          dependents: Number(form.dependents)||0,
          nationality: "Vietnam",
          status: "new",
          education: [], work_history: [], certifications: [],
          match_job_name: null, ai_data: null,
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
          <div style={{ width:"32px", height:"32px", background:navy, borderRadius:"8px", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 2L18 7V13L10 18L2 13V7Z" stroke="white" strokeWidth="1.4"/><circle cx="10" cy="10" r="3" fill="white"/></svg>
          </div>
          <span style={{ fontWeight:700, fontSize:"16px", color:navy }}>ASEKA</span>
        </Link>
      </header>
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 20px" }}>
        <div style={{ background:"#fff", borderRadius:"20px", padding:"48px 40px", textAlign:"center", maxWidth:"460px", width:"100%", boxShadow:"0 4px 40px rgba(11,31,58,0.08)" }}>
          <div style={{ width:"72px", height:"72px", borderRadius:"50%", background:"#EAF3DE", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", fontSize:"32px" }}>✅</div>
          <h2 style={{ fontSize:"22px", fontWeight:700, color:navy, margin:"0 0 8px" }}>登録完了！</h2>
          <p style={{ fontSize:"15px", fontWeight:600, color:"#27500A", margin:"0 0 16px" }}>Đăng ký thành công!</p>
          <p style={{ fontSize:"13px", color:"#6B6B6B", lineHeight:1.7, margin:"0 0 28px" }}>
            ご登録ありがとうございます。<br/>
            担当者より24時間以内にご連絡いたします。<br/><br/>
            Cảm ơn bạn đã đăng ký. Nhân viên Aseka sẽ liên hệ trong vòng 24 giờ.
          </p>
          <div style={{ display:"flex", gap:"10px", justifyContent:"center" }}>
            <Link href="/" style={{ padding:"11px 24px", borderRadius:"9px", background:navy, color:"#fff", textDecoration:"none", fontSize:"13px", fontWeight:600 }}>
              トップへ戻る / Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  /* ── MAIN FORM ───────────────────────────────────────── */
  return (
    <div style={{ minHeight:"100vh", background:"#F6F7F9", fontFamily:"'Noto Sans JP','Yu Gothic UI',sans-serif" }}>

      {/* Navbar */}
      <header style={{ background:"#fff", borderBottom:"0.5px solid rgba(11,31,58,0.1)", padding:"0 24px", height:"60px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
        <Link href="/" style={{ display:"flex", alignItems:"center", gap:"8px", textDecoration:"none" }}>
          <div style={{ width:"32px", height:"32px", background:navy, borderRadius:"8px", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 2L18 7V13L10 18L2 13V7Z" stroke="white" strokeWidth="1.4"/><circle cx="10" cy="10" r="3" fill="white"/></svg>
          </div>
          <span style={{ fontWeight:700, fontSize:"16px", color:navy }}>ASEKA</span>
        </Link>
        <div style={{ fontSize:"12px", color:"#6B6B6B" }}>求人応募フォーム · Form đăng ký ứng viên</div>
      </header>

      <div style={{ maxWidth:"680px", margin:"0 auto", padding:"32px 20px 60px" }}>

        {/* Hero banner */}
        <div style={{ background:`linear-gradient(135deg, ${navy} 0%, #1a3a6b 100%)`, borderRadius:"16px", padding:"28px 32px", marginBottom:"28px", color:"#fff" }}>
          <div style={{ fontSize:"11px", fontWeight:600, letterSpacing:"0.1em", opacity:0.6, marginBottom:"8px" }}>ASEKA · 求人応募</div>
          <h1 style={{ fontSize:"22px", fontWeight:700, margin:"0 0 6px" }}>日本での仕事を探しませんか？</h1>
          <p style={{ fontSize:"14px", opacity:0.75, margin:"0 0 16px", lineHeight:1.6 }}>
            Bạn đang tìm kiếm việc làm tại Nhật Bản?<br/>
            Hãy điền thông tin — chúng tôi sẽ liên hệ trong 24 giờ.
          </p>
          <div style={{ display:"flex", gap:"20px" }}>
            {[{ n:"800+", l:"登録スタッフ" },{ n:"97%", l:"定着率" },{ n:"24h", l:"返信速度" }].map(k=>(
              <div key={k.l}>
                <div style={{ fontSize:"18px", fontWeight:700 }}>{k.n}</div>
                <div style={{ fontSize:"10px", opacity:0.6 }}>{k.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Step indicator */}
        <div style={{ display:"flex", gap:"6px", marginBottom:"24px" }}>
          {steps.map((s,i) => {
            const active = step === s.id;
            const done2  = step > s.id;
            return (
              <div key={s.id} style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:"6px", padding:"10px 10px", borderRadius:"10px", background: active ? "#fff" : done2 ? "#EAF3DE" : "#F0F1F4", border: active ? `1.5px solid ${navy}` : done2 ? "1px solid #27500A22" : "1px solid transparent", transition:"all 0.2s" }}>
                  <div style={{ width:"24px", height:"24px", borderRadius:"50%", background: done2 ? "#27500A" : active ? navy : "#D0D3DA", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    {done2
                      ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      : <span style={{ color:"#fff", fontSize:"11px", fontWeight:700 }}>{s.id}</span>
                    }
                  </div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontSize:"10px", fontWeight:700, color: active ? navy : done2 ? "#27500A" : "#9BA0AC", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{s.ja}</div>
                    <div style={{ fontSize:"9px", color:"#9BA0AC", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{s.vn}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Card */}
        <div style={{ background:"#fff", borderRadius:"16px", padding:"28px 28px", boxShadow:"0 2px 20px rgba(11,31,58,0.06)", border:"0.5px solid rgba(11,31,58,0.08)" }}>

          {/* Step title */}
          <div style={{ marginBottom:"24px", paddingBottom:"16px", borderBottom:"0.5px solid rgba(11,31,58,0.08)" }}>
            <div style={{ fontSize:"20px", marginBottom:"4px" }}>{steps[step-1].icon}</div>
            <div style={{ fontSize:"16px", fontWeight:700, color:navy }}>{steps[step-1].ja}</div>
            <div style={{ fontSize:"12px", color:"#6B6B6B" }}>{steps[step-1].vn}</div>
          </div>

          {/* ── STEP 1: Personal info ── */}
          {step === 1 && (
            <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
              <div>
                <Label ja="氏名" vn="Họ và tên" required />
                <input style={inputStyle} placeholder="例: Nguyen Van A" value={form.name} onChange={set("name")} />
              </div>
              <div>
                <Label ja="フリガナ" vn="Phiên âm (tùy chọn)" />
                <input style={inputStyle} placeholder="例: グエン バン エー" value={form.name_kana} onChange={set("name_kana")} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                <div>
                  <Label ja="メールアドレス" vn="Email" />
                  <input style={inputStyle} type="email" placeholder="example@email.com" value={form.email} onChange={set("email")} />
                </div>
                <div>
                  <Label ja="電話番号" vn="Số điện thoại" />
                  <input style={inputStyle} placeholder="090-xxxx-xxxx" value={form.phone} onChange={set("phone")} />
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                <div>
                  <Label ja="生年月日" vn="Ngày sinh" />
                  <input style={inputStyle} type="date" value={form.date_of_birth} onChange={set("date_of_birth")} />
                </div>
                <div>
                  <Label ja="性別" vn="Giới tính" />
                  <Select value={form.gender} onChange={v=>setForm(p=>({...p,gender:v}))}
                    placeholder="選択 / Chọn"
                    options={[{v:"男性",l:"男性 · Nam"},{v:"女性",l:"女性 · Nữ"},{v:"その他",l:"その他 · Khác"}]}
                  />
                </div>
              </div>
              <div>
                <Label ja="現住所 (日本)" vn="Địa chỉ tại Nhật (nếu đã ở Nhật)" />
                <input style={inputStyle} placeholder="例: 愛知県名古屋市..." value={form.address} onChange={set("address")} />
              </div>
            </div>
          )}

          {/* ── STEP 2: Japanese / Visa ── */}
          {step === 2 && (
            <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
              <div>
                <Label ja="日本語レベル" vn="Trình độ tiếng Nhật" required />
                <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:"8px" }}>
                  {["N1","N2","N3","N4","N5"].map(n => (
                    <button key={n} onClick={()=>setForm(p=>({...p,jlpt:n}))}
                      style={{ padding:"12px 8px", borderRadius:"9px", fontWeight:700, fontSize:"14px", cursor:"pointer", border: form.jlpt===n ? `2px solid ${navy}` : "1.5px solid rgba(11,31,58,0.15)", background: form.jlpt===n ? navy : "#fff", color: form.jlpt===n ? "#fff" : navy, transition:"all 0.15s" }}>
                      {n}
                    </button>
                  ))}
                </div>
                <div style={{ marginTop:"6px", display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:"8px" }}>
                  {["N1","N2","N3","N4","N5"].map((n,i)=>(
                    <div key={n} style={{ textAlign:"center", fontSize:"9px", color:"#9BA0AC" }}>
                      {["最高","上級","中級","初級","基礎"][i]}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                <div>
                  <Label ja="在留資格" vn="Loại visa" />
                  <Select value={form.visa_type} onChange={v=>setForm(p=>({...p,visa_type:v}))}
                    placeholder="選択 / Chọn"
                    options={[
                      {v:"技能実習",l:"技能実習 · Thực tập kỹ năng"},
                      {v:"特定技能1号",l:"特定技能1号"},
                      {v:"特定技能2号",l:"特定技能2号"},
                      {v:"技術・人文知識・国際業務",l:"技人国"},
                      {v:"永住者",l:"永住者 · Thường trú"},
                      {v:"定住者",l:"定住者"},
                      {v:"留学",l:"留学 · Du học"},
                      {v:"未取得",l:"未取得 · Chưa có"},
                    ]}
                  />
                </div>
                <div>
                  <Label ja="在留期限" vn="Hạn visa" />
                  <input style={inputStyle} type="date" value={form.visa_expiry} onChange={set("visa_expiry")} />
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                <div>
                  <Label ja="婚姻状況" vn="Tình trạng hôn nhân" />
                  <Select value={form.marital_status} onChange={v=>setForm(p=>({...p,marital_status:v}))}
                    placeholder="選択 / Chọn"
                    options={[{v:"未婚",l:"未婚 · Độc thân"},{v:"既婚",l:"既婚 · Đã kết hôn"},{v:"離婚",l:"離婚 · Ly hôn"}]}
                  />
                </div>
                <div>
                  <Label ja="扶養家族数" vn="Số người phụ thuộc" />
                  <input style={inputStyle} type="number" min="0" max="10" value={form.dependents} onChange={set("dependents")} />
                </div>
              </div>
              <div>
                <Label ja="来日可能時期" vn="Thời gian có thể đến Nhật / bắt đầu làm" />
                <Select value={form.availability} onChange={v=>setForm(p=>({...p,availability:v}))}
                  placeholder="選択 / Chọn"
                  options={[
                    {v:"即日",l:"即日 · Ngay lập tức"},
                    {v:"1ヶ月以内",l:"1ヶ月以内 · Trong 1 tháng"},
                    {v:"3ヶ月以内",l:"3ヶ月以内 · Trong 3 tháng"},
                    {v:"6ヶ月以内",l:"6ヶ月以内 · Trong 6 tháng"},
                    {v:"1年以内",l:"1年以内 · Trong 1 năm"},
                    {v:"未定",l:"未定 · Chưa xác định"},
                  ]}
                />
              </div>
            </div>
          )}

          {/* ── STEP 3: Work preferences ── */}
          {step === 3 && (
            <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
              <div>
                <Label ja="希望業種" vn="Ngành nghề mong muốn" required />
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"8px" }}>
                  {[
                    {v:"飲食",    e:"🍜", vn:"Nhà hàng"},
                    {v:"製造",    e:"🏭", vn:"Nhà máy"},
                    {v:"農業",    e:"🌾", vn:"Nông nghiệp"},
                    {v:"ホテル",  e:"🏨", vn:"Khách sạn"},
                    {v:"介護・福祉",e:"🏥", vn:"Điều dưỡng"},
                    {v:"建設業",  e:"🏗️", vn:"Xây dựng"},
                    {v:"IT",      e:"💻", vn:"IT"},
                    {v:"物流",    e:"🚛", vn:"Logistics"},
                    {v:"その他",  e:"📋", vn:"Khác"},
                  ].map(s=>(
                    <button key={s.v} onClick={()=>setForm(p=>({...p,skill:s.v}))}
                      style={{ padding:"12px 8px", borderRadius:"10px", cursor:"pointer", textAlign:"center", border: form.skill===s.v ? `2px solid ${navy}` : "1.5px solid rgba(11,31,58,0.15)", background: form.skill===s.v ? "#E6F1FB" : "#fff", transition:"all 0.15s" }}>
                      <div style={{ fontSize:"20px", marginBottom:"4px" }}>{s.e}</div>
                      <div style={{ fontSize:"11px", fontWeight:600, color:navy }}>{s.v}</div>
                      <div style={{ fontSize:"9px", color:"#6B6B6B" }}>{s.vn}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label ja="希望職種・ポジション" vn="Vị trí / Công việc mong muốn" />
                <input style={inputStyle} placeholder="例: 調理師、溶接工、介護福祉士..." value={form.preferred_job} onChange={set("preferred_job")} />
              </div>
              <div>
                <Label ja="希望勤務時間" vn="Giờ làm việc mong muốn" />
                <Select value={form.work_hours} onChange={v=>setForm(p=>({...p,work_hours:v}))}
                  placeholder="選択 / Chọn"
                  options={[
                    {v:"フルタイム",l:"フルタイム · Toàn thời gian"},
                    {v:"パートタイム",l:"パートタイム · Bán thời gian"},
                    {v:"夜勤可",l:"夜勤可 · Có thể làm ca đêm"},
                    {v:"シフト制",l:"シフト制 · Ca luân phiên"},
                    {v:"週3〜4日",l:"週3〜4日 · 3–4 ngày/tuần"},
                  ]}
                />
              </div>
            </div>
          )}

          {/* ── STEP 4: Motivation ── */}
          {step === 4 && (
            <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
              <div>
                <Label ja="志望動機・来日理由" vn="Lý do muốn làm việc tại Nhật" required />
                <textarea
                  style={{ ...inputStyle, minHeight:"130px", resize:"vertical" }}
                  placeholder="日本で働きたい理由、目標などをご記入ください。&#10;Vd: Tôi muốn sang Nhật để nâng cao tay nghề và gửi tiền về hỗ trợ gia đình..."
                  value={form.motivation} onChange={set("motivation")}
                />
              </div>
              <div>
                <Label ja="自己PR" vn="Giới thiệu bản thân / Điểm mạnh" />
                <textarea
                  style={{ ...inputStyle, minHeight:"110px", resize:"vertical" }}
                  placeholder="あなたの強み、経験、スキルなどをご記入ください。&#10;Vd: Tôi có 3 năm kinh nghiệm làm bếp, chăm chỉ và học hỏi nhanh..."
                  value={form.self_pr} onChange={set("self_pr")}
                />
              </div>

              {/* Privacy notice */}
              <div style={{ background:"#F6F7F9", borderRadius:"10px", padding:"14px 16px", fontSize:"11px", color:"#6B6B6B", lineHeight:1.7 }}>
                <strong style={{ color:navy }}>個人情報の取り扱いについて</strong><br/>
                ご記入いただいた個人情報は、求人紹介目的のみに使用し、第三者に提供することはありません。<br/>
                <span style={{ opacity:0.8 }}>Thông tin cá nhân chỉ dùng cho mục đích giới thiệu việc làm, không chia sẻ cho bên thứ ba.</span>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ marginTop:"14px", padding:"10px 14px", background:"#FCEBEB", borderRadius:"8px", fontSize:"12px", color:"#C8002A", border:"1px solid #C8002A22" }}>
              ⚠️ {error}
            </div>
          )}

          {/* Navigation buttons */}
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:"24px", paddingTop:"20px", borderTop:"0.5px solid rgba(11,31,58,0.08)" }}>
            {step > 1
              ? <button onClick={back} style={{ padding:"10px 20px", borderRadius:"9px", border:`1.5px solid rgba(11,31,58,0.2)`, background:"#fff", color:navy, fontSize:"13px", fontWeight:600, cursor:"pointer" }}>
                  ← 戻る / Quay lại
                </button>
              : <div />
            }
            {step < 4
              ? <button onClick={next} style={{ padding:"10px 28px", borderRadius:"9px", background:navy, color:"#fff", fontSize:"13px", fontWeight:600, cursor:"pointer", border:"none" }}>
                  次へ / Tiếp theo →
                </button>
              : <button onClick={submit} disabled={loading}
                  style={{ padding:"11px 32px", borderRadius:"9px", background: loading ? "#9BA0AC" : "#C8002A", color:"#fff", fontSize:"13px", fontWeight:700, cursor: loading ? "not-allowed" : "pointer", border:"none", display:"flex", alignItems:"center", gap:"8px" }}>
                  {loading ? "送信中..." : "📨 応募する / Gửi đăng ký"}
                </button>
            }
          </div>
        </div>

        {/* Footer note */}
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
