"use client";
import { useLang } from "@/contexts/LangContext";

const T = {
  JP: {
    features: [
      {
        title: "即時・大量対応可能",
        body: [
          "株式会社ASEKAには、ベトナム人スタッフ、日本人スタッフどちらも常駐しております。ビザなど各種書類の確認といった煩雑な作業もサポートいたしますので、ご安心ください。",
          "過去には、僅か１日でご紹介した実績もあり、企業様は最低限の労力で求職者様をご採用いただけます。また、設立1年未満にも関わらず、多くの求職者様を企業様にご紹介できているのは、SNS20万人のネットワークがあるからです。大量採用等のご希望にも柔軟にお答えいたします。",
        ],
        iconLeft: true,
      },
      {
        title: "優秀な人材",
        body: [
          "フォロワーの3割近い技術・人文知識・国際業務ビザ保有者のうち、およそ半数の方々が機械・電子業界の方々です。その後、建設業、IT、翻訳／通訳と続きます。",
          "大手オフショア開発企業の拠点が多くできてきているベトナム。その優秀な工科大学で学ぶエンジニア志望の方が、日本にも多くいらっしゃいます。特にエンジニア不足に陥っている企業様に有効な打開策をご提案いたします。",
        ],
        iconLeft: false,
      },
      {
        title: "入社前後にフォロー",
        body: [
          "日本語教育事業も併行して手掛ける我々は、求職者様に対して入社前の日本語会話レベルの底上げ及び、日本の商習慣への理解の深化を図ることもできます。",
          "株式会社ASEKAには、人材業界に精通したベトナム人が常駐しております。ベトナム国籍保有者にどのように接するべきか、また入社後どのようにフォローすれば定着率アップに繋がるかを熟知しております。企業様とのミスマッチを事前に防ぐことのできる体制が整っております。",
        ],
        iconLeft: true,
      },
    ],
  },
  EN: {
    features: [
      {
        title: "Fast & Large-Scale Response",
        body: [
          "ASEKA has both Vietnamese and Japanese staff on-site at all times. We handle complex paperwork including visa documentation, so you can focus on your core business.",
          "We have a track record of introducing candidates in as little as one day. Our network of 200,000 SNS followers allows us to respond flexibly even to large-scale hiring requests.",
        ],
        iconLeft: true,
      },
      {
        title: "High-Quality Talent",
        body: [
          "Nearly 30% of our followers hold engineering, humanities, or international business visas — roughly half work in the machinery and electronics industries, followed by construction, IT, and translation.",
          "Vietnam is home to a growing number of top engineering universities. We connect Japan-bound engineering graduates with companies facing talent shortages.",
        ],
        iconLeft: false,
      },
      {
        title: "Pre & Post-Hire Follow-Up",
        body: [
          "Through our Japanese language education business, we help candidates improve their conversational Japanese and deepen their understanding of Japanese business culture before joining.",
          "Our Vietnamese staff, well-versed in the HR industry, know exactly how to support Vietnamese nationals — ensuring a high retention rate and preventing mismatches from the start.",
        ],
        iconLeft: true,
      },
    ],
  },
  VN: {
    features: [
      {
        title: "Phản hồi nhanh & quy mô lớn",
        body: [
          "ASEKA có cả nhân viên người Việt và người Nhật thường trực. Chúng tôi hỗ trợ các thủ tục giấy tờ phức tạp như visa để bạn có thể tập trung vào công việc kinh doanh chính.",
          "Chúng tôi có thành tích giới thiệu ứng viên trong vòng 1 ngày. Mạng lưới 200.000 người theo dõi giúp chúng tôi linh hoạt đáp ứng cả yêu cầu tuyển dụng số lượng lớn.",
        ],
        iconLeft: true,
      },
      {
        title: "Nhân tài chất lượng cao",
        body: [
          "Gần 30% người theo dõi của chúng tôi sở hữu visa kỹ thuật, nhân văn hoặc kinh doanh quốc tế — khoảng một nửa làm trong ngành cơ khí và điện tử, tiếp theo là xây dựng, IT và phiên dịch.",
          "Việt Nam đang có nhiều trường đại học kỹ thuật hàng đầu. Chúng tôi kết nối các kỹ sư tốt nghiệp muốn sang Nhật với các doanh nghiệp đang thiếu nhân lực.",
        ],
        iconLeft: false,
      },
      {
        title: "Hỗ trợ trước & sau khi nhận việc",
        body: [
          "Thông qua dịch vụ giáo dục tiếng Nhật, chúng tôi giúp ứng viên nâng cao khả năng giao tiếp và hiểu sâu hơn về văn hóa kinh doanh Nhật Bản trước khi gia nhập.",
          "Nhân viên người Việt am hiểu ngành nhân lực của chúng tôi biết rõ cách hỗ trợ người Việt — đảm bảo tỷ lệ gắn bó cao và ngăn chặn sự không phù hợp từ đầu.",
        ],
        iconLeft: true,
      },
    ],
  },
};

const ICONS = [
  // Handshake
  <svg key="1" viewBox="0 0 64 64" width="64" height="64" fill="none">
    <circle cx="32" cy="32" r="30" stroke="rgba(184,150,62,0.15)" strokeWidth="1.5"/>
    <path d="M18 36l6-6 5 3 8-8 9 5" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 38c0 0 4 6 10 6s8-4 8-4l10-10" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round"/>
    <path d="M38 28l6-4 6 6-10 10" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>,
  // People group
  <svg key="2" viewBox="0 0 64 64" width="64" height="64" fill="none">
    <circle cx="32" cy="32" r="30" stroke="rgba(184,150,62,0.15)" strokeWidth="1.5"/>
    <circle cx="32" cy="22" r="6" stroke="var(--gold)" strokeWidth="2"/>
    <path d="M20 44c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="18" cy="26" r="4.5" stroke="var(--gold)" strokeWidth="1.8"/>
    <path d="M9 44c0-4.97 4.03-9 9-9" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="46" cy="26" r="4.5" stroke="var(--gold)" strokeWidth="1.8"/>
    <path d="M55 44c0-4.97-4.03-9-9-9" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>,
  // Heart in hands
  <svg key="3" viewBox="0 0 64 64" width="64" height="64" fill="none">
    <circle cx="32" cy="32" r="30" stroke="rgba(184,150,62,0.15)" strokeWidth="1.5"/>
    <path d="M20 40c0 0 4 6 12 6s12-6 12-6V32c0-2-1.5-3-3-3s-2.5 1-3 2c-.5-1-1.5-2-3-2s-3 1-3 3v3" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M32 22c0-2.5 2-4.5 4.5-4.5S41 19.5 41 22c0 5-9 10-9 10s-9-5-9-10c0-2.5 2-4.5 4.5-4.5S32 19.5 32 22z" stroke="var(--gold)" strokeWidth="2" strokeLinejoin="round"/>
  </svg>,
];

export default function HomeFeatures() {
  const { lang } = useLang();
  const t = T[lang];

  return (
    <section style={{ padding: "100px 60px", background: "var(--cream)" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "48px" }}>
        {t.features.map((f, i) => (
          <div key={i} className="feature-card" style={{
            display: "grid",
            gridTemplateColumns: f.iconLeft ? "80px 1fr" : "1fr 80px",
            gap: "48px",
            alignItems: "flex-start",
            padding: "52px 56px",
            background: "white",
            border: "1px solid rgba(184,150,62,0.2)",
            borderRadius: "2px",
            boxShadow: "0 2px 24px rgba(0,0,0,0.04)",
            transition: "box-shadow 0.3s, border-color 0.3s",
          }}>
            {f.iconLeft && (
              <div style={{ display: "flex", justifyContent: "center", paddingTop: "6px", flexShrink: 0 }}>
                {ICONS[i]}
              </div>
            )}

            <div>
              <h3 style={{
                fontFamily: "'Noto Serif JP', serif",
                fontSize: "clamp(20px, 2.5vw, 28px)",
                fontWeight: 500,
                color: "var(--gold)",
                letterSpacing: "1px",
                marginBottom: "20px",
                lineHeight: 1.3,
              }}>{f.title}</h3>
              <div style={{ width: "40px", height: "1px", background: "rgba(184,150,62,0.4)", marginBottom: "20px" }} />
              {f.body.map((p, j) => (
                <p key={j} style={{
                  fontFamily: "'Noto Sans JP', sans-serif",
                  fontSize: "14px",
                  lineHeight: 2,
                  color: "#4a4540",
                  letterSpacing: "0.02em",
                  marginBottom: j < f.body.length - 1 ? "16px" : 0,
                }}>{p}</p>
              ))}
            </div>

            {!f.iconLeft && (
              <div style={{ display: "flex", justifyContent: "center", paddingTop: "6px", flexShrink: 0 }}>
                {ICONS[i]}
              </div>
            )}
          </div>
        ))}
      </div>

      <style>{`
        .feature-card:hover { box-shadow: 0 8px 40px rgba(0,0,0,0.08) !important; border-color: rgba(184,150,62,0.45) !important; }
        @media (max-width: 700px) {
          .feature-card { grid-template-columns: 1fr !important; gap: 24px !important; padding: 36px 28px !important; }
        }
      `}</style>
    </section>
  );
}
