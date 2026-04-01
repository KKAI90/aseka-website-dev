const paragraphs = [
  "2015年留学生として来日しました。2018年リクルートグループに入社し、グローバル人材採用に携わり、2021年5月株式会社ASEKAを立ち上げました。",
  "異国で様々な方に出会って、非常に恵まれた日々を過ごすことができていると思っています。人に大切にしていただけると感じることができているのは大変幸せで、常に感謝の気持ちでいっぱいです。",
  "一方で、決して平坦な道のりばかりではありませんでした。一般的に外国で生活するということには、母国とはちょっと不自由なことがあります。夢を持っているのに、実現するために様々な困難に相まって、今一歩踏み出せない方もいらっしゃるのではと思っています。",
  "そういった苦労や経験を、みなさまも夢を叶えるための途中に少しでも寄り添いできたら、みなさまが全員ヒーローになれるよう、知恵や知識をシェアし、サポートすることを考えています。",
  "SNSを活用した情報拡散力を駆使した企業性のある多くの人材・資質を求める企業で働けるような繋がりを作ります。私だけでなく株式会社ASEKAの職員一同が「人」を一番に考えることを軸とした事業展開を今後も継続していくことを心に決めています。",
];

export default function TopMessage() {
  return (
    <section style={{ padding: "120px 60px", background: "white" }}>

      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "72px" }}>
        <span style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "12px", color: "var(--gold)",
          letterSpacing: "3px", fontStyle: "italic",
        }}>02</span>
        <div style={{ width: "48px", height: "1px", background: "var(--gold)", opacity: 0.45, flexShrink: 0 }} />
        <span style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "12px", letterSpacing: "5px",
          color: "var(--warm-gray)", textTransform: "uppercase",
        }}>Top Message</span>
      </div>

      <div className="message-inner" style={{
        display: "grid",
        gridTemplateColumns: "1fr 1.5fr",
        gap: "88px",
        alignItems: "start",
      }}>
        {/* Photo */}
        <div style={{ position: "relative" }}>
          <div style={{ position: "relative", background: "var(--dark)", padding: "3px" }}>
            <div style={{
              position: "absolute", top: "16px", left: "16px", right: "-16px", bottom: "-16px",
              border: "1px solid var(--gold)", opacity: 0.3, zIndex: 0,
            }} />
            <img
              src="/images/ceo-portrait.jpg"
              alt="代表取締役 グェン ティラン タリ"
              style={{
                width: "100%", aspectRatio: "3/4",
                objectFit: "cover", objectPosition: "center top",
                display: "block", position: "relative", zIndex: 1,
              }}
            />
          </div>
          <div style={{
            position: "absolute", bottom: "-20px", left: 0,
            background: "var(--gold)", padding: "10px 24px",
            fontFamily: "'Noto Sans JP', sans-serif",
            fontSize: "12px", letterSpacing: "2px",
            color: "white", zIndex: 2, fontWeight: 400,
          }}>
            代表取締役
          </div>
        </div>

        {/* Text */}
        <div style={{ paddingTop: "8px" }}>
          {/* Title */}
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(40px, 4vw, 60px)", fontWeight: 300,
            lineHeight: 1.05, color: "var(--dark)",
            marginBottom: "6px", letterSpacing: "-0.5px",
          }}>
            Top<em style={{ fontStyle: "italic", color: "var(--gold)" }}>Message</em>
          </h2>

          {/* JP subtitle */}
          <p style={{
            fontFamily: "'Noto Serif JP', serif",
            fontSize: "13px", letterSpacing: "4px",
            color: "var(--warm-gray)", fontWeight: 300,
            marginBottom: "40px", paddingBottom: "28px",
            borderBottom: "1px solid rgba(184,150,62,0.25)",
          }}>
            代表挨拶
          </p>

          {/* Paragraphs */}
          {paragraphs.map((text, i) => (
            <p key={i} style={{
              fontFamily: "'Noto Serif JP', serif",
              fontSize: "15.5px", lineHeight: 1.95,
              color: "#3d3833",
              marginBottom: "22px",
              letterSpacing: "0.01em",
            }}>
              {text}
            </p>
          ))}

          {/* Signature */}
          <div style={{
            marginTop: "44px", paddingTop: "28px",
            borderTop: "1px solid rgba(184,150,62,0.25)",
            display: "flex", flexDirection: "column", gap: "10px",
          }}>
            <span style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "11px", letterSpacing: "3px",
              color: "var(--gold)",
              textTransform: "uppercase", fontStyle: "italic",
            }}>
              代表取締役 / Representative Director
            </span>
            <div style={{
              fontFamily: "'Noto Serif JP', serif",
              fontSize: "24px", color: "var(--dark)",
              letterSpacing: "3px", fontWeight: 400,
            }}>
              グェン ティラン タリ
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .message-inner { grid-template-columns: 1fr !important; gap: 60px !important; }
        }
        @media (max-width: 600px) {
          .message-inner section { padding: 80px 24px !important; }
        }
      `}</style>
    </section>
  );
}
