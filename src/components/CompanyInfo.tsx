"use client";
import { useLang } from "@/contexts/LangContext";

type Row = { label: string; value: string; href?: string; target?: string; span?: boolean };

const ROWS = {
  JP: [
    { label: "社名",          value: "株式会社ASEKA" },
    { label: "設立",          value: "2021年5月" },
    { label: "代表取締役",    value: "内田 隆嗣" },
    { label: "取締役",        value: "グェン　フォン　タオ" },
    { label: "本社",          value: "〒101-0025 東京都千代田区神田佐久間町3-27-3\nガーデンパークビル５F" },
    { label: "連絡先",        value: "03-6231-9969", href: "tel:0362319969" },
    { label: "メール",        value: "info@aseka.co.jp", href: "mailto:info@aseka.co.jp" },
    { label: "事業内容", span: true, value: "外国人人材紹介及び支援業務\n外国人向け日本語教育サービス" },
    { label: "顧問税理士",     value: "大石会計事務所" },
    { label: "許認可・届出", span: true, value: "有料職業紹介事業（許可番号：13-ユ-313472)\n登録支援機関 (登録番号：22登-007089)" },
    { label: "グループ会社",   value: "株式会社クローバーホールディングス" },
    { label: "主要取引銀行", span: true, value: "三井住友銀行 新宿岩戸支店 / 東京シティ信用金庫　秋葉原支店" },
  ] as Row[],
  EN: [
    { label: "Company Name",        value: "ASEKA Co., Ltd." },
    { label: "Founded",             value: "May 2021" },
    { label: "Representative Dir.", value: "Takashi Uchida" },
    { label: "Director",            value: "Nguyen Phuong Thao" },
    { label: "Head Office",         value: "〒101-0025 3-27-3 Kanda Sakumacho, Chiyoda-ku, Tokyo\nGarden Park Building 5F" },
    { label: "Phone",               value: "03-6231-9969", href: "tel:0362319969" },
    { label: "Email",               value: "info@aseka.co.jp", href: "mailto:info@aseka.co.jp" },
    { label: "Business", span: true, value: "Foreign Talent Recruitment & Support Services\nJapanese Language Education Services for Foreigners" },
    { label: "Tax Advisor",         value: "Oishi Accounting Office" },
    { label: "Licenses & Reg.", span: true, value: "Fee-based Employment Placement (Permit No.: 13-ユ-313472)\nRegistered Support Organization (Registration No.: 22登-007089)" },
    { label: "Group Company",       value: "Clover Holdings Co., Ltd." },
    { label: "Main Banks", span: true, value: "SMBC Shinjuku Iwato Branch / Tokyo City Shinkin Bank Akihabara Branch" },
  ] as Row[],
  VN: [
    { label: "Tên công ty",         value: "Công ty Cổ phần ASEKA" },
    { label: "Thành lập",           value: "Tháng 5 năm 2021" },
    { label: "Giám đốc Điều hành", value: "Uchida Takashi (内田 隆嗣)" },
    { label: "Giám đốc",           value: "Nguyễn Phương Thảo" },
    { label: "Trụ sở chính",       value: "〒101-0025 3-27-3 Kanda Sakumacho, Chiyoda-ku, Tokyo\nTòa nhà Garden Park, Tầng 5" },
    { label: "Điện thoại",          value: "03-6231-9969", href: "tel:0362319969" },
    { label: "Email",               value: "info@aseka.co.jp", href: "mailto:info@aseka.co.jp" },
    { label: "Dịch vụ", span: true, value: "Tuyển dụng & Hỗ trợ Nhân lực Nước ngoài\nDịch vụ Giáo dục Tiếng Nhật cho Người Nước ngoài" },
    { label: "Cố vấn Thuế",         value: "Văn phòng Kế toán Oishi" },
    { label: "Giấy phép & ĐK", span: true, value: "Dịch vụ Giới thiệu Việc làm có Phí (Giấy phép số: 13-ユ-313472)\nTổ chức Hỗ trợ Đăng ký (Số đăng ký: 22登-007089)" },
    { label: "Công ty Tập đoàn",    value: "Clover Holdings Co., Ltd." },
    { label: "Ngân hàng giao dịch", span: true, value: "SMBC Chi nhánh Shinjuku Iwato / Tokyo City Shinkin Bank Chi nhánh Akihabara" },
  ] as Row[],
};

const NOTE = {
  JP: "株式会社ASEKAは、日本とベトナムをつなぐ人材支援のプロフェッショナルとして、\n企業と求職者双方の夢の実現に貢献してまいります。",
  EN: "As a professional human resource support company connecting Japan and Vietnam,\nASEKA Co., Ltd. is committed to helping both companies and job seekers realize their dreams.",
  VN: "Công ty Cổ phần ASEKA, là chuyên gia hỗ trợ nhân lực kết nối Nhật Bản và Việt Nam,\ncam kết đóng góp vào việc hiện thực hóa ước mơ của cả doanh nghiệp lẫn người tìm việc.",
};

export default function CompanyInfo() {
  const { lang } = useLang();
  const rows = ROWS[lang];

  return (
    <section id="company" style={{ padding: "100px 60px", background: "#F7F5F0" }}>

      {/* Section label */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "56px" }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "12px", color: "var(--gold)", letterSpacing: "3px", fontStyle: "italic" }}>02</span>
        <div style={{ width: "48px", height: "1px", background: "var(--gold)", opacity: 0.45, flexShrink: 0 }} />
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "12px", letterSpacing: "5px", color: "var(--warm-gray)", textTransform: "uppercase" }}>Company Overview</span>
      </div>

      {/* Info table */}
      <div
        className="info-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2px",
          background: "rgba(184,150,62,0.2)",
          border: "1px solid rgba(184,150,62,0.2)",
        }}
      >
        {rows.map((row, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              ...(row.span ? { gridColumn: "1 / -1" } : {}),
            }}
          >
            {/* Label cell */}
            <div style={{
              flexShrink: 0,
              width: "168px",
              padding: "22px 20px 22px 0",
              background: "#1B3A5C",
              display: "flex",
              alignItems: "center",
              borderLeft: "4px solid #B8963E",
              paddingLeft: "20px",
            }}>
              <span style={{
                fontFamily: "'Noto Sans JP', sans-serif",
                fontSize: "12px",
                letterSpacing: "1px",
                color: "rgba(250,247,242,0.88)",
                fontWeight: 400,
                lineHeight: 1.6,
              }}>{row.label}</span>
            </div>

            {/* Value cell */}
            <div style={{
              flex: 1,
              padding: "22px 32px",
              background: "white",
              display: "flex",
              alignItems: "center",
            }}>
              {row.href ? (
                <a href={row.href} target={row.target} style={{
                  fontFamily: "'Noto Serif JP', serif",
                  fontSize: "15px",
                  lineHeight: 1.85,
                  color: "#B8963E",
                  textDecoration: "none",
                  borderBottom: "1px solid rgba(184,150,62,0.4)",
                  paddingBottom: "1px",
                  whiteSpace: "pre-line",
                }}>
                  {row.value}
                </a>
              ) : (
                <span style={{
                  fontFamily: "'Noto Serif JP', serif",
                  fontSize: "15px",
                  lineHeight: 1.85,
                  color: "#1B3A5C",
                  whiteSpace: "pre-line",
                }}>
                  {row.value}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Note */}
      <div style={{
        marginTop: "40px",
        padding: "32px 40px",
        background: "white",
        borderLeft: "4px solid #B8963E",
      }}>
        <p style={{
          fontFamily: "'Noto Serif JP', serif",
          fontSize: "14px",
          lineHeight: 2.0,
          color: "#3d3833",
          letterSpacing: "0.02em",
          whiteSpace: "pre-line",
          margin: 0,
        }}>
          {NOTE[lang]}
        </p>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .info-grid { grid-template-columns: 1fr !important; }
          .info-grid > div[style*="grid-column"] { grid-column: 1 !important; }
        }
        @media (max-width: 600px) { #company { padding: 80px 24px !important; } }
      `}</style>
    </section>
  );
}
