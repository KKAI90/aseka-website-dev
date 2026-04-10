"use client";
import Image from "next/image";
import Link from "next/link";
import { useLang } from "@/contexts/LangContext";

const NAV_LABELS = {
  JP: [
    { href: "/",        label: "TOP" },
    { href: "/about",   label: "ABOUT US" },
    { href: "/company", label: "COMPANY" },
    { href: "/contact", label: "CONTACT" },
  ],
  EN: [
    { href: "/",        label: "TOP" },
    { href: "/about",   label: "ABOUT US" },
    { href: "/company", label: "COMPANY" },
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
  JP: "〒101-0025 東京都千代田区神田佐久間町 3-27-3 レーベンハークビル5F",
  EN: "Kanda Sakumacho 3-27-3, Chiyoda-ku, Tokyo 101-0025 Revenharque Bldg. 5F",
  VN: "3-27-3 Kanda Sakumacho, Chiyoda-ku, Tokyo 101-0025 Tòa nhà Revenharque, Tầng 5",
};

export default function Footer() {
  const { lang } = useLang();
  const links = NAV_LABELS[lang];

  return (
    <footer style={{ background: "#111", borderTop: "1px solid rgba(184,150,62,0.15)" }}>
      <div style={{
        padding: "56px 60px",
        display: "flex", justifyContent: "space-between",
        alignItems: "center", gap: "40px",
      }} className="lux-footer-inner">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Image
            src="/images/aseka-logo-icon.png"
            alt="ASEKA"
            width={48} height={48}
            style={{ objectFit: "contain", width: "48px", height: "48px" }}
          />
          <Image
            src="/images/aseka-logo-text.png"
            alt="ASEKA"
            width={100} height={30}
            style={{ objectFit: "contain", height: "20px", width: "auto", filter: "brightness(0) saturate(100%) invert(55%) sepia(90%) saturate(700%) hue-rotate(5deg) brightness(90%)" }}
          />
        </div>
        <div style={{ display: "flex", gap: "32px" }} className="footer-links">
          {links.map((l) => (
            <Link key={l.href} href={l.href} style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: "11px", letterSpacing: "2px",
              color: "rgba(250,247,242,0.4)", textDecoration: "none",
              textTransform: "uppercase", transition: "color 0.3s",
            }} className="footer-link">
              {l.label}
            </Link>
          ))}
        </div>
        <div style={{
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: "12px", lineHeight: 2,
          color: "rgba(250,247,242,0.5)", textAlign: "right",
        }}>
          {ADDRESS[lang]}<br />
          <span style={{ color: "rgba(250,247,242,0.35)" }}>
            Tel: 03-6231-9969 ｜ {lang === "JP" ? "代表取締役：内田 隆嗣" : lang === "EN" ? "Representative Director: Takashi Uchida" : "Giám đốc Điều hành: Uchida Takashi"}
          </span>
        </div>
      </div>

      <div style={{
        padding: "16px 60px", borderTop: "1px solid rgba(255,255,255,0.05)",
        display: "flex", justifyContent: "center",
      }}>
        <span style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "11px", letterSpacing: "2px",
          color: "rgba(250,247,242,0.2)", fontStyle: "italic",
        }}>
          Copyright © 2022 ASEKA Company. All rights reserved.
        </span>
      </div>

      <style>{`
        .footer-link:hover { color: var(--gold) !important; }
        @media (max-width: 900px) {
          .lux-footer-inner {
            flex-direction: column !important; align-items: center !important;
            text-align: center !important; padding: 44px 24px !important; gap: 28px !important;
          }
          .footer-links { flex-wrap: wrap !important; justify-content: center !important; gap: 20px !important; }
          .lux-footer-inner > div:last-child { text-align: center !important; }
        }
      `}</style>
    </footer>
  );
}
