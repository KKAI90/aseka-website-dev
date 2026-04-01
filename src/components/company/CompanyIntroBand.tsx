import Image from "next/image";

export default function CompanyIntroBand() {
  return (
    <div style={{
      background: "#0E2233",
      padding: "60px",
      display: "flex",
      alignItems: "center",
      gap: "40px",
    }} className="intro-band">
      {/* White logo */}
      <div style={{ flexShrink: 0 }}>
        <Image
          src="/images/aseka-logo-white.png"
          alt="ASEKA"
          width={80}
          height={80}
          style={{ objectFit: "contain", height: "64px", width: "auto" }}
        />
      </div>

      <p style={{
        fontFamily: "'Noto Serif JP', serif",
        fontSize: "clamp(16px, 2vw, 20px)",
        lineHeight: 1.8,
        color: "#fff",
        fontWeight: 300,
      }}>
        企業様に必要とされている、<br />
        <strong style={{ color: "#D4AF6A" }}>優秀な高度人材と特定技能者を紹介</strong>
      </p>

      <style>{`
        @media (max-width: 900px) {
          .intro-band { padding: 40px 24px !important; flex-direction: column !important; gap: 20px !important; }
        }
      `}</style>
    </div>
  );
}
