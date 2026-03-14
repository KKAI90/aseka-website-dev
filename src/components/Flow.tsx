const steps = [
  { num: "1", title: "お問い合わせ", sub: "Liên hệ tư vấn" },
  { num: "2", title: "ヒアリング", sub: "Trao đổi yêu cầu" },
  { num: "3", title: "候補者提案", sub: "Giới thiệu ứng viên" },
  { num: "4", title: "着任・フォロー", sub: "Onboarding & hỗ trợ" },
];

export default function Flow() {
  return (
    <section className="py-14" style={{ background: "var(--surface)" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="section-eyebrow">Flow · ご利用の流れ</div>
        <div className="section-title" style={{ fontSize: "22px" }}>
          最短2週間でスタッフが着任
        </div>
        <div className="section-ja">Quy trình từ liên hệ đến onboarding trong 2 tuần</div>

        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
          {/* Connector line — desktop only */}
          <div
            className="hidden md:block absolute top-6 left-[15%] right-[15%] h-px"
            style={{ background: "var(--border)" }}
          />

          {steps.map((s, i) => (
            <div key={s.num} className="flex flex-col items-center text-center relative z-10">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold mb-3 transition-all"
                style={
                  i === 0
                    ? { background: "var(--navy)", color: "#fff", border: "1px solid var(--navy)" }
                    : {
                        background: "#fff",
                        color: "var(--muted)",
                        border: "0.5px solid var(--border)",
                      }
                }
              >
                {s.num}
              </div>
              <div className="text-sm font-semibold mb-1" style={{ color: "var(--navy)" }}>
                {s.title}
              </div>
              <div className="text-xs" style={{ color: "var(--muted)", letterSpacing: "0.04em" }}>
                {s.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
