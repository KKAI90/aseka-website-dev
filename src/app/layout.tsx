import type { Metadata } from "next";
import "./globals.css";
import HostGuard from "@/components/HostGuard";

export const metadata: Metadata = {
  title: "Aseka株式会社 | ベトナム人材紹介・年金・ビザサポート",
  description:
    "人材紹介から年金・ビザ手続きまで。ベトナム語対応スタッフが日本での生活と仕事を全力サポート。Dịch vụ giới thiệu nhân sự, hỗ trợ nenkin và visa tại Nhật Bản.",
  keywords: ["ベトナム人材", "年金サポート", "観光ビザ", "nhân sự Việt Nam", "nenkin", "visa Nhật"],
  openGraph: {
    title: "Aseka株式会社",
    description: "ベトナム人材紹介・年金・ビザサポート",
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
      <body><HostGuard />{children}</body>
    </html>
  );
}
