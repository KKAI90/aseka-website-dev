"use client";
import { useLang } from "@/contexts/LangContext";

const T = {
  JP: {
    eyebrow: "NETWORK",
    title: "20万人ネットワーク",
    paragraphs: [
      "創業者であり取締役のグェン フォン タオが運営する「THAO TOKYO」は、Facebook・YouTube・TikTokを中心に、累計23万人以上のフォロワーを有しています。",
      "フォロワーの約7割が日本在住、約9割が18歳〜34歳の若年層で構成されており、日本での就業意欲が高い人材が多い点が特徴です。",
      "また、日本語能力においても、N3以上の保有者が多数を占めており、即戦力として活躍可能な人材が集まっています。",
      "こうした独自ネットワークにより、質・量ともに安定した人材確保を実現しています。これにより、企業様の「人材が集まらない」という課題に対して、具体的な解決策をご提供しています。",
    ],
    stats: [
      { value: "23万+", label: "累計フォロワー" },
      { value: "70%", label: "日本在住" },
      { value: "90%", label: "18〜34歳" },
    ],
  },
  EN: {
    eyebrow: "NETWORK",
    title: "200K+ Network",
    paragraphs: [
      "\"THAO TOKYO\", operated by co-founder and Director Nguyen Phuong Thao, has accumulated over 230,000 followers across Facebook, YouTube, and TikTok.",
      "Approximately 70% of followers reside in Japan, and about 90% are young adults aged 18–34 with a strong desire to work in Japan.",
      "Many followers hold JLPT N3 or above, making them immediately deployable as capable professionals.",
      "This unique network enables us to provide a stable supply of quality candidates — offering concrete solutions to companies struggling to attract talent.",
    ],
    stats: [
      { value: "230K+", label: "Total Followers" },
      { value: "70%", label: "Based in Japan" },
      { value: "90%", label: "Aged 18–34" },
    ],
  },
  VN: {
    eyebrow: "NETWORK",
    title: "Mạng lưới 20万人",
    paragraphs: [
      "\"THAO TOKYO\" do người sáng lập kiêm Giám đốc Nguyễn Phương Thảo điều hành, đã tích lũy hơn 230.000 người theo dõi trên Facebook, YouTube và TikTok.",
      "Khoảng 70% người theo dõi đang sinh sống tại Nhật Bản, và khoảng 90% là người trẻ từ 18–34 tuổi với mong muốn làm việc mạnh mẽ tại Nhật.",
      "Nhiều người theo dõi có trình độ JLPT N3 trở lên, sẵn sàng làm việc ngay lập tức như những chuyên gia có năng lực.",
      "Mạng lưới độc đáo này cho phép chúng tôi cung cấp nguồn ứng viên chất lượng ổn định — đưa ra giải pháp cụ thể cho các doanh nghiệp đang gặp khó khăn trong tuyển dụng nhân tài.",
    ],
    stats: [
      { value: "230K+", label: "Tổng người theo dõi" },
      { value: "70%", label: "Sống tại Nhật" },
      { value: "90%", label: "Tuổi 18–34" },
    ],
  },
};

export default function HomeNetwork() {
  const { lang } = useLang();
  const t = T[lang];

  return (
    <section style={{ background: "white", overflow: "hidden" }}>

      {/* Top banner image */}
      <div style={{ height: "340px", position: "relative", overflow: "hidden" }}>
        <img
          src="/images/team-office-1.jpg"
          alt="Network"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(10,20,35,0.35) 0%, rgba(10,20,35,0.55) 100%)" }} />
        {/* Network icon overlay */}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg viewBox="0 0 80 60" width="72" height="54" fill="none" opacity="0.7">
            {/* Network/people icon */}
            <circle cx="40" cy="14" r="7" stroke="rgba(212,175,106,0.9)" strokeWidth="1.8"/>
            <path d="M29 30 Q29 22 40 22 Q51 22 51 30" stroke="rgba(212,175,106,0.9)" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
            <circle cx="14" cy="22" r="6" stroke="rgba(212,175,106,0.9)" strokeWidth="1.8"/>
            <path d="M4 38 Q4 31 14 31 Q24 31 24 38" stroke="rgba(212,175,106,0.9)" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
            <circle cx="66" cy="22" r="6" stroke="rgba(212,175,106,0.9)" strokeWidth="1.8"/>
            <path d="M56 38 Q56 31 66 31 Q76 31 76 38" stroke="rgba(212,175,106,0.9)" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
            <line x1="34" y1="20" x2="20" y2="26" stroke="rgba(212,175,106,0.6)" strokeWidth="1.2"/>
            <line x1="46" y1="20" x2="60" y2="26" stroke="rgba(212,175,106,0.6)" strokeWidth="1.2"/>
          </svg>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "80px 60px 100px", maxWidth: "1100px", margin: "0 auto" }}>

        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
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

        {/* Stats row */}
        <div className="network-stats" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", marginBottom: "64px", background: "rgba(184,150,62,0.15)" }}>
          {t.stats.map((s, i) => (
            <div key={i} style={{ background: "white", padding: "36px 24px", textAlign: "center" }}>
              <div style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(40px, 5vw, 56px)", fontWeight: 300,
                color: "var(--gold)", lineHeight: 1, marginBottom: "10px",
              }}>{s.value}</div>
              <div style={{
                fontFamily: "'Noto Sans JP', sans-serif",
                fontSize: "12px", letterSpacing: "2px",
                color: "var(--dark)", opacity: 0.75,
              }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Body text */}
        <div style={{ maxWidth: "780px", margin: "0 auto" }}>
          {t.paragraphs.map((p, i) => (
            <p key={i} style={{
              fontFamily: "'Noto Serif JP', serif",
              fontSize: "15px", lineHeight: 2.1,
              color: "#3d3833", marginBottom: "20px",
              letterSpacing: "0.01em", textAlign: "center",
            }}>
              {p}
            </p>
          ))}
        </div>

      </div>

      <style>{`
        @media (max-width: 700px) {
          .network-stats { grid-template-columns: 1fr !important; }
          section { padding: 64px 24px 80px !important; }
        }
      `}</style>
    </section>
  );
}
