const services = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#185FA5" strokeWidth="1.8">
        <path d="M18 8h1a4 4 0 010 8h-1" />
        <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
    iconBg: "var(--navy-light)",
    title: "飲食・レストラン",
    titleVn: "Nhà hàng · Quán ăn",
    desc: "調理師・ホール・キッチンスタッフを最短2週間でご紹介。日本語N3以上対応。",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3B6D11" strokeWidth="1.8">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="16" />
        <line x1="10" y1="14" x2="14" y2="14" />
      </svg>
    ),
    iconBg: "#EAF3DE",
    title: "製造・工場",
    titleVn: "Xí nghiệp · Nhà máy",
    desc: "ライン作業・溶接・品質管理。特定技能・技能実習ビザ取得者多数在籍。",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="1.8">
        <path d="M12 22V12M12 12C12 7 17 3 17 3S22 7 22 12" />
        <path d="M12 12C12 7 7 3 7 3S2 7 2 12" />
      </svg>
    ),
    iconBg: "#E1F5EE",
    title: "農業・農場",
    titleVn: "Nông nghiệp · Trang trại",
    desc: "季節農業・ハウス栽培・収穫作業。地方農家への派遣に対応しています。",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#854F0B" strokeWidth="1.8">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
    iconBg: "var(--gold-light)",
    title: "年金・社会保険",
    titleVn: "Nenkin · Bảo hiểm hưu trí",
    desc: "年金の受取申請・脱退一時金・社会保険手続きをベトナム語でサポート。",
    href: "#nenkin",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#534AB7" strokeWidth="1.8">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M2 10h20M7 4v16M17 4v16" />
      </svg>
    ),
    iconBg: "#EEEDFE",
    title: "観光ビザ申請",
    titleVn: "Visa du lịch người thân",
    desc: "ご家族・ご両親の日本観光ビザ申請を代行。招聘状作成から申請まで一括対応。",
    href: "#visa",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#993556" strokeWidth="1.8">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="12" y2="17" />
      </svg>
    ),
    iconBg: "#FCEBEB",
    title: "在留・各種手続き",
    titleVn: "Thủ tục giấy tờ lưu trú",
    desc: "在留カード更新・住民票・マイナンバーなど、日常の行政手続きをサポートします。",
  },
];

export default function Services() {
  return (
    <section id="services" className="max-w-6xl mx-auto px-6 py-14">
      <div className="section-eyebrow">Services · サービス一覧</div>
      <div className="section-title">
        Asekaが提供する
        <br />
        6つのサポート
      </div>
      <div className="section-ja">6 dịch vụ hỗ trợ toàn diện cho người Việt tại Nhật</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s) => (
          <a
            key={s.title}
            href={s.href ?? "#contact"}
            className="card flex flex-col no-underline group transition-all duration-150 hover:border-navy"
            style={{ color: "inherit" }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 flex-shrink-0"
              style={{ background: s.iconBg }}
            >
              {s.icon}
            </div>
            <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--navy)" }}>
              {s.title}
            </h3>
            <p className="text-xs mb-2" style={{ color: "var(--muted)", letterSpacing: "0.05em" }}>
              {s.titleVn}
            </p>
            <p className="text-xs leading-relaxed flex-1" style={{ color: "var(--muted)" }}>
              {s.desc}
            </p>
            <span className="mt-3 text-xs font-medium" style={{ color: "var(--navy)" }}>
              詳しく見る →
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
