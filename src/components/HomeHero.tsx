"use client";
import Link from "next/link";
import Image from "next/image";
import { useLang } from "@/contexts/LangContext";

const T = {
  JP: {
    tag: "登録支援機関 · 有料職業紹介事業",
    title1: "日本でもっと頑張りたい",
    title2: "という気持ちを",
    desc: "SNS20万人のネットワークと日本語教育を強みに、即戦力の外国人材をご紹介します",
    btn1: "企業様・採用担当者の方へ",
    btn2: "求職者・応募者の方へ",
  },
  EN: {
    tag: "Registered Support Organization · Licensed Placement Agency",
    title1: "The HR professionals",
    title2: "bridging Japan & Vietnam.",
    desc: "Leveraging a 200,000-strong SNS network and Japanese language education, we match motivated foreign talent with companies in as little as 2 weeks.",
    btn1: "For Companies & Employers",
    btn2: "For Job Seekers",
  },
  VN: {
    tag: "Tổ chức Hỗ trợ Đăng ký · Dịch vụ Giới thiệu Việc làm",
    title1: "Chuyên gia Nhân sự",
    title2: "kết nối Nhật Bản & Việt Nam.",
    desc: "Với mạng lưới 200.000 người theo dõi trên mạng xã hội và dịch vụ đào tạo tiếng Nhật, chúng tôi kết nối nhân tài năng động với doanh nghiệp trong tối đa 2 tuần.",
    btn1: "Dành cho Doanh nghiệp",
    btn2: "Dành cho Người tìm việc",
  },
};

export default function HomeHero() {
  const { lang } = useLang();
  const t = T[lang];

  return (
    <div style={{
      height: "100vh", minHeight: "600px",
      position: "relative", overflow: "hidden",
      display: "flex", alignItems: "center",
    }}>
      {/* Background */}
      <Image
        src="/images/836A0134.JPG"
        alt="ASEKA"
        fill
        priority
        style={{ objectFit: "cover", objectPosition: "72% 38%" }}
      />

      {/* Dark overlay — stronger on left */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to right, rgba(10,20,35,0.88) 0%, rgba(10,20,35,0.65) 55%, rgba(10,20,35,0.25) 100%)",
      }} />

      {/* Gold line — left accent */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0,
        width: "4px",
        background: "linear-gradient(to bottom, transparent 10%, var(--gold) 35%, var(--gold) 65%, transparent 90%)",
      }} />

      {/* Content */}
      <div style={{
        position: "relative", zIndex: 2,
        padding: "0 60px",
        maxWidth: "780px",
      }}>
        {/* Tag */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "10px",
          marginBottom: "32px",
        }}>
          <div style={{ width: "32px", height: "1px", background: "var(--gold)", opacity: 0.7 }} />
          <span style={{
            fontFamily: "'Noto Sans JP', sans-serif",
            fontSize: lang === "JP" ? "14px" : "13px",
            letterSpacing: lang === "JP" ? "1.5px" : "0.8px",
            color: "rgba(255,232,190,0.90)", fontWeight: 400,
            textTransform: "uppercase",
            fontStyle: "normal",
          }}>{t.tag}</span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: "'Noto Serif JP', serif",
          fontSize: lang === "JP" ? "clamp(30px, 4vw, 58px)" : "clamp(32px, 4vw, 58px)",
          fontWeight: 600,
          color: "#FAF7F2",
          lineHeight: 1.2,
          letterSpacing: lang === "EN" ? "0.04em" : "0.02em",
          textTransform: lang === "EN" ? "uppercase" : "none",
          margin: "0 0 24px",
          whiteSpace: "nowrap",
        }}>
          {t.title1}<br />
          <span style={{ color: "var(--gold-light)" }}>{t.title2}</span>
        </h1>

        {/* Description */}
        <p style={{
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: lang === "JP" ? "16px" : "15px", lineHeight: 1.9,
          color: "rgba(250,247,242,0.85)",
          maxWidth: "560px",
          marginBottom: "48px",
          letterSpacing: "0.02em",
        }}>
          {t.desc}
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <Link href="/company" style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "16px 32px",
            background: "var(--gold)",
            color: "#0C1F2E",
            fontFamily: "'Noto Sans JP', sans-serif",
            fontSize: lang === "JP" ? "15px" : "14px", fontWeight: 400, letterSpacing: "0.8px",
            textDecoration: "none",
            transition: "opacity 0.3s",
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            {t.btn1} →
          </Link>
          <Link href="/dang-ky" style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "16px 32px",
            background: "transparent",
            color: "#FAF7F2",
            border: "1px solid rgba(250,247,242,0.4)",
            fontFamily: "'Noto Sans JP', sans-serif",
            fontSize: lang === "JP" ? "15px" : "14px", fontWeight: 400, letterSpacing: "0.8px",
            textDecoration: "none",
            transition: "border-color 0.3s",
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--gold)")}
          onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(250,247,242,0.4)")}
          >
            {t.btn2}
          </Link>
        </div>
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
          50%       { opacity: 0.7; transform: scaleY(0.6); transform-origin: top; }
        }
        @media (max-width: 600px) {
          .home-hero-content { padding: 0 24px !important; }
        }
      `}</style>
    </div>
  );
}
