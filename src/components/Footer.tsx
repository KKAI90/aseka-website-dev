import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{
      background: "#111",
      borderTop: "1px solid rgba(184,150,62,0.15)",
    }}>
      {/* Main footer row */}
      <div style={{
        padding: "56px 60px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "40px",
      }} className="lux-footer-inner">

        {/* Logo */}
        <Image
          src="/images/aseka-logo.png"
          alt="ASEKA"
          width={140}
          height={48}
          style={{ objectFit: "contain", height: "42px", width: "auto" }}
        />

        {/* Nav links */}
        <div style={{
          display: "flex", gap: "32px",
        }} className="footer-links">
          {[
            { href: "/", label: "TOP" },
            { href: "#about", label: "ABOUT US" },
            { href: "/company", label: "COMPANY" },
            { href: "#contact", label: "CONTACT" },
          ].map((l) => (
            <Link key={l.href} href={l.href} style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: "11px", letterSpacing: "2px",
              color: "rgba(250,247,242,0.4)",
              textDecoration: "none",
              textTransform: "uppercase",
              transition: "color 0.3s",
            }} className="footer-link">
              {l.label}
            </Link>
          ))}
        </div>

        {/* Address block */}
        <div style={{
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: "12px", lineHeight: 2,
          color: "rgba(250,247,242,0.5)",
          textAlign: "right",
        }}>
          〒101-0025 東京都千代田区神田佐久間町 3-27-3 レーベンハークビル5F<br />
          <span style={{ color: "rgba(250,247,242,0.35)" }}>
            Tel: 03-6231-9969 ｜ 代表取締役：グェン ティラン タリ
          </span>
        </div>
      </div>

      {/* Copyright bar */}
      <div style={{
        padding: "16px 60px",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        display: "flex", justifyContent: "center",
      }}>
        <span style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "11px", letterSpacing: "2px",
          color: "rgba(250,247,242,0.2)",
          fontStyle: "italic",
        }}>
          Copyright © 2022 ASEKA Company. All rights reserved.
        </span>
      </div>

      <style>{`
        .footer-link:hover { color: var(--gold) !important; }
        @media (max-width: 900px) {
          .lux-footer-inner {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
            padding: 44px 24px !important;
            gap: 28px !important;
          }
          .footer-links { flex-wrap: wrap !important; justify-content: center !important; gap: 20px !important; }
          .lux-footer-inner > div:last-child { text-align: center !important; }
        }
      `}</style>
    </footer>
  );
}
