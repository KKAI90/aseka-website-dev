"use client";
import { useLang } from "@/contexts/LangContext";

type Row = { label: string; value: string; href?: string; target?: string; span?: boolean };

const ROWS = {
  JP: [
    { label: "社名",          value: "株式会社ASEKA" },
    { label: "設立",          value: "2021年5月" },
    { label: "代表取締役",    value: "内田 隆嗣" },
    { label: "取締役",        value: "グェン　フォン　タオ" },
    { label: "資本金",        value: "5,000,000円" },
    { label: "本社",          value: "〒101-0025 東京都千代田区神田佐久間町 3-27-3\nレーベンハークビル 5F" },
    { label: "連絡先",        value: "03-6231-9969", href: "tel:0362319969" },
    { label: "会社サイト",    value: "aseka.co.jp",  href: "http://aseka.co.jp", target: "_blank" },
    { label: "事業内容", span: true, value: "登録支援機関（登録番号：22登-007089）\n有料職業紹介事業（許可番号：13-ゆ-313472）\n人材育成サービス" },
    { label: "顧問",          value: "税理士法人大石会計事務所" },
    { label: "関係会社",      value: "株式会社THAO TOKYO（タオ トウキョウ）" },
    { label: "主要取引銀行", span: true, value: "三井住友銀行 新宿岩戸支店 / 東京シティ信用金庫　秋葉原支店" },
  ] as Row[],
  EN: [
    { label: "Company Name",        value: "ASEKA Co., Ltd." },
    { label: "Founded",             value: "May 2021" },
    { label: "Representative Dir.", value: "Takashi Uchida" },
    { label: "Director",            value: "Nguyen Phuong Thao" },
    { label: "Capital",             value: "¥5,000,000" },
    { label: "Head Office",         value: "〒101-0025 Kanda Sakumacho 3-27-3, Chiyoda-ku, Tokyo\nRevenharque Building 5F" },
    { label: "Phone",               value: "03-6231-9969", href: "tel:0362319969" },
    { label: "Website",             value: "aseka.co.jp",  href: "http://aseka.co.jp", target: "_blank" },
    { label: "Business", span: true, value: "Registered Support Organization (No.: 22登-007089)\nFee-based Employment Placement (No.: 13-ゆ-313472)\nHuman Resource Development Services" },
    { label: "Advisor",             value: "Oishi Accounting Tax Corporation" },
    { label: "Affiliated Co.",      value: "THAO TOKYO Co., Ltd." },
    { label: "Main Banks", span: true, value: "SMBC Shinjuku Iwato Branch / Tokyo City Shinkin Bank Akihabara Branch" },
  ] as Row[],
  VN: [
    { label: "Tên công ty",         value: "Công ty Cổ phần ASEKA" },
    { label: "Thành lập",           value: "Tháng 5 năm 2021" },
    { label: "Giám đốc Điều hành", value: "Uchida Takashi (内田 隆嗣)" },
    { label: "Giám đốc",           value: "Nguyễn Phương Thảo" },
    { label: "Vốn điều lệ",        value: "5.000.000 Yên" },
    { label: "Trụ sở chính",       value: "〒101-0025 3-27-3 Kanda Sakumacho, Chiyoda-ku, Tokyo\nTòa nhà Revenharque, Tầng 5" },
    { label: "Điện thoại",          value: "03-6231-9969", href: "tel:0362319969" },
    { label: "Website",             value: "aseka.co.jp",  href: "http://aseka.co.jp", target: "_blank" },
    { label: "Dịch vụ", span: true, value: "Tổ chức Hỗ trợ Đăng ký (Số: 22登-007089)\nDịch vụ Giới thiệu Việc làm có Phí (Số: 13-ゆ-313472)\nDịch vụ Phát triển Nhân lực" },
    { label: "Cố vấn",              value: "Văn phòng Kế toán Thuế Oishi" },
    { label: "Công ty liên kết",    value: "Công ty Cổ phần THAO TOKYO" },
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
    <section id="company" style={{ padding: "120px 60px", background: "var(--dark)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "72px" }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "12px", color: "var(--gold)", letterSpacing: "3px", fontStyle: "italic" }}>03</span>
        <div style={{ width: "48px", height: "1px", background: "var(--gold)", opacity: 0.45, flexShrink: 0 }} />
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "12px", letterSpacing: "5px", color: "rgba(250,247,242,0.45)", textTransform: "uppercase" }}>Company Overview</span>
      </div>

      <div className="info-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px" }}>
        {rows.map((row, i) => (
          <div key={i} style={{
            display: "flex", background: "rgba(255,255,255,0.04)",
            borderBottom: "1px solid rgba(184,150,62,0.1)",
            ...(row.span ? { gridColumn: "1 / -1" } : {}),
          }}>
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
            <div style={{
              padding: "22px 32px", fontFamily: "'Noto Serif JP', serif",
              fontSize: "15px", lineHeight: 1.85,
              color: "rgba(250,247,242,0.85)", whiteSpace: "pre-line",
              display: "flex", alignItems: "center",
            }}>
              {row.href ? (
                <a href={row.href} target={row.target} style={{
                  color: "var(--gold-light)", textDecoration: "none",
                  borderBottom: "1px solid rgba(212,175,106,0.35)", paddingBottom: "1px",
                }}>
                  {row.value}
                </a>
              ) : row.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: "56px", padding: "40px 48px",
        border: "1px solid rgba(184,150,62,0.2)",
        display: "flex", gap: "24px", alignItems: "flex-start",
      }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", color: "var(--gold)", flexShrink: 0, lineHeight: 1, marginTop: "2px" }}>⊡</div>
        <p style={{
          fontFamily: "'Noto Serif JP', serif", fontSize: "14px", lineHeight: 1.95,
          color: "rgba(250,247,242,0.62)", letterSpacing: "0.02em", whiteSpace: "pre-line",
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
