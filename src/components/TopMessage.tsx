"use client";
import { useLang } from "@/contexts/LangContext";

const T = {
  JP: {
    sectionLabel: "Top Message",
    title1: "Top",
    title2: "Message",
    subtitle: "代表挨拶",
    ceoLabel: "取締役",
    ceoSignatureLabel: "取締役 / Director",
    ceoName: "グェン　フォン　タオ",
    paragraphs: [
      "2015年に留学生として来日し、2018年にリクルートグループへ入社、グローバル人材採用に携わってまいりました。2021年に株式会社ASEKAを創業し、現在は取締役として事業に関わっております。",
      "私自身、日本での生活の中で多くの支えをいただく一方で、言語や文化の違いによる壁にも直面してきました。だからこそ、日本で挑戦する外国人材の力になりたいという想いが、この事業の原点です。",
      "現在は、SNS総２０万人のネットワークと日本語教育事業を強みに、意欲の高い外国人材と企業様をつなぐ取り組みを行っております。",
      "今後も、企業様と求職者様双方にとって価値ある出会いを創出し続けてまいります。",
    ],
  },
  EN: {
    sectionLabel: "Top Message",
    title1: "Top",
    title2: "Message",
    subtitle: "Message from the Director",
    ceoLabel: "Director",
    ceoSignatureLabel: "Director",
    ceoName: "Nguyen Phuong Thao",
    paragraphs: [
      "I came to Japan in 2015 as an international student, joined Recruit Group in 2018, and was involved in global talent recruitment. In 2021, I co-founded ASEKA Co., Ltd. and currently serve as a Director.",
      "While living in Japan, I have received tremendous support from those around me, yet I have also faced barriers due to language and cultural differences. That experience is the very foundation of what drives this business — a sincere desire to empower foreign professionals who are taking on the challenge of working in Japan.",
      "Today, leveraging a social media network of 200,000 followers and our Japanese language education business, we work to connect highly motivated foreign talent with companies that need them.",
      "We are committed to continuing to create valuable encounters for both companies and job seekers.",
    ],
  },
  VN: {
    sectionLabel: "Thông điệp Lãnh đạo",
    title1: "Thông điệp",
    title2: "Lãnh đạo",
    subtitle: "Lời nhắn từ Ban Giám đốc",
    ceoLabel: "Giám đốc",
    ceoSignatureLabel: "Giám đốc",
    ceoName: "Nguyễn Phương Thảo",
    paragraphs: [
      "Tôi đến Nhật Bản năm 2015 với tư cách sinh viên du học, gia nhập Recruit Group năm 2018 và tham gia vào tuyển dụng nhân tài toàn cầu. Năm 2021, tôi đồng sáng lập Công ty Cổ phần ASEKA và hiện đang giữ vai trò Giám đốc.",
      "Trong cuộc sống tại Nhật, tôi đã nhận được rất nhiều sự hỗ trợ từ mọi người, nhưng cũng đối mặt với những rào cản về ngôn ngữ và văn hóa. Chính những trải nghiệm đó là nguồn gốc của sự nghiệp này — mong muốn chân thành được trở thành chỗ dựa cho những người nước ngoài đang dũng cảm thách thức bản thân tại Nhật Bản.",
      "Hiện tại, với mạng lưới 200.000 người trên mạng xã hội và dịch vụ giáo dục tiếng Nhật, chúng tôi nỗ lực kết nối những nhân tài có động lực cao với các doanh nghiệp đang cần họ.",
      "Chúng tôi cam kết tiếp tục tạo ra những cuộc gặp gỡ có giá trị cho cả doanh nghiệp lẫn người tìm việc.",
    ],
  },
};

export default function TopMessage() {
  const { lang } = useLang();
  const t = T[lang];

  return (
    <section style={{ padding: "120px 60px", background: "white" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "72px" }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "12px", color: "var(--gold)", letterSpacing: "3px", fontStyle: "italic" }}>02</span>
        <div style={{ width: "48px", height: "1px", background: "var(--gold)", opacity: 0.45, flexShrink: 0 }} />
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "12px", letterSpacing: "5px", color: "var(--warm-gray)", textTransform: "uppercase" }}>{t.sectionLabel}</span>
      </div>

      {/* Text left, Photo right */}
      <div className="message-inner" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "88px", alignItems: "start" }}>

        {/* Text — LEFT */}
        <div style={{ paddingTop: "8px" }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(40px, 4vw, 60px)", fontWeight: 300,
            lineHeight: 1.05, color: "var(--dark)",
            marginBottom: "6px", letterSpacing: "-0.5px",
          }}>
            {t.title1}<em style={{ fontStyle: "italic", color: "var(--gold)" }}>{t.title2}</em>
          </h2>
          <p style={{
            fontFamily: "'Noto Serif JP', serif",
            fontSize: "13px", letterSpacing: "4px",
            color: "var(--warm-gray)", fontWeight: 300,
            marginBottom: "40px", paddingBottom: "28px",
            borderBottom: "1px solid rgba(184,150,62,0.25)",
          }}>
            {t.subtitle}
          </p>
          {t.paragraphs.map((text, i) => (
            <p key={i} style={{
              fontFamily: "'Noto Serif JP', serif",
              fontSize: "15.5px", lineHeight: 1.95,
              color: "#3d3833", marginBottom: "22px", letterSpacing: "0.01em",
            }}>
              {text}
            </p>
          ))}
          <div style={{
            marginTop: "44px", paddingTop: "28px",
            borderTop: "1px solid rgba(184,150,62,0.25)",
            display: "flex", flexDirection: "column", gap: "10px",
          }}>
            <span style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "11px", letterSpacing: "3px",
              color: "var(--gold)", textTransform: "uppercase", fontStyle: "italic",
            }}>
              {t.ceoSignatureLabel}
            </span>
            <div style={{
              fontFamily: "'Noto Serif JP', serif",
              fontSize: "24px", color: "var(--dark)",
              letterSpacing: "3px", fontWeight: 400,
            }}>
              {t.ceoName}
            </div>
          </div>
        </div>

        {/* Photo — RIGHT */}
        <div style={{ position: "relative" }}>
          <div style={{ position: "relative", background: "var(--dark)", padding: "3px" }}>
            <div style={{
              position: "absolute", top: "16px", left: "-16px", right: "16px", bottom: "-16px",
              border: "1px solid var(--gold)", opacity: 0.3, zIndex: 0,
            }} />
            <img
              src="/images/ceo-portrait.jpg"
              alt={t.ceoName}
              style={{
                width: "100%", aspectRatio: "3/4",
                objectFit: "cover", objectPosition: "center top",
                display: "block", position: "relative", zIndex: 1,
              }}
            />
          </div>
          <div style={{
            position: "absolute", bottom: "-20px", right: 0,
            background: "var(--gold)", padding: "10px 24px",
            fontFamily: "'Noto Sans JP', sans-serif",
            fontSize: "12px", letterSpacing: "2px",
            color: "white", zIndex: 2, fontWeight: 400,
          }}>
            {t.ceoLabel}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .message-inner { grid-template-columns: 1fr !important; gap: 60px !important; }
        }
      `}</style>
    </section>
  );
}
