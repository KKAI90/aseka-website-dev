const cards = [
  {
    letter: "A",
    tag: "AI — 人に愛",
    title: "人に愛",
    body: "私たちは、思いやりの心を持って、相手の身になって考え、人々の幸福に貢献します。",
  },
  {
    letter: "S",
    tag: "SEII — 仕事に誠実",
    title: "仕事に誠実",
    body: "私たちは、それぞれの個性・能力を認め合い、公正で透明な関わりで、企業活動に励みます。",
  },
  {
    letter: "K",
    tag: "KANSHA — 出会いに感謝",
    title: "出会いに感謝",
    body: "私たちは、多くの人々との出会いに感謝し、信頼をいただき、人間関係を構築します。",
  },
];

export default function Philosophy() {
  return (
    <section id="about" style={{ padding: "120px 60px", background: "var(--cream)" }}>

      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "72px" }}>
        <span style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "12px", color: "var(--gold)",
          letterSpacing: "3px", fontStyle: "italic",
        }}>01</span>
        <div style={{ width: "48px", height: "1px", background: "var(--gold)", opacity: 0.45, flexShrink: 0 }} />
        <span style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "12px", letterSpacing: "5px",
          color: "var(--warm-gray)", textTransform: "uppercase",
        }}>Our Philosophy</span>
      </div>

      {/* Cards */}
      <div className="phil-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "2px" }}>
        {cards.map((card) => (
          <div key={card.letter} className="phil-card" style={{
            padding: "52px 44px",
            background: "white",
            position: "relative", overflow: "hidden",
            transition: "transform 0.4s ease",
          }}>
            {/* Hover top bar */}
            <div className="phil-bar" style={{
              position: "absolute", top: 0, left: 0, right: 0,
              height: "3px", background: "var(--gold)",
              transform: "scaleX(0)", transformOrigin: "left",
              transition: "transform 0.4s ease",
            }} />

            {/* Watermark letter */}
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "96px", fontWeight: 300,
              color: "var(--gold)", opacity: 0.07,
              position: "absolute", top: "-8px", right: "20px",
              letterSpacing: "-4px", lineHeight: 1,
              userSelect: "none",
            }}>
              {card.letter}
            </div>

            {/* Tag */}
            <span style={{
              display: "inline-block",
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "11px", letterSpacing: "3px",
              color: "var(--gold)", textTransform: "uppercase",
              marginBottom: "22px",
              paddingBottom: "14px",
              borderBottom: "1px solid rgba(184,150,62,0.3)",
            }}>
              {card.tag}
            </span>

            {/* Title */}
            <h3 style={{
              fontFamily: "'Noto Serif JP', serif",
              fontSize: "24px", fontWeight: 400,
              color: "var(--dark)", marginBottom: "18px",
              lineHeight: 1.35, letterSpacing: "1px",
            }}>
              {card.title}
            </h3>

            {/* Body */}
            <p style={{
              fontFamily: "'Noto Serif JP', serif",
              fontSize: "15px", lineHeight: 1.9,
              color: "#5a5550",
              letterSpacing: "0.02em",
            }}>
              {card.body}
            </p>
          </div>
        ))}
      </div>

      {/* ASEKA name block */}
      <div style={{
        marginTop: "3px",
        padding: "52px 60px",
        background: "var(--dark)",
        display: "flex", alignItems: "center", gap: "48px",
      }} className="aseka-name-block">
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "48px", fontWeight: 300,
          color: "var(--gold)", letterSpacing: "8px",
          flexShrink: 0, lineHeight: 1,
        }}>
          ASEKA
        </div>
        <div>
          <p style={{
            fontFamily: "'Noto Serif JP', serif",
            fontSize: "16px", lineHeight: 1.85,
            color: "rgba(250,247,242,0.82)",
            marginBottom: "10px",
          }}>
            以下3つの頭文字をとって、社名を{" "}
            <strong style={{ color: "var(--gold-light)", fontWeight: 500 }}>ASEKA</strong>{" "}と命名しました。
          </p>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "14px", letterSpacing: "2px",
            color: "rgba(250,247,242,0.45)",
            fontStyle: "italic",
          }}>
            愛（AI）· 誠実（SEII）· 感謝（KANSHA）
          </p>
        </div>
      </div>

      <style>{`
        .phil-card:hover { transform: translateY(-4px); }
        .phil-card:hover .phil-bar { transform: scaleX(1) !important; }
        @media (max-width: 900px) {
          .phil-grid { grid-template-columns: 1fr !important; }
          .aseka-name-block { flex-direction: column !important; gap: 24px !important; padding: 40px 28px !important; }
        }
        @media (max-width: 600px) {
          #about { padding: 80px 24px !important; }
        }
      `}</style>
    </section>
  );
}
