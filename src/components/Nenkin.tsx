import Link from "next/link";

const points = [
  {
    title: "脱退一時金の申請代行",
    sub: "Đại lý hoàn trả một lần khi về nước",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
        <path d="M9 12l2 2 4-4M12 3a9 9 0 100 18 9 9 0 000-18z" />
      </svg>
    ),
  },
  {
    title: "年金受給資格の確認",
    sub: "Kiểm tra điều kiện nhận lương hưu",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
  },
  {
    title: "ベトナム語で全対応",
    sub: "Hỗ trợ hoàn toàn bằng tiếng Việt",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  },
];

export default function Nenkin() {
  return (
    <section id="nenkin" style={{ background: "var(--navy)" }} className="py-14">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        {/* Left text */}
        <div>
          <div
            className="text-xs font-semibold tracking-widest uppercase mb-3"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            Nenkin Support · 年金サポート
          </div>
          <h2
            className="text-2xl font-bold mb-2 leading-snug"
            style={{ color: "#fff" }}
          >
            帰国前に、
            <br />
            年金を取り戻そう。
          </h2>
          <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.55)", letterSpacing: "0.04em" }}>
            Lấy lại tiền lương hưu trước khi về nước
          </p>
          <p
            className="text-sm leading-loose mb-6"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            日本で働いたすべての外国人は、脱退一時金を受け取る権利があります。Asekaがベトナム語で申請をサポート。申請漏れを防ぎ、確実に受給できます。
          </p>
          <Link
            href="#contact"
            className="no-underline inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold"
            style={{ background: "#fff", color: "var(--navy)" }}
          >
            無料相談はこちら →
          </Link>
        </div>

        {/* Right cards */}
        <div className="flex flex-col gap-3">
          {points.map((p) => (
            <div
              key={p.title}
              className="flex items-start gap-3 rounded-xl p-4"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "0.5px solid rgba(255,255,255,0.12)",
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: "rgba(255,255,255,0.12)" }}
              >
                {p.icon}
              </div>
              <div>
                <div className="text-sm font-semibold mb-0.5" style={{ color: "#fff" }}>
                  {p.title}
                </div>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
                  {p.sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
