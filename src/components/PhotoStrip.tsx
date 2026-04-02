"use client";
import { useLang } from "@/contexts/LangContext";

const PHOTOS = [
  { src: "/images/team-office-2.jpg", alt: "チーム作業風景" },
  { src: "/images/staff-support.jpg", alt: "スタッフサポート" },
  { src: "/images/office-meeting.jpg", alt: "ビジネスミーティング" },
  { src: "/images/team-office-1.jpg", alt: "オフィス作業" },
];

const LABELS = {
  JP: [
    { label: "チームワーク",      sub: "Team Work" },
    { label: "きめ細かいサポート", sub: "Dedicated Support" },
    { label: "日越連携",          sub: "Japan × Vietnam" },
    { label: "プロフェッショナル", sub: "Professional" },
  ],
  EN: [
    { label: "Teamwork",          sub: "Team Work" },
    { label: "Dedicated Support", sub: "Dedicated Support" },
    { label: "Japan × Vietnam",   sub: "Bilateral Partnership" },
    { label: "Professional",      sub: "Professional" },
  ],
  VN: [
    { label: "Làm việc Nhóm",     sub: "Team Work" },
    { label: "Hỗ trợ Tận tâm",    sub: "Dedicated Support" },
    { label: "Nhật × Việt",       sub: "Japan × Vietnam" },
    { label: "Chuyên nghiệp",     sub: "Professional" },
  ],
};

export default function PhotoStrip() {
  const { lang } = useLang();
  const labels = LABELS[lang];

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
      gap: "3px", height: "300px", overflow: "hidden",
    }} className="photo-strip">
      {PHOTOS.map((p, i) => (
        <div key={p.src} style={{ position: "relative", overflow: "hidden" }} className="photo-strip-item">
          <img
            src={p.src} alt={p.alt}
            style={{
              width: "100%", height: "100%", objectFit: "cover",
              transition: "transform 0.7s ease",
            }}
            className="photo-strip-img"
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(20,15,10,0.82) 0%, rgba(20,15,10,0.15) 55%, transparent 100%)",
          }} />
          <div style={{ position: "absolute", bottom: "20px", left: "22px" }}>
            <div style={{
              fontFamily: "'Noto Serif JP', serif",
              fontSize: "14px", letterSpacing: "1.5px",
              color: "rgba(250,247,242,0.95)", marginBottom: "4px", fontWeight: 400,
            }}>{labels[i].label}</div>
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "12px", letterSpacing: "2px",
              color: "rgba(184,150,62,0.8)", fontStyle: "italic",
            }}>{labels[i].sub}</div>
          </div>
        </div>
      ))}

      <style>{`
        .photo-strip-item:hover .photo-strip-img { transform: scale(1.05); }
        @media (max-width: 900px) {
          .photo-strip { grid-template-columns: 1fr 1fr !important; height: 380px !important; }
        }
        @media (max-width: 600px) {
          .photo-strip { grid-template-columns: 1fr 1fr !important; height: 300px !important; }
        }
      `}</style>
    </div>
  );
}
