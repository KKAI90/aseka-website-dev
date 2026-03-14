import Link from "next/link";

const bars = [
  { label: "飲食", pct: 75, color: "#378ADD" },
  { label: "製造", pct: 60, color: "#5DCAA5" },
  { label: "農業", pct: 38, color: "#EF9F27" },
  { label: "ホテル", pct: 28, color: "#F09595" },
];

const candidates = [
  {
    initials: "NT",
    name: "Nguyen Thi Lan",
    role: "飲食スタッフ · N3取得 / Nhà hàng · N3",
    tag: "内定済み",
    tagClass: "tag-green",
    bg: "var(--navy-light)",
    color: "#0C447C",
  },
  {
    initials: "PV",
    name: "Pham Van Thanh",
    role: "製造ライン · 特定技能 / Nhà máy · Tokutei",
    tag: "面接調整中",
    tagClass: "tag-gold",
    bg: "#EAF3DE",
    color: "#27500A",
  },
];

const kpis = [
  { num: "800+", label: "登録スタッフ", sub: "Ứng viên đăng ký" },
  { num: "97%", label: "定着率", sub: "Tỷ lệ gắn bó" },
  { num: "200+", label: "対応企業", sub: "Doanh nghiệp" },
];

export default function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      {/* Left */}
      <div>
        <div
          className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-5"
          style={{ background: "var(--navy-light)", color: "#0C447C" }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: "#378ADD" }}
          />
          ベトナム人材・生活サポート総合窓口
        </div>

        <h1
          className="text-4xl font-bold leading-snug mb-2"
          style={{ color: "var(--navy)", letterSpacing: "-0.01em" }}
        >
          日本での
          <span style={{ color: "var(--accent)" }}>生活と仕事</span>
          を、
          <br />
          Asekaが全力サポート。
        </h1>

        <p className="text-sm mb-3" style={{ color: "var(--muted)", letterSpacing: "0.05em" }}>
          Aseka — Đồng hành cùng người Việt tại Nhật Bản
        </p>

        <p className="text-sm leading-relaxed mb-7" style={{ color: "var(--muted)" }}>
          人材紹介から年金・ビザ手続きまで。
          <br />
          ベトナム語対応スタッフが、あなたの悩みを解決します。
        </p>

        <div className="flex flex-wrap gap-3 mb-8">
          <Link href="#contact" className="btn-navy no-underline">
            人材を採用したい →
          </Link>
          <Link href="#contact" className="btn-ghost no-underline">
            仕事を探している
          </Link>
        </div>

        {/* KPIs */}
        <div className="flex gap-7">
          {kpis.map((k) => (
            <div key={k.label}>
              <div className="text-2xl font-bold" style={{ color: "var(--navy)" }}>
                {k.num}
              </div>
              <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                {k.label}
              </div>
              <div className="text-xs" style={{ color: "var(--muted)", opacity: 0.6 }}>
                {k.sub}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — dashboard card */}
      <div className="flex flex-col gap-3">
        <div className="rounded-2xl p-6" style={{ background: "var(--navy)", color: "#fff" }}>
          <div className="flex justify-between items-start mb-5">
            <div>
              <div className="text-xs mb-1" style={{ opacity: 0.6, letterSpacing: "0.06em" }}>
                今月の紹介実績 / Tháng này
              </div>
              <div className="text-3xl font-bold">112名</div>
            </div>
            <div
              className="text-xs px-2.5 py-1 rounded"
              style={{ background: "rgba(255,255,255,0.12)" }}
            >
              前月比 +9%
            </div>
          </div>

          {bars.map((b) => (
            <div key={b.label} className="flex items-center gap-2.5 mb-2.5">
              <div className="text-xs w-12 flex-shrink-0" style={{ opacity: 0.65 }}>
                {b.label}
              </div>
              <div
                className="flex-1 h-1.5 rounded-full overflow-hidden"
                style={{ background: "rgba(255,255,255,0.12)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: `${b.pct}%`, background: b.color }}
                />
              </div>
              <div className="text-xs w-7 text-right" style={{ opacity: 0.75 }}>
                {b.pct}%
              </div>
            </div>
          ))}
        </div>

        {candidates.map((c) => (
          <div
            key={c.name}
            className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ border: "0.5px solid var(--border)", background: "#fff" }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: c.bg, color: c.color }}
            >
              {c.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate" style={{ color: "var(--navy)" }}>
                {c.name}
              </div>
              <div className="text-xs truncate" style={{ color: "var(--muted)" }}>
                {c.role}
              </div>
            </div>
            <span className={c.tagClass}>{c.tag}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
