const partners = [
  "Sakura Foods株式会社",
  "東海製造 Holdings",
  "Grand Hotel Nagoya",
  "みどり農業組合",
  "Osaka Service Group",
];

export default function TrustStrip() {
  return (
    <div
      className="flex items-center gap-7 px-6 py-4 overflow-x-auto"
      style={{ borderTop: "0.5px solid var(--border)", borderBottom: "0.5px solid var(--border)" }}
    >
      <span
        className="text-xs flex-shrink-0"
        style={{ color: "var(--muted)", letterSpacing: "0.08em" }}
      >
        取引先 · Đối tác /
      </span>
      <div className="flex gap-7 flex-wrap">
        {partners.map((p) => (
          <span
            key={p}
            className="text-xs font-semibold whitespace-nowrap"
            style={{ color: "var(--muted)", opacity: 0.45, letterSpacing: "0.03em" }}
          >
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}
