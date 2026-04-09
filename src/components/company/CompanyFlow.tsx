"use client";
import { useLang } from "@/contexts/LangContext";

/* ─── SVG icons matching the reference image ─── */
const sw: React.SVGProps<SVGSVGElement> = {
  viewBox: "0 0 100 100",
  fill: "none",
  stroke: "rgba(255,255,255,0.9)",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

// 01 Lightbulb + 3 people
const Icon01 = () => (
  <svg {...sw}>
    {/* bulb */}
    <path d="M50 6 C33 6 22 18 22 33 C22 44 28 52 37 56 L37 63 L63 63 L63 56 C72 52 78 44 78 33 C78 18 67 6 50 6Z"/>
    {/* base lines */}
    <line x1="37" y1="65" x2="63" y2="65"/><line x1="40" y1="69" x2="60" y2="69"/>
    {/* rays */}
    <line x1="50" y1="1" x2="50" y2="4"/>
    <line x1="27" y1="11" x2="23" y2="7"/>
    <line x1="73" y1="11" x2="77" y2="7"/>
    <line x1="14" y1="33" x2="19" y2="33"/>
    <line x1="86" y1="33" x2="81" y2="33"/>
    {/* 3 people */}
    <circle cx="18" cy="80" r="7"/><path d="M5 97 Q5 88 18 88 Q31 88 31 97"/>
    <circle cx="50" cy="80" r="7"/><path d="M37 97 Q37 88 50 88 Q63 88 63 97"/>
    <circle cx="82" cy="80" r="7"/><path d="M69 97 Q69 88 82 88 Q95 88 95 97"/>
  </svg>
);

// 02 Speech bubble + 3 people at table
const Icon02 = () => (
  <svg {...sw}>
    {/* bubble */}
    <rect x="8" y="4" width="84" height="40" rx="7"/>
    {/* 3 dots */}
    <circle cx="30" cy="24" r="4" fill="rgba(255,255,255,0.9)" stroke="none"/>
    <circle cx="50" cy="24" r="4" fill="rgba(255,255,255,0.9)" stroke="none"/>
    <circle cx="70" cy="24" r="4" fill="rgba(255,255,255,0.9)" stroke="none"/>
    {/* tail */}
    <path d="M10 38 L3 52 L19 46"/>
    {/* 3 people at table */}
    <circle cx="18" cy="63" r="7"/><path d="M5 80 Q5 71 18 71 Q31 71 31 80"/>
    <circle cx="50" cy="63" r="7"/><path d="M37 80 Q37 71 50 71 Q63 71 63 80"/>
    <circle cx="82" cy="63" r="7"/><path d="M69 80 Q69 71 82 71 Q95 71 95 80"/>
    {/* table */}
    <line x1="2" y1="83" x2="98" y2="83"/>
  </svg>
);

// 03 Handshake
const Icon03 = () => (
  <svg {...sw}>
    {/* left forearm */}
    <line x1="5" y1="82" x2="33" y2="57"/>
    {/* right forearm */}
    <line x1="95" y1="82" x2="67" y2="57"/>
    {/* left hand fingers (spreading upward) */}
    <line x1="33" y1="57" x2="29" y2="46"/>
    <line x1="33" y1="57" x2="35" y2="45"/>
    <line x1="33" y1="57" x2="40" y2="43"/>
    <line x1="33" y1="57" x2="45" y2="43"/>
    {/* right hand fingers */}
    <line x1="67" y1="57" x2="71" y2="46"/>
    <line x1="67" y1="57" x2="65" y2="45"/>
    <line x1="67" y1="57" x2="60" y2="43"/>
    <line x1="67" y1="57" x2="55" y2="43"/>
    {/* clasped grip area */}
    <path d="M29 46 Q32 38 40 36 Q50 33 60 36 Q68 38 71 46"/>
    <path d="M33 57 Q40 65 50 67 Q60 65 67 57"/>
  </svg>
);

// 04 Globe + 3 people
const Icon04 = () => (
  <svg {...sw}>
    {/* globe outer */}
    <circle cx="50" cy="34" r="27"/>
    {/* meridian */}
    <path d="M50 7 Q39 16 37 34 Q39 52 50 61 Q61 52 63 34 Q61 16 50 7"/>
    {/* equator */}
    <line x1="23" y1="34" x2="77" y2="34"/>
    {/* latitude curves */}
    <path d="M27 21 Q50 15 73 21"/>
    <path d="M26 47 Q50 53 74 47"/>
    {/* 3 people */}
    <circle cx="18" cy="78" r="6"/><path d="M6 94 Q6 85 18 85 Q30 85 30 94"/>
    <circle cx="50" cy="78" r="6"/><path d="M38 94 Q38 85 50 85 Q62 85 62 94"/>
    <circle cx="82" cy="78" r="6"/><path d="M70 94 Q70 85 82 85 Q94 85 94 94"/>
  </svg>
);

// 05 Interview: 3 interviewers (top) + 3 candidates (bottom)
const Icon05 = () => (
  <svg {...sw}>
    {/* top row – 3 interviewers */}
    <circle cx="24" cy="15" r="6"/><path d="M12 30 Q12 22 24 22 Q36 22 36 30"/>
    <circle cx="50" cy="15" r="6"/><path d="M38 30 Q38 22 50 22 Q62 22 62 30"/>
    <circle cx="76" cy="15" r="6"/><path d="M64 30 Q64 22 76 22 Q88 22 88 30"/>
    {/* top table */}
    <line x1="4" y1="33" x2="96" y2="33"/>
    {/* bottom row – 3 candidates */}
    <circle cx="24" cy="62" r="6"/><path d="M12 77 Q12 69 24 69 Q36 69 36 77"/>
    <circle cx="50" cy="62" r="6"/><path d="M38 77 Q38 69 50 69 Q62 69 62 77"/>
    <circle cx="76" cy="62" r="6"/><path d="M64 77 Q64 69 76 69 Q88 69 88 77"/>
    {/* bottom table */}
    <line x1="4" y1="80" x2="96" y2="80"/>
  </svg>
);

// 06 3 people + 3 stars
const Icon06 = () => (
  <svg {...sw}>
    {/* 3 people */}
    <circle cx="18" cy="20" r="7"/><path d="M5 37 Q5 28 18 28 Q31 28 31 37"/>
    <circle cx="50" cy="20" r="7"/><path d="M37 37 Q37 28 50 28 Q63 28 63 37"/>
    <circle cx="82" cy="20" r="7"/><path d="M69 37 Q69 28 82 28 Q95 28 95 37"/>
    {/* 3 stars (5-pointed) */}
    <polygon points="18,52 20,59 27,59 22,64 24,71 18,67 12,71 14,64 9,59 16,59" fill="rgba(255,255,255,0.25)"/>
    <polygon points="50,52 52,59 59,59 54,64 56,71 50,67 44,71 46,64 41,59 48,59" fill="rgba(255,255,255,0.25)"/>
    <polygon points="82,52 84,59 91,59 86,64 88,71 82,67 76,71 78,64 73,59 80,59" fill="rgba(255,255,255,0.25)"/>
  </svg>
);

const ICONS = [Icon01, Icon02, Icon03, Icon04, Icon05, Icon06];

/* ─── Translations ─── */
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

const CARD_COLOR = "#C4975A";

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

      <div className="flow-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
        {t.steps.map((step, i) => {
          const iconTop = i >= 3; // row 2: icon at top, text at bottom
          const IconComp = ICONS[i];
          return (
            <div key={step.num} style={{
              background: CARD_COLOR,
              borderRadius: "14px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              minHeight: "280px",
            }}>
              {/* ── Text block ── */}
              <div style={{
                order: iconTop ? 2 : 1,
                padding: iconTop ? "0 22px 22px" : "22px 22px 0",
                position: "relative",
                zIndex: 2,
              }}>
                <h3 style={{
                  fontFamily: "'Noto Sans JP', sans-serif",
                  fontSize: "18px", fontWeight: 700,
                  color: "#fff", marginBottom: "8px",
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontFamily: "'Noto Sans JP', sans-serif",
                  fontSize: "12px", lineHeight: 1.85,
                  color: "rgba(255,255,255,0.82)",
                }}>
                  {step.body}
                </p>
              </div>

              {/* ── Icon zone ── */}
              <div style={{
                order: iconTop ? 1 : 2,
                flex: 1,
                position: "relative",
                overflow: "hidden",
                minHeight: "160px",
              }}>
                {/* Large number watermark – left side */}
                <span style={{
                  position: "absolute",
                  left: "-4px",
                  bottom: iconTop ? "auto" : "-16px",
                  top: iconTop ? "-16px" : "auto",
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: "italic",
                  fontSize: "130px",
                  fontWeight: 300,
                  color: "rgba(255,255,255,0.18)",
                  lineHeight: 1,
                  userSelect: "none",
                  pointerEvents: "none",
                }}>
                  {step.num}
                </span>

                {/* SVG icon – right side, overlapping number */}
                <div style={{
                  position: "absolute",
                  right: "12px",
                  bottom: iconTop ? "auto" : "10px",
                  top: iconTop ? "10px" : "auto",
                  width: "100px",
                  height: "100px",
                }}>
                  <IconComp />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @media (max-width: 900px) { .flow-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 580px) { .flow-grid { grid-template-columns: 1fr !important; } #process { padding: 64px 24px !important; } }
      `}</style>
    </section>
  );
}
