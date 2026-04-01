export default function CompanyHero() {
  return (
    <div style={{
      height: "100vh", position: "relative",
      display: "flex", alignItems: "flex-end",
      padding: "0 60px 80px",
      overflow: "hidden",
    }}>
      {/* Background image */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "url('/images/hero-vietnam.jpg')",
        backgroundSize: "cover", backgroundPosition: "center",
      }} />
      {/* Dark overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to right, rgba(14,34,51,0.88) 40%, rgba(14,34,51,0.45) 100%)",
      }} />

      {/* Vertical gold line */}
      <div style={{
        position: "absolute", left: "60px", top: 0, bottom: 0,
        width: "1px",
        background: "linear-gradient(to bottom, transparent, #B8963E, transparent)",
        opacity: 0.4, zIndex: 1,
      }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <span style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "13px", letterSpacing: "6px",
          color: "var(--gold)", marginBottom: "20px",
          display: "block", fontStyle: "italic",
        }}>
          事業内容
        </span>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(64px, 10vw, 120px)",
          fontWeight: 300, lineHeight: 0.9,
          color: "#FAF7F2", letterSpacing: "-2px",
          margin: 0,
        }}>
          COM
          <em style={{ fontStyle: "italic", color: "var(--gold-light)", display: "block" }}>PANY</em>
        </h1>
        <p style={{
          marginTop: "24px",
          fontFamily: "'Noto Serif JP', serif",
          fontSize: "15px", letterSpacing: "3px",
          color: "rgba(250,247,242,0.55)",
        }}>
          株式会社 ASEKA
        </p>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: "absolute", right: "60px", bottom: "80px", zIndex: 2,
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
        @media (max-width: 600px) {
          .company-hero { padding: 0 24px 60px !important; }
        }
      `}</style>
    </div>
  );
}
