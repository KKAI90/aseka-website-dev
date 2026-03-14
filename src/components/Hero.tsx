import Link from "next/link";
import Image from "next/image";

const kpis = [
  { num: "800+", label: "登録スタッフ", sub: "Ứng viên đăng ký" },
  { num: "97%", label: "定着率", sub: "Tỷ lệ gắn bó" },
  { num: "200+", label: "対応企業", sub: "Doanh nghiệp" },
];

const photos = [
  {
    src: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80",
    alt: "Japanese restaurant kitchen",
    label: "飲食・レストラン",
    labelVn: "Nhà hàng",
  },
  {
    src: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80",
    alt: "Factory manufacturing",
    label: "製造・工場",
    labelVn: "Nhà máy",
  },
  {
    src: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&q=80",
    alt: "Japan city professional",
    label: "ホテル・サービス",
    labelVn: "Khách sạn",
  },
];

export default function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      {/* Left */}
      <div>
        <div
          className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-5"
          style={{ background: "var(--navy-light)", color: "#0C447C" }}
        >
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#378ADD" }} />
          ベトナム人材・生活サポート総合窓口
        </div>

        <h1 className="text-4xl font-bold leading-snug mb-2" style={{ color: "var(--navy)", letterSpacing: "-0.01em" }}>
          日本での<span style={{ color: "var(--accent)" }}>生活と仕事</span>を、
          <br />
          Asekaが全力サポート。
        </h1>

        <p className="text-sm mb-3" style={{ color: "var(--muted)", letterSpacing: "0.05em" }}>
          Aseka — Đồng hành cùng người Việt tại Nhật Bản
        </p>

        <p className="text-sm leading-relaxed mb-7" style={{ color: "var(--muted)" }}>
          人材紹介から年金・ビザ手続きまで。
          <br />
          ベトナム語対応スタッフが、あなたの悩みを解決します。
        </p>

        <div className="flex flex-wrap gap-3 mb-8">
          <Link href="#contact" className="btn-navy no-underline">人材を採用したい →</Link>
          <Link href="#contact" className="btn-ghost no-underline">仕事を探している</Link>
        </div>

        {/* KPIs */}
        <div className="flex gap-7">
          {kpis.map((k) => (
            <div key={k.label}>
              <div className="text-2xl font-bold" style={{ color: "var(--navy)" }}>{k.num}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{k.label}</div>
              <div className="text-xs" style={{ color: "var(--muted)", opacity: 0.6 }}>{k.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — Photo grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Main large photo */}
        <div className="col-span-2 relative rounded-2xl overflow-hidden" style={{ height: "220px" }}>
          <img
            src={photos[0].src}
            alt={photos[0].alt}
            className="w-full h-full object-cover"
          />
          {/* Overlay label */}
          <div
            className="absolute bottom-0 left-0 right-0 px-4 py-3"
            style={{ background: "linear-gradient(to top, rgba(11,31,58,0.85) 0%, transparent 100%)" }}
          >
            <div className="text-white text-sm font-semibold">{photos[0].label}</div>
            <div className="text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>{photos[0].labelVn}</div>
          </div>
        </div>

        {/* Two smaller photos */}
        {photos.slice(1).map((p) => (
          <div key={p.src} className="relative rounded-xl overflow-hidden" style={{ height: "140px" }}>
            <img
              src={p.src}
              alt={p.alt}
              className="w-full h-full object-cover"
            />
            <div
              className="absolute bottom-0 left-0 right-0 px-3 py-2"
              style={{ background: "linear-gradient(to top, rgba(11,31,58,0.85) 0%, transparent 100%)" }}
            >
              <div className="text-white text-xs font-semibold">{p.label}</div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.65)" }}>{p.labelVn}</div>
            </div>
          </div>
        ))}

        {/* Trust badge */}
        <div
          className="col-span-2 flex items-center gap-3 rounded-xl px-4 py-3"
          style={{ border: "0.5px solid var(--border)", background: "#fff" }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--green-bg)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#27500A" strokeWidth="2">
              <path d="M9 12l2 2 4-4M12 3a9 9 0 100 18 9 9 0 000-18z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold" style={{ color: "var(--navy)" }}>
              ベトナム語で全対応
            </div>
            <div className="text-xs" style={{ color: "var(--muted)" }}>
              Hỗ trợ hoàn toàn bằng tiếng Việt · 24時間以内に返信
            </div>
          </div>
          <div
            className="text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{ background: "var(--navy-light)", color: "#0C447C" }}
          >
            無料相談
          </div>
        </div>
      </div>
    </section>
  );
}
Done
File đã có photo grid rồi — nhưng website vẫn hiện dashboard cũ nghĩa là chưa push lần này. Chạy ngay:

bash
cd ~/Downloads/aseka
git status
Nếu thấy Hero.tsx trong danh sách → chưa push, chạy tiếp:

bash
git add .
git commit -m "feat: replace dashboard with photo grid"
git push
Nếu muốn đổi ảnh khác đẹp hơn cho phù hợp Aseka, mở src/components/Hero.tsx → tìm phần const photos → thay 3 URL ảnh này:

tsx
const photos = [
  {
    // Ảnh 1 — TO LỚN — nhà hàng Nhật chuyên nghiệp
    src: "https://images.unsplash.com/photo-1514190051997-0f6f39ca5cde?w=800&q=85",
    alt: "Japanese restaurant",
    label: "飲食・レストラン",
    labelVn: "Nhà hàng · Quán ăn",
  },
  {
    // Ảnh 2 — nhỏ trái — công nhân nhà máy
    src: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&q=85",
    alt: "Factory worker",
    label: "製造・工場",
    labelVn: "Nhà máy · Xí nghiệp",
  },
  {
    // Ảnh 3 — nhỏ phải — nông nghiệp Nhật
    src: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=400&q=85",
    alt: "Agriculture Japan",
    label: "農業・農場",
    labelVn: "Nông nghiệp",
  },
];
Sau khi sửa:

bash
git add .
git commit -m "feat: update hero photos"
git push
~2 phút sau website cập nhật! Báo mình kết quả nhé.



