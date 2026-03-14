import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{ borderTop: "0.5px solid var(--border)" }}>
      <div className="max-w-6xl mx-auto px-6 py-7 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div style={{ color: "var(--muted)" }}>
          <div className="text-sm font-semibold mb-0.5" style={{ color: "var(--navy)" }}>
            Aseka株式会社 / công ty aseka
          </div>
          <div className="text-xs">
            © 2025 Aseka Co., Ltd. · 有料職業紹介事業許可番号 XX-XXXXXX
          </div>
          <div className="text-xs mt-0.5">ベトナム語対応 · Hỗ trợ tiếng Việt</div>
        </div>
        <div className="flex flex-wrap gap-5">
          {[
            { href: "/privacy", label: "プライバシーポリシー" },
            { href: "/tokushoho", label: "特定商取引法" },
            { href: "/recruit", label: "採用情報" },
            { href: "#contact", label: "お問い合わせ" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-xs no-underline"
              style={{ color: "var(--muted)" }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
