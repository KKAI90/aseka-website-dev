"use client";
import { LangProvider } from "@/contexts/LangContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <LangProvider>{children}</LangProvider>;
}
