const cards = [
  {
    letter: "A",
    tag: "AI → 人に愛",
    title: "人に愛",
    body: "私たちは、思いやりの心を持って、相手の身になって考え、人々の幸福に貢献します。",
  },
  {
    letter: "S",
    tag: "SEII → 仕事に誠実",
    title: "仕事に誠実",
    body: "私たちは、それぞれの個性・能力を認め合い、公正で透明な関わりで、企業活動に励みます。",
  },
  {
    letter: "K",
    tag: "KANSHA → 出会いに感謝",
    title: "出会いに感謝",
    body: "私たちは、多くの人々との出会いに感謝し、信頼をいただき、人間関係を構築します。",
  },
];

export default function Philosophy() {
  return (
    <section id="about" style={{ padding: "120px 60px", background: "var(--cream)" }}>
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "80px" }}>
        <span style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "13px", color: "var(--gold)", letterSpacing: "2px",
        }}>01</span>
        <div style={{ width: "60px", height: "1px", background: "var(--gold)", opacity: 0.4, flexShrink: 0 }} />
        <span style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "11px", letterSpacing: "5px",
          color: "var(--warm-gray)", textTransform: "uppercase",
        }}>Our Philosophy</span>
      </div>

      {/* Cards */}
      <div className="phil-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "2px" }}>
        {cards.map((card) => (
          <div key={card.letter} className="phil-card" style={{
            padding: "60px 48px",
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
            {/* Big letter watermark */}
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "48px", fontWeight: 300,
              color: "var(--gold)", opacity: 0.15,
              position: "absolute", top: "20px", right: "24px",
              letterSpacing: "-2px", lineHeight: 1,
            }}>
              {card.letter}
            </div>
            <span style={{
              display: "inline-block",
              fontSize: "10px", letterSpacing: "3px",
              color: "var(--gold)", textTransform: "uppercase",
              marginBottom: "20px",
              paddingBottom: "10px",
              borderBottom: "1px solid rgba(184,150,62,0.25)",
            }}>
              {card.tag}
            </span>
            <h3 style={{
              fontFamily: "'Noto Serif JP', serif",
              fontSize: "22px", fontWeight: 400,
              color: "var(--dark)", marginBottom: "20px",
              lineHeight: 1.4,
            }}>
              {card.title}
            </h3>
            <p style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: "14px", lineHeight: 2,
              color: "var(--warm-gray)",
            }}>
              {card.body}
            </p>
          </div>
        ))}
      </div>

      {/* ASEKA name block */}
      <div style={{
        marginTop: "60px",
        padding: "48px 60px",
        background: "var(--dark)",
        display: "flex", alignItems: "center", gap: "40px",
      }} className="aseka-name-block">
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "52px", fontWeight: 300,
          color: "var(--gold)", letterSpacing: "6px",
          flexShrink: 0,
        }}>
          ASEKA
        </div>
        <p style={{
          fontFamily: "'Noto Serif JP', serif",
          fontSize: "15px", lineHeight: 2,
          color: "rgba(250,247,242,0.7)",
        }}>
          以下3つの頭文字をとって、社名を{" "}
          <strong style={{ color: "var(--gold-light)" }}>ASEKA</strong>{" "}と命名しました。<br />
          <span style={{ fontSize: "13px", opacity: 0.6 }}>
            愛（AI）・誠実（SEII）・感謝（KANSHA）— 三つの想い、ひとつの名前に。
          </span>
        </p>
      </div>

      <style>{`
        .phil-card:hover { transform: translateY(-4px); }
        .phil-card:hover .phil-bar { transform: scaleX(1) !important; }
        @media (max-width: 900px) {
          .phil-grid { grid-template-columns: 1fr !important; }
          .aseka-name-block { flex-direction: column; gap: 20px !important; padding: 32px 24px !important; }
        }
        @media (max-width: 600px) {
          #about { padding: 80px 24px !important; }
        }
      `}</style>
    </section>
  );
}
