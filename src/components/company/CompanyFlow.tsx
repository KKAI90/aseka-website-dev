"use client";
import { useLang } from "@/contexts/LangContext";

const STEP_ICONS = [
  // 01 求人のご依頼 — lightbulb + people
  <svg key="01" viewBox="0 0 80 80" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M40 12c9 0 16 7 16 16 0 6-3 11-8 14.5V50H32v-7.5C27 39 24 34 24 28c0-9 7-16 16-16z"/>
    <line x1="32" y1="54" x2="48" y2="54"/><line x1="34" y1="58" x2="46" y2="58"/>
    <circle cx="24" cy="68" r="5"/><circle cx="40" cy="70" r="5"/><circle cx="56" cy="68" r="5"/>
    <path d="M29 69 Q40 73 51 69"/>
  </svg>,
  // 02 打ち合わせ — speech bubble + people
  <svg key="02" viewBox="0 0 80 80" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="10" y="10" width="42" height="28" rx="6"/>
    <circle cx="25" cy="24" r="2.5" fill="rgba(255,255,255,0.85)" stroke="none"/>
    <circle cx="36" cy="24" r="2.5" fill="rgba(255,255,255,0.85)" stroke="none"/>
    <circle cx="47" cy="24" r="2.5" fill="rgba(255,255,255,0.85)" stroke="none"/>
    <path d="M10 34 L6 44 L20 40"/>
    <circle cx="36" cy="60" r="7"/><circle cx="54" cy="58" r="7"/>
    <path d="M29 66 Q45 72 61 64"/>
  </svg>,
  // 03 契約締結 — handshake
  <svg key="03" viewBox="0 0 80 80" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 50 L26 34 Q32 28 40 32 L48 36 Q54 38 60 34 L70 26"/>
    <path d="M10 50 L18 58 L26 50"/>
    <path d="M70 26 L62 34 L54 42 L46 50 L38 58 L46 66 L62 50 L70 42 L70 26"/>
    <circle cx="22" cy="22" r="8"/><circle cx="58" cy="22" r="8"/>
  </svg>,
  // 04 人材を紹介 — globe + people
  <svg key="04" viewBox="0 0 80 80" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="40" cy="34" r="20"/>
    <ellipse cx="40" cy="34" rx="9" ry="20"/>
    <line x1="20" y1="34" x2="60" y2="34"/>
    <path d="M24 22 Q40 18 56 22"/><path d="M24 46 Q40 50 56 46"/>
    <circle cx="22" cy="66" r="6"/><circle cx="40" cy="68" r="6"/><circle cx="58" cy="66" r="6"/>
    <path d="M28 67 Q40 71 52 67"/>
  </svg>,
  // 05 書類選考/面接 — people at interview table
  <svg key="05" viewBox="0 0 80 80" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="44" width="64" height="5" rx="2.5"/>
    <circle cx="22" cy="32" r="7"/><circle cx="40" cy="32" r="7"/><circle cx="58" cy="32" r="7"/>
    <path d="M15 44 a7 7 0 0 1 14 0"/><path d="M33 44 a7 7 0 0 1 14 0"/><path d="M51 44 a7 7 0 0 1 14 0"/>
    <circle cx="40" cy="64" r="8"/>
    <path d="M32 70 Q40 74 48 70"/>
  </svg>,
  // 06 内定/入社 — person with stars
  <svg key="06" viewBox="0 0 80 80" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="40" cy="28" r="12"/>
    <path d="M24 68 a16 16 0 0 1 32 0"/>
    <polygon points="16,36 17.5,31 19,36 24,36 20,39 21.5,44 17.5,41 13.5,44 15,39 11,36" fill="rgba(255,255,255,0.4)" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2"/>
    <polygon points="64,36 65.5,31 67,36 72,36 68,39 69.5,44 65.5,41 61.5,44 63,39 59,36" fill="rgba(255,255,255,0.4)" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2"/>
    <polygon points="40,10 41.5,6 43,10 47,10 44,12.5 45,17 41,14 37,17 38,12.5 35,10" fill="rgba(255,255,255,0.5)" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2"/>
  </svg>,
];

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
      { num: "01", title: "Request",             body: "Contact us via the inquiry form or by phone." },
      { num: "02", title: "Consultation",        body: "We listen to your hiring requirements and recruitment plan." },
      { num: "03", title: "Contract",            body: "We sign an agreement and begin the formal placement process." },
      { num: "04", title: "Candidate Intro",     body: "We select candidates and submit their application documents." },
      { num: "05", title: "Screening / Interview", body: "We coordinate interview schedules, follow up, and notify candidates of results." },
      { num: "06", title: "Offer / Onboarding",  body: "We handle offer negotiations, post-hire follow-up, and operational support." },
    ],
  },
  VN: {
    sectionLabel: "Quy trình",
    intro: "Đây là quy trình giới thiệu nhân sự của chúng tôi.",
    steps: [
      { num: "01", title: "Yêu cầu Tuyển dụng",   body: "Liên hệ qua form hoặc điện thoại để gửi yêu cầu." },
      { num: "02", title: "Tư vấn",                body: "Chúng tôi lắng nghe yêu cầu và kế hoạch tuyển dụng của bạn." },
      { num: "03", title: "Ký Hợp đồng",           body: "Ký kết hợp đồng và bắt đầu quá trình giới thiệu nhân sự chính thức." },
      { num: "04", title: "Giới thiệu Ứng viên",   body: "Chúng tôi chọn lọc ứng viên phù hợp và gửi hồ sơ." },
      { num: "05", title: "Sàng lọc / Phỏng vấn", body: "Điều phối lịch phỏng vấn, theo dõi sau phỏng vấn và thông báo kết quả." },
      { num: "06", title: "Nhận việc / Onboarding", body: "Hỗ trợ đàm phán điều kiện, theo dõi sau khi nhận việc và hỗ trợ công việc." },
    ],
  },
};

const CARD_BG = ["#B8924A", "#AD8844", "#A37E3E", "#B8924A", "#AD8844", "#A37E3E"];

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

      <div className="flow-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
        {t.steps.map((step, i) => (
          <div key={step.num} style={{
            background: CARD_BG[i],
            borderRadius: "16px",
            padding: "36px 28px 28px",
            position: "relative",
            overflow: "hidden",
            minHeight: "220px",
            display: "flex",
            flexDirection: "column",
          }}>
            {/* Title */}
            <h3 style={{
              fontFamily: "'Noto Serif JP', serif",
              fontSize: "20px", fontWeight: 600,
              color: "#fff", marginBottom: "10px",
              position: "relative", zIndex: 2,
            }}>
              {step.title}
            </h3>
            {/* Body */}
            <p style={{
              fontSize: "13px", lineHeight: 1.9,
              color: "rgba(255,255,255,0.82)",
              position: "relative", zIndex: 2,
              flex: 1,
            }}>
              {step.body}
            </p>
            {/* Icon */}
            <div style={{
              position: "absolute", bottom: "24px", right: "16px",
              width: "80px", height: "80px",
              opacity: 0.9, zIndex: 2,
            }}>
              {STEP_ICONS[i]}
            </div>
            {/* Large number watermark */}
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "110px", fontWeight: 300,
              color: "rgba(255,255,255,0.12)",
              position: "absolute", bottom: "-20px", right: "8px",
              lineHeight: 1, fontStyle: "italic",
              zIndex: 1, userSelect: "none",
            }}>{step.num}</div>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 900px) { .flow-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 600px) { .flow-grid { grid-template-columns: 1fr !important; } #process { padding: 64px 24px !important; } }
      `}</style>
    </section>
  );
}
