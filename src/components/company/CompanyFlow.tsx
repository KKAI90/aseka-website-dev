"use client";
import { useLang } from "@/contexts/LangContext";

const T = {
  JP: {
    sectionLabel: "Process",
    intro: "紹介の流れはこのようになっております。",
    steps: [
      { num: "01", title: "求人のご依頼",    body: "お問い合わせフォームまたはお電話でご依頼ください。" },
      { num: "02", title: "打ち合わせ",      body: "採用要件・計画のヒアリングをします。" },
      { num: "03", title: "契約締結",        body: "契約を締結し、本格的に人材を紹介する流れに入ります。" },
      { num: "04", title: "人材を紹介",      body: "採用候補者の人選、応募書類を提出します。" },
      { num: "05", title: "書類選考/面接",   body: "面接日調整、認定、面接後フォロー、求職者への合否連絡をします。" },
      { num: "06", title: "内定/入社",       body: "条件交渉、入社後をフォローします。業務支援も行います。" },
    ],
  },
  EN: {
    sectionLabel: "Process",
    intro: "Here is how our placement process works.",
    steps: [
      { num: "01", title: "Request",               body: "Contact us via the inquiry form or by phone." },
      { num: "02", title: "Consultation",          body: "We listen to your hiring requirements and recruitment plan." },
      { num: "03", title: "Contract",              body: "We sign an agreement and begin the formal placement process." },
      { num: "04", title: "Candidate Intro",       body: "We select candidates and submit their application documents." },
      { num: "05", title: "Screening / Interview", body: "We coordinate interview schedules, follow up, and notify candidates of results." },
      { num: "06", title: "Offer / Onboarding",    body: "We handle offer negotiations, post-hire follow-up, and operational support." },
    ],
  },
  VN: {
    sectionLabel: "Quy trình",
    intro: "Đây là quy trình giới thiệu nhân sự của chúng tôi.",
    steps: [
      { num: "01", title: "Yêu cầu Tuyển dụng",    body: "Liên hệ qua form hoặc điện thoại để gửi yêu cầu." },
      { num: "02", title: "Tư vấn",                 body: "Chúng tôi lắng nghe yêu cầu và kế hoạch tuyển dụng của bạn." },
      { num: "03", title: "Ký Hợp đồng",            body: "Ký kết hợp đồng và bắt đầu quá trình giới thiệu nhân sự chính thức." },
      { num: "04", title: "Giới thiệu Ứng viên",    body: "Chúng tôi chọn lọc ứng viên phù hợp và gửi hồ sơ." },
      { num: "05", title: "Sàng lọc / Phỏng vấn",  body: "Điều phối lịch phỏng vấn, theo dõi sau phỏng vấn và thông báo kết quả." },
      { num: "06", title: "Nhận việc / Onboarding", body: "Hỗ trợ đàm phán điều kiện, theo dõi sau khi nhận việc và hỗ trợ công việc." },
    ],
  },
};

export default function CompanyFlow() {
  const { lang } = useLang();
  const t = T[lang];

  return (
    <section id="process" style={{ padding: "100px 0", background: "var(--cream)" }}>

      {/* Header */}
      <div style={{ padding: "0 60px 56px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "36px" }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "13px", color: "var(--gold)", letterSpacing: "2px" }}>02</span>
          <div style={{ width: "60px", height: "1px", background: "var(--gold)", opacity: 0.4, flexShrink: 0 }} />
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "11px", letterSpacing: "5px", color: "var(--warm-gray)", textTransform: "uppercase" }}>{t.sectionLabel}</span>
        </div>
        <p style={{
          fontFamily: "'Noto Serif JP', serif",
          fontSize: "22px",
          letterSpacing: "2px",
          color: "var(--dark)",
          textAlign: "center",
          margin: 0,
        }}>
          {t.intro}
        </p>
      </div>

      {/* Step grid — 3 columns, 2 rows; 1px gold gap as dividers */}
      <div
        className="flow-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1px",
          background: "rgba(184,150,62,0.18)",
          margin: "0 60px",
        }}
      >
        {t.steps.map((step, i) => (
          <div
            key={step.num}
            style={{
              background: "white",
              padding: "48px 44px 44px",
              position: "relative",
              overflow: "hidden",
              transition: "background 0.3s ease",
            }}
            className="flow-card"
          >
            {/* Large watermark number — background */}
            <span style={{
              position: "absolute",
              right: "-8px",
              bottom: "-20px",
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "140px",
              fontWeight: 300,
              fontStyle: "italic",
              color: "var(--gold)",
              opacity: 0.055,
              lineHeight: 1,
              userSelect: "none",
              pointerEvents: "none",
              letterSpacing: "-4px",
            }}>{step.num}</span>

            {/* STEP label + number */}
            <div style={{ marginBottom: "28px" }}>
              <span style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "10px",
                letterSpacing: "4px",
                color: "var(--gold)",
                textTransform: "uppercase",
                display: "block",
                marginBottom: "4px",
              }}>STEP</span>
              <span style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "48px",
                fontWeight: 300,
                fontStyle: "italic",
                color: "var(--gold)",
                lineHeight: 1,
                letterSpacing: "-1px",
              }}>{step.num}</span>
            </div>

            {/* Gold rule */}
            <div style={{
              width: "28px",
              height: "1px",
              background: "var(--gold)",
              marginBottom: "24px",
            }} />

            {/* Title */}
            <h3 style={{
              fontFamily: "'Noto Serif JP', serif",
              fontSize: "17px",
              fontWeight: 500,
              color: "#1B3A5C",
              marginBottom: "14px",
              lineHeight: 1.5,
              letterSpacing: "0.5px",
            }}>{step.title}</h3>

            {/* Body */}
            <p style={{
              fontFamily: "'Noto Serif JP', serif",
              fontSize: "13px",
              lineHeight: 2.0,
              color: "#6b6560",
              position: "relative",
              zIndex: 1,
            }}>{step.body}</p>

            {/* Top accent bar — appears on hover */}
            <div className="flow-bar" style={{
              position: "absolute",
              top: 0, left: 0, right: 0,
              height: "2px",
              background: "var(--gold)",
              transform: "scaleX(0)",
              transformOrigin: "left",
              transition: "transform 0.4s ease",
            }} />
          </div>
        ))}
      </div>

      <style>{`
        .flow-card:hover { background: #FDFCFA !important; }
        .flow-card:hover .flow-bar { transform: scaleX(1) !important; }
        @media (max-width: 900px) {
          .flow-grid { grid-template-columns: 1fr 1fr !important; margin: 0 32px !important; }
        }
        @media (max-width: 580px) {
          .flow-grid { grid-template-columns: 1fr !important; margin: 0 24px !important; }
          #process { padding: 64px 0 !important; }
          #process > div:first-child { padding: 0 24px 40px !important; }
        }
      `}</style>
    </section>
  );
}
