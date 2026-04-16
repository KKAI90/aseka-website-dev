"use client";
import Image from "next/image";
import { useLang } from "@/contexts/LangContext";

const T = {
  JP: {
    sectionLabel: "Top Message",
    uchida: {
      eyebrow: "代表取締役より",
      title: "代表取締役挨拶",
      subtitle: "代表取締役就任にあたって",
      ceoLabel: "代表取締役",
      ceoSignatureLabel: "代表取締役",
      ceoName: "内田 隆嗣",
      signatureNote: ["令和８年３月", "株式会社ASEKA", "代表取締役　内田 隆嗣"],
      paragraphs: [
        "このたび、株式会社クローバーホールディングスによる株式取得により、株式会社ASEKAの代表取締役に就任いたしました、内田隆嗣でございます。",
        "まずは、創業者でありこれまでASEKAを牽引してこられたグェン・フォン・タオ氏に心より敬意を表するとともに、社員の皆様、お取引先の皆様に深く感謝申し上げます。",
        "タオ氏は、日本語教育者としての専門性に加え、SNSを通じて21万人規模のフォロワーを持つインフルエンサーとして、多くの外国人材との強固なコミュニティを築いてこられました。この発信力・教育力・コミュニティは、ASEKAの大きな競争優位性であると認識しております。",
        "今後は、これらの強みをさらに発展させていくことを最重要の使命とし、クローバーホールディングスの経営資源を掛け合わせ、ASEKAを次の成長ステージへと導いてまいります。",
        "また、「人材を集め、育て、活かし、定着させる」仕組みを進化させ、企業価値の向上に取り組むとともに、外国人材が安心して働き、社会に貢献できる環境づくりを推進してまいります。",
        "社員の皆様と共に、ASEKAの未来を創り上げてまいります。今後とも、皆様の変わらぬご支援を賜りますよう、何卒よろしくお願い申し上げます。",
      ],
    },
    thao: {
      eyebrow: "取締役より",
      title: "取締役挨拶",
      subtitle: "創業者・取締役",
      ceoLabel: "取締役",
      ceoSignatureLabel: "取締役",
      ceoName: "グェン　フォン　タオ",
      signatureNote: ["取締役　グェン　フォン　タオ"],
      paragraphs: [
        "2015年に留学生として来日し、2018年にリクルートグループへ入社、グローバル人材採用に携わってまいりました。2021年に株式会社ASEKAを創業し、現在は取締役として事業に関わっております。",
        "私自身、日本での生活の中で多くの支えをいただく一方で、言語や文化の違いによる壁にも直面してきました。だからこそ、日本で挑戦する外国人材の力になりたいという想いが、この事業の原点です。",
        "現在は、SNS総21万人のネットワークと日本語教育事業を強みに、意欲の高い外国人材と企業様をつなぐ取り組みを行っております。",
        "今後も、企業様と求職者様双方にとって価値ある出会いを創出し続けてまいります。",
      ],
    },
  },
  EN: {
    sectionLabel: "Top Message",
    uchida: {
      eyebrow: "From the Representative Director",
      title: "Representative Director's Message",
      subtitle: "On My Appointment as Representative Director",
      ceoLabel: "Representative Director",
      ceoSignatureLabel: "Representative Director",
      ceoName: "Takashi Uchida",
      signatureNote: ["March 2026", "ASEKA Co., Ltd.", "Representative Director　Takashi Uchida"],
      paragraphs: [
        "I am Takashi Uchida, appointed as Representative Director of ASEKA Co., Ltd. following the acquisition of shares by Clover Holdings Co., Ltd.",
        "First and foremost, I would like to express my deepest respect to Ms. Nguyen Phuong Thao, the founder who has led ASEKA with dedication, and extend my sincere gratitude to all employees and business partners.",
        "Ms. Thao has built a strong community of foreign talent — not only as an expert in Japanese language education, but also as an influencer with over 210,000 SNS followers. We recognize this reach, educational expertise, and community as a major competitive advantage for ASEKA.",
        "Our top priority going forward is to further develop these strengths, combined with the management resources of Clover Holdings, and lead ASEKA into its next stage of growth.",
        "We will also evolve our framework for attracting, developing, utilizing, and retaining talent — working to enhance corporate value while creating an environment where foreign professionals can work with confidence and contribute to society.",
        "Together with all our employees, we will shape the future of ASEKA. We sincerely appreciate your continued support.",
      ],
    },
    thao: {
      eyebrow: "From the Director",
      title: "Director's Message",
      subtitle: "Founder & Director",
      ceoLabel: "Director",
      ceoSignatureLabel: "Director",
      ceoName: "Nguyen Phuong Thao",
      signatureNote: ["Director　Nguyen Phuong Thao"],
      paragraphs: [
        "I came to Japan in 2015 as an international student, joined Recruit Group in 2018, and was involved in global talent recruitment. In 2021, I co-founded ASEKA Co., Ltd. and currently serve as a Director.",
        "While living in Japan, I have received tremendous support from those around me, yet I have also faced barriers due to language and cultural differences. That experience is the very foundation of what drives this business — a sincere desire to empower foreign professionals who are taking on the challenge of working in Japan.",
        "Today, leveraging a social media network of 210,000 followers and our Japanese language education business, we work to connect highly motivated foreign talent with companies that need them.",
        "We are committed to continuing to create valuable encounters for both companies and job seekers.",
      ],
    },
  },
  VN: {
    sectionLabel: "Thông điệp Lãnh đạo",
    uchida: {
      eyebrow: "Từ Giám đốc Điều hành",
      title: "Thông điệp Giám đốc Điều hành",
      subtitle: "Nhân dịp nhậm chức Giám đốc Điều hành",
      ceoLabel: "Giám đốc Điều hành",
      ceoSignatureLabel: "Giám đốc Điều hành",
      ceoName: "Uchida Takashi (内田 隆嗣)",
      signatureNote: ["Tháng 3 năm 2026", "Công ty Cổ phần ASEKA", "Giám đốc Điều hành　Uchida Takashi"],
      paragraphs: [
        "Tôi là Uchida Takashi, được bổ nhiệm làm Giám đốc Điều hành Công ty Cổ phần ASEKA sau khi Clover Holdings Co., Ltd. hoàn tất việc mua lại cổ phần.",
        "Trước hết, tôi xin bày tỏ sự kính trọng sâu sắc đối với bà Nguyễn Phương Thảo — người sáng lập đã dẫn dắt ASEKA với tất cả tâm huyết, và gửi lời cảm ơn chân thành đến toàn thể nhân viên cũng như các đối tác kinh doanh.",
        "Bà Thảo không chỉ là chuyên gia giáo dục tiếng Nhật, mà còn là influencer với hơn 210.000 người theo dõi trên mạng xã hội, đã xây dựng một cộng đồng nhân tài nước ngoài vững mạnh. Chúng tôi xem đây là lợi thế cạnh tranh lớn của ASEKA.",
        "Sứ mệnh quan trọng nhất của chúng tôi là tiếp tục phát huy những thế mạnh này, kết hợp với nguồn lực quản trị của Clover Holdings, để đưa ASEKA lên giai đoạn tăng trưởng tiếp theo.",
        "Chúng tôi sẽ không ngừng hoàn thiện hệ thống thu hút, đào tạo, sử dụng và giữ chân nhân tài — nâng cao giá trị doanh nghiệp và tạo môi trường để người lao động nước ngoài có thể yên tâm làm việc và đóng góp cho xã hội.",
        "Cùng với toàn thể nhân viên, chúng tôi sẽ cùng nhau xây dựng tương lai của ASEKA. Kính mong tiếp tục nhận được sự ủng hộ của quý vị.",
      ],
    },
    thao: {
      eyebrow: "Từ Giám đốc",
      title: "Thông điệp Giám đốc",
      subtitle: "Người sáng lập & Giám đốc",
      ceoLabel: "Giám đốc",
      ceoSignatureLabel: "Giám đốc",
      ceoName: "Nguyễn Phương Thảo",
      signatureNote: ["Giám đốc　Nguyễn Phương Thảo"],
      paragraphs: [
        "Tôi đến Nhật Bản năm 2015 với tư cách sinh viên du học, gia nhập Recruit Group năm 2018 và tham gia vào tuyển dụng nhân tài toàn cầu. Năm 2021, tôi đồng sáng lập Công ty Cổ phần ASEKA và hiện đang giữ vai trò Giám đốc.",
        "Trong cuộc sống tại Nhật, tôi đã nhận được rất nhiều sự hỗ trợ từ mọi người, nhưng cũng đối mặt với những rào cản về ngôn ngữ và văn hóa. Chính những trải nghiệm đó là nguồn gốc của sự nghiệp này — mong muốn chân thành được trở thành chỗ dựa cho những người nước ngoài đang dũng cảm thách thức bản thân tại Nhật Bản.",
        "Hiện tại, với mạng lưới 210.000 người trên mạng xã hội và dịch vụ giáo dục tiếng Nhật, chúng tôi nỗ lực kết nối những nhân tài có động lực cao với các doanh nghiệp đang cần họ.",
        "Chúng tôi cam kết tiếp tục tạo ra những cuộc gặp gỡ có giá trị cho cả doanh nghiệp lẫn người tìm việc.",
      ],
    },
  },
};

function PersonBlock({
  photoSrc, photoAlt, eyebrow, title,
  ceoLabel, paragraphs, photoLeft, signatureNote,
}: {
  photoSrc: string; photoAlt: string;
  eyebrow: string; title: string;
  ceoLabel: string; ceoSignatureLabel: string; ceoName: string;
  paragraphs: string[]; photoLeft: boolean; signatureNote?: string[];
}) {
  const photo = (
    <div style={{ position: "relative" }}>
      {/* Decorative gold offset border */}
      <div style={{
        position: "absolute",
        top: "16px",
        left: photoLeft ? "16px" : "-16px",
        right: photoLeft ? "-16px" : "16px",
        bottom: "-16px",
        border: "1px solid rgba(184,150,62,0.45)", zIndex: 0,
      }} />

      {/* Photo — no dark frame */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <Image
          src={photoSrc} alt={photoAlt}
          width={400} height={534}
          style={{
            width: "100%", aspectRatio: "3/4",
            objectFit: "cover", objectPosition: "center top",
            display: "block",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          }}
        />
      </div>

      {/* CEO label badge */}
      <div style={{
        position: "absolute", bottom: "-20px",
        left: photoLeft ? 0 : "auto",
        right: photoLeft ? "auto" : 0,
        background: "var(--gold)", padding: "10px 24px",
        fontFamily: "'Noto Sans JP', sans-serif",
        fontSize: "12px", letterSpacing: "1px",
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
        fontFamily: "'Noto Sans JP', sans-serif",
        fontSize: "12px", letterSpacing: "2px",
        color: "var(--gold)", fontStyle: "normal",
        fontWeight: 400, marginBottom: "12px",
      }}>
        {eyebrow}
      </div>

      {/* Title */}
      <h2 style={{
        fontFamily: "'Noto Serif JP', serif",
        fontSize: "clamp(22px, 2.8vw, 34px)", fontWeight: 400,
        color: "var(--dark)", letterSpacing: "2px",
        marginBottom: "8px", lineHeight: 1.3,
      }}>
        {title}
      </h2>

      {/* Divider */}
      <div style={{
        marginBottom: "36px", paddingBottom: "24px",
        borderBottom: "1px solid rgba(184,150,62,0.25)",
      }} />

      {/* Paragraphs */}
      {paragraphs.map((text, i) => (
        <p key={i} style={{
          fontFamily: "'Noto Serif JP', serif",
          fontSize: "15px", lineHeight: 2,
          color: "#3d3833", marginBottom: "20px", letterSpacing: "0.01em",
        }}>
          {text}
        </p>
      ))}

      {/* Signature */}
      {signatureNote && (
        <div style={{
          marginTop: "40px", paddingTop: "24px",
          borderTop: "1px solid rgba(184,150,62,0.25)",
          display: "flex", flexDirection: "column", gap: "4px",
          textAlign: "right",
        }}>
          {signatureNote.map((line, i) => (
            <span key={i} style={{
              fontFamily: "'Noto Serif JP', serif",
              fontSize: "13px",
              color: i === signatureNote.length - 1 ? "var(--gold)" : "#3d3833",
              letterSpacing: "0.05em", lineHeight: 1.8,
            }}>
              {line}
            </span>
          ))}
        </div>
      )}
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
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "14px", color: "var(--gold)", letterSpacing: "2px", fontStyle: "normal", fontWeight: 500 }}>01</span>
        <div style={{ width: "48px", height: "1px", background: "var(--gold)", opacity: 0.6, flexShrink: 0 }} />
        <span style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: "13px", letterSpacing: "3px", color: "#3d3833", textTransform: "uppercase", fontWeight: 400 }}>{t.sectionLabel}</span>
      </div>

      {/* Uchida — photo left, text right (FIRST) */}
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

      {/* Thao — text left, photo right (SECOND) */}
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
