"use client";
import { useLang } from "@/contexts/LangContext";

const T = {
  JP: { title: "SERVICE", subtitle: "事業内容" },
  EN: { title: "SERVICE", subtitle: "Our Business" },
  VN: { title: "SERVICE", subtitle: "Dịch vụ của Chúng tôi" },
};

export default function CompanyHero() {
  const { lang } = useLang();
  const t = T[lang];

  return (
    <div style={{
      height: "100vh", position: "relative", overflow: "hidden",
      display: "flex", alignItems: "center", justifyContent: "flex-end",
    }}>
      <img
        src="/images/hero-vietnam.jpg"
        alt="ASEKA Company"
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover", objectPosition: "center 40%",
        }}
      />
      <div style={{ position: "absolute", inset: 0, background: "rgba(240,236,228,0.18)" }} />
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to left, rgba(250,247,242,0.72) 0%, rgba(250,247,242,0.18) 55%, transparent 100%)",
      }} />
      <div style={{ position: "relative", zIndex: 2, padding: "0 72px 0 0", maxWidth: "540px", textAlign: "right" }}>
        <h1 style={{
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: "clamp(52px, 7.5vw, 96px)", fontWeight: 700,
          color: "#0C1F2E", letterSpacing: "-1px", lineHeight: 1,
          margin: 0, whiteSpace: "nowrap",
        }}>
          {t.title}
        </h1>
        <div style={{
          height: "3px",
          background: "linear-gradient(to left, var(--gold) 0%, rgba(184,150,62,0.15) 100%)",
          margin: "20px 0 18px", borderRadius: "2px",
        }} />
        <p style={{
          fontFamily: "'Noto Serif JP', serif", fontSize: "17px",
          fontWeight: 400, color: "#1A2E3A",
          letterSpacing: lang === "JP" ? "5px" : "2px",
        }}>
          {t.subtitle}
        </p>
      </div>
      <div style={{
        position: "absolute", bottom: "36px", left: "50%",
        transform: "translateX(-50%)", zIndex: 3,
        display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
      }}>
        <div style={{
          width: "1px", height: "52px",
          background: "linear-gradient(to bottom, var(--gold), transparent)",
          animation: "scrollLine 2s ease-in-out infinite",
        }} />
        <span style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "10px", letterSpacing: "4px",
          color: "var(--gold)", opacity: 0.7, fontStyle: "italic",
        }}>SCROLL</span>
      </div>
      <style>{`
        @keyframes scrollLine {
          0%, 100% { opacity: 1; transform: scaleY(1); transform-origin: top; }
          50%       { opacity: 0.4; transform: scaleY(0.4); transform-origin: top; }
        }
      `}</style>
    </div>
  );
}
