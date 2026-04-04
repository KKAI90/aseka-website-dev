"use client";
import { useState } from "react";
import { useLang } from "@/contexts/LangContext";

const T = {
  JP: {
    eyebrow: "Contact · お問い合わせ",
    title: "まずは無料でご相談ください",
    subtitle: "無料相談 · 24時間以内にご返信 · ベトナム語対応可",
    tabs: [
      { val: "business",   label: "企業・採用担当者",   sub: "企業・法人のお客様" },
      { val: "individual", label: "個人・求職者",        sub: "個人のお客様" },
    ],
    fields: { name: "お名前 *", company: "会社名 *", email: "メールアドレス *", phone: "電話番号", service: "ご相談内容", message: "メッセージ" },
    namePh: "山田 太郎", companyPh: "株式会社〇〇",
    servicePh: "選択してください",
    services: [{ v: "hr", l: "人材紹介" }, { v: "nenkin", l: "年金・社会保険" }, { v: "visa", l: "観光ビザ申請" }, { v: "zairyu", l: "在留手続き" }, { v: "other", l: "その他" }],
    messagePh: "ご質問・ご要望をご記入ください",
    submit: "送信する →", sending: "送信中...",
    privacy: "個人情報は適切に管理し、第三者に提供しません。",
    successTitle: "送信完了", successBody: "お問い合わせありがとうございます。\n24時間以内にご連絡いたします。",
    successSub: "担当者より折り返しご連絡いたします。",
    anotherBtn: "別のお問い合わせ",
  },
  EN: {
    eyebrow: "Contact Us",
    title: "Free Consultation",
    subtitle: "Free advice · Response within 24 hours · Vietnamese support available",
    tabs: [
      { val: "business",   label: "For Companies",   sub: "Corporate Inquiry" },
      { val: "individual", label: "For Job Seekers",  sub: "Individual Inquiry" },
    ],
    fields: { name: "Full Name *", company: "Company Name *", email: "Email Address *", phone: "Phone Number", service: "Service of Interest", message: "Message" },
    namePh: "Yamada Taro / Nguyen Van A", companyPh: "ASEKA Co., Ltd.",
    servicePh: "Please select",
    services: [{ v: "hr", l: "HR Placement" }, { v: "nenkin", l: "Pension / Social Insurance" }, { v: "visa", l: "Tourist Visa" }, { v: "zairyu", l: "Residence Procedures" }, { v: "other", l: "Other" }],
    messagePh: "Please enter your questions or requests...",
    submit: "Send Inquiry →", sending: "Sending...",
    privacy: "Your personal information is handled securely and will not be shared with third parties.",
    successTitle: "Message Sent", successBody: "Thank you for your inquiry.\nWe will get back to you within 24 hours.",
    successSub: "Our team will contact you shortly.",
    anotherBtn: "Send Another Inquiry",
  },
  VN: {
    eyebrow: "Liên hệ với Chúng tôi",
    title: "Tư vấn Miễn phí Ngay hôm nay",
    subtitle: "Tư vấn miễn phí · Phản hồi trong 24 giờ · Hỗ trợ tiếng Việt",
    tabs: [
      { val: "business",   label: "Doanh nghiệp",    sub: "Tuyển dụng / Nhân sự" },
      { val: "individual", label: "Cá nhân / Ứng viên", sub: "Tìm việc / Hỏi thăm" },
    ],
    fields: { name: "Họ và tên *", company: "Tên công ty *", email: "Địa chỉ Email *", phone: "Số điện thoại", service: "Dịch vụ quan tâm", message: "Nội dung" },
    namePh: "Nguyễn Văn A", companyPh: "Công ty Cổ phần ...",
    servicePh: "Chọn dịch vụ",
    services: [{ v: "hr", l: "Giới thiệu Nhân sự" }, { v: "nenkin", l: "Nenkin / Bảo hiểm Xã hội" }, { v: "visa", l: "Visa Du lịch" }, { v: "zairyu", l: "Thủ tục Lưu trú" }, { v: "other", l: "Khác" }],
    messagePh: "Nhập câu hỏi hoặc yêu cầu của bạn...",
    submit: "Gửi Liên hệ →", sending: "Đang gửi...",
    privacy: "Thông tin của bạn được bảo mật hoàn toàn và không chia sẻ với bên thứ ba.",
    successTitle: "Đã gửi thành công", successBody: "Cảm ơn bạn đã liên hệ.\nChúng tôi sẽ phản hồi trong vòng 24 giờ.",
    successSub: "Nhân viên của chúng tôi sẽ liên hệ với bạn sớm nhất.",
    anotherBtn: "Gửi liên hệ khác",
  },
};

type FormState = { type: string; name: string; company: string; email: string; phone: string; service: string; message: string };
const initial: FormState = { type: "business", name: "", company: "", email: "", phone: "", service: "", message: "" };

export default function Contact() {
  const { lang } = useLang();
  const t = T[lang];
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState>(initial);

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Error"); }
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error");
    } finally { setLoading(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "14px 16px",
    fontFamily: "'Noto Sans JP', sans-serif", fontSize: "14px", color: "var(--dark)",
    background: "#fff", border: "1px solid rgba(184,150,62,0.25)", borderRadius: "0", outline: "none",
    transition: "border-color 0.3s", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontFamily: "'Noto Sans JP', sans-serif",
    fontSize: "11px", letterSpacing: "1.5px", color: "var(--warm-gray)", marginBottom: "8px",
  };

  if (submitted) {
    return (
      <section style={{ padding: "120px 60px", background: "var(--cream)", minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: "480px", padding: "64px 48px", border: "1px solid rgba(184,150,62,0.25)", background: "#fff" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(184,150,62,0.1)", border: "1px solid rgba(184,150,62,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h3 style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "20px", fontWeight: 400, color: "var(--dark)", marginBottom: "12px", letterSpacing: "1px" }}>{t.successTitle}</h3>
          <p style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: "14px", lineHeight: 1.9, color: "var(--warm-gray)", marginBottom: "8px", whiteSpace: "pre-line" }}>{t.successBody}</p>
          <p style={{ fontSize: "13px", color: "var(--warm-gray)", opacity: 0.75, marginBottom: "32px" }}>{t.successSub}</p>
          <button onClick={() => { setSubmitted(false); setForm(initial); }} style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: "12px", letterSpacing: "2px", color: "var(--gold)", background: "none", border: "1px solid rgba(184,150,62,0.4)", padding: "10px 28px", cursor: "pointer" }}>
            {t.anotherBtn}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section style={{ padding: "100px 60px 120px", background: "var(--cream)" }}>
      <div style={{ maxWidth: "760px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "12px", color: "var(--gold)", letterSpacing: "5px", fontStyle: "italic", marginBottom: "16px" }}>{t.eyebrow}</div>
          <h2 style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 400, color: "var(--dark)", letterSpacing: "1px", margin: "0 0 16px" }}>{t.title}</h2>
          <div style={{ width: "48px", height: "1px", background: "var(--gold)", opacity: 0.5, margin: "0 auto 20px" }} />
          <p style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: "13px", color: "var(--warm-gray)" }}>{t.subtitle}</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", marginBottom: "48px", border: "1px solid rgba(184,150,62,0.25)" }}>
          {t.tabs.map((tab) => (
            <button key={tab.val} onClick={() => setForm((f) => ({ ...f, type: tab.val }))} style={{
              padding: "20px 16px", background: form.type === tab.val ? "var(--dark)" : "#fff",
              color: form.type === tab.val ? "#FAF7F2" : "var(--warm-gray)",
              border: "none", cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: "14px", fontWeight: 500, letterSpacing: "0.5px", transition: "all 0.3s",
              borderRight: tab.val === "business" ? "1px solid rgba(184,150,62,0.25)" : "none",
            }}>
              {tab.label}
              <span style={{ display: "block", fontSize: "11px", opacity: 0.6, marginTop: "4px", fontWeight: 400 }}>{tab.sub}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }} className="contact-form-grid">
            <div>
              <label style={labelStyle}>{t.fields.name}</label>
              <input required type="text" placeholder={t.namePh} value={form.name} onChange={set("name")} style={inputStyle} />
            </div>
            {form.type === "business" && (
              <div>
                <label style={labelStyle}>{t.fields.company}</label>
                <input required type="text" placeholder={t.companyPh} value={form.company} onChange={set("company")} style={inputStyle} />
              </div>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }} className="contact-form-grid">
            <div>
              <label style={labelStyle}>{t.fields.email}</label>
              <input required type="email" placeholder="example@email.com" value={form.email} onChange={set("email")} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t.fields.phone}</label>
              <input type="tel" placeholder="090-0000-0000" value={form.phone} onChange={set("phone")} style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>{t.fields.service}</label>
            <select value={form.service} onChange={set("service")} style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="">{t.servicePh}</option>
              {t.services.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>{t.fields.message}</label>
            <textarea rows={5} placeholder={t.messagePh} value={form.message} onChange={set("message")} style={{ ...inputStyle, resize: "vertical" }} />
          </div>
          {error && <p style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: "13px", color: "#C8002A", textAlign: "center" }}>{error}</p>}
          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "18px",
            background: loading ? "rgba(12,31,46,0.6)" : "#0C1F2E", color: "#FAF7F2",
            fontFamily: "'Noto Sans JP', sans-serif", fontSize: "14px", letterSpacing: "3px",
            border: "none", cursor: loading ? "not-allowed" : "pointer", transition: "background 0.3s",
          }}>
            {loading ? t.sending : t.submit}
          </button>
          <p style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: "11px", color: "var(--warm-gray)", textAlign: "center", letterSpacing: "0.5px", whiteSpace: "pre-line" }}>{t.privacy}</p>
        </form>
      </div>

      <style>{`
        input:focus, textarea:focus, select:focus { border-color: var(--gold) !important; box-shadow: 0 0 0 2px rgba(184,150,62,0.12); }
        input::placeholder, textarea::placeholder { color: rgba(138,130,120,0.5); }
        @media (max-width: 700px) { .contact-form-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 600px) { section { padding: 80px 24px 100px !important; } }
      `}</style>
    </section>
  );
}
