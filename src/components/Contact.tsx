"use client";
import { useState } from "react";

type FormState = {
  type: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  service: string;
  message: string;
};

const initialForm: FormState = {
  type: "business",
  name: "",
  company: "",
  email: "",
  phone: "",
  service: "",
  message: "",
};

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState>(initialForm);

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "エラーが発生しました");
      }
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <section style={{ padding: "120px 60px", background: "var(--cream)", minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          textAlign: "center", maxWidth: "480px",
          padding: "64px 48px",
          border: "1px solid rgba(184,150,62,0.25)",
          background: "#fff",
        }}>
          {/* Gold check icon */}
          <div style={{
            width: "56px", height: "56px", borderRadius: "50%",
            background: "rgba(184,150,62,0.1)",
            border: "1px solid rgba(184,150,62,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 28px",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3 style={{
            fontFamily: "'Noto Serif JP', serif",
            fontSize: "20px", fontWeight: 400,
            color: "var(--dark)", marginBottom: "12px",
            letterSpacing: "1px",
          }}>
            送信完了
          </h3>
          <p style={{
            fontFamily: "'Noto Sans JP', sans-serif",
            fontSize: "14px", lineHeight: 1.9,
            color: "var(--warm-gray)", marginBottom: "32px",
          }}>
            お問い合わせありがとうございます。<br />
            24時間以内にご連絡いたします。<br />
            <span style={{ fontSize: "13px", opacity: 0.75 }}>Chúng tôi sẽ liên hệ trong vòng 24 giờ.</span>
          </p>
          <button
            onClick={() => { setSubmitted(false); setForm(initialForm); }}
            style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: "12px", letterSpacing: "2px",
              color: "var(--gold)", background: "none",
              border: "1px solid rgba(184,150,62,0.4)",
              padding: "10px 28px", cursor: "pointer",
              transition: "all 0.3s",
            }}
          >
            別のお問い合わせ
          </button>
        </div>
      </section>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    fontFamily: "'Noto Sans JP', sans-serif",
    fontSize: "14px",
    color: "var(--dark)",
    background: "#fff",
    border: "1px solid rgba(184,150,62,0.25)",
    borderRadius: "0",
    outline: "none",
    transition: "border-color 0.3s",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontFamily: "'Noto Sans JP', sans-serif",
    fontSize: "11px",
    letterSpacing: "1.5px",
    color: "var(--warm-gray)",
    marginBottom: "8px",
  };

  return (
    <section style={{ padding: "100px 60px 120px", background: "var(--cream)" }}>
      <div style={{ maxWidth: "760px", margin: "0 auto" }}>

        {/* Section header */}
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "12px", color: "var(--gold)",
            letterSpacing: "5px", fontStyle: "italic",
            marginBottom: "16px",
          }}>
            Contact · お問い合わせ
          </div>
          <h2 style={{
            fontFamily: "'Noto Serif JP', serif",
            fontSize: "clamp(26px, 4vw, 38px)",
            fontWeight: 400, color: "var(--dark)",
            letterSpacing: "1px", margin: "0 0 16px",
          }}>
            まずは無料でご相談ください
          </h2>
          <div style={{
            width: "48px", height: "1px",
            background: "var(--gold)", opacity: 0.5,
            margin: "0 auto 20px",
          }} />
          <p style={{
            fontFamily: "'Noto Sans JP', sans-serif",
            fontSize: "13px", color: "var(--warm-gray)",
            letterSpacing: "0.5px",
          }}>
            Tư vấn miễn phí · Phản hồi trong 24 giờ · Hỗ trợ tiếng Việt
          </p>
        </div>

        {/* Type selector */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          marginBottom: "48px",
          border: "1px solid rgba(184,150,62,0.25)",
        }}>
          {[
            { val: "business",   jp: "企業・採用担当者", vn: "Doanh nghiệp" },
            { val: "individual", jp: "個人・求職者",     vn: "Cá nhân / ứng viên" },
          ].map((tab) => (
            <button
              key={tab.val}
              onClick={() => setForm((f) => ({ ...f, type: tab.val }))}
              style={{
                padding: "20px 16px",
                background: form.type === tab.val ? "var(--dark)" : "#fff",
                color: form.type === tab.val ? "#FAF7F2" : "var(--warm-gray)",
                border: "none", cursor: "pointer",
                fontFamily: "'Noto Sans JP', sans-serif",
                fontSize: "14px", fontWeight: 500,
                letterSpacing: "0.5px",
                transition: "all 0.3s",
                borderRight: tab.val === "business" ? "1px solid rgba(184,150,62,0.25)" : "none",
              }}
            >
              {tab.jp}
              <span style={{
                display: "block", fontSize: "11px",
                opacity: 0.6, marginTop: "4px",
                fontWeight: 400,
              }}>{tab.vn}</span>
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

          {/* Row 1: Name + Company */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }} className="contact-grid">
            <div>
              <label style={labelStyle}>お名前 / Họ tên *</label>
              <input
                required type="text"
                placeholder="山田 太郎 / Nguyễn Văn A"
                value={form.name} onChange={set("name")}
                style={inputStyle}
              />
            </div>
            {form.type === "business" && (
              <div>
                <label style={labelStyle}>会社名 / Tên công ty *</label>
                <input
                  required type="text"
                  placeholder="株式会社〇〇"
                  value={form.company} onChange={set("company")}
                  style={inputStyle}
                />
              </div>
            )}
          </div>

          {/* Row 2: Email + Phone */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }} className="contact-grid">
            <div>
              <label style={labelStyle}>メールアドレス / Email *</label>
              <input
                required type="email"
                placeholder="example@email.com"
                value={form.email} onChange={set("email")}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>電話番号 / Số điện thoại</label>
              <input
                type="tel"
                placeholder="090-0000-0000"
                value={form.phone} onChange={set("phone")}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Service select */}
          <div>
            <label style={labelStyle}>ご相談内容 / Dịch vụ quan tâm</label>
            <select value={form.service} onChange={set("service")} style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="">選択してください / Chọn dịch vụ</option>
              <option value="hr">人材紹介 / Giới thiệu nhân sự</option>
              <option value="nenkin">年金・社会保険 / Nenkin</option>
              <option value="visa">観光ビザ / Visa du lịch</option>
              <option value="zairyu">在留手続き / Thủ tục lưu trú</option>
              <option value="other">その他 / Khác</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label style={labelStyle}>メッセージ / Nội dung</label>
            <textarea
              rows={5}
              placeholder="ご質問・ご要望をご記入ください / Nhập nội dung..."
              value={form.message} onChange={set("message")}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          {error && (
            <p style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: "13px", color: "#C8002A",
              textAlign: "center",
            }}>{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "18px",
              background: loading ? "rgba(12,31,46,0.6)" : "#0C1F2E",
              color: "#FAF7F2",
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: "14px", letterSpacing: "3px",
              border: "none", cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.3s",
            }}
          >
            {loading ? "送信中... / Đang gửi..." : "送信する · Gửi liên hệ →"}
          </button>

          <p style={{
            fontFamily: "'Noto Sans JP', sans-serif",
            fontSize: "11px", color: "var(--warm-gray)",
            textAlign: "center", letterSpacing: "0.5px",
          }}>
            個人情報は適切に管理し、第三者に提供しません。<br />
            Thông tin của bạn được bảo mật hoàn toàn.
          </p>
        </form>
      </div>

      <style>{`
        input:focus, textarea:focus, select:focus {
          border-color: var(--gold) !important;
          box-shadow: 0 0 0 2px rgba(184,150,62,0.12);
        }
        input::placeholder, textarea::placeholder {
          color: rgba(138,130,120,0.5);
        }
        @media (max-width: 700px) {
          .contact-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          section { padding: 80px 24px 100px !important; }
        }
      `}</style>
    </section>
  );
}
