"use client";
import Link from "next/link";
import { useLang } from "@/contexts/LangContext";

const T = {
  JP: {
    eyebrow: "Contact Us",
    title: "まずは、無料でご相談ください。",
    desc: "企業の採用担当者様も、求職者様も、お気軽にお問い合わせください。\n担当者が24時間以内にご連絡いたします。",
    btn1: "お問い合わせフォームへ",
    btn2: "お電話で相談する",
    tel: "03-6231-9969",
  },
  EN: {
    eyebrow: "Contact Us",
    title: "Start with a free consultation.",
    desc: "Whether you are a company looking to hire or a job seeker ready to take the next step,\nwe are here to help. We will respond within 24 hours.",
    btn1: "Go to Contact Form",
    btn2: "Call Us",
    tel: "03-6231-9969",
  },
  VN: {
    eyebrow: "Liên hệ",
    title: "Hãy bắt đầu bằng tư vấn miễn phí.",
    desc: "Dù bạn là doanh nghiệp đang tuyển dụng hay ứng viên muốn tìm việc,\nchúng tôi luôn sẵn sàng hỗ trợ. Phản hồi trong vòng 24 giờ.",
    btn1: "Đến Form Liên hệ",
    btn2: "Gọi điện tư vấn",
    tel: "03-6231-9969",
  },
};

export default function ContactCTA() {
  const { lang } = useLang();
  const t = T[lang];

  return (
    <section style={{
      background: "#0C1F2E",
      padding: "100px 60px",
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Decorative gold circle */}
      <div style={{
        position: "absolute", top: "-120px", right: "-120px",
        width: "400px", height: "400px", borderRadius: "50%",
        border: "1px solid rgba(184,150,62,0.12)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-80px", left: "-80px",
        width: "300px", height: "300px", borderRadius: "50%",
        border: "1px solid rgba(184,150,62,0.08)",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Eyebrow */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginBottom: "28px" }}>
          <div style={{ width: "40px", height: "1px", background: "var(--gold)", opacity: 0.5 }} />
          <span style={{
            fontFamily: "'Noto Sans JP', sans-serif",
            fontSize: "12px", letterSpacing: "3px",
            color: "var(--gold)", fontStyle: "normal", textTransform: "uppercase",
          }}>{t.eyebrow}</span>
          <div style={{ width: "40px", height: "1px", background: "var(--gold)", opacity: 0.5 }} />
        </div>

        {/* Title */}
        <h2 style={{
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: "clamp(22px, 3.2vw, 40px)", fontWeight: 500,
          color: "#FAF7F2", letterSpacing: "2px",
          lineHeight: 1.5,
          marginBottom: "28px",
        }}>{t.title}</h2>

        {/* Description */}
        <p style={{
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: lang === "JP" ? "15px" : "14px", lineHeight: 2.1,
          color: "rgba(250,247,242,0.78)",
          marginBottom: "52px",
          whiteSpace: "pre-line",
          letterSpacing: "0.3px",
        }}>{t.desc}</p>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/contact" style={{
            display: "inline-flex", alignItems: "center",
            padding: "18px 44px",
            background: "var(--gold)",
            color: "#0C1F2E",
            fontFamily: "'Noto Sans JP', sans-serif",
            fontSize: lang === "JP" ? "15px" : "13px", fontWeight: 500, letterSpacing: "1px",
            textDecoration: "none",
            transition: "opacity 0.3s",
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            {t.btn1}
          </Link>
          <a href={`tel:${t.tel.replace(/-/g, "")}`} style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "18px 36px",
            border: "1px solid rgba(184,150,62,0.4)",
            color: "rgba(250,247,242,0.92)",
            fontFamily: "'Noto Sans JP', sans-serif",
            fontSize: lang === "JP" ? "15px" : "13px",
            fontWeight: 500, letterSpacing: "1px",
            textDecoration: "none",
            transition: "border-color 0.3s",
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--gold)")}
          onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(184,150,62,0.4)")}
          >
            {t.btn2} · {t.tel}
          </a>
        </div>
      </div>

      <style>{`
        @media (max-width: 600px) {
          section { padding: 80px 24px !important; }
        }
      `}</style>
    </section>
  );
}
