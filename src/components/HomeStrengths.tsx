"use client";
import Link from "next/link";
import { useLang } from "@/contexts/LangContext";

const T = {
  JP: {
    eyebrow: "ASEKAの強み",
    title: "選ばれる3つの理由",
    intro: "SNS23万人の独自ネットワークと日本語教育を強みに、人材の「集客・選定・定着」までを一貫して提供しています。これにより、「人材が集まらない」「採用しても定着しない」といった企業様の課題を解決します。",
    cta1: "最短即日で人材をご提案可能です",
    cta2: "まずはお気軽にご相談ください",
    ctaBtn: "問い合わせフォーム",
    strengths: [
      {
        num: "①",
        title: "圧倒的な集客力",
        desc: "SNS20万人のネットワークにより、意欲の高い人材が安定して集まります。他社では難しい母集団形成を実現しています。",
      },
      {
        num: "②",
        title: "即戦力人材のご紹介",
        desc: "日本語教育と選考により、入社後すぐに活躍できる人材をご紹介しています。",
      },
      {
        num: "③",
        title: "高い定着率の実現",
        desc: "入社前後のフォロー体制により、長期就業につながる採用を実現しています。",
      },
    ],
  },
  EN: {
    eyebrow: "ASEKA Strengths",
    title: "3 Reasons to Choose ASEKA",
    intro: "Leveraging our unique network of 230,000 SNS followers and Japanese language education, we provide end-to-end support for talent attraction, selection, and retention — solving the challenges of 'can't find people' and 'can't retain them'.",
    cta1: "We can propose candidates as quickly as same-day.",
    cta2: "Feel free to reach out for a free consultation.",
    ctaBtn: "Contact Form",
    strengths: [
      {
        num: "①",
        title: "Unmatched Talent Reach",
        desc: "Our 200,000-strong SNS network ensures a steady flow of motivated candidates — enabling talent pooling that other agencies simply cannot match.",
      },
      {
        num: "②",
        title: "Ready-to-Work Candidates",
        desc: "Through Japanese language training and rigorous screening, we introduce candidates who can contribute from day one.",
      },
      {
        num: "③",
        title: "High Retention Rates",
        desc: "Our pre- and post-hire follow-up system supports long-term employment, helping companies build stable, committed teams.",
      },
    ],
  },
  VN: {
    eyebrow: "Thế mạnh của ASEKA",
    title: "3 Lý Do Chọn ASEKA",
    intro: "Với mạng lưới 230.000 người trên mạng xã hội và thế mạnh giáo dục tiếng Nhật, chúng tôi cung cấp dịch vụ toàn diện từ thu hút, tuyển chọn đến giữ chân nhân tài — giải quyết bài toán \"không tuyển được người\" và \"tuyển xong lại nghỉ\".",
    cta1: "Chúng tôi có thể giới thiệu ứng viên ngay trong ngày.",
    cta2: "Hãy liên hệ để được tư vấn miễn phí.",
    ctaBtn: "Form liên hệ",
    strengths: [
      {
        num: "①",
        title: "Sức hút nhân tài vượt trội",
        desc: "Mạng lưới 200.000 người trên SNS giúp thu hút liên tục nguồn nhân lực có động lực cao — tạo lập nguồn ứng viên mà các công ty khác không thể đạt được.",
      },
      {
        num: "②",
        title: "Ứng viên sẵn sàng làm việc ngay",
        desc: "Qua đào tạo tiếng Nhật và quy trình tuyển chọn nghiêm ngặt, chúng tôi giới thiệu ứng viên có thể đóng góp ngay từ ngày đầu.",
      },
      {
        num: "③",
        title: "Tỷ lệ gắn bó cao",
        desc: "Hệ thống hỗ trợ trước và sau khi nhận việc giúp duy trì việc làm lâu dài, xây dựng đội ngũ ổn định cho doanh nghiệp.",
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
      <div style={{ textAlign: "center", marginBottom: "56px" }}>
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
          marginBottom: "28px",
        }}>{t.title}</h2>
        <div style={{ width: "48px", height: "2px", background: "var(--gold)", opacity: 0.5, margin: "0 auto 28px" }} />
        <p style={{
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: "clamp(13px, 1.3vw, 15px)",
          lineHeight: 2,
          color: "rgba(250,247,242,0.65)",
          maxWidth: "720px",
          margin: "0 auto",
          letterSpacing: "0.03em",
        }}>{t.intro}</p>
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


      <style>{`
        .strength-card:hover { border-top-color: var(--gold) !important; }
        @media (max-width: 900px) { .strengths-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 600px) { section { padding: 80px 24px 0 !important; } }
      `}</style>
    </section>
  );
}
