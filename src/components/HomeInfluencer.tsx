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
    stats: [
      { value: "200,000+", label: "SNSフォロワー" },
      { value: "2019", label: "YouTube開始" },
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
    stats: [
      { value: "200,000+", label: "SNS Followers" },
      { value: "2019", label: "YouTube Launch" },
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
    stats: [
      { value: "200,000+", label: "Người theo dõi SNS" },
      { value: "2019", label: "Bắt đầu YouTube" },
    ],
  },
};

export default function HomeInfluencer() {
  const { lang } = useLang();
  const t = T[lang];

  return (
    <section style={{ padding: "100px 60px", background: "white" }}>
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>

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
          marginBottom: "0",
        }}>
          {t.title}
        </h2>
        <div style={{ width: "100%", height: "1px", background: "var(--gold)", opacity: 0.35, margin: "20px 0 40px" }} />

        {/* Paragraphs */}
        <div style={{ marginBottom: "56px" }}>
          {t.paragraphs.map((p, i) => (
            <p key={i} style={{
              fontFamily: "'Noto Serif JP', serif",
              fontSize: "15px", lineHeight: 2.1,
              color: "#3d3833", marginBottom: "0", letterSpacing: "0.02em",
            }}>
              {p}
            </p>
          ))}
        </div>

        {/* Stats row */}
        <div style={{
          display: "flex", gap: "2px",
          borderTop: "1px solid rgba(184,150,62,0.2)",
          paddingTop: "40px",
        }}>
          {t.stats.map((s, i) => (
            <div key={i} style={{
              flex: 1, padding: "32px 40px",
              background: "#0C1F2E",
              borderRight: i < t.stats.length - 1 ? "1px solid rgba(184,150,62,0.15)" : "none",
              textAlign: "center",
            }}>
              <div style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(32px, 3.5vw, 48px)",
                fontWeight: 300, color: "var(--gold)",
                letterSpacing: "-1px", lineHeight: 1,
                marginBottom: "10px",
              }}>
                {s.value}
              </div>
              <div style={{
                fontFamily: "'Noto Sans JP', sans-serif",
                fontSize: "11px", letterSpacing: "2px",
                color: "rgba(250,247,242,0.7)",
              }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

      </div>

      <style>{`
        @media (max-width: 600px) {
          #influencer-stats { flex-direction: column !important; }
        }
      `}</style>
    </section>
  );
}
