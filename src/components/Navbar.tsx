"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const links = [
  { href: "/", label: "TOP" },
  { href: "#about", label: "ABOUT US" },
  { href: "/company", label: "COMPANY" },
  { href: "#services", label: "SERVICES" },
  { href: "#contact", label: "CONTACT" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "16px 60px",
      background: "rgba(250,247,242,0.92)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(184,150,62,0.25)",
    }}>
      {/* Logo */}
      <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
        <Image
          src="/images/aseka-logo.png"
          alt="ASEKA"
          width={120}
          height={40}
          style={{ objectFit: "contain", height: "36px", width: "auto" }}
          priority
        />
      </Link>

      {/* Desktop links */}
      <ul style={{ display: "flex", gap: "36px", listStyle: "none", margin: 0, padding: 0 }}
        className="hidden md:flex">
        {links.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="lux-nav-link" style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: "11px", letterSpacing: "2px",
              textDecoration: "none", color: "var(--warm-gray)",
              textTransform: "uppercase", transition: "color 0.3s",
            }}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

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
        </div>
      )}

      <style>{`.lux-nav-link:hover { color: var(--gold) !important; }`}</style>
    </nav>
  );
}
