const steps = [
  { num: "01", title: "求人のご依頼", body: "お問い合わせフォームまたはお電話でご依頼ください。" },
  { num: "02", title: "打ち合わせ", body: "採用要件・計画のヒアリングをします。" },
  { num: "03", title: "契約締結", body: "契約を締結し、本格的に人材を紹介する流れに入ります。" },
  { num: "04", title: "人材をご紹介", body: "採用候補者の人選・応募書類を提出します。" },
  { num: "05", title: "書類選考・面接", body: "面接日調整・設定、面接後のフォロー、求職者への合否連絡もします。" },
  { num: "06", title: "内定・入社", body: "条件交渉・入社後フォローもします。業務支援を行います。" },
];

export default function CompanyFlow() {
  return (
    <section id="process" style={{ padding: "100px 60px", background: "white" }}>
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "64px" }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "13px", color: "var(--gold)", letterSpacing: "2px" }}>02</span>
        <div style={{ width: "60px", height: "1px", background: "var(--gold)", opacity: 0.4, flexShrink: 0 }} />
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "11px", letterSpacing: "5px", color: "var(--warm-gray)", textTransform: "uppercase" }}>Process</span>
      </div>

      <p style={{
        fontFamily: "'Noto Serif JP', serif",
        fontSize: "22px", letterSpacing: "2px",
        color: "var(--dark)", marginBottom: "48px", textAlign: "center",
      }}>
        紹介の流れはこのようになっています。
      </p>

      <div className="flow-grid" style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "3px",
      }}>
        {steps.map((step, i) => (
          <div key={step.num} style={{
            background: i % 2 === 0 ? "#C4975A" : "#b5894e",
            padding: "48px 36px",
            position: "relative", overflow: "hidden",
          }}>
            {/* Big watermark number */}
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "80px", fontWeight: 300,
              color: "rgba(255,255,255,0.15)",
              position: "absolute", bottom: "-10px", right: "16px",
              lineHeight: 1, fontStyle: "italic",
            }}>
              {step.num}
            </div>
            <h3 style={{
              fontFamily: "'Noto Serif JP', serif",
              fontSize: "20px", fontWeight: 400,
              color: "#fff", marginBottom: "12px",
              position: "relative", zIndex: 1,
            }}>
              {step.title}
            </h3>
            <p style={{
              fontSize: "13px", lineHeight: 2,
              color: "rgba(255,255,255,0.8)",
              position: "relative", zIndex: 1,
            }}>
              {step.body}
            </p>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .flow-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          #process { padding: 64px 24px !important; }
        }
      `}</style>
    </section>
  );
}
