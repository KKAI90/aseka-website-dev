"use client";
import { useLang } from "@/contexts/LangContext";
import { useEffect, useRef, useState } from "react";

function useCountUp(target: number, duration = 1600, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      setCount(Math.floor(ease * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

const PLATFORMS = [
  {
    name: "Facebook",
    color: "#1877F2",
    stat: 118000,
    suffix: "+",
    statLabel: { JP: "フォロワー", EN: "Followers", VN: "Người theo dõi" },
    href: "#", // TODO: replace with real URL
  },
  {
    name: "YouTube",
    color: "#FF0000",
    stat: 46000,
    suffix: "+",
    statLabel: { JP: "チャンネル登録者", EN: "Subscribers", VN: "Đăng ký kênh" },
    href: "#", // TODO: replace with real URL
  },
  {
    name: "TikTok",
    color: "#000000",
    stat: 55000,
    suffix: "+",
    statLabel: { JP: "フォロワー", EN: "Followers", VN: "Người theo dõi" },
    href: "#", // TODO: replace with real URL
  },
];

const T = {
  JP: {
    eyebrow: "NETWORK",
    title: "21万人ネットワーク",
    paragraphs: [
      "当社は、Facebook・YouTube・TikTokを中心に、累計21万人以上のフォロワーを有しています。",
      "フォロワーの約7割が日本在住、約9割が18歳〜34歳の若年層で構成されており、日本での就業意欲が高い人材が多い点が特徴です。",
      "また、日本語能力においても、N3以上の保有者が多数を占めており、即戦力として活躍可能な人材が集まっています。",
      "このネットワークにより、採用難易度の高い外国人材に対しても、安定した母集団形成を実現します。",
    ],
    stats: [
      { value: 210000, suffix: "+", label: "累計フォロワー" },
      { value: 70, suffix: "%", label: "日本在住" },
      { value: 90, suffix: "%", label: "18〜34歳" },
    ],
  },
  EN: {
    eyebrow: "NETWORK",
    title: "210,000+ Network",
    paragraphs: [
      "We have accumulated over 210,000 followers across Facebook, YouTube, and TikTok.",
      "Approximately 70% of followers reside in Japan, and about 90% are young adults aged 18–34 with a strong desire to work in Japan.",
      "Many followers hold JLPT N3 or above, making them immediately deployable as capable professionals.",
      "This network enables stable talent pipeline formation even for hard-to-fill foreign national positions.",
    ],
    stats: [
      { value: 210000, suffix: "+", label: "Total Followers" },
      { value: 70, suffix: "%", label: "Based in Japan" },
      { value: 90, suffix: "%", label: "Aged 18–34" },
    ],
  },
  VN: {
    eyebrow: "NETWORK",
    title: "Mạng lưới 210,000+",
    paragraphs: [
      "Chúng tôi đã tích lũy hơn 210,000 người theo dõi trên Facebook, YouTube và TikTok.",
      "Khoảng 70% người theo dõi đang sinh sống tại Nhật Bản, và khoảng 90% là người trẻ từ 18–34 tuổi.",
      "Nhiều người theo dõi có trình độ JLPT N3 trở lên, sẵn sàng làm việc ngay lập tức.",
      "Mạng lưới này giúp chúng tôi xây dựng nguồn ứng viên ổn định, kể cả với những vị trí nhân sự nước ngoài khó tuyển.",
    ],
    stats: [
      { value: 210000, suffix: "+", label: "Tổng người theo dõi" },
      { value: 70, suffix: "%", label: "Sống tại Nhật" },
      { value: 90, suffix: "%", label: "Tuổi 18–34" },
    ],
  },
};

function StatCard({ value, suffix, label, started, lang }: {
  value: number; suffix: string; label: string; started: boolean; lang: "JP" | "EN" | "VN";
}) {
  const count = useCountUp(value, value > 1000 ? 1800 : 1000, started);
  const formatted = count.toLocaleString("en-US");
  return (
    <div style={{ background: "white", padding: "28px 16px", textAlign: "center" }}>
      <div style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "clamp(26px, 2.8vw, 40px)", fontWeight: 500,
        color: "var(--gold)", lineHeight: 1, marginBottom: "10px",
      }}>
        {formatted}{suffix}
      </div>
      <div style={{
        fontFamily: "'Noto Sans JP', sans-serif",
        fontSize: lang === "JP" ? "14px" : "13px",
        letterSpacing: "0.3px",
        color: "#3d3833",
        fontWeight: 400,
      }}>
        {label}
      </div>
    </div>
  );
}

type Platform = typeof PLATFORMS[number];

function PlatformCard({ p, lang, started }: { p: Platform; lang: "JP" | "EN" | "VN"; started: boolean }) {
  const count = useCountUp(p.stat, 1600, started);
  return (
    <a
      href={p.href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex", alignItems: "center", gap: "20px",
        padding: "24px 28px",
        background: "white",
        border: "1px solid rgba(184,150,62,0.18)",
        textDecoration: "none",
        transition: "box-shadow 0.25s, transform 0.25s",
        borderLeft: `4px solid ${p.color}`,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
      }}
    >
      <div style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: "16px", fontWeight: 600, color: "#1B3A5C", minWidth: "90px" }}>
        {p.name}
      </div>
      <div style={{ width: "1px", height: "36px", background: "rgba(184,150,62,0.25)", flexShrink: 0 }} />
      <div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", fontWeight: 400, color: "var(--gold)", lineHeight: 1 }}>
          {count.toLocaleString("en-US")}{p.suffix}
        </div>
        <div style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: "11px", color: "#8A8278", marginTop: "3px" }}>
          {p.statLabel[lang]}
        </div>
      </div>
      <div style={{ marginLeft: "auto", color: "rgba(184,150,62,0.6)", fontSize: "18px" }}>→</div>
    </a>
  );
}

function PlatformCards({ lang }: { lang: "JP" | "EN" | "VN" }) {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {PLATFORMS.map((p) => (
        <PlatformCard key={p.name} p={p} lang={lang} started={started} />
      ))}
    </div>
  );
}

export default function HomeNetwork() {
  const { lang } = useLang();
  const t = T[lang];

  const statsRef = useRef<HTMLDivElement>(null);
  const [statsStarted, setStatsStarted] = useState(false);
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStatsStarted(true); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section style={{ background: "var(--cream)", overflow: "hidden", padding: "100px 60px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: "72px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginBottom: "20px" }}>
            <div style={{ width: "48px", height: "1px", background: "var(--gold)", opacity: 0.5 }} />
            <span style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: "12px", letterSpacing: "3px",
              color: "var(--gold)", fontStyle: "normal", fontWeight: 400,
            }}>{t.eyebrow}</span>
            <div style={{ width: "48px", height: "1px", background: "var(--gold)", opacity: 0.5 }} />
          </div>
          <h2 style={{
            fontFamily: "'Noto Sans JP', sans-serif",
            fontSize: "clamp(24px, 3.2vw, 40px)", fontWeight: 500,
            color: "var(--dark)", letterSpacing: "1px", marginBottom: "16px",
          }}>
            {t.title}
          </h2>
          <div style={{ width: "56px", height: "2px", background: "var(--gold)", opacity: 0.55, margin: "0 auto" }} />
        </div>

        {/* Two-column layout */}
        <div className="network-inner" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "72px", alignItems: "start" }}>

          {/* Left: Platform cards */}
          <div>
            <PlatformCards lang={lang} />
          </div>

          {/* Right: Stats + Text */}
          <div>
            {/* Stats count-up */}
            <div ref={statsRef} style={{
              display: "grid", gridTemplateColumns: "repeat(3,1fr)",
              gap: "1px", background: "rgba(184,150,62,0.15)", marginBottom: "48px",
            }}>
              {t.stats.map((s, i) => (
                <StatCard key={i} value={s.value} suffix={s.suffix} label={s.label} started={statsStarted} lang={lang} />
              ))}
            </div>

            {/* Body text */}
            {t.paragraphs.map((p, i) => (
              <p key={i} style={{
                fontFamily: "'Noto Serif JP', serif",
                fontSize: "15px", lineHeight: 2.1,
                color: "#3d3833", marginBottom: "16px",
                letterSpacing: "0.01em",
              }}>
                {p}
              </p>
            ))}
          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .network-inner { grid-template-columns: 1fr !important; gap: 48px !important; }
        }
        @media (max-width: 600px) {
          section { padding: 72px 24px !important; }
        }
      `}</style>
    </section>
  );
}
