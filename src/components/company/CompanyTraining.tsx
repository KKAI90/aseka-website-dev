"use client";
import { useLang } from "@/contexts/LangContext";

const T = {
  JP: {
    sectionLabel: "Training",
    heading: "TRAINING",
    subheading: "人材育成事業",
    intro: "日本での就職を支援するために、言語力向上のためのオンライン日本語教育・面接対策・特定技能向けの試験対策のサービスを提供しています。",
    cards: [
      { title: "オンライン日本語教育", body: "多くのベトナム人から支持されているTHAO TOKYOオンライン日本語スクールを運営。試験対策から、日本語での会話の重要性に焦点を置いた、生活と仕事の両面で活用できる指導に注力しています。" },
      { title: "面接対策", body: "日本で働きたい・就職したいベトナム人求職者に向けて面接試験対策を行っています。面接でのマナーや日本独自の社会常識にもサポート、面接試験突破の手助けをしています。" },
      { title: "特定技能試験向けの対策", body: "特定技能の試験に向けた専門対策を行っています。求職者の方にとっての希望の会社への入社に近づけるよう、総合的なサポートを提供しています。" },
    ],
    teacherLabel: "日本語教師",
    teacherName: "伊井 誠",
    teacherRomaji: "Makoto Ii — Japanese Language Instructor",
    teacherProfile: [
      "カリフォルニア州生まれ。岐阜県大垣市谷汲流教育め",
      "2004年 国立大学法人農学部入学。在学中、個人塾経営",
      "2008年 同大学院で研究を開始",
      "2010年 農学修士取得",
      "2011年 上京後、インターネット通信、学習塾多方面及び私塾・家庭教師・コンター運営・設立",
      "フランチャイズ・コンサルティングを経験後、THAO TOKYO / ASEKA に登録",
    ],
  },
  EN: {
    sectionLabel: "Training",
    heading: "TRAINING",
    subheading: "Human Resource Development",
    intro: "To support employment in Japan, we provide online Japanese language education, interview preparation, and exam preparation for specified skilled worker tests.",
    cards: [
      { title: "Online Japanese Education", body: "We operate THAO TOKYO Online Japanese School, which is highly regarded by many Vietnamese learners. We focus on practical conversation skills alongside exam preparation, so students can thrive in daily life and at work." },
      { title: "Interview Preparation", body: "We provide interview coaching for Vietnamese job seekers who wish to work in Japan. We support students with proper manners, Japanese workplace etiquette, and strategies to pass the interview." },
      { title: "Specified Skills Exam Prep", body: "We offer specialized preparation for specified skilled worker examinations. We provide comprehensive support to help candidates get closer to joining their target company." },
    ],
    teacherLabel: "Japanese Language Instructor",
    teacherName: "Makoto Ii",
    teacherRomaji: "Makoto Ii — Japanese Language Instructor",
    teacherProfile: [
      "Born in California. Raised in Tanigumi style education, Ogaki, Gifu.",
      "2004: Enrolled in National University Faculty of Agriculture. Ran a private tutoring school during studies.",
      "2008: Began graduate research at the same university.",
      "2010: Completed Master's degree in Agriculture.",
      "2011: Moved to Tokyo; engaged in internet communications, tutoring centers, private lessons, and consulting.",
      "After franchise consulting experience, registered with THAO TOKYO / ASEKA.",
    ],
  },
  VN: {
    sectionLabel: "Đào tạo",
    heading: "TRAINING",
    subheading: "Dịch vụ Phát triển Nhân lực",
    intro: "Để hỗ trợ việc làm tại Nhật Bản, chúng tôi cung cấp dịch vụ giáo dục tiếng Nhật trực tuyến, luyện tập phỏng vấn, và ôn tập kỳ thi kỹ năng đặc định.",
    cards: [
      { title: "Giáo dục Tiếng Nhật Trực tuyến", body: "Chúng tôi vận hành Trường Tiếng Nhật Trực tuyến THAO TOKYO được nhiều người Việt Nam tin dùng. Chúng tôi tập trung vào kỹ năng giao tiếp thực tế lẫn luyện thi, giúp học viên tự tin trong cả cuộc sống lẫn công việc." },
      { title: "Luyện tập Phỏng vấn", body: "Chúng tôi hỗ trợ luyện phỏng vấn cho người tìm việc người Việt muốn làm việc tại Nhật. Chúng tôi hướng dẫn về phong cách ứng xử, văn hóa nơi làm việc Nhật và chiến lược vượt qua buổi phỏng vấn." },
      { title: "Luyện thi Kỹ năng Đặc định", body: "Chúng tôi cung cấp chương trình luyện thi chuyên biệt cho kỳ thi kỹ năng đặc định. Hỗ trợ toàn diện để ứng viên có thể tiến gần hơn đến vị trí làm việc mơ ước tại Nhật." },
    ],
    teacherLabel: "Giáo viên Tiếng Nhật",
    teacherName: "Makoto Ii (伊井 誠)",
    teacherRomaji: "Makoto Ii — Giáo viên Tiếng Nhật",
    teacherProfile: [
      "Sinh tại California. Được đào tạo theo phong cách giáo dục Tanigumi, Ogaki, Gifu.",
      "2004: Nhập học Khoa Nông nghiệp Đại học Quốc gia. Điều hành lớp học thêm trong thời gian học.",
      "2008: Bắt đầu nghiên cứu tại trường đại học cùng trường.",
      "2010: Tốt nghiệp Thạc sĩ Nông nghiệp.",
      "2011: Lên Tokyo, hoạt động trong lĩnh vực truyền thông, trung tâm học thêm, gia sư và tư vấn.",
      "Sau kinh nghiệm tư vấn nhượng quyền, đăng ký với THAO TOKYO / ASEKA.",
    ],
  },
};

export default function CompanyTraining() {
  const { lang } = useLang();
  const t = T[lang];

  return (
    <section id="training" style={{ padding: "100px 60px", background: "white" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "64px" }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "13px", color: "var(--gold)", letterSpacing: "2px" }}>04</span>
        <div style={{ width: "60px", height: "1px", background: "var(--gold)", opacity: 0.4, flexShrink: 0 }} />
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "11px", letterSpacing: "5px", color: "var(--warm-gray)", textTransform: "uppercase" }}>{t.sectionLabel}</span>
      </div>

      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(40px, 6vw, 56px)", fontWeight: 300, color: "var(--dark)", marginBottom: "6px" }}>{t.heading}</h2>
      <p style={{ fontSize: "13px", letterSpacing: "3px", color: "var(--warm-gray)", marginBottom: "48px", paddingBottom: "32px", borderBottom: "1px solid var(--border)" }}>
        {t.subheading}
      </p>
      <p style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "15px", lineHeight: 2, color: "#3a3a3a", marginBottom: "56px" }}>
        {t.intro}
      </p>

      <div className="training-services" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "3px", marginBottom: "64px" }}>
        {t.cards.map((card) => (
          <div key={card.title} style={{ padding: "40px 32px", background: "var(--cream)", borderTop: "3px solid var(--gold)" }}>
            <h3 style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "18px", color: "#0E2233", marginBottom: "16px" }}>{card.title}</h3>
            <p style={{ fontSize: "14px", lineHeight: 2, color: "var(--warm-gray)" }}>{card.body}</p>
          </div>
        ))}
      </div>

      <div className="teacher-block" style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: "64px", alignItems: "start", marginTop: "64px", paddingTop: "64px", borderTop: "1px solid var(--border)" }}>
        <div style={{ position: "relative" }}>
          <div style={{ position: "relative", background: "var(--dark)", padding: "3px" }}>
            <div style={{ position: "absolute", top: "16px", left: "16px", right: "-16px", bottom: "-16px", border: "1px solid var(--gold)", opacity: 0.3, zIndex: 0 }} />
            <img
              src="/images/teacher-portrait.jpg"
              alt={t.teacherName}
              style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", objectPosition: "center top", display: "block", position: "relative", zIndex: 1 }}
            />
          </div>
          <div style={{ position: "absolute", bottom: "-20px", left: 0, background: "var(--gold)", padding: "8px 20px", fontSize: "11px", letterSpacing: "2px", color: "white", zIndex: 2 }}>
            {t.teacherLabel}
          </div>
        </div>
        <div style={{ paddingTop: "16px" }}>
          <div style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "28px", color: "var(--dark)", marginBottom: "6px" }}>{t.teacherName}</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "15px", letterSpacing: "3px", color: "var(--gold)", marginBottom: "32px" }}>{t.teacherRomaji}</div>
          {t.teacherProfile.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: "16px", marginBottom: "12px", fontSize: "14px", lineHeight: 1.7, color: "#555" }}>
              <span style={{ color: "var(--gold)", flexShrink: 0, fontSize: "20px", lineHeight: 1.3 }}>·</span>{item}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .training-services { grid-template-columns: 1fr !important; }
          .teacher-block { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
        @media (max-width: 600px) { #training { padding: 64px 24px !important; } }
      `}</style>
    </section>
  );
}
