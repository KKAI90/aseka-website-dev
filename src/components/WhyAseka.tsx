"use client";
import { useLang } from "@/contexts/LangContext";

const T = {
  JP: {
    eyebrow: "Why ASEKA",
    title: "なぜASEKAが選ばれるのか",
    sub: "日本とベトナムをつなぐ、3つの強み。",
    imgOverlay: "外国人材の定着率向上に向け、入社後のフォロー体制を整えています。ミスマッチを防ぎ、長期的な雇用につなげます。また、返金制度を設けているため、安心してご導入いただけます。",
    pillars: [
      {
        num: "01",
        icon: "◈",
        title: "20万人のSNSコミュニティ",
        desc: "創業者タオ氏が築いた20万人規模のベトナム人コミュニティ。意欲ある人材へ直接リーチできる、他社にはない圧倒的なネットワークです。",
        tag: "Community Network",
      },
      {
        num: "02",
        icon: "◈",
        title: "8,000件超の紹介実績",
        desc: "累計8,000件以上のマッチング実績。業種・在留資格・日本語レベルを熟知したコンサルタントが、ミスマッチゼロを目指します。",
        tag: "Track Record",
      },
      {
        num: "03",
        icon: "◈",
        title: "採用から定着まで一貫支援",
        desc: "求人紹介・ビザ申請・社会保険・生活サポートまで、外国人材が安心して働ける環境づくりをワンストップで提供します。",
        tag: "Full Support",
      },
    ],
  },
  EN: {
    eyebrow: "Why ASEKA",
    title: "Why Companies Choose ASEKA",
    sub: "Three pillars connecting Japan and Vietnam.",
    imgOverlay: "We provide thorough post-hire follow-up to improve retention of foreign talent, prevent mismatches, and build long-term employment. We also offer a refund policy for added peace of mind.",
    pillars: [
      {
        num: "01",
        icon: "◈",
        title: "200,000-Strong SNS Community",
        desc: "A vast Vietnamese community built by our founder Thao — giving us direct reach to motivated talent that no other agency can match.",
        tag: "Community Network",
      },
      {
        num: "02",
        icon: "◈",
        title: "8,000+ Successful Placements",
        desc: "Over 8,000 cumulative introductions across all industries. Our consultants know visa statuses, Japanese levels, and industries inside-out — minimizing mismatches.",
        tag: "Track Record",
      },
      {
        num: "03",
        icon: "◈",
        title: "End-to-End Support",
        desc: "From job placement to visa processing, pension support, and daily life assistance — we ensure every foreign worker can settle in and thrive.",
        tag: "Full Support",
      },
    ],
  },
  VN: {
    eyebrow: "Why ASEKA",
    title: "Tại sao chọn ASEKA?",
    sub: "Ba thế mạnh kết nối Nhật Bản và Việt Nam.",
    imgOverlay: "Chúng tôi xây dựng hệ thống hỗ trợ sau tuyển dụng nhằm nâng cao tỷ lệ gắn bó của nhân lực nước ngoài, ngăn chặn sự không phù hợp và hướng đến hợp đồng lao động dài hạn. Ngoài ra, chính sách hoàn tiền giúp doanh nghiệp yên tâm triển khai.",
    pillars: [
      {
        num: "01",
        icon: "◈",
        title: "Cộng đồng 200.000 người",
        desc: "Mạng lưới cộng đồng người Việt rộng lớn do Giám đốc Thảo xây dựng — tiếp cận trực tiếp nhân tài tiềm năng mà không công ty nào khác có được.",
        tag: "Community Network",
      },
      {
        num: "02",
        icon: "◈",
        title: "Hơn 8.000 hồ sơ thành công",
        desc: "Hơn 8.000 ca giới thiệu việc làm thành công. Chuyên viên tư vấn am hiểu tư cách lưu trú, trình độ tiếng Nhật và đặc thù ngành nghề — hạn chế tối đa sự không phù hợp.",
        tag: "Track Record",
      },
      {
        num: "03",
        icon: "◈",
        title: "Hỗ trợ toàn diện từ A–Z",
        desc: "Từ giới thiệu việc làm, xin visa, nenkin, bảo hiểm đến hỗ trợ cuộc sống hàng ngày — chúng tôi đồng hành để người lao động yên tâm làm việc.",
        tag: "Full Support",
      },
    ],
  },
};

export default function WhyAseka() {
  const { lang } = useLang();
  const t = T[lang];

  return (
    <section style={{ padding: "120px 60px", background: "#FAF7F2" }}>
      {/* Header */}
      <div style={{ maxWidth: "640px", marginBottom: "72px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
          <div style={{ width: "32px", height: "1px", background: "var(--gold)", opacity: 0.7 }} />
          <span style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "12px", letterSpacing: "5px",
            color: "var(--gold)", fontStyle: "italic", textTransform: "uppercase",
          }}>{t.eyebrow}</span>
        </div>
        <h2 style={{
          fontFamily: "'Noto Serif JP', serif",
          fontSize: "clamp(26px, 3.5vw, 42px)", fontWeight: 400,
          color: "var(--dark)", letterSpacing: "1px",
          marginBottom: "14px", lineHeight: 1.3,
        }}>{t.title}</h2>
        <p style={{
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: "14px", color: "var(--warm-gray)",
          letterSpacing: "0.5px",
        }}>{t.sub}</p>
      </div>

      {/* Pillars */}
      <div className="why-grid" style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
        gap: "2px",
      }}>
        {t.pillars.map((p, i) => (
          <div key={i} className="why-card" style={{
            background: "white",
            padding: "52px 44px",
            position: "relative", overflow: "hidden",
            borderTop: "3px solid transparent",
            transition: "border-color 0.4s, transform 0.3s",
          }}>
            {/* Large background number */}
            <div style={{
              position: "absolute", top: "-12px", right: "20px",
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "96px", fontWeight: 300,
              color: "var(--gold)", opacity: 0.055,
              lineHeight: 1, userSelect: "none",
            }}>{p.num}</div>

            {/* Icon */}
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "24px", color: "var(--gold)",
              marginBottom: "24px", opacity: 0.8,
            }}>{p.icon}</div>

            {/* Tag */}
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "11px", letterSpacing: "3px",
              color: "var(--gold)", fontStyle: "italic",
              marginBottom: "12px", textTransform: "uppercase",
            }}>{p.tag}</div>

            {/* Divider */}
            <div style={{ height: "1px", background: "rgba(184,150,62,0.2)", marginBottom: "20px" }} />

            {/* Title */}
            <h3 style={{
              fontFamily: "'Noto Serif JP', serif",
              fontSize: "19px", fontWeight: 400,
              color: "var(--dark)", letterSpacing: "0.5px",
              marginBottom: "16px", lineHeight: 1.4,
            }}>{p.title}</h3>

            {/* Description */}
            <p style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: "13.5px", lineHeight: 1.95,
              color: "#5a5550", letterSpacing: "0.02em",
            }}>{p.desc}</p>
          </div>
        ))}
      </div>

      {/* Image with overlay text */}
      <div style={{ marginTop: "64px", position: "relative", overflow: "hidden" }}>
        <img
          src="/images/staff-consult.jpg"
          alt="ASEKA support"
          style={{ width: "100%", height: "auto", display: "block", objectFit: "cover", objectPosition: "center center" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(10,20,35,0.78) 0%, rgba(10,20,35,0.45) 55%, rgba(10,20,35,0.15) 100%)" }} />
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center",
          padding: "0 64px",
        }}>
          <p style={{
            fontFamily: "'Noto Serif JP', serif",
            fontSize: "clamp(14px, 1.5vw, 17px)",
            lineHeight: 2.1,
            color: "rgba(250,247,242,0.92)",
            maxWidth: "600px",
            letterSpacing: "0.03em",
          }}>
            {t.imgOverlay}
          </p>
        </div>
      </div>

      <style>{`
        .why-card:hover { border-top-color: var(--gold) !important; transform: translateY(-4px); }
        @media (max-width: 900px) { .why-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 600px) { section { padding: 80px 24px !important; } }
      `}</style>
    </section>
  );
}
