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
    imgOverlay: "We provide thorough post-hire follow-up to improve retention of foreign talent.\nWe help prevent mismatches and support long-term employment.\nWe also offer a refund policy for added peace of mind.",
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
    imgOverlay: "Chúng tôi xây dựng hệ thống hỗ trợ sau tuyển dụng nhằm nâng cao tỷ lệ gắn bó của nhân lực nước ngoài.\nChúng tôi giúp ngăn chặn sự không phù hợp và hướng đến hợp đồng lao động dài hạn.\nNgoài ra, chính sách hoàn tiền giúp doanh nghiệp yên tâm triển khai.",
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
