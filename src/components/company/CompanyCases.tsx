const cases = [
  {
    title: "高度人材（IT）",
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="#B8963E">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    ),
    items: [
      "北海道在住・26歳男性",
      "年収：380万円 ／ ポジション：プログラマー",
      "経験：2年間は業務管理システムをC#・Javaで機能開発〜テスト、3年間はカーナビの設計書作成・C#で機能開発・テスト",
      "日本語レベル：N2（中級）",
    ],
  },
  {
    title: "高度人材（建設）",
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="#B8963E">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
      </svg>
    ),
    items: [
      "中国・韓国在住・29歳男性",
      "年収：440万円",
      "経験：2年間の太陽光パネル設置工事、5年間の高層ビル電気設備工事及び現場管理",
      "日本語レベル：N1（上級）",
      "資格：第1種電気工事士取得済、中型運転許可取得済",
    ],
  },
  {
    title: "高度人材（商系）",
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="#B8963E">
        <path d="M20 6h-2.18c.07-.44.18-.88.18-1.34C18 2.54 15.46 0 12.34 0c-1.72 0-3.24.86-4.2 2.16L12 6H20zm-8.34-4c1.64 0 2.84 1.19 2.84 2.66 0 .46-.1.9-.18 1.34H9.18c-.08-.44-.18-.88-.18-1.34C9 3.19 10.2 2 11.66 2zM4 6l3.77-3.77C7.06 1.46 6.28 1 5.38 1 3.51 1 2 2.51 2 4.38c0 .75.25 1.5.63 2.13L4 6zm0 2l-1.5 2H22l-1.5-2H4zM2 20c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-9H2v9z"/>
      </svg>
    ),
    items: [
      "関東在住・32歳男性",
      "年収：520万円 ／ ポジション：営業職",
      "経験：物川会社で8年間、BtoB営業を経験",
      "日本語レベル：N1（ビジネス）",
      "英語レベル：TOEIC 940点",
    ],
  },
  {
    title: "特定技能人材（介護）",
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="#B8963E">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    ),
    items: [
      "関西在住・23歳女性",
      "年収：300万円 ／ ポジション：介護スタッフ",
      "経験：3年間実習生として勤務",
      "日本語レベル：N2（中級）",
      "資格：介護福祉士資格取得に向け勉強中",
    ],
  },
];

export default function CompanyCases() {
  return (
    <section id="cases" style={{ padding: "100px 60px", background: "var(--cream)" }}>
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "64px" }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "13px", color: "var(--gold)", letterSpacing: "2px" }}>03</span>
        <div style={{ width: "60px", height: "1px", background: "var(--gold)", opacity: 0.4, flexShrink: 0 }} />
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "11px", letterSpacing: "5px", color: "var(--warm-gray)", textTransform: "uppercase" }}>Case Studies</span>
      </div>

      <p style={{
        fontFamily: "'Noto Serif JP', serif",
        fontSize: "22px", letterSpacing: "2px",
        color: "var(--dark)", marginBottom: "48px", textAlign: "center",
      }}>
        紹介事例
      </p>

      <div className="cases-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {cases.map((c) => (
          <div key={c.title} className="case-card" style={{
            background: "white", padding: "36px",
            border: "1px solid rgba(0,0,0,0.07)",
            borderTop: "3px solid var(--gold)",
            transition: "transform 0.3s, box-shadow 0.3s",
          }}>
            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", gap: "20px",
              marginBottom: "24px", paddingBottom: "20px",
              borderBottom: "1px solid var(--border)",
            }}>
              <div style={{
                width: "56px", height: "56px",
                background: "#0E2233", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                {c.icon}
              </div>
              <div style={{
                fontFamily: "'Noto Serif JP', serif",
                fontSize: "18px", color: "#0E2233",
              }}>
                {c.title}
              </div>
            </div>
            {/* Items */}
            {c.items.map((item, i) => (
              <div key={i} style={{
                display: "flex", gap: "12px",
                marginBottom: "10px",
                fontSize: "14px", lineHeight: 1.7, color: "#555",
              }}>
                <span style={{ color: "var(--gold)", flexShrink: 0 }}>›</span>
                {item}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Refund note */}
      <div style={{
        marginTop: "40px", padding: "28px 36px",
        background: "#0E2233",
        borderLeft: "4px solid var(--gold)",
      }}>
        <p style={{
          fontFamily: "'Noto Serif JP', serif",
          fontSize: "15px", lineHeight: 2,
          color: "rgba(255,255,255,0.8)",
        }}>
          ※弊社では、求職者の早期離職が発生した際に、紹介手数料の一部をご返還する
          <strong style={{ color: "#D4AF6A" }}>「返還規定」</strong>を設けています。
        </p>
      </div>

      <style>{`
        .case-card:hover { transform: translateY(-4px) !important; box-shadow: 0 12px 40px rgba(0,0,0,0.08) !important; }
        @media (max-width: 900px) {
          .cases-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          #cases { padding: 64px 24px !important; }
        }
      `}</style>
    </section>
  );
}
