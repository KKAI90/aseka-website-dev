"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLang, type Lang } from "@/contexts/LangContext";

const NAV_LABELS: Record<Lang, { top: string; about: string; company: string; contact: string }> = {
  JP: { top: "TOP", about: "ABOUT US", company: "SERVICE", contact: "CONTACT" },
  EN: { top: "TOP", about: "ABOUT US", company: "SERVICE", contact: "CONTACT" },
  VN: { top: "TRANG CHỦ", about: "GIỚI THIỆU", company: "SERVICE", contact: "LIÊN HỆ" },
};

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { lang, setLang } = useLang();
  const labels = NAV_LABELS[lang];

  const links = [
    { href: "/", label: labels.top },
    { href: "/about", label: labels.about },
    { href: "/company", label: labels.company },
    { href: "/contact", label: labels.contact },
  ];

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "18px 64px",
      background: "rgba(250,247,242,0.95)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(184,150,62,0.28)",
    }}>
      {/* Logo */}
      <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
        <Image
          src="/images/aseka-logo-icon.png"
          alt="ASEKA"
          width={120}
          height={120}
          style={{ objectFit: "contain", height: "48px", width: "auto" }}
          priority
        />
      </Link>

      {/* Desktop: nav links + lang switcher */}
      <div className="hidden md:flex" style={{ display: "flex", alignItems: "center", gap: "40px" }}>
        <ul style={{ display: "flex", gap: "40px", listStyle: "none", margin: 0, padding: 0 }}>
          {links.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="lux-nav-link" style={{
                fontFamily: "'Noto Sans JP', sans-serif",
                fontSize: "13px", letterSpacing: "2px",
                textDecoration: "none", color: "#4a4540",
                textTransform: "uppercase", transition: "color 0.3s",
                fontWeight: 400,
              }}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Divider */}
        <div style={{ width: "1px", height: "18px", background: "rgba(184,150,62,0.4)", flexShrink: 0 }} />

        {/* Language switcher */}
        <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
          {(["JP", "EN", "VN"] as const).map((l, i) => (
            <span key={l} style={{ display: "flex", alignItems: "center" }}>
              {i > 0 && (
                <span style={{ color: "rgba(184,150,62,0.35)", fontSize: "11px", padding: "0 4px" }}>|</span>
              )}
              <button
                onClick={() => setLang(l)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "14px", letterSpacing: "2px",
                  color: lang === l ? "var(--gold)" : "#4a4540",
                  fontWeight: lang === l ? 600 : 400,
                  padding: "3px 5px",
                  borderBottom: lang === l ? "1px solid var(--gold)" : "1px solid transparent",
                  transition: "all 0.2s",
                }}
              >
                {l}
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Mobile burger */}
      <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}
        style={{ background: "none", border: "none", cursor: "pointer", padding: "8px" }}
        aria-label="メニュー">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <line x1="3" y1="6"  x2="19" y2="6"  stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="3" y1="11" x2="19" y2="11" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="3" y1="16" x2="19" y2="16" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden" style={{
          position: "absolute", top: "100%", left: 0, right: 0,
          background: "rgba(250,247,242,0.97)",
          backdropFilter: "blur(12px)",
          padding: "20px 24px",
          borderBottom: "1px solid rgba(184,150,62,0.25)",
          display: "flex", flexDirection: "column", gap: "16px",
        }}>
          {links.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} style={{
              fontSize: "12px", letterSpacing: "2px",
              color: "var(--warm-gray)", textDecoration: "none",
              textTransform: "uppercase",
            }}>
              {item.label}
            </Link>
          ))}
          {/* Mobile lang switcher */}
          <div style={{ display: "flex", gap: "12px", paddingTop: "8px", borderTop: "1px solid rgba(184,150,62,0.2)" }}>
            {(["JP", "EN", "VN"] as const).map((l) => (
              <button
                key={l}
                onClick={() => { setLang(l); setMobileOpen(false); }}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "13px", letterSpacing: "1.5px",
                  color: lang === l ? "var(--gold)" : "var(--warm-gray)",
                  fontWeight: lang === l ? 600 : 400,
                  padding: "4px 0",
                  borderBottom: lang === l ? "1px solid var(--gold)" : "1px solid transparent",
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`.lux-nav-link:hover { color: var(--gold) !important; }`}</style>
    </nav>
  );
}
