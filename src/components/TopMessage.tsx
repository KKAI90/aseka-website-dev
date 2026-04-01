const paragraphs = [
  "2015年留学生として来日しました。2018年リクルートグループに入社し、グローバル人材採用に携わり、2021年5月株式会社ASEKAを立ち上げました。",
  "異国で様々な方に出会って、非常に恵まれた日々を過ごすことができていると思っています。人に大切にしていただけると感じることができているのは大変幸せで、常に感謝の気持ちでいっぱいです。",
  "一方で、決して平坦な道のりばかりではありませんでした。一般的に外国で生活するということには、母国とはちょっと不自由なことがあります。夢を持っているのに、実現するために様々な困難に相まって、今一歩踏み出せない方もいらっしゃるのではと思っています。",
  "そういった苦労や経験を、みなさまも夢を叶えるための途中に少しでも寄り添いできたら、みなさまが全員ヒーローになれるよう、知恵や知識をシェアし、サポートすることを考えています。",
  "SNSを活用した情報拡散力を駆使した企業性のある多くの人材・資質を求める企業で働けるような繋がりを作ります。私だけでなく株式会社ASEKAの職員一同が\u201c人\u201dを一番に考えることを軸とした事業展開を今後も継続していくことを心に決めています。",
];

export default function TopMessage() {
  return (
    <section style={{ padding: "120px 60px", background: "white" }}>
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "80px" }}>
        <span style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "13px", color: "var(--gold)", letterSpacing: "2px",
        }}>02</span>
        <div style={{ width: "60px", height: "1px", background: "var(--gold)", opacity: 0.4, flexShrink: 0 }} />
        <span style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "11px", letterSpacing: "5px",
          color: "var(--warm-gray)", textTransform: "uppercase",
        }}>Top Message</span>
      </div>

      <div className="message-inner" style={{
        display: "grid",
        gridTemplateColumns: "1fr 1.4fr",
        gap: "80px",
        alignItems: "start",
      }}>
        {/* Photo */}
        <div style={{ position: "relative" }}>
          <div style={{ position: "relative", background: "var(--dark)", padding: "3px" }}>
            {/* Shadow frame */}
            <div style={{
              position: "absolute", top: "16px", left: "16px", right: "-16px", bottom: "-16px",
              border: "1px solid var(--gold)", opacity: 0.3, zIndex: 0,
            }} />
            {/* Placeholder */}
            <div style={{
              width: "100%", aspectRatio: "3/4",
              background: "linear-gradient(160deg, #2C2C2C 0%, #3a3530 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative", zIndex: 1,
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "13px", letterSpacing: "3px",
              color: "var(--gold)", opacity: 0.5,
            }}>
              PHOTO
            </div>
          </div>
          {/* Name tag */}
          <div style={{
            position: "absolute", bottom: "-24px", left: 0,
            background: "var(--gold)",
            padding: "10px 24px",
            fontFamily: "'Noto Sans JP', sans-serif",
            fontSize: "11px", letterSpacing: "2px",
            color: "white", zIndex: 2,
          }}>
            代表取締役
          </div>
        </div>

        {/* Text */}
        <div style={{ paddingTop: "20px" }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 300,
            lineHeight: 1.1, color: "var(--dark)",
            marginBottom: "12px",
          }}>
            Top<em style={{ fontStyle: "italic", color: "var(--gold)" }}>Message</em>
          </h2>
          <p style={{
            fontFamily: "'Noto Serif JP', serif",
            fontSize: "14px", letterSpacing: "3px",
            color: "var(--warm-gray)", marginBottom: "48px",
            paddingBottom: "24px", borderBottom: "1px solid rgba(184,150,62,0.25)",
          }}>
            代表挨拶
          </p>

          {paragraphs.map((text, i) => (
            <p key={i} style={{
              fontFamily: "'Noto Serif JP', serif",
              fontSize: "15px", lineHeight: 2.2,
              color: "#3a3a3a", marginBottom: "24px",
            }}>
              {text}
            </p>
          ))}

          <div style={{
            marginTop: "48px", paddingTop: "24px",
            borderTop: "1px solid rgba(184,150,62,0.25)",
          }}>
            <span style={{
              fontSize: "10px", letterSpacing: "3px",
              color: "var(--gold)", marginBottom: "8px",
              display: "block", textTransform: "uppercase",
            }}>
              代表取締役 / Representative Director
            </span>
            <div style={{
              fontFamily: "'Noto Serif JP', serif",
              fontSize: "22px", color: "var(--dark)", letterSpacing: "2px",
            }}>
              グェン ティラン タリ
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .message-inner { grid-template-columns: 1fr !important; gap: 48px !important; }
        }
        @media (max-width: 600px) {
          .message-inner { padding: 0; }
          section { padding: 80px 24px !important; }
        }
      `}</style>
    </section>
  );
}
