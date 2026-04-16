"use client";
import Image from "next/image";
import { useLang } from "@/contexts/LangContext";

const T = {
  JP: { title: "ABOUT US", subtitle: "私たちについて" },
  EN: { title: "ABOUT US", subtitle: "About Our Company" },
  VN: { title: "ABOUT US", subtitle: "Về Chúng Tôi" },
};

export default function Hero() {
  const { lang } = useLang();
  const t = T[lang];

  return (
    <div style={{
      height: "80vh", minHeight: "560px",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
    }}>

      {/* Background photo — no Vietnamese text */}
      <Image
        src="/images/Cover.jpg"
        alt="ASEKA Office"
        fill
        priority
        style={{ objectFit: "cover", objectPosition: "center 30%" }}
      />

      {/* Dark overlay — consistent with homepage tone */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to right, rgba(10,20,35,0.60) 0%, rgba(10,20,35,0.30) 50%, rgba(10,20,35,0.72) 100%)",
      }} />

      {/* Right-side gradient to frame text */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to left, rgba(10,20,35,0.82) 0%, rgba(10,20,35,0.30) 45%, transparent 100%)",
      }} />

      {/* Main text — right side */}
      <div style={{
        position: "relative", zIndex: 2,
        padding: "0 72px 0 0",
        maxWidth: "540px",
        textAlign: "right",
      }}>

        <h1 style={{
          fontFamily: "'Noto Serif JP', serif",
          fontSize: "clamp(52px, 7.5vw, 96px)",
          fontWeight: 600,
          color: "#FAF7F2",
          letterSpacing: "2px",
          lineHeight: 1,
          margin: 0,
          whiteSpace: "nowrap",
        }}>
          {t.title}
        </h1>

        {/* Gold divider line */}
        <div style={{
          height: "3px",
          background: "linear-gradient(to left, var(--gold) 0%, rgba(184,150,62,0.15) 100%)",
          margin: "20px 0 18px",
          borderRadius: "2px",
        }} />

        <p style={{
          fontFamily: "'Noto Serif JP', serif",
          fontSize: lang === "JP" ? "18px" : "16px",
          fontWeight: 400,
          color: "rgba(250,247,242,0.88)",
          letterSpacing: lang === "JP" ? "5px" : "2px",
        }}>
          {t.subtitle}
        </p>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: "absolute", bottom: "36px", left: "50%",
        transform: "translateX(-50%)", zIndex: 3,
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: "8px",
      }}>
        <div style={{
          width: "1px", height: "52px",
          background: "linear-gradient(to bottom, var(--gold), transparent)",
          animation: "scrollLine 2s ease-in-out infinite",
        }} />
        <span style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "10px", letterSpacing: "4px",
          color: "var(--gold)", opacity: 1,
          fontStyle: "italic",
        }}>SCROLL</span>
      </div>

      <style>{`
        @keyframes scrollLine {
          0%, 100% { opacity: 1; transform: scaleY(1); transform-origin: top; }
          50%       { opacity: 0.6; transform: scaleY(0.5); transform-origin: top; }
        }
        @media (max-width: 900px) {
          .hero-text { padding: 0 32px 0 0 !important; max-width: 100% !important; }
        }
        @media (max-width: 600px) {
          .hero-text { text-align: center !important; padding: 0 24px !important; }
        }
      `}</style>
    </div>
  );
}
