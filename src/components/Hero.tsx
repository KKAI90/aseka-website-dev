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

      {/* Photo panel — right side, 2 photos stacked */}
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: "46%", height: "100%",
        display: "grid",
        gridTemplateRows: "62% 38%",
        gap: "3px",
        zIndex: 0,
      }}>
        <div style={{ overflow: "hidden", position: "relative" }}>
          <img
            src="/images/ceo-desk.jpg"
            alt="代表取締役"
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%" }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to right, #1A1A1A 0%, rgba(26,26,26,0.45) 35%, rgba(26,26,26,0.2) 100%)",
          }} />
        </div>
        <div style={{ overflow: "hidden", position: "relative" }}>
          <img
            src="/images/team-office-1.jpg"
            alt="チームオフィス"
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to right, #1A1A1A 0%, rgba(26,26,26,0.4) 35%, rgba(26,26,26,0.15) 100%)",
          }} />
        </div>
      </div>

      {/* Left-side dark gradient */}
      <div style={{
        position: "absolute", top: 0, left: 0,
        width: "60%", height: "100%",
        background: "linear-gradient(to right, #1A1A1A 55%, transparent 100%)",
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
        {/* Eyebrow */}
        <span style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "14px", letterSpacing: "6px",
          color: "var(--gold)", marginBottom: "24px",
          display: "block", fontStyle: "italic",
        }}>
          私たちについて
        </span>

        {/* Main title */}
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(72px, 10vw, 124px)",
          fontWeight: 300, lineHeight: 0.88,
          color: "#FAF7F2", letterSpacing: "-2px",
          margin: 0,
        }}>
          ABOUT
          <em style={{ fontStyle: "italic", color: "var(--gold-light)", display: "block" }}>US</em>
        </h1>

        {/* Divider */}
        <div style={{
          width: "48px", height: "1px",
          background: "var(--gold)", opacity: 0.5,
          margin: "28px 0",
        }} />

        {/* Subtitle */}
        <p style={{
          fontFamily: "'Noto Serif JP', serif",
          fontSize: "13px", letterSpacing: "4px",
          color: "rgba(250,247,242,0.65)",
          fontWeight: 300,
        }}>
          株式会社 ASEKA
        </p>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: "absolute", right: "60px", bottom: "80px", zIndex: 3,
        writingMode: "vertical-rl",
        fontSize: "10px", letterSpacing: "4px",
        color: "var(--gold)", opacity: 0.7,
        display: "flex", alignItems: "center", gap: "12px",
        fontFamily: "'Cormorant Garamond', serif",
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
      `}</style>
    </div>
  );
}
