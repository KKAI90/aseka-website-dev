"use client";
import Link from "next/link";
import { useLang } from "@/contexts/LangContext";

const points: Record<string, { title: string; sub: string }[]> = {
  JP: [
    { title: "脱退一時金の申請代行",  sub: "Đại lý hoàn trả một lần khi về nước" },
    { title: "年金受給資格の確認",    sub: "Kiểm tra điều kiện nhận lương hưu" },
    { title: "ベトナム語で全対応",    sub: "Hỗ trợ hoàn toàn bằng tiếng Việt" },
  ],
  EN: [
    { title: "Lump-Sum Withdrawal Application", sub: "We handle the application process" },
    { title: "Pension Eligibility Check",        sub: "Verify your pension entitlement" },
    { title: "Full Vietnamese Support",          sub: "All services available in Vietnamese" },
  ],
  VN: [
    { title: "Đại lý hoàn trả nenkin một lần", sub: "申請代行で確実に受給" },
    { title: "Kiểm tra điều kiện nhận lương hưu", sub: "年金受給資格の確認" },
    { title: "Hỗ trợ hoàn toàn bằng tiếng Việt", sub: "ベトナム語で全対応" },
  ],
};

const icons = [
  (<svg key="1" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><path d="M9 12l2 2 4-4M12 3a9 9 0 100 18 9 9 0 000-18z"/></svg>),
  (<svg key="2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>),
  (<svg key="3" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>),
];

const T: Record<string, { eyebrow: string; h2: string; sub: string; desc: string; btn: string }> = {
  JP: {
    eyebrow: "Nenkin Support · 年金サポート",
    h2: "帰国前に、\n年金を取り戻そう。",
    sub: "Lấy lại tiền lương hưu trước khi về nước",
    desc: "日本で働いたすべての外国人は、脱退一時金を受け取る権利があります。Asekaがベトナム語で申請をサポート。申請漏れを防ぎ、確実に受給できます。",
    btn: "無料相談はこちら →",
  },
  VN: {
    eyebrow: "Hỗ trợ Nenkin · 年金サポート",
    h2: "Trước khi về nước,\nhãy lấy lại tiền nenkin.",
    sub: "帰国前に年金を取り戻そう",
    desc: "Tất cả người nước ngoài từng làm việc tại Nhật đều có quyền nhận lại tiền nenkin một lần. Aseka hỗ trợ thủ tục bằng tiếng Việt, đảm bảo bạn không bị bỏ sót.",
    btn: "Tư vấn miễn phí →",
  },
};

export default function Nenkin() {
  const { lang } = useLang();
  const t = T[lang];
  const pts = points[lang];
  return (
    <section id="nenkin" style={{ background: "var(--navy)" }} className="py-14">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div>
          <div className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "rgba(255,255,255,0.45)" }}>
            {t.eyebrow}
          </div>
          <h2 className="text-2xl font-bold mb-2 leading-snug" style={{ color: "#fff", whiteSpace: "pre-line" }}>
            {t.h2}
          </h2>
          <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.55)", letterSpacing: "0.04em" }}>{t.sub}</p>
          <p className="text-sm leading-loose mb-6" style={{ color: "rgba(255,255,255,0.65)" }}>{t.desc}</p>
          <Link href="#contact" className="no-underline inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold" style={{ background: "#fff", color: "var(--navy)" }}>
            {t.btn}
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          {pts.map((p, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl p-4" style={{ background: "rgba(255,255,255,0.08)", border: "0.5px solid rgba(255,255,255,0.12)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(255,255,255,0.12)" }}>
                {icons[i]}
              </div>
              <div>
                <div className="text-sm font-semibold mb-0.5" style={{ color: "#fff" }}>{p.title}</div>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>{p.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
