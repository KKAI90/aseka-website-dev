import Link from "next/link";

const steps = [
  {
    num: "1",
    title: "招聘状・身元保証書の作成",
    sub: "Soạn thảo thư bảo lãnh và giấy tờ mời",
  },
  {
    num: "2",
    title: "必要書類のチェック・翻訳",
    sub: "Kiểm tra và dịch thuật hồ sơ cần thiết",
  },
  {
    num: "3",
    title: "大使館への申請サポート",
    sub: "Hỗ trợ nộp hồ sơ tại đại sứ quán",
  },
  {
    num: "4",
    title: "ビザ取得後のアドバイス",
    sub: "Tư vấn sau khi có visa nhập cảnh",
  },
];

export default function Visa() {
  return (
    <section id="visa" className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
      {/* Left */}
      <div>
        <div className="section-eyebrow">Visa Support · ビザサポート</div>
        <div className="section-title" style={{ fontSize: "22px" }}>
          ご家族の日本訪問を、
          <br />
          Asekaが全力支援。
        </div>
        <p className="text-sm mb-2" style={{ color: "var(--muted)", letterSpacing: "0.04em" }}>
          Hỗ trợ làm visa du lịch cho người thân sang thăm
        </p>
        <p className="text-sm leading-loose mb-6" style={{ color: "var(--muted)" }}>
          両親・兄弟・配偶者など、ご家族の短期観光ビザ申請をサポート。招聘状の作成から大使館提出まで、ベトナム語で丁寧に対応します。
        </p>
        <Link href="#contact" className="btn-navy no-underline">
          ビザ相談をする →
        </Link>
      </div>

      {/* Right */}
      <div className="flex flex-col gap-3">
        {steps.map((s) => (
          <div
            key={s.num}
            className="card flex items-start gap-3"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5"
              style={{ background: "var(--navy-light)", color: "#0C447C" }}
            >
              {s.num}
            </div>
            <div>
              <div className="text-sm font-semibold mb-0.5" style={{ color: "var(--navy)" }}>
                {s.title}
              </div>
              <div className="text-xs" style={{ color: "var(--muted)" }}>
                {s.sub}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
