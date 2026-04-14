"use client";
import Image from "next/image";
import Link from "next/link";
import { useLang } from "@/contexts/LangContext";

const NAV_LABELS = {
  JP: [
    { href: "/",        label: "TOP" },
    { href: "/about",   label: "ABOUT US" },
    { href: "/company", label: "SERVICE" },
    { href: "/contact", label: "CONTACT" },
  ],
  EN: [
    { href: "/",        label: "TOP" },
    { href: "/about",   label: "ABOUT US" },
    { href: "/company", label: "SERVICE" },
    { href: "/contact", label: "CONTACT" },
  ],
  VN: [
    { href: "/",        label: "TRANG CHỦ" },
    { href: "/about",   label: "GIỚI THIỆU" },
    { href: "/company", label: "CÔNG TY" },
    { href: "/contact", label: "LIÊN HỆ" },
  ],
};

const ADDRESS = {
  JP: { line1: "〒101-0025 東京都千代田区神田佐久間町3-27-3", line2: "ガーデンパークビル５F" },
  EN: { line1: "Kanda Sakumacho 3-27-3, Chiyoda-ku, Tokyo 101-0025", line2: "Garden Park Building 5F" },
  VN: { line1: "3-27-3 Kanda Sakumacho, Chiyoda-ku, Tokyo 101-0025", line2: "Tòa nhà Garden Park, Tầng 5" },
};

export default function Footer() {
  const { lang } = useLang();
  const links = NAV_LABELS[lang];

  return (
    <footer style={{ background: "#111", borderTop: "1px solid rgba(184,150,62,0.18)" }}>

      {/* Main footer row */}
      <div style={{
        padding: "48px 60px",
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        alignItems: "center",
        gap: "48px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }} className="lux-footer-inner">

        {/* Logo */}
        <Image
          src="/images/aseka-logo-icon.png"
          alt="ASEKA"
          width={64} height={64}
          style={{ objectFit: "contain", width: "64px", height: "64px" }}
        />

        {/* Nav links — centered */}
        <div style={{ display: "flex", gap: "32px", justifyContent: "center", flexWrap: "wrap" }} className="footer-links">
          {links.map((l) => (
            <Link key={l.href} href={l.href} style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: "11px", letterSpacing: "2px",
              color: "rgba(250,247,242,0.45)", textDecoration: "none",
              textTransform: "uppercase", transition: "color 0.3s",
            }} className="footer-link">
              {l.label}
            </Link>
          ))}
        </div>

        {/* Address */}
        <div style={{
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: "12px", lineHeight: 2,
          color: "rgba(250,247,242,0.5)", textAlign: "right",
        }}>
          {ADDRESS[lang].line1}<br />{ADDRESS[lang].line2}<br />
          <span style={{ color: "rgba(250,247,242,0.35)", fontSize: "11px" }}>
            Tel: 03-6231-9969　｜　{lang === "JP" ? "代表取締役：内田 隆嗣" : lang === "EN" ? "Representative Director: Takashi Uchida" : "Giám đốc: Uchida Takashi"}
          </span>
        </div>
      </div>

      {/* Copyright bar */}
      <div style={{
        padding: "14px 60px",
        display: "flex", justifyContent: "center", alignItems: "center",
      }}>
        <span style={{
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: "11px", letterSpacing: "1px",
          color: "rgba(250,247,242,0.25)",
        }}>
          © 2022 ASEKA Co., Ltd. All rights reserved.
        </span>
      </div>

      <style>{`
        .footer-link:hover { color: var(--gold) !important; }
        @media (max-width: 900px) {
          .lux-footer-inner {
            grid-template-columns: 1fr !important;
            justify-items: center !important;
            text-align: center !important;
            padding: 40px 24px !important;
          }
          .lux-footer-inner > div:last-child { text-align: center !important; }
        }
      `}</style>
    </footer>
  );
}
