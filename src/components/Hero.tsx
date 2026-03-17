"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const kpis = [
  { num: "800+", label: "登録スタッフ", sub: "Ứng viên đăng ký" },
  { num: "97%",  label: "定着率",       sub: "Tỷ lệ gắn bó" },
  { num: "200+", label: "対応企業",     sub: "Doanh nghiệp" },
];

const slides = [
  {
    big:   { src: "https://images.unsplash.com/photo-1514190051997-0f6f39ca5cde?w=900&q=85", alt: "Japanese restaurant", label: "飲食・レストラン", labelVn: "Nhà hàng · Quán ăn" },
    sm1:   { src: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&q=80", alt: "Factory worker",    label: "製造・工場",    labelVn: "Nhà máy · Xí nghiệp" },
    sm2:   { src: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=500&q=80", alt: "Agriculture Japan", label: "農業・農場",    labelVn: "Nông nghiệp" },
  },
  {
    big:   { src: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&q=85", alt: "Hotel Japan",       label: "ホテル・宿泊",  labelVn: "Khách sạn" },
    sm1:   { src: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&q=80", alt: "Hotel interior",   label: "サービス業",    labelVn: "Dịch vụ" },
    sm2:   { src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&q=80", alt: "Team work Japan",  label: "オフィスワーク", labelVn: "Văn phòng" },
  },
  {
    big:   { src: "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=900&q=85", alt: "Construction Japan", label: "建設・土木",  labelVn: "Xây dựng" },
    sm1:   { src: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&q=80", alt: "Medical care",     label: "介護・医療",    labelVn: "Điều dưỡng" },
    sm2:   { src: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&q=80", alt: "Factory",          label: "製造・工場",    labelVn: "Nhà máy" },
  },
];

type PhotoCard = { src: string; alt: string; label: string; labelVn: string };

function PhotoCard({ photo, height, labelSize = "sm" }: { photo: PhotoCard; height: string; labelSize?: "sm" | "lg" }) {
  return (
    <div style={{ position: "relative", width: "100%", height, borderRadius: labelSize === "lg" ? "16px" : "12px", overflow: "hidden" }}>
      <img src={photo.src} alt={photo.alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: labelSize === "lg" ? "12px 16px" : "8px 12px",
        background: "linear-gradient(to top, rgba(11,31,58,0.88) 0%, transparent 100%)",
      }}>
        <div style={{ color: "#fff", fontSize: labelSize === "lg" ? "14px" : "12px", fontWeight: 600 }}>{photo.label}</div>
        <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "10px" }}>{photo.labelVn}</div>
      </div>
    </div>
  );
}

export default function Hero() {
  const [cur, setCur] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const t = setInterval(() => goTo((c: number) => (c + 1) % slides.length), 4000);
    return () => clearInterval(t);
  }, []);

  const goTo = (next: number | ((c: number) => number)) => {
    const nextIdx = typeof next === "function" ? next(cur) : next;
    if (nextIdx === cur) return;
    setPrev(cur);
    setFading(true);
    setTimeout(() => {
      setCur(nextIdx);
      setFading(false);
      setPrev(null);
    }, 500);
  };

  const slide = slides[cur];
  const prevSlide = prev !== null ? slides[prev] : null;

  return (
    <section className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      {/* LEFT */}
      <div>
        <div
          className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-5"
          style={{ background: "var(--navy-light)", color: "#0C447C" }}
        >
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#378ADD" }} />
          ベトナム人材・生活サポート総合窓口
        </div>

        <h1 className="text-4xl font-bold leading-snug mb-2" style={{ color: "var(--navy)", letterSpacing: "-0.01em" }}>
          日本での<span style={{ color: "var(--accent)" }}>生活と仕事</span>を、<br />Asekaが全力サポート。
        </h1>

        <p className="text-sm mb-3" style={{ color: "var(--muted)", letterSpacing: "0.05em" }}>
          Aseka — Đồng hành cùng người Việt tại Nhật Bản
        </p>
        <p className="text-sm leading-relaxed mb-7" style={{ color: "var(--muted)" }}>
          人材紹介から年金・ビザ手続きまで。<br />ベトナム語対応スタッフが、あなたの悩みを解決します。
        </p>

        <div className="flex flex-wrap gap-3 mb-8">
          <Link href="#contact" className="btn-navy no-underline">人材を採用したい →</Link>
          <Link href="/dang-ky" className="btn-ghost no-underline">仕事を探している →</Link>
        </div>

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

      {/* RIGHT — slideshow */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

        {/* Big image with crossfade */}
        <div style={{ position: "relative", borderRadius: "16px", overflow: "hidden", height: "220px" }}>
          {/* Current */}
          <div style={{ position: "absolute", inset: 0, opacity: fading ? 0 : 1, transition: "opacity 0.5s ease" }}>
            <PhotoCard photo={slide.big} height="220px" labelSize="lg" />
          </div>
          {/* Previous (fades out) */}
          {prevSlide && (
            <div style={{ position: "absolute", inset: 0, opacity: fading ? 1 : 0, transition: "opacity 0.5s ease" }}>
              <PhotoCard photo={prevSlide.big} height="220px" labelSize="lg" />
            </div>
          )}
        </div>

        {/* 2 small images with crossfade */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          {(["sm1", "sm2"] as const).map((key) => (
            <div key={key} style={{ position: "relative", borderRadius: "12px", overflow: "hidden", height: "140px" }}>
              <div style={{ position: "absolute", inset: 0, opacity: fading ? 0 : 1, transition: "opacity 0.5s ease" }}>
                <PhotoCard photo={slide[key]} height="140px" />
              </div>
              {prevSlide && (
                <div style={{ position: "absolute", inset: 0, opacity: fading ? 1 : 0, transition: "opacity 0.5s ease" }}>
                  <PhotoCard photo={prevSlide[key]} height="140px" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Dots + Trust bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 2px" }}>
          {/* Dots */}
          <div style={{ display: "flex", gap: "6px" }}>
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                style={{
                  width: i === cur ? "20px" : "6px",
                  height: "6px",
                  borderRadius: "3px",
                  background: i === cur ? "var(--navy)" : "rgba(11,31,58,0.2)",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>
          {/* Trust badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px", borderRadius: "10px", border: "0.5px solid var(--border)", background: "#fff" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--green-bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#27500A" strokeWidth="2.5">
                <path d="M9 12l2 2 4-4M12 3a9 9 0 100 18 9 9 0 000-18z" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--navy)" }}>ベトナム語で全対応</div>
              <div style={{ fontSize: "10px", color: "var(--muted)" }}>24時間以内に返信</div>
            </div>
            <div style={{ fontSize: "10px", fontWeight: 600, padding: "3px 10px", borderRadius: "20px", background: "var(--navy-light)", color: "#0C447C", flexShrink: 0 }}>無料相談</div>
          </div>
        </div>
      </div>
    </section>
  );
}
