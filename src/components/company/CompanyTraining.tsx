"use client";
import { useLang } from "@/contexts/LangContext";

const T = {
  JP: {
    sectionLabel: "Training",
    heading: "TRAINING",
    subheading: "日本語教育サービス",
    paragraphs: [
      "日本での就職を支援するために、言語力向上のためのオンライン日本語教育、特定技能向けの試験対策のサービスを提供しております。",
      "多くのベトナム人から支持されているTHAO TOKYOオンライン日本語スクールを運営しております。",
      "THAO TOKYOでは試験対策授業というよりもむしろ、日本語での会話の重要性に重きを置いておりますので、生活と仕事の両面で活用できるような指導に注力しております。",
    ],
  },
  EN: {
    sectionLabel: "Training",
    heading: "TRAINING",
    subheading: "Japanese Language Education Services",
    paragraphs: [
      "To support employment in Japan, we provide online Japanese language education and exam preparation services for specified skilled workers.",
      "We operate THAO TOKYO Online Japanese School, which is highly regarded by many Vietnamese learners.",
      "Rather than focusing solely on exam preparation, THAO TOKYO places great importance on conversational Japanese, providing instruction that can be applied in both daily life and at work.",
    ],
  },
  VN: {
    sectionLabel: "Đào tạo",
    heading: "TRAINING",
    subheading: "Dịch vụ Giáo dục Tiếng Nhật",
    paragraphs: [
      "Để hỗ trợ việc làm tại Nhật Bản, chúng tôi cung cấp dịch vụ giáo dục tiếng Nhật trực tuyến nhằm nâng cao ngôn ngữ và ôn thi kỹ năng đặc định.",
      "Chúng tôi vận hành Trường Tiếng Nhật Trực tuyến THAO TOKYO được nhiều người Việt Nam tin dùng.",
      "THAO TOKYO không chỉ tập trung vào luyện thi mà đặt trọng tâm vào tầm quan trọng của giao tiếp tiếng Nhật, giúp học viên ứng dụng được trong cả cuộc sống lẫn công việc.",
    ],
  },
};

export default function CompanyTraining() {
  const { lang } = useLang();
  const t = T[lang];

  return (
    <section id="training" style={{ padding: "100px 60px", background: "white" }}>
      {/* Section label */}
      <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "64px" }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "13px", color: "var(--gold)", letterSpacing: "2px" }}>04</span>
        <div style={{ width: "60px", height: "1px", background: "var(--gold)", opacity: 0.4, flexShrink: 0 }} />
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "11px", letterSpacing: "5px", color: "var(--warm-gray)", textTransform: "uppercase" }}>{t.sectionLabel}</span>
      </div>

      <div style={{ maxWidth: "800px" }}>
        {/* Heading */}
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(40px, 6vw, 56px)", fontWeight: 300,
          color: "var(--dark)", marginBottom: "6px",
        }}>{t.heading}</h2>

        {/* Subheading + divider */}
        <p style={{
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: "13px", letterSpacing: "3px",
          color: "var(--warm-gray)", marginBottom: "40px",
          paddingBottom: "32px",
          borderBottom: "1px solid rgba(184,150,62,0.25)",
        }}>
          {t.subheading}
        </p>

        {/* Paragraphs */}
        {t.paragraphs.map((p, i) => (
          <p key={i} style={{
            fontFamily: "'Noto Serif JP', serif",
            fontSize: "15px", lineHeight: 2.1,
            color: "#3d3833", marginBottom: "20px",
            letterSpacing: "0.02em",
          }}>
            {p}
          </p>
        ))}

        {/* THAO TOKYO brand accent */}
        <div style={{
          marginTop: "48px",
          padding: "32px 40px",
          background: "#0C1F2E",
          borderLeft: "3px solid var(--gold)",
          display: "flex", alignItems: "center", gap: "24px",
        }}>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "22px", letterSpacing: "4px",
            color: "var(--gold)", flexShrink: 0,
          }}>THAO TOKYO</div>
          <div style={{
            width: "1px", height: "32px",
            background: "rgba(184,150,62,0.3)", flexShrink: 0,
          }} />
          <div style={{
            fontFamily: "'Noto Sans JP', sans-serif",
            fontSize: "12px", letterSpacing: "1.5px",
            color: "rgba(250,247,242,0.65)",
          }}>
            {lang === "JP" ? "オンライン日本語スクール" : lang === "EN" ? "Online Japanese School" : "Trường Tiếng Nhật Trực tuyến"}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 600px) { #training { padding: 64px 24px !important; } }
      `}</style>
    </section>
  );
}
