"use client";
import { useLang } from "@/contexts/LangContext";

const T = {
  JP: {
    sectionLabel: "Process",
    intro: "紹介の流れはこのようになっています。",
    steps: [
      { num: "01", title: "求人のご依頼",    body: "お問い合わせフォームまたはお電話でご依頼ください。" },
      { num: "02", title: "打ち合わせ",      body: "採用要件・計画のヒアリングをします。" },
      { num: "03", title: "契約締結",        body: "契約を締結し、本格的に人材を紹介する流れに入ります。" },
      { num: "04", title: "人材をご紹介",    body: "採用候補者の人選・応募書類を提出します。" },
      { num: "05", title: "書類選考・面接",  body: "面接日調整・設定、面接後のフォロー、求職者への合否連絡もします。" },
      { num: "06", title: "内定・入社",      body: "条件交渉・入社後フォローもします。業務支援を行います。" },
    ],
  },
  EN: {
    sectionLabel: "Process",
    intro: "Here is how our placement process works.",
    steps: [
      { num: "01", title: "Request",          body: "Contact us via the inquiry form or by phone." },
      { num: "02", title: "Consultation",     body: "We listen to your hiring requirements and recruitment plan." },
      { num: "03", title: "Contract",         body: "We sign an agreement and begin the formal placement process." },
      { num: "04", title: "Candidate Intro",  body: "We select candidates and submit their application documents." },
      { num: "05", title: "Screening & Interview", body: "We coordinate interview schedules, follow up, and notify candidates of results." },
      { num: "06", title: "Offer & Onboarding", body: "We handle offer negotiations, post-hire follow-up, and operational support." },
    ],
  },
  VN: {
    sectionLabel: "Quy trình",
    intro: "Đây là quy trình giới thiệu nhân sự của chúng tôi.",
    steps: [
      { num: "01", title: "Yêu cầu Tuyển dụng", body: "Liên hệ qua form hoặc điện thoại để gửi yêu cầu." },
      { num: "02", title: "Tư vấn",              body: "Chúng tôi lắng nghe yêu cầu và kế hoạch tuyển dụng của bạn." },
      { num: "03", title: "Ký Hợp đồng",         body: "Ký kết hợp đồng và bắt đầu quá trình giới thiệu nhân sự chính thức." },
      { num: "04", title: "Giới thiệu Ứng viên", body: "Chúng tôi chọn lọc ứng viên phù hợp và gửi hồ sơ." },
      { num: "05", title: "Sàng lọc & Phỏng vấn", body: "Điều phối lịch phỏng vấn, theo dõi sau phỏng vấn và thông báo kết quả." },
      { num: "06", title: "Nhận việc & Onboarding", body: "Hỗ trợ đàm phán điều kiện, theo dõi sau khi nhận việc và hỗ trợ công việc." },
    ],
  },
};

export default function CompanyFlow() {
  const { lang } = useLang();
  const t = T[lang];

  return (
    <section id="process" style={{ padding: "100px 60px", background: "white" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "64px" }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "13px", color: "var(--gold)", letterSpacing: "2px" }}>02</span>
        <div style={{ width: "60px", height: "1px", background: "var(--gold)", opacity: 0.4, flexShrink: 0 }} />
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "11px", letterSpacing: "5px", color: "var(--warm-gray)", textTransform: "uppercase" }}>{t.sectionLabel}</span>
      </div>

      <p style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "22px", letterSpacing: "2px", color: "var(--dark)", marginBottom: "48px", textAlign: "center" }}>
        {t.intro}
      </p>

      <div className="flow-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "3px" }}>
        {t.steps.map((step, i) => (
          <div key={step.num} style={{
            background: i % 2 === 0 ? "#C4975A" : "#b5894e",
            padding: "48px 36px", position: "relative", overflow: "hidden",
          }}>
            <div style={{
              fontFamily: "'Cormorant Garamond', serif", fontSize: "80px", fontWeight: 300,
              color: "rgba(255,255,255,0.15)", position: "absolute", bottom: "-10px", right: "16px",
              lineHeight: 1, fontStyle: "italic",
            }}>{step.num}</div>
            <h3 style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "20px", fontWeight: 400, color: "#fff", marginBottom: "12px", position: "relative", zIndex: 1 }}>
              {step.title}
            </h3>
            <p style={{ fontSize: "13px", lineHeight: 2, color: "rgba(255,255,255,0.8)", position: "relative", zIndex: 1 }}>
              {step.body}
            </p>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 900px) { .flow-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 600px) { #process { padding: 64px 24px !important; } }
      `}</style>
    </section>
  );
}
