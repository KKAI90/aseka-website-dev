import type { Metadata } from "next";
import "./globals.css";
import HostGuard from "@/components/HostGuard";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Aseka株式会社 | ベトナム人材紹介",
  description:
    "ベトナム語対応スタッフが日本での就職・採用を全力サポート。21万人のネットワークで、意欲ある外国人材と企業をつなぎます。",
  keywords: ["ベトナム人材", "外国人採用", "人材紹介", "nhân sự Việt Nam", "tuyển dụng Nhật Bản"],
  openGraph: {
    title: "Aseka株式会社",
    description: "ベトナム人材紹介",
    locale: "ja_JP",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body><HostGuard /><Providers>{children}</Providers></body>
    </html>
  );
}
// prod db migration Thu Apr 16 23:56:54 JST 2026
