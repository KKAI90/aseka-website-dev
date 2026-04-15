"use client";
import Image from "next/image";
import { useLang } from "@/contexts/LangContext";

const T = {
  JP: {
    text: "SNS21万人の独自ネットワークと日本語教育を強みに、「集まらない」「定着しない」といった採用課題を解決します。",
    strong: "即戦力人材のご紹介から入社後の定着支援まで、一貫してサポートいたします。",
  },
  EN: {
    text: "Leveraging our 210,000-strong SNS network and Japanese language education, we solve the hiring challenges of 'can't attract' and 'can't retain' foreign talent.",
    strong: "From introducing ready-to-work candidates to post-hire retention support — we provide end-to-end service.",
  },
  VN: {
    text: "Với mạng lưới SNS 210.000 người và thế mạnh giáo dục tiếng Nhật, chúng tôi giải quyết bài toán \"không tuyển được\" và \"không giữ chân được\" nhân tài nước ngoài.",
    strong: "Từ giới thiệu ứng viên sẵn sàng làm việc đến hỗ trợ gắn bó sau tuyển dụng — chúng tôi đồng hành toàn diện.",
  },
};

export default function CompanyIntroBand() {
  const { lang } = useLang();
  const t = T[lang];

  return (
    <div style={{
      background: "#0E2233", padding: "60px",
      display: "flex", alignItems: "center", gap: "40px",
    }} className="intro-band">
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: "10px" }}>
        <Image
          src="/images/aseka-logo-icon.png"
          alt="ASEKA"
          width={52} height={52}
          style={{ objectFit: "contain", width: "52px", height: "52px" }}
        />
      </div>
      <p style={{
        fontFamily: "'Noto Serif JP', serif",
        fontSize: "clamp(16px, 2vw, 20px)",
        lineHeight: 1.8, color: "#fff", fontWeight: 300,
      }}>
        {t.text}<br />
        <strong style={{ color: "#D4AF6A" }}>{t.strong}</strong>
      </p>
      <style>{`
        @media (max-width: 900px) {
          .intro-band { padding: 40px 24px !important; flex-direction: column !important; gap: 20px !important; }
        }
      `}</style>
    </div>
  );
}
