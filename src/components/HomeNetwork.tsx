"use client";
import { useLang } from "@/contexts/LangContext";

const T = {
  JP: {
    eyebrow: "NETWORK",
    title: "20万人ネットワーク",
    paragraphs: [
      "創業者であり取締役のグェン フォン タオが運営する「THAO TOKYO」は、Facebook・YouTube・TikTokを中心に、累計200,000人以上のフォロワーを有しています。",
      "フォロワーの約7割が日本在住、約9割が18歳〜34歳の若年層で構成されており、日本での就業意欲が高い人材が多い点が特徴です。",
      "また、日本語能力においても、N3以上の保有者が多数を占めており、即戦力として活躍可能な人材が集まっています。",
      "こうした独自ネットワークにより、質・量ともに安定した人材確保を実現しています。",
    ],
    stats: [
      { value: "200,000+", label: "累計フォロワー" },
      { value: "70%", label: "日本在住" },
      { value: "90%", label: "18〜34歳" },
    ],
    platforms: ["Facebook", "YouTube", "TikTok"],
  },
  EN: {
    eyebrow: "NETWORK",
    title: "200,000+ Network",
    paragraphs: [
      "\"THAO TOKYO\", operated by co-founder and Director Nguyen Phuong Thao, has accumulated over 200,000 followers across Facebook, YouTube, and TikTok.",
      "Approximately 70% of followers reside in Japan, and about 90% are young adults aged 18–34 with a strong desire to work in Japan.",
      "Many followers hold JLPT N3 or above, making them immediately deployable as capable professionals.",
      "This unique network enables us to provide a stable supply of quality candidates.",
    ],
    stats: [
      { value: "200,000+", label: "Total Followers" },
      { value: "70%", label: "Based in Japan" },
      { value: "90%", label: "Aged 18–34" },
    ],
    platforms: ["Facebook", "YouTube", "TikTok"],
  },
  VN: {
    eyebrow: "NETWORK",
    title: "Mạng lưới 200,000+",
    paragraphs: [
      "\"THAO TOKYO\" do người sáng lập kiêm Giám đốc Nguyễn Phương Thảo điều hành, đã tích lũy hơn 200,000 người theo dõi trên Facebook, YouTube và TikTok.",
      "Khoảng 70% người theo dõi đang sinh sống tại Nhật Bản, và khoảng 90% là người trẻ từ 18–34 tuổi.",
      "Nhiều người theo dõi có trình độ JLPT N3 trở lên, sẵn sàng làm việc ngay lập tức.",
      "Mạng lưới độc đáo này cho phép chúng tôi cung cấp nguồn ứng viên chất lượng ổn định.",
    ],
    stats: [
      { value: "200,000+", label: "Tổng người theo dõi" },
      { value: "70%", label: "Sống tại Nhật" },
      { value: "90%", label: "Tuổi 18–34" },
    ],
    platforms: ["Facebook", "YouTube", "TikTok"],
  },
};

function NetworkIllustration() {
  return (
    <svg viewBox="0 0 480 260" width="100%" style={{ display: "block", maxWidth: "480px", margin: "0 auto" }}>
      {/* Background circles */}
      <circle cx="240" cy="130" r="100" fill="none" stroke="rgba(184,150,62,0.08)" strokeWidth="1"/>
      <circle cx="240" cy="130" r="68" fill="none" stroke="rgba(184,150,62,0.12)" strokeWidth="1"/>
      <circle cx="240" cy="130" r="36" fill="none" stroke="rgba(184,150,62,0.18)" strokeWidth="1"/>

      {/* Connection lines */}
      <line x1="240" y1="130" x2="100" y2="60" stroke="rgba(184,150,62,0.25)" strokeWidth="1" strokeDasharray="4 3"/>
      <line x1="240" y1="130" x2="380" y2="60" stroke="rgba(184,150,62,0.25)" strokeWidth="1" strokeDasharray="4 3"/>
      <line x1="240" y1="130" x2="80" y2="190" stroke="rgba(184,150,62,0.25)" strokeWidth="1" strokeDasharray="4 3"/>
      <line x1="240" y1="130" x2="400" y2="190" stroke="rgba(184,150,62,0.25)" strokeWidth="1" strokeDasharray="4 3"/>
      <line x1="240" y1="130" x2="240" y2="30" stroke="rgba(184,150,62,0.25)" strokeWidth="1" strokeDasharray="4 3"/>
      <line x1="100" y1="60" x2="80" y2="190" stroke="rgba(184,150,62,0.12)" strokeWidth="1"/>
      <line x1="380" y1="60" x2="400" y2="190" stroke="rgba(184,150,62,0.12)" strokeWidth="1"/>
      <line x1="100" y1="60" x2="240" y2="30" stroke="rgba(184,150,62,0.12)" strokeWidth="1"/>
      <line x1="380" y1="60" x2="240" y2="30" stroke="rgba(184,150,62,0.12)" strokeWidth="1"/>

      {/* Center node */}
      <circle cx="240" cy="130" r="22" fill="rgba(12,31,46,0.9)" stroke="rgba(184,150,62,0.6)" strokeWidth="1.5"/>
      <text x="240" y="127" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize="9" fill="rgba(212,175,106,0.9)" letterSpacing="1">THAO</text>
      <text x="240" y="138" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize="9" fill="rgba(212,175,106,0.9)" letterSpacing="1">TOKYO</text>

      {/* Outer nodes */}
      <circle cx="100" cy="60" r="16" fill="rgba(12,31,46,0.85)" stroke="rgba(184,150,62,0.4)" strokeWidth="1.2"/>
      <text x="100" y="64" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize="8" fill="rgba(212,175,106,0.8)">FB</text>

      <circle cx="380" cy="60" r="16" fill="rgba(12,31,46,0.85)" stroke="rgba(184,150,62,0.4)" strokeWidth="1.2"/>
      <text x="380" y="64" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize="8" fill="rgba(212,175,106,0.8)">YT</text>

      <circle cx="80" cy="190" r="16" fill="rgba(12,31,46,0.85)" stroke="rgba(184,150,62,0.4)" strokeWidth="1.2"/>
      <text x="80" y="194" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize="7.5" fill="rgba(212,175,106,0.8)">TikTok</text>

      <circle cx="400" cy="190" r="14" fill="rgba(184,150,62,0.15)" stroke="rgba(184,150,62,0.35)" strokeWidth="1"/>
      <text x="400" y="194" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize="9" fill="rgba(184,150,62,0.9)">200K+</text>

      <circle cx="240" cy="30" r="13" fill="rgba(184,150,62,0.12)" stroke="rgba(184,150,62,0.3)" strokeWidth="1"/>
      <text x="240" y="34" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize="8" fill="rgba(184,150,62,0.8)">SNS</text>

      {/* Small satellite nodes */}
      {[
        [148, 42], [320, 45], [430, 120], [52, 130], [160, 215], [330, 220],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="4" fill="rgba(184,150,62,0.3)" stroke="rgba(184,150,62,0.5)" strokeWidth="0.8"/>
      ))}
    </svg>
  );
}

export default function HomeNetwork() {
  const { lang } = useLang();
  const t = T[lang];

  return (
    <section style={{ background: "var(--cream)", overflow: "hidden", padding: "100px 60px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: "72px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginBottom: "20px" }}>
            <div style={{ width: "48px", height: "1px", background: "var(--gold)", opacity: 0.5 }} />
            <span style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "12px", letterSpacing: "6px",
              color: "var(--gold)", fontStyle: "italic",
            }}>{t.eyebrow}</span>
            <div style={{ width: "48px", height: "1px", background: "var(--gold)", opacity: 0.5 }} />
          </div>
          <h2 style={{
            fontFamily: "'Noto Serif JP', serif",
            fontSize: "clamp(26px, 3.5vw, 42px)", fontWeight: 400,
            color: "var(--dark)", letterSpacing: "2px", marginBottom: "16px",
          }}>
            {t.title}
          </h2>
          <div style={{ width: "56px", height: "2px", background: "var(--gold)", opacity: 0.55, margin: "0 auto" }} />
        </div>

        {/* Two-column layout */}
        <div className="network-inner" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }}>

          {/* Left: Illustration */}
          <div style={{
            background: "white",
            border: "1px solid rgba(184,150,62,0.18)",
            padding: "48px 32px",
            position: "relative",
          }}>
            <div style={{
              position: "absolute", top: "12px", left: "12px", right: "-12px", bottom: "-12px",
              border: "1px solid rgba(184,150,62,0.12)", zIndex: 0,
            }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <NetworkIllustration />
              {/* Platform tags */}
              <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "24px" }}>
                {t.platforms.map((p) => (
                  <span key={p} style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "11px", letterSpacing: "2px",
                    color: "var(--gold)", border: "1px solid rgba(184,150,62,0.3)",
                    padding: "4px 12px",
                  }}>{p}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Stats + Text */}
          <div>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1px", background: "rgba(184,150,62,0.15)", marginBottom: "48px" }}>
              {t.stats.map((s, i) => (
                <div key={i} style={{ background: "white", padding: "28px 16px", textAlign: "center" }}>
                  <div style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "clamp(22px, 2.8vw, 36px)", fontWeight: 300,
                    color: "var(--gold)", lineHeight: 1, marginBottom: "8px",
                  }}>{s.value}</div>
                  <div style={{
                    fontFamily: "'Noto Sans JP', sans-serif",
                    fontSize: "10px", letterSpacing: "1.5px",
                    color: "var(--dark)", opacity: 0.7,
                  }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Body text */}
            {t.paragraphs.map((p, i) => (
              <p key={i} style={{
                fontFamily: "'Noto Serif JP', serif",
                fontSize: "15px", lineHeight: 2.1,
                color: "#3d3833", marginBottom: "16px",
                letterSpacing: "0.01em",
              }}>
                {p}
              </p>
            ))}
          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .network-inner { grid-template-columns: 1fr !important; gap: 48px !important; }
        }
        @media (max-width: 600px) {
          section { padding: 72px 24px !important; }
        }
      `}</style>
    </section>
  );
}
