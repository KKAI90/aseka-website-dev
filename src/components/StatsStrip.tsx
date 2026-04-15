"use client";
import { useLang } from "@/contexts/LangContext";

const STATS = {
  JP: [
    { num: "210,000", suffix: "+",   label: "SNSフォロワー" },
    { num: "1,000",   suffix: "名以上", label: "累計紹介実績" },
    { num: "3",       suffix: "日間", prefix: "最短", label: "最短採用可能" },
  ],
  EN: [
    { num: "210,000", suffix: "+",      label: "SNS Followers" },
    { num: "1,000",   suffix: "+",      label: "Placements" },
    { num: "3",       suffix: " Days",  label: "Fastest Onboarding" },
  ],
  VN: [
    { num: "210,000", suffix: "+",      label: "Người theo dõi SNS" },
    { num: "1,000",   suffix: "+",      label: "Hồ sơ đã Giới thiệu" },
    { num: "3",       suffix: " ngày",  label: "Nhanh nhất" },
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
                  fontWeight: 400, color: "var(--gold)",
                  letterSpacing: "1px", marginRight: "4px",
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
              fontSize: lang === "JP" ? "14px" : "13px",
              letterSpacing: "0.5px",
              color: "rgba(250,247,242,1)",
              fontWeight: 400,
              marginBottom: "6px",
            }}>
              {s.label}
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
