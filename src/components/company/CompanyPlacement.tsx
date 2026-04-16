"use client";
import { useLang } from "@/contexts/LangContext";

const T = {
  JP: {
    sectionLabel: "Placement",
    heading: "PLACEMENT",
    subheading: "人材紹介事業",
    services: [
      {
        num: "01",
        tag: "Highly Skilled",
        title: "高度人材紹介",
        desc: "日本語堪能な、技術・人文知識・国際業務や、特定活動46号の在留資格を持つ外国人を紹介しております。",
        jobsLabel: "主な取扱職種",
        jobs: [
          "IT分野（システムエンジニア、プログラマー、ブリッジシステムエンジニア等）",
          "機械工学の技術者（機械設計、自動車設計、自動車解析等）",
          "土木及び建築におけるAuto CAD, BIMオペレーター、施工管理",
          "文系出身求職者（事務、営業、翻訳・通訳、ホテルスタッフ、マーケティング等）",
        ],
        strengthsLabel: "強み",
        strengths: ["日本語レベルN2以上の人材も多数在籍", "実務経験者中心のご紹介", "最短3日でのスピード提案"],
      },
      {
        num: "02",
        tag: "Specified Skills",
        title: "特定技能紹介・支援",
        desc: "特定技能全分野に対応し、採用から入社後の支援まで一貫してサポートいたします。ビザ手続きや各種書類対応もお任せください。",
        jobsLabel: "主な取扱職種",
        jobs: ["介護", "飲食料品製造業", "外食業", "素形材産業／産業機械製造業", "宿泊業"],
        strengthsLabel: "強み",
        strengths: ["大量採用にも対応可能", "最短3日での紹介実績", "登録支援機関として定着支援まで対応"],
      },
    ],
  },
  EN: {
    sectionLabel: "Placement",
    heading: "PLACEMENT",
    subheading: "Human Resource Placement",
    services: [
      {
        num: "01",
        tag: "Highly Skilled",
        title: "Highly Skilled Personnel",
        desc: "We introduce foreigners with Specified Activity No. 46 residence status who are proficient in Japanese and skilled in technology, humanities, international business, and more.",
        jobsLabel: "Main Job Categories",
        jobs: [
          "IT sector (Systems Engineer, Programmer, Bridge Systems Engineer, etc.)",
          "Mechanical Engineering (Mechanical Design, Automotive Design, Automotive Analysis, etc.)",
          "Civil & Architecture: Auto CAD / BIM Operator, Construction Management",
          "Liberal Arts (Office, Sales, Translation/Interpretation, Hotel Staff, Marketing, etc.)",
        ],
        strengthsLabel: "Strengths",
        strengths: ["Many candidates with N2+ Japanese proficiency", "Focused on candidates with practical experience", "Fastest proposal in as little as 3 days"],
      },
      {
        num: "02",
        tag: "Specified Skills",
        title: "Specified Skilled Workers",
        desc: "We provide comprehensive support across all specified skilled fields, from recruitment to post-hire retention. Leave visa procedures and all documentation to us.",
        jobsLabel: "Main Job Categories",
        jobs: ["Nursing Care", "Food & Beverage Manufacturing", "Restaurant Industry", "Foundry / Industrial Machinery Manufacturing", "Accommodation"],
        strengthsLabel: "Strengths",
        strengths: ["Capable of handling large-scale hiring", "Placement track record in as little as 3 days", "Retention support as a registered support organization"],
      },
    ],
  },
  VN: {
    sectionLabel: "Giới thiệu Nhân sự",
    heading: "PLACEMENT",
    subheading: "Dịch vụ Giới thiệu Nhân sự",
    services: [
      {
        num: "01",
        tag: "Highly Skilled",
        title: "Nhân tài Trình độ Cao",
        desc: "Chúng tôi giới thiệu người nước ngoài có tư cách lưu trú Hoạt động Chỉ định số 46, thành thạo tiếng Nhật, có kiến thức kỹ thuật, nhân văn quốc tế.",
        jobsLabel: "Các vị trí chính",
        jobs: [
          "Lĩnh vực IT (Kỹ sư Hệ thống, Lập trình viên, Kỹ sư Cầu đường, v.v.)",
          "Kỹ thuật Cơ khí (Thiết kế Cơ khí, Thiết kế Ô tô, Phân tích Ô tô, v.v.)",
          "Xây dựng & Kiến trúc: Vận hành Auto CAD / BIM, Quản lý Thi công",
          "Nhóm ngành Xã hội (Văn phòng, Kinh doanh, Phiên/Biên dịch, Khách sạn, Marketing, v.v.)",
        ],
        strengthsLabel: "Thế mạnh",
        strengths: ["Nhiều ứng viên có trình độ tiếng Nhật N2 trở lên", "Tập trung ứng viên có kinh nghiệm thực tế", "Đề xuất ứng viên trong tối thiểu 3 ngày"],
      },
      {
        num: "02",
        tag: "Specified Skills",
        title: "Lao động Kỹ năng Đặc định",
        desc: "Chúng tôi hỗ trợ toàn diện tất cả các ngành kỹ năng đặc định, từ tuyển dụng đến hỗ trợ sau khi nhận việc. Thủ tục visa và các giấy tờ liên quan cũng do chúng tôi đảm nhận.",
        jobsLabel: "Các vị trí chính",
        jobs: ["Điều dưỡng", "Sản xuất Thực phẩm & Đồ uống", "Ngành Nhà hàng", "Công nghiệp Đúc / Sản xuất Máy móc", "Lưu trú khách sạn"],
        strengthsLabel: "Thế mạnh",
        strengths: ["Có thể đáp ứng tuyển dụng số lượng lớn", "Thành tích giới thiệu trong tối thiểu 3 ngày", "Hỗ trợ gắn bó với tư cách tổ chức hỗ trợ đăng ký"],
      },
    ],
  },
};

export default function CompanyPlacement() {
  const { lang } = useLang();
  const t = T[lang];

  return (
    <section id="placement" style={{ padding: "100px 60px", background: "var(--cream)" }}>
      {/* Section label */}
      <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "64px" }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "14px", color: "var(--gold)", letterSpacing: "2px", fontStyle: "normal", fontWeight: 500 }}>01</span>
        <div style={{ width: "48px", height: "1px", background: "var(--gold)", opacity: 0.6, flexShrink: 0 }} />
        <span style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: "13px", letterSpacing: "3px", color: "#3d3833", textTransform: "uppercase", fontWeight: 400 }}>{t.sectionLabel}</span>
      </div>

      {/* Heading */}
      <h2 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "clamp(40px, 6vw, 56px)", fontWeight: 300,
        color: "var(--dark)", marginBottom: "6px",
      }}>{t.heading}</h2>
      <p style={{
        fontFamily: "'Noto Sans JP', sans-serif",
        fontSize: "13px", letterSpacing: "3px",
        color: "var(--warm-gray)", marginBottom: "72px",
        paddingBottom: "32px",
        borderBottom: "1px solid rgba(184,150,62,0.25)",
      }}>{t.subheading}</p>

      {/* Services */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {t.services.map((s) => (
          <div key={s.num} style={{
            display: "grid",
            gridTemplateColumns: "240px 1fr",
            background: "white",
            overflow: "hidden",
          }} className="placement-row">
            {/* Left: number + title */}
            <div style={{
              background: "#0C1F2E",
              padding: "48px 36px",
              display: "flex", flexDirection: "column",
              justifyContent: "center",
              borderRight: "3px solid var(--gold)",
            }}>
              <div style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "48px", fontWeight: 300,
                color: "rgba(184,150,62,0.25)", lineHeight: 1,
                marginBottom: "12px",
              }}>{s.num}</div>
              <div style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "10px", letterSpacing: "3px",
                color: "var(--gold)", fontStyle: "italic",
                marginBottom: "10px",
              }}>{s.tag}</div>
              <div style={{
                fontFamily: "'Noto Serif JP', serif",
                fontSize: "17px", fontWeight: 400,
                color: "#FAF7F2", lineHeight: 1.5,
                letterSpacing: "1px",
              }}>{s.title}</div>
            </div>

            {/* Right: desc + jobs */}
            <div style={{ padding: "48px 52px" }}>
              <p style={{
                fontFamily: "'Noto Serif JP', serif",
                fontSize: "15px", lineHeight: 2,
                color: "#3d3833", marginBottom: "36px",
                letterSpacing: "0.02em",
              }}>{s.desc}</p>

              <div style={{
                fontSize: "10px", letterSpacing: "2.5px",
                color: "var(--gold)", textTransform: "uppercase",
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: "italic", marginBottom: "16px",
              }}>{s.jobsLabel}</div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "32px" }}>
                {s.jobs.map((job) => (
                  <span key={job} className="job-tag" style={{
                    padding: "7px 16px",
                    border: "1px solid rgba(184,150,62,0.3)",
                    fontSize: "12.5px", letterSpacing: "0.3px",
                    color: "#3d3833",
                    background: "var(--cream)",
                    transition: "all 0.25s",
                    cursor: "default",
                  }}>
                    {job}
                  </span>
                ))}
              </div>

              {/* Strengths */}
              <div style={{
                fontSize: "10px", letterSpacing: "2.5px",
                color: "var(--gold)", textTransform: "uppercase",
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: "italic", marginBottom: "12px",
              }}>{s.strengthsLabel}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {s.strengths.map((item) => (
                  <span key={item} style={{
                    padding: "7px 16px",
                    border: "1px solid rgba(184,150,62,0.3)",
                    fontSize: "12.5px", letterSpacing: "0.3px",
                    color: "#3d3833",
                    background: "var(--cream)",
                  }}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .job-tag:hover { background: var(--gold) !important; color: #fff !important; border-color: var(--gold) !important; }
        @media (max-width: 900px) {
          .placement-row { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) { #placement { padding: 64px 24px !important; } }
      `}</style>
    </section>
  );
}
