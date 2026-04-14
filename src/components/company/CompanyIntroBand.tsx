"use client";
import Image from "next/image";
import { useLang } from "@/contexts/LangContext";

const T = {
  JP: { text: "企業様に必要とされている、", strong: "優秀な高度人材と特定技能者を紹介" },
  EN: { text: "We introduce ", strong: "highly skilled professionals and specified skilled workers" },
  VN: { text: "Chúng tôi giới thiệu ", strong: "nhân tài trình độ cao và lao động kỹ năng đặc định" },
};

export default function CompanyIntroBand() {
  const { lang } = useLang();
  const t = T[lang];

  return (
    <div style={{
      background: "#0E2233", padding: "60px",
      display: "flex", alignItems: "center", gap: "40px",
    }} className="intro-band">
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: "10px" }}>
        <Image
          src="/images/aseka-logo-icon.png"
          alt="ASEKA"
          width={52} height={52}
          style={{ objectFit: "contain", width: "52px", height: "52px" }}
        />
      </div>
      <p style={{
        fontFamily: "'Noto Serif JP', serif",
        fontSize: "clamp(16px, 2vw, 20px)",
        lineHeight: 1.8, color: "#fff", fontWeight: 300,
      }}>
        {t.text}<br />
        <strong style={{ color: "#D4AF6A" }}>{t.strong}</strong>
      </p>
      <style>{`
        @media (max-width: 900px) {
          .intro-band { padding: 40px 24px !important; flex-direction: column !important; gap: 20px !important; }
        }
      `}</style>
    </div>
  );
}
