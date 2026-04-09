"use client";
import { useLang } from "@/contexts/LangContext";

const SERVICES = {
  JP: [
    {
      num: "01",
      title: "高度人材紹介",
      sub: "Highly Skilled Placement",
      desc: "IT・建設・商系など、特定活動46号の在留資格を持つ日本語堪能な高度人材を紹介。JLPT N1〜N2保持者多数。",
      icon: "👔",
    },
    {
      num: "02",
      title: "特定技能紹介・支援",
      sub: "Specified Skilled Workers",
      desc: "全14業種対応。JLPT N4〜N1の求職者を多数ご用意。累計紹介実績8,000件のノウハウでミスマッチを防ぎます。",
      icon: "🏭",
    },
    {
      num: "03",
      title: "日本語教育",
      sub: "Japanese Language Training",
      desc: "THAO TOKYOオンライン日本語スクール運営。試験対策・ビジネス日本語・面接対策まで幅広く対応。",
      icon: "📚",
    },
  ],
  EN: [
    {
      num: "01",
      title: "Skilled Personnel Placement",
      sub: "高度人材紹介",
      desc: "We introduce foreign professionals fluent in Japanese with Specified Activity No. 46 status — across IT, construction, business, and more. Many hold JLPT N1–N2.",
      icon: "👔",
    },
    {
      num: "02",
      title: "Specified Skilled Workers",
      sub: "特定技能紹介・支援",
      desc: "We support all 14 specified skill industries. With 8,000+ cumulative introductions and JLPT N4–N1 candidates on hand, we minimize mismatches.",
      icon: "🏭",
    },
    {
      num: "03",
      title: "Japanese Language Education",
      sub: "日本語教育",
      desc: "We operate THAO TOKYO Online Japanese School — covering exam prep, business Japanese, and interview coaching for Vietnamese learners.",
      icon: "📚",
    },
  ],
  VN: [
    {
      num: "01",
      title: "Giới thiệu Nhân tài Cao cấp",
      sub: "高度人材紹介",
      desc: "Giới thiệu người nước ngoài thành thạo tiếng Nhật có tư cách lưu trú Hoạt động Chỉ định số 46, trong lĩnh vực IT, xây dựng, kinh doanh. Nhiều ứng viên JLPT N1–N2.",
      icon: "👔",
    },
    {
      num: "02",
      title: "Lao động Kỹ năng Đặc định",
      sub: "特定技能紹介・支援",
      desc: "Hỗ trợ toàn bộ 14 ngành nghề kỹ năng đặc định. Với hơn 8.000 hồ sơ đã giới thiệu và ứng viên JLPT N4–N1 sẵn có, chúng tôi giảm thiểu tình trạng không phù hợp.",
      icon: "🏭",
    },
    {
      num: "03",
      title: "Giáo dục Tiếng Nhật",
      sub: "日本語教育",
      desc: "Vận hành Trường Tiếng Nhật Trực tuyến THAO TOKYO — bao gồm luyện thi, tiếng Nhật thương mại và luyện phỏng vấn cho người học Việt Nam.",
      icon: "📚",
    },
  ],
};

const HEADER = {
  JP: { eyebrow: "Our Services", title: "ASEKAのサービス", sub: "人材紹介から生活サポートまで、ワンストップで対応します。" },
  EN: { eyebrow: "Our Services", title: "What We Offer", sub: "From HR placement to daily life support — we handle it all." },
  VN: { eyebrow: "Dịch vụ của chúng tôi", title: "Chúng tôi cung cấp gì?", sub: "Từ giới thiệu nhân sự đến hỗ trợ cuộc sống — tất cả trong một." },
};

export default function Services() {
  const { lang } = useLang();
  const t = HEADER[lang];
  const services = SERVICES[lang];

  return (
    <section id="services" style={{ padding: "120px 60px", background: "var(--cream)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "24px" }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "12px", color: "var(--gold)", letterSpacing: "3px", fontStyle: "italic" }}>—</span>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "12px", letterSpacing: "5px", color: "var(--warm-gray)", textTransform: "uppercase" }}>{t.eyebrow}</span>
      </div>
      <h2 style={{
        fontFamily: "'Noto Serif JP', serif",
        fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 400,
        color: "var(--dark)", marginBottom: "12px", letterSpacing: "1px",
      }}>{t.title}</h2>
      <p style={{
        fontFamily: "'Noto Sans JP', sans-serif",
        fontSize: "14px", color: "var(--warm-gray)",
        marginBottom: "72px", letterSpacing: "0.5px",
      }}>{t.sub}</p>

      {/* Service cards */}
      <div className="services-grid" style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "2px",
      }}>
        {services.map((s) => (
          <div key={s.num} className="service-card" style={{
            background: "white",
            padding: "44px 40px",
            position: "relative", overflow: "hidden",
            transition: "transform 0.3s",
            cursor: "default",
          }}>
            {/* Top border on hover */}
            <div className="service-bar" style={{
              position: "absolute", top: 0, left: 0, right: 0,
              height: "3px", background: "var(--gold)",
              transform: "scaleX(0)", transformOrigin: "left",
              transition: "transform 0.4s ease",
            }} />

            {/* Number */}
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "72px", fontWeight: 300,
              color: "var(--gold)", opacity: 0.07,
              position: "absolute", top: "-8px", right: "16px",
              lineHeight: 1, userSelect: "none",
            }}>{s.num}</div>

            {/* Icon */}
            <div style={{
              fontSize: "28px", marginBottom: "20px", lineHeight: 1,
            }}>{s.icon}</div>

            {/* Title */}
            <h3 style={{
              fontFamily: "'Noto Serif JP', serif",
              fontSize: "18px", fontWeight: 400,
              color: "var(--dark)", marginBottom: "6px",
              letterSpacing: "0.5px",
            }}>{s.title}</h3>

            {/* Sub */}
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "12px", letterSpacing: "2px",
              color: "var(--gold)", marginBottom: "18px",
              fontStyle: "italic",
            }}>{s.sub}</p>

            {/* Divider */}
            <div style={{ height: "1px", background: "rgba(184,150,62,0.2)", marginBottom: "18px" }} />

            {/* Desc */}
            <p style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: "13.5px", lineHeight: 1.85,
              color: "#5a5550", letterSpacing: "0.02em",
            }}>{s.desc}</p>
          </div>
        ))}
      </div>

      <style>{`
        .service-card:hover { transform: translateY(-4px); }
        .service-card:hover .service-bar { transform: scaleX(1) !important; }
        @media (max-width: 1000px) { .services-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 600px) {
          .services-grid { grid-template-columns: 1fr !important; }
          #services { padding: 80px 24px !important; }
        }
      `}</style>
    </section>
  );
}
