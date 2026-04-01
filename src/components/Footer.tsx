import Image from "next/image";

export default function Footer() {
  return (
    <footer style={{
      background: "#111",
      padding: "60px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderTop: "1px solid rgba(184,150,62,0.15)",
    }} className="lux-footer">
      <Image
        src="/images/aseka-logo.png"
        alt="ASEKA"
        width={160}
        height={54}
        style={{ objectFit: "contain", height: "48px", width: "auto" }}
      />

      <div style={{
        fontFamily: "'Noto Sans JP', sans-serif",
        fontSize: "11px", lineHeight: 2,
        color: "rgba(250,247,242,0.35)",
        textAlign: "right",
      }}>
        〒101-0025 東京都千代田区神田佐久間町 3-27-3 レーベンハークビル5F<br />
        Tel: 03-6231-9969 ｜ 代表取締役：グェン ティラン タリ
        <div style={{
          marginTop: "8px", fontSize: "10px", letterSpacing: "1px",
          color: "rgba(250,247,242,0.2)",
        }}>
          Copyright © 2022 ASEKA Company All rights reserved.
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .lux-footer {
            flex-direction: column !important;
            gap: 24px !important;
            padding: 40px 24px !important;
            text-align: center !important;
          }
          .lux-footer > div:last-child { text-align: center !important; }
        }
      `}</style>
    </footer>
  );
}
