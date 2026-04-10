"use client";
import Image from "next/image";
import { useLang } from "@/contexts/LangContext";

const T = {
  JP: {
    sectionLabel: "Our Philosophy",
    cards: [
      { letter: "A", tag: "AI — 人に愛", title: "人に愛", body: "私たちは、思いやりの心を持って、相手の身になって考え、人々の幸福に貢献します。" },
      { letter: "SE", tag: "SEII — 仕事に誠意", title: "仕事に誠意", body: "私たちは、それぞれの個性・能力を認め合い、公正で透明な関わりで、企業活動に励みます。" },
      { letter: "KA", tag: "KANSHA — 出会いに感謝", title: "出会いに感謝", body: "私たちは、多くの人々との出会いに感謝し、信頼をいただき、人間関係を構築します。" },
    ],
    asekaDesc1: "以下3つの頭文字をとって、社名を",
    asekaDesc2: "と命名しました。",
    asekaTagline: "愛（AI）· 誠意（SEII）· 感謝（KANSHA）",
  },
  EN: {
    sectionLabel: "Our Philosophy",
    cards: [
      { letter: "A", tag: "AI — Love for People", title: "Love for People", body: "We place ourselves in others' shoes with a caring heart, contributing to the happiness and wellbeing of all." },
      { letter: "S", tag: "SEII — Integrity in Work", title: "Integrity in Work", body: "We acknowledge each other's individuality and abilities, working together in fair and transparent business activities." },
      { letter: "K", tag: "KANSHA — Gratitude", title: "Gratitude for Encounters", body: "We cherish the many encounters in our lives, building trust and lasting human relationships." },
    ],
    asekaDesc1: "The company name",
    asekaDesc2: "was formed from the initials of our three core values.",
    asekaTagline: "Love (AI) · Integrity (SEII) · Gratitude (KANSHA)",
  },
  VN: {
    sectionLabel: "Triết lý Công ty",
    cards: [
      { letter: "A", tag: "AI — Yêu thương Con người", title: "Yêu thương Con người", body: "Chúng tôi đặt mình vào vị trí của người khác với tấm lòng thấu cảm, đóng góp vào hạnh phúc của mọi người." },
      { letter: "S", tag: "SEII — Tận tâm Công việc", title: "Tận tâm Công việc", body: "Chúng tôi tôn trọng cá tính và năng lực của từng người, cùng nhau nỗ lực kinh doanh một cách công bằng và minh bạch." },
      { letter: "K", tag: "KANSHA — Biết ơn Cuộc gặp gỡ", title: "Biết ơn Cuộc gặp gỡ", body: "Chúng tôi trân trọng những cuộc gặp gỡ với nhiều người, xây dựng lòng tin và mối quan hệ bền lâu." },
    ],
    asekaDesc1: "Tên công ty",
    asekaDesc2: "được đặt từ ba chữ cái đầu của những giá trị cốt lõi sau:",
    asekaTagline: "Yêu thương (AI) · Tận tâm (SEII) · Biết ơn (KANSHA)",
  },
};

export default function Philosophy() {
  const { lang } = useLang();
  const t = T[lang];

  return (
    <section id="about" style={{ padding: "120px 60px", background: "var(--cream)" }}>
      <div className="phil-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "2px" }}>
        {t.cards.map((card) => (
          <div key={card.letter} className="phil-card" style={{
            padding: "52px 44px", background: "white",
            position: "relative", overflow: "hidden", transition: "transform 0.4s ease",
          }}>
            <div className="phil-bar" style={{
              position: "absolute", top: 0, left: 0, right: 0,
              height: "3px", background: "var(--gold)",
              transform: "scaleX(0)", transformOrigin: "left", transition: "transform 0.4s ease",
            }} />
            <div style={{
              fontFamily: "'Cormorant Garamond', serif", fontSize: "96px", fontWeight: 300,
              color: "var(--gold)", opacity: 0.07, position: "absolute", top: "-8px", right: "20px",
              letterSpacing: "-4px", lineHeight: 1, userSelect: "none",
            }}>{card.letter}</div>
            <span style={{
              display: "inline-block", fontFamily: "'Cormorant Garamond', serif",
              fontSize: "11px", letterSpacing: "3px", color: "#B8963E", textTransform: "uppercase",
              marginBottom: "22px", paddingBottom: "14px", borderBottom: "1px solid rgba(184,150,62,0.3)",
            }}>{card.tag}</span>
            <h3 style={{
              fontFamily: "'Noto Serif JP', serif", fontSize: "24px", fontWeight: 400,
              color: "var(--dark)", marginBottom: "18px", lineHeight: 1.35, letterSpacing: "1px",
            }}>{card.title}</h3>
            <p style={{
              fontFamily: "'Noto Serif JP', serif", fontSize: "15px", lineHeight: 1.9,
              color: "#5a5550", letterSpacing: "0.02em",
            }}>{card.body}</p>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: "3px", padding: "52px 60px", background: "var(--dark)",
        display: "flex", alignItems: "center", gap: "64px",
      }} className="aseka-name-block">
        <div style={{ flexShrink: 0 }}>
          <Image
            src="/images/aseka-logo-icon.png"
            alt="ASEKA"
            width={72}
            height={72}
            style={{ objectFit: "contain", width: "72px", height: "72px" }}
          />
        </div>
        <div>
          <p style={{
            fontFamily: "'Noto Serif JP', serif", fontSize: "20px", lineHeight: 2,
            color: "rgba(250,247,242,0.88)", marginBottom: "14px", letterSpacing: "0.05em",
          }}>
            {t.asekaDesc1}{" "}
            <strong style={{ color: "var(--gold-light)", fontWeight: 500 }}>ASEKA</strong>{" "}
            {t.asekaDesc2}
          </p>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: "17px", letterSpacing: "3px",
            color: "rgba(250,247,242,0.55)", fontStyle: "italic",
          }}>{t.asekaTagline}</p>
        </div>
      </div>

      <style>{`
        .phil-card:hover { transform: translateY(-4px); }
        .phil-card:hover .phil-bar { transform: scaleX(1) !important; }
        @media (max-width: 900px) {
          .phil-grid { grid-template-columns: 1fr !important; }
          .aseka-name-block { flex-direction: column !important; gap: 24px !important; padding: 40px 28px !important; }
        }
        @media (max-width: 600px) { #about { padding: 80px 24px !important; } }
      `}</style>
    </section>
  );
}
