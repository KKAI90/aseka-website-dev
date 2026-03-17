"use client";
import { useState } from "react";
import Link from "next/link";
import { useLang } from "@/contexts/LangContext";

const NAV = {
  JP: [
    { href: "#services", label: "サービス" },
    { href: "#nenkin",   label: "年金・手続き" },
    { href: "#visa",     label: "ビザサポート" },
    { href: "#about",    label: "会社概要" },
  ],
  VN: [
    { href: "#services", label: "Dịch vụ" },
    { href: "#nenkin",   label: "Nenkin" },
    { href: "#visa",     label: "Visa" },
    { href: "#about",    label: "Về chúng tôi" },
  ],
};

export default function Navbar() {
  const { lang, setLang } = useLang();
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = NAV[lang];

  return (
    <nav
      style={{ borderBottom: "0.5px solid var(--border)" }}
      className="sticky top-0 z-50 bg-white"
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--navy)" }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L18 7V13L10 18L2 13V7Z" stroke="white" strokeWidth="1.4" fill="none" />
              <circle cx="10" cy="10" r="3" fill="white" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-widest" style={{ color: "var(--navy)", letterSpacing: "0.1em" }}>
              ASEKA
            </span>
            <span className="text-xs" style={{ color: "var(--muted)", marginTop: "-2px", letterSpacing: "0.04em" }}>
              aseka株式会社
            </span>
          </div>
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-6">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm no-underline" style={{ color: "var(--muted)" }}>
              {item.label}
            </Link>
          ))}

          {/* Language toggle */}
          <div className="flex overflow-hidden rounded" style={{ border: "0.5px solid var(--border)" }}>
            {(["JP", "VN"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className="px-2.5 py-1 text-xs border-none cursor-pointer transition-all"
                style={{
                  background: lang === l ? "var(--navy)" : "transparent",
                  color: lang === l ? "#fff" : "var(--muted)",
                }}
              >
                {l}
              </button>
            ))}
          </div>

          <Link href="/dang-ky" className="btn-ghost text-sm no-underline" style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>
            {lang === "JP" ? "仕事を探す / Tìm việc" : "Tìm việc làm"}
          </Link>
          <Link href="/mypage/login"
            className="text-sm no-underline inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold transition-all"
            style={{ background: "var(--navy)", color: "#fff" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            {lang === "JP" ? "マイページ" : "Trang cá nhân"}
          </Link>
          <Link href="#contact" className="btn-accent text-sm no-underline">
            {lang === "JP" ? "お問い合わせ" : "Liên hệ"}
          </Link>
        </div>

        {/* Mobile burger */}
        <button
          className="md:hidden p-2 border-none bg-transparent cursor-pointer"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="メニュー"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <line x1="3" y1="6"  x2="19" y2="6"  stroke="var(--navy)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="3" y1="11" x2="19" y2="11" stroke="var(--navy)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="3" y1="16" x2="19" y2="16" stroke="var(--navy)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="md:hidden px-6 pb-5 flex flex-col gap-4"
          style={{ borderTop: "0.5px solid var(--border)", background: "#fff" }}
        >
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm no-underline" style={{ color: "var(--muted)" }} onClick={() => setMobileOpen(false)}>
              {item.label}
            </Link>
          ))}
          {/* Mobile lang toggle */}
          <div className="flex overflow-hidden rounded w-fit" style={{ border: "0.5px solid var(--border)" }}>
            {(["JP", "VN"] as const).map((l) => (
              <button key={l} onClick={() => setLang(l)}
                className="px-3 py-1.5 text-xs border-none cursor-pointer"
                style={{ background: lang === l ? "var(--navy)" : "transparent", color: lang === l ? "#fff" : "var(--muted)" }}>
                {l}
              </button>
            ))}
          </div>
          <Link href="#contact" className="btn-accent text-sm no-underline text-center">
            {lang === "JP" ? "お問い合わせ" : "Liên hệ"}
          </Link>
        </div>
      )}
    </nav>
  );
}
