"use client";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { useLang } from "@/contexts/LangContext";

const HERO_T = {
  JP: { title: "CONTACT", subtitle: "お問い合わせ" },
  EN: { title: "CONTACT", subtitle: "Get in Touch" },
  VN: { title: "CONTACT", subtitle: "Liên hệ với Chúng tôi" },
};

function ContactHero() {
  const { lang } = useLang();
  const t = HERO_T[lang];

  return (
    <div style={{
      height: "68vh", minHeight: "460px",
      position: "relative", overflow: "hidden",
      display: "flex", alignItems: "center", justifyContent: "flex-end",
    }}>
      <Image
        src="/images/contact.jpg"
        alt="ASEKA Contact"
        fill
        priority
        style={{ objectFit: "cover", objectPosition: "center 50%" }}
      />
      {/* Dark base overlay — matches About Us / Service */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to right, rgba(10,20,35,0.55) 0%, rgba(10,20,35,0.25) 50%, rgba(10,20,35,0.68) 100%)",
      }} />
      {/* Right gradient to frame text */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to left, rgba(10,20,35,0.80) 0%, rgba(10,20,35,0.28) 45%, transparent 100%)",
      }} />

      {/* Text — right aligned */}
      <div style={{ position: "relative", zIndex: 2, padding: "0 72px 0 0", maxWidth: "540px", textAlign: "right" }}>
        <h1 style={{
          fontFamily: "'Noto Serif JP', serif",
          fontSize: "clamp(52px, 7.5vw, 96px)", fontWeight: 600,
          color: "#FAF7F2", letterSpacing: "2px", lineHeight: 1,
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
          fontFamily: "'Noto Serif JP', serif",
          fontSize: lang === "JP" ? "18px" : "16px", fontWeight: 400,
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
        display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
      }}>
        <div style={{
          width: "1px", height: "52px",
          background: "linear-gradient(to bottom, var(--gold), transparent)",
          animation: "scrollLine 2s ease-in-out infinite",
        }} />
        <span style={{
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: "10px", letterSpacing: "4px",
          color: "var(--gold)", opacity: 1,
        }}>SCROLL</span>
      </div>

      <style>{`
        @keyframes scrollLine {
          0%, 100% { opacity: 1; transform: scaleY(1); transform-origin: top; }
          50%       { opacity: 0.6; transform: scaleY(0.5); transform-origin: top; }
        }
      `}</style>
    </div>
  );
}

export default function ContactPage() {
  return (
    <main>
      <Navbar />
      <ContactHero />
      <Contact />
      <Footer />
    </main>
  );
}
