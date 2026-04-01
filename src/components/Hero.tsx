export default function Hero() {
  return (
    <div style={{
      height: "100vh",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
    }}>

      {/* Background photo — full screen */}
      <img
        src="/images/team-office-1.jpg"
        alt="ASEKA Office"
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover",
          objectPosition: "center 30%",
        }}
      />

      {/* Subtle light overlay to soften photo */}
      <div style={{
        position: "absolute", inset: 0,
        background: "rgba(240,236,228,0.18)",
      }} />

      {/* Right-side gradient so text stays readable */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to left, rgba(250,247,242,0.72) 0%, rgba(250,247,242,0.18) 55%, transparent 100%)",
      }} />

      {/* Main text — right side */}
      <div style={{
        position: "relative", zIndex: 2,
        padding: "0 72px 0 0",
        maxWidth: "540px",
        textAlign: "right",
      }}>

        {/* Main title */}
        <h1 style={{
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: "clamp(52px, 7.5vw, 96px)",
          fontWeight: 700,
          color: "#0C1F2E",
          letterSpacing: "-1px",
          lineHeight: 1,
          margin: 0,
        }}>
          ABOUT US
        </h1>

        {/* Gold divider line */}
        <div style={{
          height: "3px",
          background: "linear-gradient(to left, var(--gold) 0%, rgba(184,150,62,0.15) 100%)",
          margin: "20px 0 18px",
          borderRadius: "2px",
        }} />

        {/* Japanese subtitle */}
        <p style={{
          fontFamily: "'Noto Serif JP', serif",
          fontSize: "17px",
          fontWeight: 400,
          color: "#1A2E3A",
          letterSpacing: "5px",
        }}>
          私たちについて
        </p>
      </div>

      {/* Scroll indicator — bottom center */}
      <div style={{
        position: "absolute", bottom: "36px", left: "50%",
        transform: "translateX(-50%)", zIndex: 3,
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: "8px",
      }}>
        <div style={{
          width: "1px", height: "52px",
          background: "linear-gradient(to bottom, var(--gold), transparent)",
          animation: "scrollLine 2s ease-in-out infinite",
        }} />
        <span style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "10px", letterSpacing: "4px",
          color: "var(--gold)", opacity: 0.7,
          fontStyle: "italic",
        }}>SCROLL</span>
      </div>

      <style>{`
        @keyframes scrollLine {
          0%, 100% { opacity: 1; transform: scaleY(1); transform-origin: top; }
          50%       { opacity: 0.4; transform: scaleY(0.4); transform-origin: top; }
        }
        @media (max-width: 900px) {
          .hero-text { padding: 0 32px 0 0 !important; max-width: 100% !important; }
        }
        @media (max-width: 600px) {
          .hero-text { text-align: center !important; padding: 0 24px !important; }
        }
      `}</style>
    </div>
  );
}
