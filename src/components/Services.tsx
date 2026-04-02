"use client";
import { useLang } from "@/contexts/LangContext";

const services = [
  {
    icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#185FA5" strokeWidth="1.8"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>),
    iconBg: "var(--navy-light)",
    titleJp: "飲食・レストラン",    titleVn: "Nhà hàng · Quán ăn",
    descJp: "調理師・ホール・キッチンスタッフを最短2週間でご紹介。日本語N3以上対応。",
    descVn: "Giới thiệu đầu bếp, nhân viên phục vụ trong tối đa 2 tuần. Yêu cầu N3 trở lên.",
  },
  {
    icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3B6D11" strokeWidth="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>),
    iconBg: "#EAF3DE",
    titleJp: "製造・工場",          titleVn: "Xí nghiệp · Nhà máy",
    descJp: "ライン作業・溶接・品質管理。特定技能・技能実習ビザ取得者多数在籍。",
    descVn: "Dây chuyền sản xuất, hàn, kiểm tra chất lượng. Nhiều ứng viên có visa kỹ năng đặc định.",
  },
  {
    icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="1.8"><path d="M12 22V12M12 12C12 7 17 3 17 3S22 7 22 12"/><path d="M12 12C12 7 7 3 7 3S2 7 2 12"/></svg>),
    iconBg: "#E1F5EE",
    titleJp: "農業・農場",           titleVn: "Nông nghiệp · Trang trại",
    descJp: "季節農業・ハウス栽培・収穫作業。地方農家への派遣に対応しています。",
    descVn: "Nông nghiệp theo mùa, trồng nhà kính, thu hoạch. Hỗ trợ điều phối đến nông thôn.",
  },
  {
    icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#854F0B" strokeWidth="1.8"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>),
    iconBg: "var(--gold-light)",
    titleJp: "年金・社会保険",        titleVn: "Nenkin · Bảo hiểm hưu trí",
    descJp: "年金の受取申請・脱退一時金・社会保険手続きをベトナム語でサポート。",
    descVn: "Hỗ trợ hoàn tiền nenkin, thủ tục bảo hiểm xã hội hoàn toàn bằng tiếng Việt.",
    href: "#nenkin",
  },
  {
    icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#534AB7" strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 10h20M7 4v16M17 4v16"/></svg>),
    iconBg: "#EEEDFE",
    titleJp: "観光ビザ申請",          titleVn: "Visa du lịch người thân",
    descJp: "ご家族・ご両親の日本観光ビザ申請を代行。招聘状作成から申請まで一括対応。",
    descVn: "Đại diện làm visa du lịch cho bố mẹ, gia đình. Từ thư bảo lãnh đến nộp đơn.",
    href: "#visa",
  },
  {
    icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#993556" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg>),
    iconBg: "#FCEBEB",
    titleJp: "在留・各種手続き",       titleVn: "Thủ tục giấy tờ lưu trú",
    descJp: "在留カード更新・住民票・マイナンバーなど、日常の行政手続きをサポートします。",
    descVn: "Gia hạn thẻ ngoại kiều, hộ khẩu, my number và các thủ tục hành chính hàng ngày.",
  },
];

const T: Record<string, { eyebrow: string; title: string; sub: string; more: string }> = {
  JP: { eyebrow: "Services · サービス一覧", title: "Asekaが提供する\n6つのサポート", sub: "6 dịch vụ hỗ trợ toàn diện cho người Việt tại Nhật", more: "詳しく見る →" },
  EN: { eyebrow: "Our Services",             title: "6 Comprehensive\nSupport Services", sub: "Full support for Vietnamese residents in Japan", more: "Learn more →" },
  VN: { eyebrow: "Dịch vụ · Services",       title: "6 dịch vụ hỗ trợ\ntoàn diện của Aseka", sub: "Hỗ trợ người Việt tại Nhật từ việc làm đến thủ tục giấy tờ", more: "Xem chi tiết →" },
};

export default function Services() {
  const { lang } = useLang();
  const t = T[lang];
  return (
    <section id="services" className="max-w-6xl mx-auto px-6 py-14">
      <div className="section-eyebrow">{t.eyebrow}</div>
      <div className="section-title" style={{ whiteSpace: "pre-line" }}>{t.title}</div>
      <div className="section-ja">{t.sub}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s) => (
          <a key={s.titleJp} href={s.href ?? "#contact"} className="card flex flex-col no-underline group transition-all duration-150 hover:border-navy" style={{ color: "inherit" }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 flex-shrink-0" style={{ background: s.iconBg }}>
              {s.icon}
            </div>
            <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--navy)" }}>
              {lang === "JP" ? s.titleJp : s.titleVn}
            </h3>
            <p className="text-xs mb-2" style={{ color: "var(--muted)", letterSpacing: "0.05em" }}>
              {lang === "JP" ? s.titleVn : s.titleJp}
            </p>
            <p className="text-xs leading-relaxed flex-1" style={{ color: "var(--muted)" }}>
              {lang === "JP" ? s.descJp : s.descVn}
            </p>
            <span className="mt-3 text-xs font-medium" style={{ color: "var(--navy)" }}>{t.more}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
