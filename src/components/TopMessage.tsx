"use client";
import { useLang } from "@/contexts/LangContext";

const T = {
  JP: {
    sectionLabel: "Top Message",
    uchida: {
      eyebrow: "代表取締役より",
      title: "代表取締役挨拶",
      subtitle: "",
      ceoLabel: "代表取締役",
      ceoSignatureLabel: "代表取締役",
      ceoName: "内田 隆嗣",
      closing: { date: "令和８年３月", company: "株式会社ASEKA", name: "代表取締役　内田 隆嗣" },
      paragraphs: [
        "このたび、株式会社クローバーホールディングスによる株式取得により、株式会社ASEKAの代表取締役に就任いたしました、内田隆嗣でございます。",
        "まずは、創業者でありこれまでASEKAを牽引してこられたグェン・フォン・タオ氏に心より敬意を表するとともに、社員の皆様、お取引先の皆様に深く感謝申し上げます。",
        "タオ氏は、日本語教育者としての専門性に加え、SNSを通じて20万人規模のフォロワーを持つインフルエンサーとして、多くの外国人材との強固なコミュニティを築いてこられました。この発信力・教育力・コミュニティは、ASEKAの大きな競争優位性であると認識しております。",
        "今後は、これらの強みをさらに発展させていくことを最重要の使命とし、クローバーホールディングスの経営資源を掛け合わせ、ASEKAを次の成長ステージへと導いてまいります。",
        "また、「人材を集め、育て、活かし、定着させる」仕組みを進化させ、企業価値の向上に取り組むとともに、外国人材が安心して働き、社会に貢献できる環境づくりを推進してまいります。",
        "タオ氏と共に、そして社員の皆様と共に、ASEKAの未来を創り上げてまいります。今後とも、皆様の変わらぬご支援を賜りますよう、何卒よろしくお願い申し上げます。",
      ],
    },
    thao: {
      eyebrow: "取締役より",
      title: "取締役挨拶",
      subtitle: "創業者・取締役",
      ceoLabel: "取締役",
      ceoSignatureLabel: "取締役",
      ceoName: "グェン　フォン　タオ",
      closing: null,
      paragraphs: [
        "2015年に留学生として来日し、2018年にリクルートグループへ入社、グローバル人材採用に携わってまいりました。2021年に株式会社ASEKAを創業し、現在は取締役として事業に関わっております。",
        "私自身、日本での生活の中で多くの支えをいただく一方で、言語や文化の違いによる壁にも直面してきました。だからこそ、日本で挑戦する外国人材の力になりたいという想いが、この事業の原点です。",
        "現在は、SNS総２０万人のネットワークと日本語教育事業を強みに、意欲の高い外国人材と企業様をつなぐ取り組みを行っております。",
        "今後も、企業様と求職者様双方にとって価値ある出会いを創出し続けてまいります。",
      ],
    },
  },
  EN: {
    sectionLabel: "Top Message",
    uchida: {
      eyebrow: "From the Representative Director",
      title: "Representative Director's Message",
      subtitle: "",
      ceoLabel: "Representative Director",
      ceoSignatureLabel: "Representative Director",
      ceoName: "Takashi Uchida",
      closing: { date: "March 2026", company: "ASEKA Co., Ltd.", name: "Representative Director   Takashi Uchida" },
      paragraphs: [
        "I am Takashi Uchida, appointed as Representative Director of ASEKA Co., Ltd. following the acquisition of shares by Clover Holdings Co., Ltd.",
        "First and foremost, I would like to express my deepest respect to Ms. Nguyen Phuong Thao, the founder who has led ASEKA with dedication, and extend my sincere gratitude to all employees and business partners.",
        "Ms. Thao has built a strong community of foreign talent — not only as an expert in Japanese language education, but also as an influencer with over 200,000 SNS followers. We recognize this reach, educational expertise, and community as a major competitive advantage for ASEKA.",
        "Our top priority going forward is to further develop these strengths, combined with the management resources of Clover Holdings, and lead ASEKA into its next stage of growth.",
        "We will also evolve our framework for attracting, developing, utilizing, and retaining talent — working to enhance corporate value while creating an environment where foreign professionals can work with confidence and contribute to society.",
        "Together with Ms. Thao and all our employees, we will shape the future of ASEKA. We sincerely appreciate your continued support.",
      ],
    },
    thao: {
      eyebrow: "From the Director",
      title: "Director's Message",
      subtitle: "Founder & Director",
      ceoLabel: "Director",
      ceoSignatureLabel: "Director",
      ceoName: "Nguyen Phuong Thao",
      closing: null,
      paragraphs: [
        "I came to Japan in 2015 as an international student, joined Recruit Group in 2018, and was involved in global talent recruitment. In 2021, I co-founded ASEKA Co., Ltd. and currently serve as a Director.",
        "While living in Japan, I have received tremendous support from those around me, yet I have also faced barriers due to language and cultural differences. That experience is the very foundation of what drives this business — a sincere desire to empower foreign professionals who are taking on the challenge of working in Japan.",
        "Today, leveraging a social media network of 200,000 followers and our Japanese language education business, we work to connect highly motivated foreign talent with companies that need them.",
        "We are committed to continuing to create valuable encounters for both companies and job seekers.",
      ],
    },
  },
  VN: {
    sectionLabel: "Thông điệp Lãnh đạo",
    uchida: {
      eyebrow: "Từ Giám đốc Điều hành",
      title: "Thông điệp Giám đốc Điều hành",
      subtitle: "",
      ceoLabel: "Giám đốc Điều hành",
      ceoSignatureLabel: "Giám đốc Điều hành",
      ceoName: "Uchida Takashi (内田 隆嗣)",
      closing: { date: "Tháng 3, 2026", company: "Công ty Cổ phần ASEKA", name: "Giám đốc Điều hành   Uchida Takashi" },
      paragraphs: [
        "Tôi là Uchida Takashi, được bổ nhiệm làm Giám đốc Điều hành Công ty Cổ phần ASEKA sau khi Clover Holdings Co., Ltd. hoàn tất việc mua lại cổ phần.",
        "Trước hết, tôi xin bày tỏ sự kính trọng sâu sắc đối với bà Nguyễn Phương Thảo — người sáng lập đã dẫn dắt ASEKA với tất cả tâm huyết, và gửi lời cảm ơn chân thành đến toàn thể nhân viên cũng như các đối tác kinh doanh.",
        "Bà Thảo không chỉ là chuyên gia giáo dục tiếng Nhật, mà còn là influencer với hơn 200.000 người theo dõi trên mạng xã hội, đã xây dựng một cộng đồng nhân tài nước ngoài vững mạnh. Chúng tôi xem đây là lợi thế cạnh tranh lớn của ASEKA.",
        "Sứ mệnh quan trọng nhất của chúng tôi là tiếp tục phát huy những thế mạnh này, kết hợp với nguồn lực quản trị của Clover Holdings, để đưa ASEKA lên giai đoạn tăng trưởng tiếp theo.",
        "Chúng tôi sẽ không ngừng hoàn thiện hệ thống thu hút, đào tạo, sử dụng và giữ chân nhân tài — nâng cao giá trị doanh nghiệp và tạo môi trường để người lao động nước ngoài có thể yên tâm làm việc và đóng góp cho xã hội.",
        "Cùng với bà Thảo và toàn thể nhân viên, chúng tôi sẽ cùng nhau xây dựng tương lai của ASEKA. Kính mong tiếp tục nhận được sự ủng hộ của quý vị.",
      ],
    },
    thao: {
      eyebrow: "Từ Giám đốc",
      title: "Thông điệp Giám đốc",
      subtitle: "Người sáng lập & Giám đốc",
      ceoLabel: "Giám đốc",
      ceoSignatureLabel: "Giám đốc",
      ceoName: "Nguyễn Phương Thảo",
      closing: null,
      paragraphs: [
        "Tôi đến Nhật Bản năm 2015 với tư cách sinh viên du học, gia nhập Recruit Group năm 2018 và tham gia vào tuyển dụng nhân tài toàn cầu. Năm 2021, tôi đồng sáng lập Công ty Cổ phần ASEKA và hiện đang giữ vai trò Giám đốc.",
        "Trong cuộc sống tại Nhật, tôi đã nhận được rất nhiều sự hỗ trợ từ mọi người, nhưng cũng đối mặt với những rào cản về ngôn ngữ và văn hóa. Chính những trải nghiệm đó là nguồn gốc của sự nghiệp này — mong muốn chân thành được trở thành chỗ dựa cho những người nước ngoài đang dũng cảm thách thức bản thân tại Nhật Bản.",
        "Hiện tại, với mạng lưới 200.000 người trên mạng xã hội và dịch vụ giáo dục tiếng Nhật, chúng tôi nỗ lực kết nối những nhân tài có động lực cao với các doanh nghiệp đang cần họ.",
        "Chúng tôi cam kết tiếp tục tạo ra những cuộc gặp gỡ có giá trị cho cả doanh nghiệp lẫn người tìm việc.",
      ],
    },
  },
};

type Closing = { date: string; company: string; name: string } | null;

function PersonBlock({
  photoSrc, photoAlt, eyebrow, title, subtitle,
  ceoLabel, ceoSignatureLabel, ceoName, paragraphs, photoLeft, closing,
}: {
  photoSrc: string; photoAlt: string;
  eyebrow: string; title: string; subtitle: string;
  ceoLabel: string; ceoSignatureLabel: string; ceoName: string;
  paragraphs: string[]; photoLeft: boolean; closing: Closing;
}) {
  const photo = (
    <div style={{ position: "relative" }}>
      <div style={{ position: "relative", background: "var(--dark)", padding: "3px" }}>
        <div style={{
          position: "absolute",
          top: "16px",
          left: photoLeft ? "16px" : "-16px",
          right: photoLeft ? "-16px" : "16px",
          bottom: "-16px",
          border: "1px solid var(--gold)", opacity: 0.3, zIndex: 0,
        }} />
        <img
          src={photoSrc} alt={photoAlt}
          style={{
            width: "100%", aspectRatio: "3/4",
            objectFit: "cover", objectPosition: "center top",
            display: "block", position: "relative", zIndex: 1,
          }}
        />
      </div>
      <div style={{
        position: "absolute", bottom: "-20px",
        left: photoLeft ? 0 : "auto",
        right: photoLeft ? "auto" : 0,
        background: "var(--gold)", padding: "10px 24px",
        fontFamily: "'Noto Sans JP', sans-serif",
        fontSize: "12px", letterSpacing: "2px",
        color: "white", zIndex: 2, fontWeight: 400,
      }}>
        {ceoLabel}
      </div>
    </div>
  );

  const text = (
    <div style={{ paddingTop: "8px" }}>
      {/* Eyebrow */}
      <div style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "12px", letterSpacing: "4px",
        color: "var(--gold)", fontStyle: "italic",
        textTransform: "uppercase", marginBottom: "12px",
      }}>
        {eyebrow}
      </div>

      {/* Title */}
      <h2 style={{
        fontFamily: "'Noto Serif JP', serif",
        fontSize: "clamp(22px, 2.8vw, 34px)", fontWeight: 400,
        color: "var(--dark)", letterSpacing: "2px",
        marginBottom: subtitle ? "8px" : "36px",
        paddingBottom: subtitle ? "0" : "24px",
        borderBottom: subtitle ? "none" : "1px solid rgba(184,150,62,0.25)",
        lineHeight: 1.3,
      }}>
        {title}
      </h2>

      {/* Subtitle (only if non-empty) */}
      {subtitle && (
        <p style={{
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: "12px", letterSpacing: "3px",
          color: "var(--warm-gray)", fontWeight: 300,
          marginBottom: "36px", paddingBottom: "24px",
          borderBottom: "1px solid rgba(184,150,62,0.25)",
        }}>
          {subtitle}
        </p>
      )}

      {/* Paragraphs */}
      {paragraphs.map((p, i) => (
        <p key={i} style={{
          fontFamily: "'Noto Serif JP', serif",
          fontSize: "15px", lineHeight: 2,
          color: "#3d3833", marginBottom: "20px", letterSpacing: "0.01em",
        }}>
          {p}
        </p>
      ))}

      {/* Signature row */}
      <div style={{
        marginTop: "40px", paddingTop: "24px",
        borderTop: "1px solid rgba(184,150,62,0.25)",
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        gap: "24px",
      }}>
        {/* Left: name signature */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <span style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "11px", letterSpacing: "3px",
            color: "var(--gold)", textTransform: "uppercase", fontStyle: "italic",
          }}>
            {ceoSignatureLabel}
          </span>
          <div style={{
            fontFamily: "'Noto Serif JP', serif",
            fontSize: "22px", color: "var(--dark)",
            letterSpacing: "3px", fontWeight: 400,
          }}>
            {ceoName}
          </div>
        </div>

        {/* Right: closing block (date / company / full name) — Uchida only */}
        {closing && (
          <div style={{
            border: "1px solid rgba(184,150,62,0.3)",
            padding: "18px 28px",
            display: "flex", flexDirection: "column", gap: "6px",
            minWidth: "220px",
          }}>
            <span style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "13px", color: "var(--dark)", letterSpacing: "1px" }}>
              {closing.date}
            </span>
            <span style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "13px", color: "var(--dark)", letterSpacing: "1px" }}>
              {closing.company}
            </span>
            <span style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "13px", color: "var(--dark)", letterSpacing: "1px" }}>
              {closing.name}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="message-inner" style={{
      display: "grid",
      gridTemplateColumns: photoLeft ? "1fr 1.6fr" : "1.6fr 1fr",
      gap: "80px", alignItems: "start",
    }}>
      {photoLeft ? photo : text}
      {photoLeft ? text : photo}
    </div>
  );
}

export default function TopMessage() {
  const { lang } = useLang();
  const t = T[lang];

  return (
    <section style={{ padding: "120px 60px", background: "white" }}>
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "80px" }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "12px", color: "var(--gold)", letterSpacing: "3px", fontStyle: "italic" }}>01</span>
        <div style={{ width: "48px", height: "1px", background: "var(--gold)", opacity: 0.45, flexShrink: 0 }} />
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "12px", letterSpacing: "5px", color: "var(--warm-gray)", textTransform: "uppercase" }}>{t.sectionLabel}</span>
      </div>

      {/* Uchida — photo left, text right */}
      <PersonBlock
        photoSrc="/images/ceo-uchida.jpg"
        photoAlt={t.uchida.ceoName}
        photoLeft={true}
        {...t.uchida}
      />

      {/* Divider */}
      <div style={{
        margin: "96px 0",
        height: "1px",
        background: "linear-gradient(to right, transparent, rgba(184,150,62,0.4), transparent)",
      }} />

      {/* Thao — text left, photo right */}
      <PersonBlock
        photoSrc="/images/ceo-portrait.jpg"
        photoAlt={t.thao.ceoName}
        photoLeft={false}
        {...t.thao}
      />

      <style>{`
        @media (max-width: 900px) {
          .message-inner { grid-template-columns: 1fr !important; gap: 60px !important; }
        }
      `}</style>
    </section>
  );
}
