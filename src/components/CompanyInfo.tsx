const rows: { label: string; value: string; href?: string; target?: string; span?: boolean }[] = [
  { label: "社名",        value: "株式会社ASEKA" },
  { label: "設立",        value: "2021年5月" },
  { label: "代表取締役",  value: "グェン ティラン タリ" },
  { label: "資本金",      value: "5,000,000円" },
  { label: "本社",        value: "〒101-0025 東京都千代田区神田佐久間町 3-27-3\nレーベンハークビル 5F" },
  { label: "従業員数",    value: "14名（役員・パート含む）" },
  { label: "連絡先",      value: "03-6231-9969", href: "tel:0362319969" },
  { label: "会社サイト",  value: "aseka.co.jp",  href: "http://aseka.co.jp", target: "_blank" },
  {
    label: "事業内容", span: true,
    value: "登録支援機関（登録番号：22登-007089）\n有料職業紹介事業（許可番号：13-ゆ-313472）\n人材育成サービス",
  },
  { label: "顧問",        value: "税理士法人大石会計事務所" },
  { label: "関係会社",    value: "株式会社THAO TOKYO（タオ トウキョウ）" },
  { label: "主要取引銀行", span: true, value: "三井住友銀行 新宿岩戸支店 / 松山信用金庫 本店" },
];

export default function CompanyInfo() {
  return (
    <section id="company" style={{ padding: "120px 60px", background: "var(--dark)" }}>

      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "72px" }}>
        <span style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "12px", color: "var(--gold)",
          letterSpacing: "3px", fontStyle: "italic",
        }}>03</span>
        <div style={{ width: "48px", height: "1px", background: "var(--gold)", opacity: 0.45, flexShrink: 0 }} />
        <span style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "12px", letterSpacing: "5px",
          color: "rgba(250,247,242,0.45)", textTransform: "uppercase",
        }}>Company Overview</span>
      </div>

      {/* Info grid */}
      <div className="info-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px" }}>
        {rows.map((row, i) => (
          <div key={i} style={{
            display: "flex",
            background: "rgba(255,255,255,0.04)",
            borderBottom: "1px solid rgba(184,150,62,0.1)",
            ...(row.span ? { gridColumn: "1 / -1" } : {}),
          }}>
            {/* Label */}
            <div style={{
              flexShrink: 0, width: "180px", padding: "22px 28px",
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: "12px", letterSpacing: "1.5px",
              color: "var(--gold)", fontWeight: 400,
              borderRight: "1px solid rgba(184,150,62,0.12)",
              display: "flex", alignItems: "center",
            }}>
              {row.label}
            </div>
            {/* Value */}
            <div style={{
              padding: "22px 32px",
              fontFamily: "'Noto Serif JP', serif",
              fontSize: "15px", lineHeight: 1.85,
              color: "rgba(250,247,242,0.85)",
              whiteSpace: "pre-line",
              display: "flex", alignItems: "center",
            }}>
              {row.href ? (
                <a href={row.href} target={row.target} style={{
                  color: "var(--gold-light)", textDecoration: "none",
                  borderBottom: "1px solid rgba(212,175,106,0.35)",
                  paddingBottom: "1px",
                }}>
                  {row.value}
                </a>
              ) : row.value}
            </div>
          </div>
        ))}
      </div>

      {/* Note */}
      <div style={{
        marginTop: "56px", padding: "40px 48px",
        border: "1px solid rgba(184,150,62,0.2)",
        display: "flex", gap: "24px", alignItems: "flex-start",
      }}>
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "28px", color: "var(--gold)",
          flexShrink: 0, lineHeight: 1, marginTop: "2px",
        }}>⊡</div>
        <p style={{
          fontFamily: "'Noto Serif JP', serif",
          fontSize: "14px", lineHeight: 1.95,
          color: "rgba(250,247,242,0.62)",
          letterSpacing: "0.02em",
        }}>
          株式会社ASEKAは、日本とベトナムをつなぐ人材支援のプロフェッショナルとして、<br />
          企業と求職者双方の夢の実現に貢献してまいります。
        </p>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .info-grid { grid-template-columns: 1fr !important; }
          .info-grid > div[style*="grid-column"] { grid-column: 1 !important; }
        }
        @media (max-width: 600px) {
          #company { padding: 80px 24px !important; }
        }
      `}</style>
    </section>
  );
}
