"use client";
import { useLang } from "@/contexts/LangContext";

const T = {
  JP: {
    sectionLabel: "Contact",
    intro: "お仕事のご相談、質問等のお問い合わせは、\n以下から該当の項目からお選びください。",
    sub: "お問い合わせ内容の確認後、担当者よりご連絡させていただきます。",
    corp: { title: "法人の方", desc: "人材についてまた弊社業務インバウンドサービスなどの\nお問い合わせはこちらのフォームへお進みください", btn: "› 法人の方フォームへ" },
    seeker: { title: "求職者の方", desc: "求職されている方、弊社教育サービスなどへの\nお問い合わせはこちらのフォームへお進みください", btn: "› 求職者の方フォームへ" },
  },
  EN: {
    sectionLabel: "Contact",
    intro: "For business inquiries and questions,\nplease select the appropriate option below.",
    sub: "We will respond after reviewing the content of your inquiry.",
    corp: { title: "For Companies", desc: "For inquiries about staffing, inbound services,\nand other business matters, please use this form.", btn: "› Company Inquiry Form" },
    seeker: { title: "For Job Seekers", desc: "For inquiries about job placement,\ntraining services, and more, please use this form.", btn: "› Job Seeker Form" },
  },
  VN: {
    sectionLabel: "Liên hệ",
    intro: "Để tư vấn công việc hoặc gửi câu hỏi,\nvui lòng chọn mục phù hợp dưới đây.",
    sub: "Chúng tôi sẽ liên hệ lại sau khi xem xét nội dung của bạn.",
    corp: { title: "Dành cho Doanh nghiệp", desc: "Liên hệ về tuyển dụng nhân sự, dịch vụ inbound\nvà các vấn đề kinh doanh khác.", btn: "› Form Dành cho Doanh nghiệp" },
    seeker: { title: "Dành cho Người tìm việc", desc: "Liên hệ về giới thiệu việc làm,\ndịch vụ đào tạo và các thắc mắc khác.", btn: "› Form Dành cho Ứng viên" },
  },
};

export default function CompanyContact() {
  const { lang } = useLang();
  const t = T[lang];

  return (
    <section id="contact" style={{ background: "#0E2233", padding: "100px 60px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "64px", justifyContent: "center" }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "13px", color: "var(--gold)", letterSpacing: "2px" }}>05</span>
        <div style={{ width: "60px", height: "1px", background: "var(--gold)", opacity: 0.4, flexShrink: 0 }} />
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "11px", letterSpacing: "5px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>{t.sectionLabel}</span>
      </div>

      <p style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "22px", lineHeight: 2, color: "rgba(255,255,255,0.85)", textAlign: "center", marginBottom: "64px", whiteSpace: "pre-line" }}>
        {t.intro}<br />
        <span style={{ fontSize: "16px", opacity: 0.6 }}>{t.sub}</span>
      </p>

      <div className="contact-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {[
          { ...t.corp,   href: "/contact" },
          { ...t.seeker, href: "/dang-ky" },
        ].map((card) => (
          <div key={card.title} className="contact-card" style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(184,150,62,0.3)",
            padding: "40px", display: "flex", justifyContent: "space-between",
            alignItems: "center", gap: "24px", transition: "background 0.3s",
          }}>
            <div>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", color: "#D4AF6A", marginBottom: "8px" }}>{card.title}</h3>
              <p style={{ fontSize: "13px", lineHeight: 1.8, color: "rgba(255,255,255,0.55)", whiteSpace: "pre-line" }}>{card.desc}</p>
            </div>
            <a href={card.href} style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "14px 28px", border: "1px solid var(--gold)",
              color: "var(--gold)", fontSize: "12px", letterSpacing: "2px",
              cursor: "pointer", whiteSpace: "nowrap", textDecoration: "none",
              transition: "all 0.3s", flexShrink: 0,
            }} className="contact-btn">
              {card.btn}
            </a>
          </div>
        ))}
      </div>

      <style>{`
        .contact-card:hover { background: rgba(255,255,255,0.1) !important; }
        .contact-btn:hover { background: var(--gold) !important; color: white !important; }
        @media (max-width: 900px) {
          .contact-grid { grid-template-columns: 1fr !important; }
          .contact-card { flex-direction: column !important; align-items: flex-start !important; }
          #contact { padding: 64px 24px !important; }
        }
      `}</style>
    </section>
  );
}
