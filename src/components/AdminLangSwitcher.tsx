"use client";
import { useAdminLang, type AdminLang } from "@/lib/adminI18n";

const OPTIONS: { code: AdminLang; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "vi", label: "VI" },
  { code: "ja", label: "JA" },
];

export default function AdminLangSwitcher({ compact, variant = "dark" }: { compact?: boolean; variant?: "dark" | "light" }) {
  const { lang, setLang } = useAdminLang();
  const trackBg = variant === "dark" ? "rgba(255,255,255,0.07)" : "#F1F1EF";
  const inactiveColor = variant === "dark" ? "rgba(255,255,255,0.55)" : "#8A8A85";
  const activeBg = variant === "dark" ? "#fff" : "#0B1F3A";
  const activeColor = variant === "dark" ? "#0B1F3A" : "#fff";
  return (
    <div style={{ display: "flex", gap: "2px", background: trackBg, borderRadius: "8px", padding: "2px" }}>
      {OPTIONS.map(o => (
        <button key={o.code} onClick={() => setLang(o.code)}
          style={{
            padding: compact ? "3px 7px" : "4px 9px",
            borderRadius: "6px",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.02em",
            border: "none",
            cursor: "pointer",
            background: lang === o.code ? activeBg : "transparent",
            color: lang === o.code ? activeColor : inactiveColor,
            transition: "all 0.15s",
          }}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
