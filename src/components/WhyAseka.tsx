"use client";
import Image from "next/image";
import { useLang } from "@/contexts/LangContext";

const T = {
  JP: {
    eyebrow: "Why ASEKA",
    title: "なぜASEKAが選ばれるのか",
    sub: "日本とベトナムをつなぐ、3つの強み。",
    imgOverlay: "外国人材の定着率向上に向け、入社後のフォロー体制を整えています。\nミスマッチを防ぎ、長期的な雇用につなげます。\nまた、返金制度を設けているため、安心してご導入いただけます。",
    pillars: [
      {
        num: "①",
        icon: "◈",
        title: "圧倒的な集客力",
        desc: "SNS21万人のネットワークにより、意欲の高い人材が安定して集まります。他社では難しい母集団形成を実現しています。",
        tag: "Talent Reach",
      },
      {
        num: "②",
        icon: "◈",
        title: "即戦力人材のご紹介",
        desc: "日本語教育と選考により、入社後すぐに活躍できる人材をご紹介しています。",
        tag: "Placement",
      },
      {
        num: "③",
        icon: "◈",
        title: "高い定着率の実現",
        desc: "入社前後のフォロー体制により、長期就業につながる採用を実現しています。",
        tag: "Retention",
      },
    ],
  },
  EN: {
    eyebrow: "Why ASEKA",
    title: "Why Companies Choose ASEKA",
    sub: "Three pillars connecting Japan and Vietnam.",
    imgOverlay: "We provide thorough post-hire follow-up to improve retention of foreign talent.\nWe help prevent mismatches and support long-term employment.\nWe also offer a refund policy for added peace of mind.",
    pillars: [
      {
        num: "①",
        icon: "◈",
        title: "Unmatched Talent Reach",
        desc: "Our 210,000-strong SNS network ensures a steady flow of motivated candidates — enabling talent pooling that other agencies simply cannot match.",
        tag: "Talent Reach",
      },
      {
        num: "②",
        icon: "◈",
        title: "Ready-to-Work Candidates",
        desc: "Through Japanese language training and rigorous screening, we introduce candidates who can contribute from day one.",
        tag: "Placement",
      },
      {
        num: "③",
        icon: "◈",
        title: "High Retention Rates",
        desc: "Our pre- and post-hire follow-up system supports long-term employment, helping companies build stable, committed teams.",
        tag: "Retention",
      },
    ],
  },
  VN: {
    eyebrow: "Why ASEKA",
    title: "Tại sao chọn ASEKA?",
    sub: "Ba thế mạnh kết nối Nhật Bản và Việt Nam.",
    imgOverlay: "Chúng tôi xây dựng hệ thống hỗ trợ sau tuyển dụng nhằm nâng cao tỷ lệ gắn bó của nhân lực nước ngoài.\nChúng tôi giúp ngăn chặn sự không phù hợp và hướng đến hợp đồng lao động dài hạn.\nNgoài ra, chính sách hoàn tiền giúp doanh nghiệp yên tâm triển khai.",
    pillars: [
      {
        num: "①",
        icon: "◈",
        title: "Sức hút nhân tài vượt trội",
        desc: "Mạng lưới 210.000 người trên SNS giúp thu hút liên tục nguồn nhân lực có động lực cao — tạo lập nguồn ứng viên mà các công ty khác không thể đạt được.",
        tag: "Talent Reach",
      },
      {
        num: "②",
        icon: "◈",
        title: "Ứng viên sẵn sàng làm việc ngay",
        desc: "Qua đào tạo tiếng Nhật và quy trình tuyển chọn nghiêm ngặt, chúng tôi giới thiệu ứng viên có thể đóng góp ngay từ ngày đầu.",
        tag: "Placement",
      },
      {
        num: "③",
        icon: "◈",
        title: "Tỷ lệ gắn bó cao",
        desc: "Hệ thống hỗ trợ trước và sau khi nhận việc giúp duy trì việc làm lâu dài, xây dựng đội ngũ ổn định cho doanh nghiệp.",
        tag: "Retention",
      },
    ],
  },
};

export default function WhyAseka() {
  const { lang } = useLang();
  const t = T[lang];

  return (
    <section style={{ background: "#FAF7F2", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "100px 60px 64px" }} className="why-header-wrap">
      <div style={{ maxWidth: "640px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
          <div style={{ width: "32px", height: "1px", background: "var(--gold)", opacity: 0.7 }} />
          <span style={{
            fontFamily: "'Noto Sans JP', sans-serif",
            fontSize: "12px", letterSpacing: "3px",
            color: "var(--gold)", fontStyle: "normal", textTransform: "uppercase",
          }}>{t.eyebrow}</span>
        </div>
        <h2 style={{
          fontFamily: "'Noto Serif JP', serif",
          fontSize: "clamp(26px, 3.5vw, 42px)", fontWeight: 400,
          color: "var(--dark)", letterSpacing: "1px",
          lineHeight: 1.3,
        }}>{t.title}</h2>
      </div>
      </div>

      {/* Image Quote Band */}
      <div style={{ position: "relative", height: "420px", overflow: "hidden" }} className="why-imgband">
        <Image
          src="/images/JPVN.jpg"
          alt="ASEKA support"
          fill
          style={{ objectFit: "cover", objectPosition: "center center" }}
        />
        {/* Dark gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to right, rgba(10,20,35,0.88) 0%, rgba(10,20,35,0.65) 55%, rgba(10,20,35,0.15) 100%)",
        }} />
        {/* Left gold bar */}
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: "4px",
          background: "linear-gradient(to bottom, transparent, var(--gold), transparent)",
        }} />
        {/* Text */}
        <div style={{
          position: "absolute", left: "80px", top: "50%",
          transform: "translateY(-50%)",
          maxWidth: "720px", zIndex: 1,
        }} className="why-imgband-text">
          <div style={{ width: "40px", height: "2px", background: "var(--gold)", marginBottom: "32px" }} />
          <p style={{
            fontFamily: "'Noto Serif JP', serif",
            fontSize: "clamp(15px, 1.5vw, 17px)",
            lineHeight: 2.3,
            color: "rgba(250,247,242,0.92)",
            letterSpacing: "0.04em",
            margin: 0,
            whiteSpace: "pre-line",
          }}>
            {t.imgOverlay}
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .why-header-wrap { padding: 72px 24px 48px !important; }
.why-imgband { height: 520px !important; }
          .why-imgband-text { left: 28px !important; right: 28px !important; max-width: 100% !important; }
        }
      `}</style>
    </section>
  );
}
