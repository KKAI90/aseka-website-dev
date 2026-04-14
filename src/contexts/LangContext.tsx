"use client";
import { createContext, useContext, useState } from "react";

export type Lang = "JP" | "EN" | "VN";

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "JP",
  setLang: () => {},
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("JP");
  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
