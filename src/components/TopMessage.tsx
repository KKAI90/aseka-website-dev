"use client";
import { useLang } from "@/contexts/LangContext";

const T = {
  JP: {
    sectionLabel: "Top Message",
    title1: "Top",
    title2: "Message",
    subtitle: "代表挨拶",
    ceoLabel: "代表取締役",
    ceoSignatureLabel: "代表取締役 / Representative Director",
    ceoName: "グェン ティラン タリ",
    paragraphs: [
      "2015年留学生として来日しました。2018年リクルートグループに入社し、グローバル人材採用に携わり、2021年5月株式会社ASEKAを立ち上げました。",
      "異国で様々な方に出会って、非常に恵まれた日々を過ごすことができていると思っています。人に大切にしていただけると感じることができているのは大変幸せで、常に感謝の気持ちでいっぱいです。",
      "一方で、決して平坦な道のりばかりではありませんでした。一般的に外国で生活するということには、母国とはちょっと不自由なことがあります。夢を持っているのに、実現するために様々な困難に相まって、今一歩踏み出せない方もいらっしゃるのではと思っています。",
      "そういった苦労や経験を、みなさまも夢を叶えるための途中に少しでも寄り添いできたら、みなさまが全員ヒーローになれるよう、知恵や知識をシェアし、サポートすることを考えています。",
      "SNSを活用した情報拡散力を駆使した企業性のある多くの人材・資質を求める企業で働けるような繋がりを作ります。私だけでなく株式会社ASEKAの職員一同が「人」を一番に考えることを軸とした事業展開を今後も継続していくことを心に決めています。",
    ],
  },
  EN: {
    sectionLabel: "Top Message",
    title1: "Top",
    title2: "Message",
    subtitle: "Message from the CEO",
    ceoLabel: "Representative Director",
    ceoSignatureLabel: "Representative Director",
    ceoName: "Nguyen Thi Lan Tari",
    paragraphs: [
      "I came to Japan in 2015 as an international student. In 2018, I joined Recruit Group and became involved in global talent recruitment. In May 2021, I founded ASEKA Co., Ltd.",
      "Living in a foreign country, I have been fortunate to meet many wonderful people and experience truly enriching days. The feeling of being cared for by others brings me immense joy, and I am constantly filled with gratitude.",
      "However, the journey has not always been smooth. Life in a foreign country often comes with certain inconveniences compared to one's home. I believe there are many who have dreams but have yet to take that decisive step, held back by various challenges.",
      "Drawing from those experiences and hardships, I hope to walk alongside each of you on the path to realizing your dreams — sharing knowledge, wisdom, and support so that everyone can become the hero of their own story.",
      "Leveraging the power of social media, we create meaningful connections between talented individuals and the companies that need them. I, along with every member of ASEKA Co., Ltd., am firmly committed to building a future where people always come first.",
    ],
  },
  VN: {
    sectionLabel: "Thông điệp Lãnh đạo",
    title1: "Thông điệp",
    title2: "CEO",
    subtitle: "Lời nhắn từ Giám đốc",
    ceoLabel: "Giám đốc Điều hành",
    ceoSignatureLabel: "Giám đốc Điều hành",
    ceoName: "Nguyễn Thị Lan Tari",
    paragraphs: [
      "Tôi đến Nhật Bản năm 2015 với tư cách sinh viên du học. Năm 2018, tôi gia nhập Recruit Group, tham gia vào tuyển dụng nhân tài toàn cầu, và vào tháng 5 năm 2021, tôi thành lập Công ty Cổ phần ASEKA.",
      "Tôi cảm thấy mình thực sự may mắn khi được gặp gỡ nhiều người ở đất nước xa lạ và trải qua những ngày tháng vô cùng quý giá. Được cảm nhận sự trân trọng từ người khác là điều hạnh phúc vô cùng, và tôi luôn tràn đầy lòng biết ơn.",
      "Mặt khác, con đường không phải lúc nào cũng bằng phẳng. Sống ở nước ngoài thường có những bất tiện nhất định so với quê hương. Tôi nghĩ có những người dù có ước mơ nhưng vì gặp phải nhiều khó khăn mà vẫn chưa dám bước đi.",
      "Từ những vất vả và kinh nghiệm đó, tôi muốn đồng hành cùng các bạn trên con đường thực hiện ước mơ, chia sẻ kiến thức và hỗ trợ để mọi người đều có thể trở thành người hùng của chính mình.",
      "Chúng tôi tạo ra những kết nối giúp nhiều nhân tài có thể làm việc tại các doanh nghiệp đang cần họ, thông qua sức lan tỏa của mạng xã hội. Không chỉ riêng tôi, mà tất cả nhân viên của Công ty Cổ phần ASEKA đều quyết tâm tiếp tục phát triển kinh doanh với triết lý đặt con người lên hàng đầu.",
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

      <div className="message-inner" style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "88px", alignItems: "start" }}>
        {/* Photo */}
        <div style={{ position: "relative" }}>
          <div style={{ position: "relative", background: "var(--dark)", padding: "3px" }}>
            <div style={{
              position: "absolute", top: "16px", left: "16px", right: "-16px", bottom: "-16px",
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
            position: "absolute", bottom: "-20px", left: 0,
            background: "var(--gold)", padding: "10px 24px",
            fontFamily: "'Noto Sans JP', sans-serif",
            fontSize: "12px", letterSpacing: "2px",
            color: "white", zIndex: 2, fontWeight: 400,
          }}>
            {t.ceoLabel}
          </div>
        </div>

        {/* Text */}
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
      </div>

      <style>{`
        @media (max-width: 900px) {
          .message-inner { grid-template-columns: 1fr !important; gap: 60px !important; }
        }
      `}</style>
    </section>
  );
}
