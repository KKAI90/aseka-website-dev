export default function Hero() {
  return (
    <div style={{
      height: "100vh", position: "relative",
      display: "flex", alignItems: "flex-end",
      padding: "0 60px 80px",
      background: "linear-gradient(135deg, #1A1A1A 0%, #2C2423 50%, #1A1A1A 100%)",
      overflow: "hidden",
    }}>
      {/* Grid pattern */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent 80px, rgba(184,150,62,0.04) 80px, rgba(184,150,62,0.04) 81px),
          repeating-linear-gradient(90deg, transparent, transparent 80px, rgba(184,150,62,0.04) 80px, rgba(184,150,62,0.04) 81px)
        `,
      }} />

      {/* Photo collage — right side */}
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: "48%", height: "100%",
        display: "grid",
        gridTemplateRows: "1fr 1fr",
        gridTemplateColumns: "1fr 1fr",
        gap: "3px",
        zIndex: 0,
      }}>
        {/* Top: CEO at desk — spans both columns */}
        <div style={{ gridRow: "1", gridColumn: "1 / 3", overflow: "hidden", position: "relative" }}>
          <img
            src="/images/ceo-desk.jpg"
            alt="代表取締役"
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to right, #1A1A1A 0%, rgba(26,26,26,0.5) 40%, rgba(26,26,26,0.25) 100%)",
          }} />
        </div>
        {/* Bottom left: team Vietnam */}
        <div style={{ overflow: "hidden", position: "relative" }}>
          <img
            src="/images/team-office-1.jpg"
            alt="チームオフィス"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div style={{ position: "absolute", inset: 0, background: "rgba(26,26,26,0.55)" }} />
        </div>
        {/* Bottom right: business meeting */}
        <div style={{ overflow: "hidden", position: "relative" }}>
          <img
            src="/images/office-meeting.jpg"
            alt="ビジネスミーティング"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div style={{ position: "absolute", inset: 0, background: "rgba(26,26,26,0.55)" }} />
        </div>
      </div>

      {/* Left-side dark gradient over photos */}
      <div style={{
        position: "absolute", top: 0, left: 0,
        width: "60%", height: "100%",
        background: "linear-gradient(to right, #1A1A1A 55%, transparent 100%)",
        zIndex: 1,
      }} />

      {/* Gold accent */}
      <div style={{
        position: "absolute", top: 0, right: "48%",
        width: "20%", height: "100%",
        background: "linear-gradient(160deg, rgba(184,150,62,0.08) 0%, transparent 60%)",
        zIndex: 1,
      }} />

      {/* Vertical gold line */}
      <div style={{
        position: "absolute", left: "60px", top: 0, bottom: 0, zIndex: 2,
        width: "1px",
        background: "linear-gradient(to bottom, transparent, #B8963E, transparent)",
        opacity: 0.4,
      }} />

      {/* Main content */}
      <div style={{ position: "relative", zIndex: 3 }}>
        <span style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "13px", letterSpacing: "6px",
          color: "var(--gold)", marginBottom: "20px",
          display: "block", fontStyle: "italic",
        }}>
          私たちについて
        </span>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(64px, 10vw, 120px)",
          fontWeight: 300, lineHeight: 0.9,
          color: "#FAF7F2", letterSpacing: "-2px",
          margin: 0,
        }}>
          ABOUT
          <em style={{ fontStyle: "italic", color: "var(--gold-light)", display: "block" }}>US</em>
        </h1>
        <p style={{
          marginTop: "24px",
          fontFamily: "'Noto Serif JP', serif",
          fontSize: "15px", letterSpacing: "3px",
          color: "rgba(250,247,242,0.5)",
        }}>
          株式会社 ASEKA
        </p>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: "absolute", right: "60px", bottom: "80px", zIndex: 3,
        writingMode: "vertical-rl",
        fontSize: "10px", letterSpacing: "3px",
        color: "var(--gold)", opacity: 0.7,
        display: "flex", alignItems: "center", gap: "12px",
      }}>
        <div style={{
          width: "1px", height: "60px",
          background: "var(--gold)", opacity: 0.5,
          animation: "scrollLine 2s ease-in-out infinite",
        }} />
        SCROLL
      </div>

      <style>{`
        @keyframes scrollLine {
          0%, 100% { transform: scaleY(1); transform-origin: top; }
          50% { transform: scaleY(0.3); transform-origin: top; }
        }
        @media (max-width: 900px) {
          .hero-photo-collage { display: none !important; }
        }
      `}</style>
    </div>
  );
}
