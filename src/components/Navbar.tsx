"use client";
import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [lang, setLang] = useState<"JP" | "VN">("JP");
  const [mobileOpen, setMobileOpen] = useState(false);

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
              <path
                d="M10 2L18 7V13L10 18L2 13V7Z"
                stroke="white"
                strokeWidth="1.4"
                fill="none"
              />
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
          <Link href="#services" className="text-sm no-underline" style={{ color: "var(--muted)" }}>
            サービス
          </Link>
          <Link href="#nenkin" className="text-sm no-underline" style={{ color: "var(--muted)" }}>
            年金・手続き
          </Link>
          <Link href="#visa" className="text-sm no-underline" style={{ color: "var(--muted)" }}>
            ビザサポート
          </Link>
          <Link href="#about" className="text-sm no-underline" style={{ color: "var(--muted)" }}>
            会社概要
          </Link>

          {/* Language toggle */}
          <div
            className="flex overflow-hidden rounded"
            style={{ border: "0.5px solid var(--border)" }}
          >
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

          <Link href="#contact" className="btn-accent text-sm no-underline">
            お問い合わせ
          </Link>
        </div>

        {/* Mobile burger */}
        <button
          className="md:hidden p-2 border-none bg-transparent cursor-pointer"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="メニュー"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <line x1="3" y1="6" x2="19" y2="6" stroke="var(--navy)" strokeWidth="1.5" strokeLinecap="round" />
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
          {["#services", "#nenkin", "#visa", "#about"].map((href, i) => {
            const labels = ["サービス", "年金・手続き", "ビザサポート", "会社概要"];
            return (
              <Link
                key={href}
                href={href}
                className="text-sm no-underline"
                style={{ color: "var(--muted)" }}
                onClick={() => setMobileOpen(false)}
              >
                {labels[i]}
              </Link>
            );
          })}
          <Link href="#contact" className="btn-accent text-sm no-underline text-center">
            お問い合わせ
          </Link>
        </div>
      )}
    </nav>
  );
}
