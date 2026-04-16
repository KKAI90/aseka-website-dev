"use client";
import Image from "next/image";

const PHOTOS = [
  { src: "/images/teamwork.jpg",      alt: "チーム作業風景",    pos: "center center",  scale: 1 },
  { src: "/images/ズェン.jpg",         alt: "スタッフサポート",  pos: "60% 40%",        scale: 1.45 },
  { src: "/images/JPVN.jpg",          alt: "ビジネスミーティング", pos: "center center", scale: 1 },
  { src: "/images/Professional.jpg",  alt: "オフィス作業",      pos: "center center",  scale: 1 },
];

export default function PhotoStrip() {

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
                style={{
                  objectFit: "cover",
                  objectPosition: p.pos,
                  transform: `scale(${p.scale})`,
                  transformOrigin: p.pos,
                  transition: "transform 0.8s ease",
                }}
                className="photo-strip-img"
              />
              {/* Gradient overlay */}
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to top, rgba(20,15,10,0.80) 0%, rgba(20,15,10,0.10) 55%, transparent 100%)",
              }} />
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
      `}</style>
    </div>
  );
}
