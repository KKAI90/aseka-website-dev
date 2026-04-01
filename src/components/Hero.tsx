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
        position: "absolute", inset: 0,
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent 80px, rgba(184,150,62,0.04) 80px, rgba(184,150,62,0.04) 81px),
          repeating-linear-gradient(90deg, transparent, transparent 80px, rgba(184,150,62,0.04) 80px, rgba(184,150,62,0.04) 81px)
        `,
      }} />

      {/* Gold accent gradient */}
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: "45%", height: "100%",
        background: "linear-gradient(160deg, rgba(184,150,62,0.12) 0%, transparent 60%)",
      }} />

      {/* Vertical gold line */}
      <div style={{
        position: "absolute", left: "60px", top: 0, bottom: 0,
        width: "1px",
        background: "linear-gradient(to bottom, transparent, #B8963E, transparent)",
        opacity: 0.4,
      }} />

      {/* Main content */}
      <div style={{ position: "relative", zIndex: 2 }}>
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
        position: "absolute", right: "60px", bottom: "80px",
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
          .hero-inner { padding: 0 24px 60px !important; }
          .hero-line { left: 24px !important; }
          .hero-scroll { right: 24px !important; }
        }
      `}</style>
    </div>
  );
}
