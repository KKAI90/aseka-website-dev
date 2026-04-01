const photos = [
  { src: "/images/team-office-2.jpg", alt: "チーム作業風景", label: "チームワーク" },
  { src: "/images/staff-support.jpg", alt: "スタッフサポート", label: "きめ細かいサポート" },
  { src: "/images/office-meeting.jpg", alt: "ビジネスミーティング", label: "日越連携" },
  { src: "/images/team-office-1.jpg", alt: "オフィス作業", label: "チームオフィス" },
];

export default function PhotoStrip() {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "3px",
      height: "280px",
      overflow: "hidden",
    }} className="photo-strip">
      {photos.map((p) => (
        <div key={p.src} style={{ position: "relative", overflow: "hidden" }}>
          <img
            src={p.src}
            alt={p.alt}
            style={{
              width: "100%", height: "100%",
              objectFit: "cover",
              transition: "transform 0.6s ease",
            }}
            className="photo-strip-img"
          />
          {/* Overlay */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(26,26,26,0.75) 0%, transparent 50%)",
          }} />
          {/* Label */}
          <div style={{
            position: "absolute", bottom: "16px", left: "20px",
            fontFamily: "'Noto Serif JP', serif",
            fontSize: "12px", letterSpacing: "2px",
            color: "rgba(250,247,242,0.85)",
          }}>
            {p.label}
          </div>
        </div>
      ))}

      <style>{`
        .photo-strip-img:hover { transform: scale(1.04); }
        @media (max-width: 900px) {
          .photo-strip { grid-template-columns: 1fr 1fr !important; height: 360px !important; }
        }
        @media (max-width: 600px) {
          .photo-strip { grid-template-columns: 1fr 1fr !important; height: 280px !important; }
        }
      `}</style>
    </div>
  );
}
