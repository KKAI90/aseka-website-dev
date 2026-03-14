import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aseka BO — Back Office",
  robots: "noindex, nofollow",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "'Noto Sans JP', 'Yu Gothic UI', sans-serif" }}>
      {children}
    </div>
  );
}
