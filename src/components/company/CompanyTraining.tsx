"use client";
import Image from "next/image";
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
    schoolLabel: "オンライン日本語スクール",
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
    schoolLabel: "Online Japanese School",
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
    schoolLabel: "Trường Tiếng Nhật Trực tuyến",
  },
};

export default function CompanyTraining() {
  const { lang } = useLang();
  const t = T[lang];

  return (
    <section id="training" style={{ background: "white", overflow: "hidden" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        minHeight: "600px",
      }} className="training-grid">

        {/* ── Left: text content ── */}
        <div style={{ padding: "88px 64px 88px 60px" }} className="training-text">

          {/* Section label */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "52px" }}>
            <span style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: "13px", color: "var(--gold)",
              letterSpacing: "2px", fontWeight: 500,
            }}>04</span>
            <div style={{ width: "48px", height: "1px", background: "var(--gold)", opacity: 0.4, flexShrink: 0 }} />
            <span style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: "11px", letterSpacing: "4px",
              color: "var(--warm-gray)", textTransform: "uppercase",
            }}>{t.sectionLabel}</span>
          </div>

          {/* Heading */}
          <h2 style={{
            fontFamily: "'Noto Serif JP', serif",
            fontSize: "clamp(36px, 4.5vw, 52px)", fontWeight: 600,
            color: "var(--dark)", marginBottom: "8px", letterSpacing: "2px",
          }}>{t.heading}</h2>

          {/* Subheading */}
          <p style={{
            fontFamily: "'Noto Sans JP', sans-serif",
            fontSize: "12px", letterSpacing: "3px",
            color: "var(--warm-gray)", marginBottom: "36px",
            paddingBottom: "28px",
            borderBottom: "1px solid rgba(184,150,62,0.25)",
          }}>
            {t.subheading}
          </p>

          {/* Paragraphs */}
          {t.paragraphs.map((p, i) => (
            <p key={i} style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: lang === "JP" ? "15px" : "14px",
              lineHeight: 2.1,
              color: "#3d3833", marginBottom: "18px",
              letterSpacing: "0.02em",
            }}>
              {p}
            </p>
          ))}

          {/* THAO TOKYO brand block */}
          <div style={{
            marginTop: "44px",
            padding: "24px 32px",
            background: "#0C1F2E",
            borderLeft: "3px solid var(--gold)",
            display: "flex", alignItems: "center", gap: "20px",
          }}>
            <div style={{
              fontFamily: "'Noto Serif JP', serif",
              fontSize: "18px", letterSpacing: "3px",
              color: "var(--gold)", flexShrink: 0, fontWeight: 600,
            }}>THAO TOKYO</div>
            <div style={{
              width: "1px", height: "28px",
              background: "rgba(184,150,62,0.3)", flexShrink: 0,
            }} />
            <div style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: "12px", letterSpacing: "1px",
              color: "rgba(250,247,242,0.65)",
            }}>
              {t.schoolLabel}
            </div>
          </div>
        </div>

        {/* ── Right: image ── */}
        <div style={{ position: "relative", minHeight: "520px" }} className="training-image">
          <Image
            src="/images/teacher-portrait.jpg"
            alt="THAO TOKYO Japanese Language Training"
            fill
            style={{ objectFit: "cover", objectPosition: "center 20%" }}
          />
          {/* Subtle dark overlay for depth */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to right, rgba(10,20,35,0.18) 0%, rgba(10,20,35,0.08) 100%)",
          }} />
          {/* Gold accent line on left edge */}
          <div style={{
            position: "absolute", left: 0, top: "15%", bottom: "15%",
            width: "3px", background: "var(--gold)", opacity: 0.6,
          }} />
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .training-grid {
            grid-template-columns: 1fr !important;
          }
          .training-image {
            min-height: 340px !important;
          }
          .training-text {
            padding: 64px 24px !important;
          }
        }
      `}</style>
    </section>
  );
}
