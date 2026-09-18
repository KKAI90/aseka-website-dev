"use client";
import { MypageLangProvider } from "@/lib/mypageI18n";

export default function MypageLayout({ children }: { children: React.ReactNode }) {
  return <MypageLangProvider>{children}</MypageLangProvider>;
}
