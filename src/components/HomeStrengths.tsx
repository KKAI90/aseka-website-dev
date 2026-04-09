"use client";
import Link from "next/link";
import { useLang } from "@/contexts/LangContext";

const T = {
  JP: {
    eyebrow: "ASEKA の強み",
    title: "選ばれる3つの理由",
    cta1: "最短即日で人材をご提案可能です",
    cta2: "まずはお気軽にご相談ください",
    ctaBtn: "無料相談はこちら",
    strengths: [
      {
        num: "①",
        title: "20万人のSNSネットワーク",
        desc: "創業者タオ氏が築いたベトナム人コミュニティへ直接アクセス。他社にはない圧倒的なネットワークで、意欲ある即戦力人材を最短でご紹介します。",
      },
      {
        num: "②",
        title: "日本語教育×採用支援",
        desc: "N3以上の人材を中心に、日本語教育と採用をワンストップで提供。企業が求めるコミュニケーション能力を備えた人材だけをご紹介します。",
      },
      {
        num: "③",
        title: "入社後の定着サポート",
        desc: "ビザ・保険・生活サポートまで一貫対応。返金制度も完備しており、ミスマッチを防ぎながら長期的な雇用関係の構築を全力でバックアップします。",
      },
    ],
  },
  EN: {
    eyebrow: "ASEKA Strengths",
    title: "3 Reasons to Choose ASEKA",
    cta1: "We can propose candidates as quickly as same-day.",
    cta2: "Feel free to reach out for a free consultation.",
    ctaBtn: "Contact Us Free",
    strengths: [
      {
        num: "①",
        title: "200K SNS Network",
        desc: "Direct access to the Vietnamese community built by our founder Thao. An unmatched network that allows us to introduce motivated, ready-to-work talent faster than any competitor.",
      },
      {
        num: "②",
        title: "Language Training × Hiring",
        desc: "We provide both Japanese language education and recruitment in one package, focusing on N3+ candidates who meet the communication standards companies need.",
      },
      {
        num: "③",
        title: "Post-Hire Retention Support",
        desc: "Full support from visa processing to insurance and daily life assistance. With our refund policy, we prevent mismatches and back you up for long-term employment success.",
      },
    ],
  },
  VN: {
    eyebrow: "Thế mạnh của ASEKA",
    title: "3 Lý Do Chọn ASEKA",
    cta1: "Chúng tôi có thể giới thiệu ứng viên trong ngay hôm nay.",
    cta2: "Hãy liên hệ để được tư vấn miễn phí.",
    ctaBtn: "Tư vấn miễn phí",
    strengths: [
      {
        num: "①",
        title: "Mạng lưới 200.000 người",
        desc: "Tiếp cận trực tiếp cộng đồng người Việt do Giám đốc Thảo xây dựng — mạng lưới độc đáo giúp giới thiệu nhân tài sẵn sàng làm việc nhanh hơn bất kỳ đối thủ nào.",
      },
      {
        num: "②",
        title: "Đào tạo tiếng Nhật + Tuyển dụng",
        desc: "Dịch vụ giáo dục tiếng Nhật và tuyển dụng trọn gói, tập trung vào ứng viên N3 trở lên đáp ứng tiêu chuẩn giao tiếp doanh nghiệp yêu cầu.",
      },
      {
        num: "③",
        title: "Hỗ trợ định cư sau tuyển dụng",
        desc: "Hỗ trợ toàn diện từ visa, bảo hiểm đến cuộc sống hàng ngày. Chính sách hoàn tiền giúp ngăn sự không phù hợp và đảm bảo quan hệ lao động bền vững.",
      },
    ],
  },
};

export default function HomeStrengths() {
  const { lang } = useLang();
  const t = T[lang];

  return (
    <section style={{ background: "var(--dark)", padding: "100px 60px 0" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "72px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginBottom: "20px" }}>
          <div style={{ width: "48px", height: "1px", background: "var(--gold)", opacity: 0.5 }} />
          <span style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "12px", letterSpacing: "6px",
            color: "var(--gold)", fontStyle: "italic",
          }}>{t.eyebrow}</span>
          <div style={{ width: "48px", height: "1px", background: "var(--gold)", opacity: 0.5 }} />
        </div>
        <h2 style={{
          fontFamily: "'Noto Serif JP', serif",
          fontSize: "clamp(24px, 3vw, 38px)", fontWeight: 400,
          color: "#FAF7F2", letterSpacing: "2px",
        }}>{t.title}</h2>
        <div style={{ width: "48px", height: "2px", background: "var(--gold)", opacity: 0.5, margin: "20px auto 0" }} />
      </div>

      {/* Strengths grid */}
      <div className="strengths-grid" style={{
        maxWidth: "1100px", margin: "0 auto",
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
        gap: "1px", background: "rgba(184,150,62,0.12)",
      }}>
        {t.strengths.map((s, i) => (
          <div key={i} style={{
            background: "#0C1F2E",
            padding: "52px 40px",
            position: "relative",
            borderTop: "2px solid rgba(184,150,62,0.2)",
            transition: "border-color 0.3s",
          }}
          className="strength-card"
          >
            {/* Circled number */}
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "52px", fontWeight: 300,
              color: "var(--gold)",
              lineHeight: 1,
              marginBottom: "28px",
              opacity: 0.9,
            }}>{s.num}</div>

            {/* Title */}
            <h3 style={{
              fontFamily: "'Noto Serif JP', serif",
              fontSize: "18px", fontWeight: 600,
              color: "#FAF7F2",
              letterSpacing: "0.5px",
              marginBottom: "16px",
              lineHeight: 1.5,
            }}>{s.title}</h3>

            {/* Divider */}
            <div style={{ width: "32px", height: "1px", background: "var(--gold)", opacity: 0.45, marginBottom: "20px" }} />

            {/* Description */}
            <p style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: "13.5px", lineHeight: 2,
              color: "rgba(250,247,242,0.65)",
              letterSpacing: "0.02em",
            }}>{s.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA banner */}
      <div style={{
        marginTop: "80px",
        padding: "72px 60px",
        textAlign: "center",
        borderTop: "1px solid rgba(184,150,62,0.15)",
      }}>
        <p style={{
          fontFamily: "'Noto Serif JP', serif",
          fontSize: "clamp(18px, 2.5vw, 28px)", fontWeight: 400,
          color: "#FAF7F2",
          letterSpacing: "2px",
          marginBottom: "12px",
        }}>{t.cta1}</p>
        <p style={{
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: "14px",
          color: "rgba(250,247,242,0.55)",
          letterSpacing: "1px",
          marginBottom: "40px",
        }}>{t.cta2}</p>
        <Link href="/contact" style={{
          display: "inline-flex", alignItems: "center", gap: "10px",
          padding: "18px 52px",
          background: "var(--gold)",
          color: "#0C1F2E",
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: "13px", fontWeight: 600, letterSpacing: "2px",
          textDecoration: "none",
          transition: "opacity 0.3s",
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
        onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        >
          {t.ctaBtn} →
        </Link>
      </div>

      <style>{`
        .strength-card:hover { border-top-color: var(--gold) !important; }
        @media (max-width: 900px) { .strengths-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 600px) { section { padding: 80px 24px 0 !important; } }
      `}</style>
    </section>
  );
}
