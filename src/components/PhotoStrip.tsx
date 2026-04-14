"use client";
import Image from "next/image";
import { useLang } from "@/contexts/LangContext";

const PHOTOS = [
  { src: "/images/teamwork.jpg",      alt: "チーム作業風景" },
  { src: "/images/ズェン.jpg",         alt: "スタッフサポート" },
  { src: "/images/JPVN.jpg",          alt: "ビジネスミーティング" },
  { src: "/images/Professional.jpg",  alt: "オフィス作業" },
];

const LABELS = {
  JP: [
    { label: "チームワーク",       sub: "Team Work" },
    { label: "きめ細かいサポート",  sub: "Dedicated Support" },
    { label: "日越連携",           sub: "Japan × Vietnam" },
    { label: "プロフェッショナル",  sub: "Professional" },
  ],
  EN: [
    { label: "Teamwork",          sub: "Team Work" },
    { label: "Dedicated Support", sub: "Dedicated Support" },
    { label: "Japan × Vietnam",   sub: "Bilateral Partnership" },
    { label: "Professional",      sub: "Professional" },
  ],
  VN: [
    { label: "Làm việc Nhóm",    sub: "Team Work" },
    { label: "Hỗ trợ Tận tâm",   sub: "Dedicated Support" },
    { label: "Nhật × Việt",      sub: "Japan × Vietnam" },
    { label: "Chuyên nghiệp",    sub: "Professional" },
  ],
};

export default function PhotoStrip() {
  const { lang } = useLang();
  const labels = LABELS[lang];

  /* Duplicate for seamless infinite loop */
  const doubled = [...PHOTOS, ...PHOTOS];

  return (
    <div style={{ overflow: "hidden", height: "320px", position: "relative" }}>
      {/* Left fade edge */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: "80px", zIndex: 2,
        background: "linear-gradient(to right, var(--cream), transparent)",
        pointerEvents: "none",
      }} />
      {/* Right fade edge */}
      <div style={{
        position: "absolute", right: 0, top: 0, bottom: 0, width: "80px", zIndex: 2,
        background: "linear-gradient(to left, var(--cream), transparent)",
        pointerEvents: "none",
      }} />

      <div
        className="photo-track"
        style={{
          display: "flex",
          height: "100%",
          gap: "3px",
          width: "max-content",
          animation: "photoScroll 22s linear infinite",
        }}
      >
        {doubled.map((p, i) => {
          const idx = i % PHOTOS.length;
          return (
            <div
              key={i}
              className="photo-strip-item"
              style={{
                width: "380px",
                height: "100%",
                flexShrink: 0,
                position: "relative",
                overflow: "hidden",
                cursor: "default",
              }}
            >
              <Image
                src={p.src}
                alt={p.alt}
                fill
                style={{ objectFit: "cover", transition: "transform 0.8s ease" }}
                className="photo-strip-img"
              />
              {/* Gradient overlay */}
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to top, rgba(20,15,10,0.80) 0%, rgba(20,15,10,0.10) 55%, transparent 100%)",
              }} />
              {/* Label */}
              <div style={{ position: "absolute", bottom: "22px", left: "24px" }}>
                <div style={{
                  fontFamily: "'Noto Serif JP', serif",
                  fontSize: "14px", letterSpacing: "1.5px",
                  color: "rgba(250,247,242,0.95)", marginBottom: "4px", fontWeight: 400,
                }}>{labels[idx].label}</div>
                <div style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "12px", letterSpacing: "2px",
                  color: "rgba(184,150,62,0.85)", fontStyle: "italic",
                }}>{labels[idx].sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes photoScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .photo-track:hover { animation-play-state: paused; }
        .photo-strip-item:hover .photo-strip-img { transform: scale(1.06); }
      `}</style>
    </div>
  );
}
