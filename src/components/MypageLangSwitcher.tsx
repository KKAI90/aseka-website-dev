"use client";
import { useMypageLang, type MypageLang } from "@/lib/mypageI18n";

const OPTIONS: { code: MypageLang; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "vi", label: "VI" },
  { code: "ja", label: "JA" },
];

export default function MypageLangSwitcher() {
  const { lang, setLang } = useMypageLang();
  return (
    <div style={{ display: "flex", gap: "2px", background: "#F1F1EF", borderRadius: "8px", padding: "2px" }}>
      {OPTIONS.map(o => (
        <button key={o.code} onClick={() => setLang(o.code)}
          style={{
            padding: "4px 9px",
            borderRadius: "6px",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.02em",
            border: "none",
            cursor: "pointer",
            background: lang === o.code ? "#0B1F3A" : "transparent",
            color: lang === o.code ? "#fff" : "#8A8A85",
            transition: "all 0.15s",
          }}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
