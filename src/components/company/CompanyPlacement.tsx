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
      },
      {
        num: "02",
        tag: "Specified Skills",
        title: "特定技能紹介・支援",
        desc: "当社では、特定技能の全16業種を紹介及び支援しております。日本語能力試験JLPT 中上級（N4〜N1）の求職者様を中心に対応しております。",
        jobsLabel: "主な取扱職種",
        jobs: ["介護", "飲食料品製造業", "外食業", "素形材産業／産業機械製造業"],
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
      },
      {
        num: "02",
        tag: "Specified Skills",
        title: "Specified Skilled Workers",
        desc: "We provide placement and support services across all 16 industries for specified skilled workers. We mainly handle candidates with JLPT N4–N1 (intermediate to advanced).",
        jobsLabel: "Main Job Categories",
        jobs: ["Nursing Care", "Food & Beverage Manufacturing", "Restaurant Industry", "Foundry / Industrial Machinery Manufacturing"],
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
      },
      {
        num: "02",
        tag: "Specified Skills",
        title: "Lao động Kỹ năng Đặc định",
        desc: "Chúng tôi giới thiệu và hỗ trợ tất cả 16 ngành nghề kỹ năng đặc định. Chủ yếu hỗ trợ ứng viên có JLPT N4–N1.",
        jobsLabel: "Các vị trí chính",
        jobs: ["Điều dưỡng", "Sản xuất Thực phẩm & Đồ uống", "Ngành Nhà hàng", "Công nghiệp Đúc / Sản xuất Máy móc"],
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
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "13px", color: "var(--gold)", letterSpacing: "2px" }}>01</span>
        <div style={{ width: "60px", height: "1px", background: "var(--gold)", opacity: 0.4, flexShrink: 0 }} />
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "11px", letterSpacing: "5px", color: "var(--warm-gray)", textTransform: "uppercase" }}>{t.sectionLabel}</span>
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

              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
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
