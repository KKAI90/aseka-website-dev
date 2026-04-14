"use client";
import Link from "next/link";
import { useLang } from "@/contexts/LangContext";

const steps: Record<string, { num: string; title: string; sub: string }[]> = {
  JP: [
    { num: "1", title: "招聘状・身元保証書の作成",  sub: "Soạn thảo thư bảo lãnh và giấy tờ mời" },
    { num: "2", title: "必要書類のチェック・翻訳",  sub: "Kiểm tra và dịch thuật hồ sơ cần thiết" },
    { num: "3", title: "大使館への申請サポート",    sub: "Hỗ trợ nộp hồ sơ tại đại sứ quán" },
    { num: "4", title: "ビザ取得後のアドバイス",    sub: "Tư vấn sau khi có visa nhập cảnh" },
  ],
  VN: [
    { num: "1", title: "Soạn thư bảo lãnh & giấy mời", sub: "招聘状・身元保証書の作成" },
    { num: "2", title: "Kiểm tra & dịch hồ sơ",        sub: "必要書類のチェック・翻訳" },
    { num: "3", title: "Nộp hồ sơ tại đại sứ quán",    sub: "大使館への申請サポート" },
    { num: "4", title: "Tư vấn sau khi có visa",        sub: "ビザ取得後のアドバイス" },
  ],
};

const T: Record<string, { eyebrow: string; h2: string; sub: string; desc: string; btn: string }> = {
  JP: {
    eyebrow: "Visa Support · ビザサポート",
    h2: "ご家族の日本訪問を、\nAsekaが全力支援。",
    sub: "Hỗ trợ làm visa du lịch cho người thân sang thăm",
    desc: "両親・兄弟・配偶者など、ご家族の短期観光ビザ申請をサポート。招聘状の作成から大使館提出まで、ベトナム語で丁寧に対応します。",
    btn: "ビザ相談をする →",
  },
  VN: {
    eyebrow: "Hỗ trợ Visa · ビザサポート",
    h2: "Hỗ trợ visa du lịch\ncho người thân sang thăm.",
    sub: "ご家族の日本訪問をサポート",
    desc: "Visa ngắn hạn cho bố mẹ, anh chị em, vợ/chồng. Từ soạn thư bảo lãnh đến nộp hồ sơ đại sứ quán, Aseka hỗ trợ hoàn toàn bằng tiếng Việt.",
    btn: "Tư vấn visa →",
  },
};

export default function Visa() {
  const { lang } = useLang();
  const t = T[lang];
  const stps = steps[lang];
  return (
    <section id="visa" className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
      <div>
        <div className="section-eyebrow">{t.eyebrow}</div>
        <div className="section-title" style={{ fontSize: "22px", whiteSpace: "pre-line" }}>{t.h2}</div>
        <p className="text-sm mb-2" style={{ color: "var(--muted)", letterSpacing: "0.04em" }}>{t.sub}</p>
        <p className="text-sm leading-loose mb-6" style={{ color: "var(--muted)" }}>{t.desc}</p>
        <Link href="#contact" className="btn-navy no-underline">{t.btn}</Link>
      </div>
      <div className="flex flex-col gap-3">
        {stps.map((s) => (
          <div key={s.num} className="card flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5" style={{ background: "var(--navy-light)", color: "#0C447C" }}>
              {s.num}
            </div>
            <div>
              <div className="text-sm font-semibold mb-0.5" style={{ color: "var(--navy)" }}>{s.title}</div>
              <div className="text-xs" style={{ color: "var(--muted)" }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
