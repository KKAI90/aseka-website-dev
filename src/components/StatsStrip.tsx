"use client";
import { useLang } from "@/contexts/LangContext";

const STATS = {
  JP: [
    { value: "200,000+", label: "SNSフォロワー", sub: "Mạng lưới SNS" },
    { value: "700名", label: "累計紹介実績", sub: "Tổng hồ sơ giới thiệu" },
    { value: "最短３日間", label: "最短着任期間", sub: "Thời gian onboarding" },
  ],
  EN: [
    { value: "200,000+", label: "SNS Followers", sub: "Social media network" },
    { value: "700+", label: "Placements", sub: "Cumulative introductions" },
    { value: "3 Days", label: "Fastest Onboarding", sub: "Min. placement period" },
  ],
  VN: [
    { value: "200,000+", label: "Người theo dõi SNS", sub: "Mạng lưới mạng xã hội" },
    { value: "700+", label: "Hồ sơ đã Giới thiệu", sub: "Tổng cộng" },
    { value: "3 ngày", label: "Nhanh nhất", sub: "Thời gian onboarding tối thiểu" },
  ],
};

export default function StatsStrip() {
  const { lang } = useLang();
  const stats = STATS[lang];

  return (
    <div style={{
      background: "#0C1F2E",
      padding: "0",
    }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
      }} className="stats-grid">
        {stats.map((s, i) => (
          <div key={i} style={{
            padding: "48px 40px",
            borderRight: i < 2 ? "1px solid rgba(184,150,62,0.15)" : "none",
            textAlign: "center",
            position: "relative",
          }}>
            {/* Top gold line */}
            <div style={{
              position: "absolute", top: 0, left: "20%", right: "20%",
              height: "2px", background: "var(--gold)", opacity: 0.5,
            }} />
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(36px, 4vw, 52px)",
              fontWeight: 300, color: "var(--gold)",
              letterSpacing: "-1px", lineHeight: 1,
              marginBottom: "10px",
            }}>
              {s.value}
            </div>
            <div style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: "12px", letterSpacing: "2px",
              color: "rgba(250,247,242,0.85)",
              marginBottom: "6px",
            }}>
              {s.label}
            </div>
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "11px", letterSpacing: "1.5px",
              color: "rgba(184,150,62,0.55)",
              fontStyle: "italic",
            }}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @media (max-width: 900px) {
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 500px) {
          .stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
