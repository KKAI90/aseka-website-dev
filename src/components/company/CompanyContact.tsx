export default function CompanyContact() {
  return (
    <section id="contact" style={{ background: "#0E2233", padding: "100px 60px" }}>
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "64px", justifyContent: "center" }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "13px", color: "var(--gold)", letterSpacing: "2px" }}>05</span>
        <div style={{ width: "60px", height: "1px", background: "var(--gold)", opacity: 0.4, flexShrink: 0 }} />
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "11px", letterSpacing: "5px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Contact</span>
      </div>

      <p style={{
        fontFamily: "'Noto Serif JP', serif",
        fontSize: "22px", lineHeight: 2,
        color: "rgba(255,255,255,0.85)",
        textAlign: "center", marginBottom: "64px",
      }}>
        お仕事のご相談、質問等のお問い合わせは、<br />
        以下から該当の項目からお選びください。<br />
        <span style={{ fontSize: "16px", opacity: 0.6 }}>
          お問い合わせ内容の確認後、担当者よりご連絡させていただきます。
        </span>
      </p>

      <div className="contact-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Corporate */}
        <div className="contact-card" style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(184,150,62,0.3)",
          padding: "40px",
          display: "flex", justifyContent: "space-between",
          alignItems: "center", gap: "24px",
          transition: "background 0.3s",
        }}>
          <div>
            <h3 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "28px", color: "#D4AF6A",
              marginBottom: "8px",
            }}>法人の方</h3>
            <p style={{ fontSize: "13px", lineHeight: 1.8, color: "rgba(255,255,255,0.55)" }}>
              人材についてまた弊社業務インバウンドサービスなどの<br />
              お問い合わせはこちらのフォームへお進みください
            </p>
          </div>
          <a href="#" style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "14px 28px",
            border: "1px solid var(--gold)",
            color: "var(--gold)",
            fontSize: "12px", letterSpacing: "2px",
            cursor: "pointer", whiteSpace: "nowrap",
            textDecoration: "none",
            transition: "all 0.3s",
            flexShrink: 0,
          }} className="contact-btn">
            › 法人の方フォームへ
          </a>
        </div>

        {/* Job seekers */}
        <div className="contact-card" style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(184,150,62,0.3)",
          padding: "40px",
          display: "flex", justifyContent: "space-between",
          alignItems: "center", gap: "24px",
          transition: "background 0.3s",
        }}>
          <div>
            <h3 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "28px", color: "#D4AF6A",
              marginBottom: "8px",
            }}>求職者の方</h3>
            <p style={{ fontSize: "13px", lineHeight: 1.8, color: "rgba(255,255,255,0.55)" }}>
              求職されている方、弊社教育サービスなどへの<br />
              お問い合わせはこちらのフォームへお進みください
            </p>
          </div>
          <a href="/dang-ky" style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "14px 28px",
            border: "1px solid var(--gold)",
            color: "var(--gold)",
            fontSize: "12px", letterSpacing: "2px",
            cursor: "pointer", whiteSpace: "nowrap",
            textDecoration: "none",
            transition: "all 0.3s",
            flexShrink: 0,
          }} className="contact-btn">
            › 求職者の方フォームへ
          </a>
        </div>
      </div>

      <style>{`
        .contact-card:hover { background: rgba(255,255,255,0.1) !important; }
        .contact-btn:hover { background: var(--gold) !important; color: white !important; }
        @media (max-width: 900px) {
          .contact-grid { grid-template-columns: 1fr !important; }
          .contact-card { flex-direction: column !important; align-items: flex-start !important; }
          #contact { padding: 64px 24px !important; }
        }
      `}</style>
    </section>
  );
}
