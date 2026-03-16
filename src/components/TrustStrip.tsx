"use client";

const partners = [
  "Sakura Foods株式会社",
  "東海製造 Holdings",
  "Grand Hotel Nagoya",
  "みどり農業組合",
  "Osaka Service Group",
  "Tokyo Recruit株式会社",
  "Nagoya Build Corp",
  "Kyoto Hotel Group",
];

export default function TrustStrip() {
  return (
    <div
      style={{
        borderTop: "0.5px solid var(--border)",
        borderBottom: "0.5px solid var(--border)",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        gap: "24px",
        padding: "14px 0",
        position: "relative",
      }}
    >
      {/* Fade edges */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: "80px", zIndex: 2,
        background: "linear-gradient(to right, var(--background,#fff), transparent)",
        pointerEvents: "none",
      }}/>
      <div style={{
        position: "absolute", right: 0, top: 0, bottom: 0, width: "80px", zIndex: 2,
        background: "linear-gradient(to left, var(--background,#fff), transparent)",
        pointerEvents: "none",
      }}/>

      {/* Label */}
      <span style={{
        color: "var(--muted)", fontSize: "11px", letterSpacing: "0.08em",
        flexShrink: 0, paddingLeft: "20px", zIndex: 3, position: "relative",
        whiteSpace: "nowrap",
      }}>
        取引先 · Đối tác /
      </span>

      {/* Marquee track */}
      <div style={{ overflow: "hidden", flex: 1 }}>
        <div style={{
          display: "flex",
          gap: "48px",
          animation: "marquee 22s linear infinite",
          width: "max-content",
        }}>
          {/* Duplicate 3 times for seamless loop */}
          {[...partners, ...partners, ...partners].map((p, i) => (
            <span
              key={i}
              style={{
                fontSize: "12px",
                fontWeight: 600,
                whiteSpace: "nowrap",
                color: "var(--muted)",
                opacity: 0.5,
                letterSpacing: "0.03em",
              }}
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes marquee { 0%, 100% { transform: translateX(0); } }
        }
      `}</style>
    </div>
  );
}
