"use client";
import { useLang } from "@/contexts/LangContext";

const T = {
  JP: {
    sectionLabel: "Placement",
    heading: "PLACEMENT",
    subheading: "人材紹介事業",
    highTitle: "高度人材紹介",
    highDesc: "日本語堪能な技術・人材知識・国際業務等、特定活動46号の在留資格を持つ外国人を紹介しています。",
    highJobsLabel: "主な対求職種",
    highJobs: ["ITエンジニア（システムエンジニア）","プログラマー","橋梁システムエンジニア","機械設計・自動車設計","自動車解析","Auto CAD・BIMオペレーター","施工管理","事務・営業","翻訳・通訳","ホテルスタッフ","マーケティング"],
    tokuteiTitle: "特定技能紹介・支援",
    tokuteiDesc: "当社では、特定技能の全14業種を紹介及び支援しています。\n日本語能力試験JLPT 中上級（N4〜N1）の求職者多数、累計紹介",
    tokuteiCount: "8,000件",
    tokuteiDesc2: "のご対応をさせていただいております。",
    tokuteiJobsLabel: "主な対求職種",
    tokuteiJobs: ["介護","飲食料品製造業","外食業","素形材産業","産業機械製造業"],
  },
  EN: {
    sectionLabel: "Placement",
    heading: "PLACEMENT",
    subheading: "Human Resource Placement",
    highTitle: "Highly Skilled Personnel",
    highDesc: "We introduce foreigners with Specified Activity No. 46 residence status who are proficient in Japanese and skilled in technology, international business, and more.",
    highJobsLabel: "Main Job Categories",
    highJobs: ["IT Engineer (Systems Engineer)","Programmer","Bridge Systems Engineer","Mechanical / Automotive Design","Automotive Analysis","Auto CAD / BIM Operator","Construction Management","Office / Sales","Translation / Interpretation","Hotel Staff","Marketing"],
    tokuteiTitle: "Specified Skilled Workers",
    tokuteiDesc: "We provide placement and support services across all 14 industries for specified skilled workers.\nMany candidates hold JLPT N4–N1, with a cumulative placement track record of",
    tokuteiCount: "8,000 cases",
    tokuteiDesc2: ".",
    tokuteiJobsLabel: "Main Job Categories",
    tokuteiJobs: ["Nursing Care","Food & Beverage Manufacturing","Restaurant Industry","Foundry Industry","Industrial Machinery Manufacturing"],
  },
  VN: {
    sectionLabel: "Giới thiệu Nhân sự",
    heading: "PLACEMENT",
    subheading: "Dịch vụ Giới thiệu Nhân sự",
    highTitle: "Nhân tài Trình độ Cao",
    highDesc: "Chúng tôi giới thiệu người nước ngoài có tư cách lưu trú Hoạt động Chỉ định số 46, thành thạo tiếng Nhật, có kiến thức kỹ thuật và kinh nghiệm quốc tế.",
    highJobsLabel: "Các vị trí chính",
    highJobs: ["Kỹ sư IT (Kỹ sư Hệ thống)","Lập trình viên","Kỹ sư Hệ thống Cầu đường","Thiết kế Cơ khí / Ô tô","Phân tích Ô tô","Vận hành Auto CAD / BIM","Quản lý Thi công","Văn phòng / Kinh doanh","Phiên dịch / Biên dịch","Nhân viên Khách sạn","Marketing"],
    tokuteiTitle: "Lao động Kỹ năng Đặc định",
    tokuteiDesc: "Chúng tôi giới thiệu và hỗ trợ tất cả 14 ngành nghề kỹ năng đặc định.\nNhiều ứng viên có JLPT N4–N1, tổng số hồ sơ đã giới thiệu đạt",
    tokuteiCount: "8.000 trường hợp",
    tokuteiDesc2: ".",
    tokuteiJobsLabel: "Các vị trí chính",
    tokuteiJobs: ["Điều dưỡng","Sản xuất Thực phẩm & Đồ uống","Ngành Nhà hàng","Công nghiệp Đúc","Sản xuất Máy móc Công nghiệp"],
  },
};

export default function CompanyPlacement() {
  const { lang } = useLang();
  const t = T[lang];

  return (
    <section id="placement" style={{ padding: "100px 60px", background: "var(--cream)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "64px" }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "13px", color: "var(--gold)", letterSpacing: "2px" }}>01</span>
        <div style={{ width: "60px", height: "1px", background: "var(--gold)", opacity: 0.4, flexShrink: 0 }} />
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "11px", letterSpacing: "5px", color: "var(--warm-gray)", textTransform: "uppercase" }}>{t.sectionLabel}</span>
      </div>

      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(40px, 6vw, 56px)", fontWeight: 300, color: "var(--dark)", marginBottom: "6px" }}>{t.heading}</h2>
      <p style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: "13px", letterSpacing: "3px", color: "var(--warm-gray)", marginBottom: "56px", paddingBottom: "32px", borderBottom: "1px solid var(--border)" }}>
        {t.subheading}
      </p>

      {/* 高度人材 */}
      <div style={{ marginBottom: "56px" }}>
        <div style={{ display: "inline-block", background: "#0E2233", color: "#fff", padding: "16px 32px", fontFamily: "'Noto Serif JP', serif", fontSize: "16px", letterSpacing: "2px", marginBottom: "28px" }}>
          {t.highTitle}
        </div>
        <p style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "15px", lineHeight: 2, color: "#3a3a3a", marginBottom: "24px" }}>
          {t.highDesc}
        </p>
        <div style={{ margin: "24px 0" }}>
          <h4 style={{ fontSize: "12px", letterSpacing: "2px", color: "var(--gold)", marginBottom: "16px", textTransform: "uppercase" }}>{t.highJobsLabel}</h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {t.highJobs.map((job) => (
              <span key={job} className="job-tag" style={{ padding: "8px 20px", border: "1px solid var(--border)", fontSize: "13px", color: "var(--dark)", transition: "all 0.3s", cursor: "default" }}>
                {job}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 特定技能 */}
      <div>
        <div style={{ display: "inline-block", background: "#0E2233", color: "#fff", padding: "16px 32px", fontFamily: "'Noto Serif JP', serif", fontSize: "16px", letterSpacing: "2px", marginBottom: "28px" }}>
          {t.tokuteiTitle}
        </div>
        <p style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "15px", lineHeight: 2, color: "#3a3a3a", marginBottom: "24px" }}>
          {t.tokuteiDesc}<strong style={{ color: "var(--dark)" }}>{t.tokuteiCount}</strong>{t.tokuteiDesc2}
        </p>
        <div style={{ margin: "24px 0" }}>
          <h4 style={{ fontSize: "12px", letterSpacing: "2px", color: "var(--gold)", marginBottom: "16px", textTransform: "uppercase" }}>{t.tokuteiJobsLabel}</h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {t.tokuteiJobs.map((job) => (
              <span key={job} className="job-tag" style={{ padding: "8px 20px", border: "1px solid var(--border)", fontSize: "13px", color: "var(--dark)", transition: "all 0.3s", cursor: "default" }}>
                {job}
              </span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .job-tag:hover { background: var(--gold) !important; color: #fff !important; border-color: var(--gold) !important; }
        @media (max-width: 600px) { #placement { padding: 64px 24px !important; } }
      `}</style>
    </section>
  );
}
