"use client";
import { useLang } from "@/contexts/LangContext";

const T = {
  JP: {
    eyebrow: "INFLUENCER",
    title: "インフルエンサー",
    paragraphs: [
      "株式会社ASEKAの創業者であり取締役のグェン フォン タオは、2019年よりYouTubeでの情報発信を開始しました。",
      "そのきっかけは、自身が日本で経験してきた課題や苦労を、これから来日する後輩たちに共有し、少しでも力になりたいという想いからでした。",
      "日本語や文化の違い、そして日本で働くための情報をわかりやすく発信することで、多くの外国人から支持を集めています。",
      "現在では、こうした発信を通じて、日本で働きたいと考える人々の挑戦を後押しし続けています。",
    ],
  },
  EN: {
    eyebrow: "INFLUENCER",
    title: "Influencer",
    paragraphs: [
      "Nguyen Phuong Thao, co-founder and Director of ASEKA Co., Ltd., began sharing content on YouTube in 2019.",
      "Her motivation was simple: to share the challenges and struggles she experienced in Japan with those who would come after her, hoping to make their journey a little easier.",
      "By communicating clearly about the Japanese language, cultural differences, and the realities of working in Japan, she has earned the trust and support of many foreign nationals.",
      "Today, through this ongoing outreach, she continues to encourage and empower people who aspire to work in Japan.",
    ],
  },
  VN: {
    eyebrow: "INFLUENCER",
    title: "Influencer",
    paragraphs: [
      "Nguyễn Phương Thảo, người sáng lập kiêm Giám đốc của Công ty Cổ phần ASEKA, bắt đầu chia sẻ nội dung trên YouTube từ năm 2019.",
      "Động lực của cô đơn giản là: chia sẻ những khó khăn và thử thách mà bản thân đã trải qua tại Nhật Bản với những người sắp đến sau, với hy vọng giúp hành trình của họ bớt gian nan hơn.",
      "Bằng cách truyền đạt rõ ràng về tiếng Nhật, sự khác biệt văn hóa và thực tế làm việc tại Nhật, cô đã nhận được sự tin tưởng và ủng hộ từ rất nhiều người nước ngoài.",
      "Hiện tại, thông qua những chia sẻ liên tục này, cô tiếp tục khuyến khích và trao thêm động lực cho những ai khao khát làm việc tại Nhật Bản.",
    ],
  },
};

export default function HomeInfluencer() {
  const { lang } = useLang();
  const t = T[lang];

  return (
    <section style={{ padding: "100px 60px", background: "var(--cream)" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }} className="influencer-grid">

        {/* Left: Photo */}
        <div style={{ position: "relative" }}>
          <div style={{ position: "relative", background: "var(--dark)", padding: "4px" }}>
            <div style={{
              position: "absolute", top: "20px", left: "20px", right: "-20px", bottom: "-20px",
              border: "1px solid rgba(184,150,62,0.3)", zIndex: 0,
            }} />
            <img
              src="/images/ceo-portrait.jpg"
              alt="Nguyen Phuong Thao"
              style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", objectPosition: "center top", display: "block", position: "relative", zIndex: 1 }}
            />
          </div>
          {/* Badge */}
          <div style={{
            position: "absolute", bottom: "-16px", right: "-16px",
            background: "#0C1F2E", padding: "20px 28px",
            border: "1px solid rgba(184,150,62,0.3)", zIndex: 2,
          }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", color: "var(--gold)", lineHeight: 1 }}>20万+</div>
            <div style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: "10px", letterSpacing: "2px", color: "rgba(250,247,242,0.6)", marginTop: "4px" }}>SNS FOLLOWERS</div>
          </div>
        </div>

        {/* Right: Text */}
        <div>
          {/* Eyebrow */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
            <div style={{ width: "40px", height: "1px", background: "var(--gold)", opacity: 0.5 }} />
            <span style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "12px", letterSpacing: "5px",
              color: "var(--gold)", fontStyle: "italic",
            }}>{t.eyebrow}</span>
          </div>

          {/* Title */}
          <h2 style={{
            fontFamily: "'Noto Serif JP', serif",
            fontSize: "clamp(26px, 3.5vw, 42px)", fontWeight: 400,
            color: "var(--dark)", letterSpacing: "2px",
            marginBottom: "12px",
          }}>
            {t.title}
          </h2>
          <div style={{ width: "48px", height: "2px", background: "var(--gold)", opacity: 0.6, marginBottom: "36px" }} />

          {/* Paragraphs */}
          {t.paragraphs.map((p, i) => (
            <p key={i} style={{
              fontFamily: "'Noto Serif JP', serif",
              fontSize: "15px", lineHeight: 2,
              color: "#3d3833", marginBottom: "18px", letterSpacing: "0.01em",
            }}>
              {p}
            </p>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .influencer-grid { grid-template-columns: 1fr !important; gap: 56px !important; }
        }
        @media (max-width: 600px) { section { padding: 72px 24px !important; } }
      `}</style>
    </section>
  );
}
