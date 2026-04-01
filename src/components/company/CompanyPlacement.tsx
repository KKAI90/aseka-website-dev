const highSkillJobs = [
  "ITエンジニア（システムエンジニア）", "プログラマー", "橋梁システムエンジニア",
  "機械設計・自動車設計", "自動車解析", "Auto CAD・BIMオペレーター",
  "施工管理", "事務・営業", "翻訳・通訳", "ホテルスタッフ", "マーケティング",
];

const tokuteiJobs = [
  "介護", "飲食料品製造業", "外食業", "素形材産業", "産業機械製造業",
];

export default function CompanyPlacement() {
  return (
    <section id="placement" style={{ padding: "100px 60px", background: "var(--cream)" }}>
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "64px" }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "13px", color: "var(--gold)", letterSpacing: "2px" }}>01</span>
        <div style={{ width: "60px", height: "1px", background: "var(--gold)", opacity: 0.4, flexShrink: 0 }} />
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "11px", letterSpacing: "5px", color: "var(--warm-gray)", textTransform: "uppercase" }}>Placement</span>
      </div>

      <h2 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "clamp(40px, 6vw, 56px)", fontWeight: 300,
        color: "var(--dark)", marginBottom: "6px",
      }}>PLACEMENT</h2>
      <p style={{
        fontFamily: "'Noto Sans JP', sans-serif",
        fontSize: "13px", letterSpacing: "3px",
        color: "var(--warm-gray)", marginBottom: "56px",
        paddingBottom: "32px", borderBottom: "1px solid var(--border)",
      }}>
        人材紹介事業
      </p>

      {/* 高度人材紹介 */}
      <div style={{ marginBottom: "56px" }}>
        <div style={{
          display: "inline-block",
          background: "#0E2233", color: "#fff",
          padding: "16px 32px",
          fontFamily: "'Noto Serif JP', serif",
          fontSize: "16px", letterSpacing: "2px",
          marginBottom: "28px",
        }}>
          高度人材紹介
        </div>
        <p style={{
          fontFamily: "'Noto Serif JP', serif",
          fontSize: "15px", lineHeight: 2,
          color: "#3a3a3a", marginBottom: "24px",
        }}>
          日本語堪能な技術・人材知識・国際業務等、特定活動46号の在留資格を持つ外国人を紹介しています。
        </p>
        <div style={{ margin: "24px 0" }}>
          <h4 style={{
            fontSize: "12px", letterSpacing: "2px",
            color: "var(--gold)", marginBottom: "16px",
            textTransform: "uppercase",
          }}>主な対求職種</h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {highSkillJobs.map((job) => (
              <span key={job} className="job-tag" style={{
                padding: "8px 20px",
                border: "1px solid var(--border)",
                fontSize: "13px", color: "var(--dark)",
                transition: "all 0.3s", cursor: "default",
              }}>
                {job}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 特定技能紹介・支援 */}
      <div>
        <div style={{
          display: "inline-block",
          background: "#0E2233", color: "#fff",
          padding: "16px 32px",
          fontFamily: "'Noto Serif JP', serif",
          fontSize: "16px", letterSpacing: "2px",
          marginBottom: "28px",
        }}>
          特定技能紹介・支援
        </div>
        <p style={{
          fontFamily: "'Noto Serif JP', serif",
          fontSize: "15px", lineHeight: 2,
          color: "#3a3a3a", marginBottom: "24px",
        }}>
          当社では、特定技能の全14業種を紹介及び支援しています。<br />
          日本語能力試験JLPT 中上級（N4〜N1）の求職者多数、累計紹介<strong>8,000件</strong>のご対応をさせていただいております。
        </p>
        <div style={{ margin: "24px 0" }}>
          <h4 style={{
            fontSize: "12px", letterSpacing: "2px",
            color: "var(--gold)", marginBottom: "16px",
            textTransform: "uppercase",
          }}>主な対求職種</h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {tokuteiJobs.map((job) => (
              <span key={job} className="job-tag" style={{
                padding: "8px 20px",
                border: "1px solid var(--border)",
                fontSize: "13px", color: "var(--dark)",
                transition: "all 0.3s", cursor: "default",
              }}>
                {job}
              </span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .job-tag:hover { background: var(--gold) !important; color: #fff !important; border-color: var(--gold) !important; }
        @media (max-width: 600px) {
          #placement { padding: 64px 24px !important; }
        }
      `}</style>
    </section>
  );
}
