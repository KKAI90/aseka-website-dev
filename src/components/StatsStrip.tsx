"use client";
import { useLang } from "@/contexts/LangContext";

const STATS = {
  JP: [
    { num: "200,000", suffix: "+",   label: "SNSフォロワー",  sub: "Mạng lưới SNS" },
    { num: "700",     suffix: "名",   label: "累計紹介実績",   sub: "Tổng hồ sơ giới thiệu" },
    { num: "3",       suffix: "日間", prefix: "最短", label: "最短着任期間", sub: "Thời gian onboarding" },
  ],
  EN: [
    { num: "200,000", suffix: "+",      label: "SNS Followers",     sub: "Social media network" },
    { num: "700",     suffix: "+",      label: "Placements",        sub: "Cumulative introductions" },
    { num: "3",       suffix: " Days",  label: "Fastest Onboarding",sub: "Min. placement period" },
  ],
  VN: [
    { num: "200,000", suffix: "+",      label: "Người theo dõi SNS",   sub: "Mạng lưới mạng xã hội" },
    { num: "700",     suffix: "+",      label: "Hồ sơ đã Giới thiệu",  sub: "Tổng cộng" },
    { num: "3",       suffix: " ngày",  label: "Nhanh nhất",           sub: "Thời gian onboarding tối thiểu" },
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
              lineHeight: 1, marginBottom: "10px",
              display: "flex", alignItems: "baseline",
              justifyContent: "center", gap: "2px",
            }}>
              {"prefix" in s && (
                <span style={{
                  fontFamily: "'Noto Serif JP', serif",
                  fontSize: "clamp(14px, 1.4vw, 20px)",
                  fontWeight: 300, color: "var(--gold)",
                  letterSpacing: "2px", marginRight: "4px",
                }}>{s.prefix}</span>
              )}
              <span style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(40px, 4.5vw, 58px)",
                fontWeight: 300, color: "var(--gold)",
                letterSpacing: "-1px",
              }}>{s.num}</span>
              <span style={{
                fontFamily: "'Noto Serif JP', serif",
                fontSize: "clamp(18px, 2vw, 26px)",
                fontWeight: 300, color: "var(--gold)",
                letterSpacing: "1px",
              }}>{s.suffix}</span>
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
