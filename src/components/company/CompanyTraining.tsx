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
    schoolLabel: "オンライン日本語スクール",
    features: [
      { title: "オンライン完結", desc: "場所を選ばず受講できる完全オンライン形式" },
      { title: "試験対策コース", desc: "特定技能・JLPT に特化した対策授業" },
      { title: "会話重視の指導", desc: "実生活・職場で使える実践的な日本語" },
      { title: "ベトナム語対応", desc: "ネイティブ講師によるきめ細かいサポート" },
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
    schoolLabel: "Online Japanese School",
    features: [
      { title: "100% Online", desc: "Study from anywhere with fully online classes" },
      { title: "Exam Preparation", desc: "Specialized courses for Specified Skilled Worker & JLPT" },
      { title: "Conversation Focus", desc: "Practical Japanese for daily life and the workplace" },
      { title: "Vietnamese Support", desc: "Native instructors providing detailed guidance" },
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
    schoolLabel: "Trường Tiếng Nhật Trực tuyến",
    features: [
      { title: "Học hoàn toàn Online", desc: "Học mọi lúc, mọi nơi qua hình thức trực tuyến" },
      { title: "Luyện thi chuyên sâu", desc: "Khóa học ôn thi Kỹ năng đặc định & JLPT" },
      { title: "Trọng tâm giao tiếp", desc: "Tiếng Nhật thực dụng trong cuộc sống và công việc" },
      { title: "Hỗ trợ tiếng Việt", desc: "Giảng viên bản ngữ hướng dẫn tận tình" },
    ],
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
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "14px", color: "var(--gold)",
              letterSpacing: "2px", fontWeight: 500, fontStyle: "normal",
            }}>04</span>
            <div style={{ width: "48px", height: "1px", background: "var(--gold)", opacity: 0.6, flexShrink: 0 }} />
            <span style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: "13px", letterSpacing: "3px",
              color: "#3d3833", textTransform: "uppercase", fontWeight: 400,
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
        </div>

        {/* ── Right: THAO TOKYO dark panel ── */}
        <div style={{
          background: "#0C1F2E",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px 56px",
          position: "relative",
          overflow: "hidden",
        }} className="training-panel">

          {/* Decorative circle */}
          <div style={{
            position: "absolute", top: "-80px", right: "-80px",
            width: "280px", height: "280px", borderRadius: "50%",
            border: "1px solid rgba(184,150,62,0.10)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: "-60px", left: "-60px",
            width: "200px", height: "200px", borderRadius: "50%",
            border: "1px solid rgba(184,150,62,0.07)",
            pointerEvents: "none",
          }} />

          {/* THAO TOKYO brand header */}
          <div style={{ marginBottom: "48px" }}>
            <div style={{
              fontFamily: "'Noto Serif JP', serif",
              fontSize: "28px", letterSpacing: "4px",
              color: "var(--gold)", fontWeight: 600,
              marginBottom: "10px",
            }}>THAO TOKYO</div>
            <div style={{
              width: "40px", height: "2px",
              background: "var(--gold)", opacity: 0.5,
              marginBottom: "10px",
            }} />
            <div style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: "12px", letterSpacing: "2px",
              color: "rgba(250,247,242,0.5)",
              textTransform: "uppercase",
            }}>{t.schoolLabel}</div>
          </div>

          {/* Feature list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            {t.features.map((f, i) => (
              <div key={i} style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
                {/* Gold number */}
                <div style={{
                  fontFamily: "'Noto Serif JP', serif",
                  fontSize: "13px", color: "var(--gold)",
                  opacity: 0.7, flexShrink: 0,
                  marginTop: "2px", letterSpacing: "1px",
                  fontWeight: 600,
                }}>0{i + 1}</div>
                <div style={{
                  borderLeft: "1px solid rgba(184,150,62,0.2)",
                  paddingLeft: "18px",
                }}>
                  <div style={{
                    fontFamily: "'Noto Sans JP', sans-serif",
                    fontSize: lang === "JP" ? "14px" : "13px",
                    fontWeight: 600, letterSpacing: "0.5px",
                    color: "#FAF7F2", marginBottom: "5px",
                  }}>{f.title}</div>
                  <div style={{
                    fontFamily: "'Noto Sans JP', sans-serif",
                    fontSize: lang === "JP" ? "13px" : "12px",
                    lineHeight: 1.8,
                    color: "rgba(250,247,242,0.52)",
                  }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .training-grid { grid-template-columns: 1fr !important; }
          .training-panel { padding: 56px 24px !important; }
          .training-text { padding: 64px 24px !important; }
        }
      `}</style>
    </section>
  );
}
