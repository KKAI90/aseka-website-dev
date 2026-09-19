"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const navy = "#0B1F3A";
const red  = "#C8002A";
// Links to the main site must be absolute — this page runs on the mypage.* subdomain,
// where middleware redirects any path outside /mypage back to /mypage/login. A relative
// href="/" here would just bounce the user right back to this same login page.
const MAIN_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dev.aseka.co.jp";

/* 3 real Aseka office/team photos (same set used on the site's homepage
   PhotoStrip), floating as staggered cards — PASONA-style motion. */
const FLOATING: { src:string; alt:string; pos:string; cls:string }[] = [
  { src:"/images/teamwork.jpg",       alt:"チームでの検討",  pos:"center 15%", cls:"float-a" },
  { src:"/images/office-meeting.jpg", alt:"打ち合わせ風景",  pos:"center 25%", cls:"float-b" },
  { src:"/images/team-office-1.jpg",  alt:"オフィスチーム",  pos:"center 55%", cls:"float-c" },
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label style={{ display:"block", fontSize:"12px", fontWeight:700, color:"#3F4552", marginBottom:"6px", letterSpacing:"0.01em" }}>{children}</label>;
}

export default function MypageLogin() {
  const router = useRouter();
  const [mode, setMode] = useState<"password" | "forgot">("password");

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/mypage/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, remember }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }
    router.push("/mypage");
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(""); setResetSent(false);
    const res = await fetch("/api/mypage/password-reset/request", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "エラーが発生しました"); return; }
    setResetSent(true);
    if (data._devLink) console.log("[dev] password reset link:", data._devLink);
  };

  return (
    <div className="login-split" style={{ minHeight:"100vh", display:"flex", fontFamily:"'Noto Sans JP','Yu Gothic UI',sans-serif" }}>
      {/* dangerouslySetInnerHTML, not a literal JSX text child — the quote characters in
          content:"" (::before/::after) get HTML-entity-escaped ("&quot;") by React's
          normal SSR text serialization, but browsers treat <style> as a raw-text element
          and never decode entities back, so the SSR'd markup and the client's re-render
          disagreed and forced a full client-side re-render on every page load (same bug
          class fixed earlier in admin/layout.tsx, found here via a fresh console check). */}
      <style dangerouslySetInnerHTML={{ __html: `
        .login-split { background:#fff; }
        .login-left { position:relative; background:linear-gradient(160deg, #FFFFFF 0%, #FDF8F8 55%, #FCF4F4 100%); }
        .login-left::before {
          content:""; position:absolute; top:-140px; left:-160px; width:420px; height:420px; border-radius:50%;
          background:radial-gradient(circle, rgba(200,0,42,0.06) 0%, transparent 70%); pointer-events:none;
        }
        .login-left::after {
          content:""; position:absolute; bottom:-160px; right:-140px; width:380px; height:380px; border-radius:50%;
          background:radial-gradient(circle, rgba(11,31,58,0.045) 0%, transparent 70%); pointer-events:none;
        }
        .login-right { display:flex; }
        .login-input { transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease; }
        .login-input:focus { border-color:${navy} !important; box-shadow:0 0 0 3px rgba(11,31,58,0.1); background:#fff !important; }
        .login-eye-btn { transition: color 0.15s ease, transform 0.15s ease; }
        .login-eye-btn:hover { color:${navy} !important; transform:translateY(-50%) scale(1.1); }
        .login-submit-btn { transition: opacity 0.15s ease, transform 0.15s ease, box-shadow 0.2s ease; box-shadow:0 4px 14px rgba(11,31,58,0.18); }
        .login-submit-btn:hover:not(:disabled) { opacity:0.92; transform:translateY(-1px); box-shadow:0 6px 18px rgba(11,31,58,0.24); }
        .login-submit-btn:active:not(:disabled) { transform:translateY(0); }
        .login-text-link { transition: opacity 0.15s ease; }
        .login-text-link:hover { opacity:0.7; }
        .login-fade-in { animation: loginFadeIn 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes loginFadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes loginResetPop { 0% { transform:scale(0.6); opacity:0; } 70% { transform:scale(1.08); } 100% { transform:scale(1); opacity:1; } }
        .login-reset-check { animation: loginResetPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
        .float-card { position:absolute; border-radius:18px; overflow:hidden; box-shadow:0 24px 48px -12px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.08); }
        .float-a { width:44%; aspect-ratio:3/4;  left:4%;  top:10%; animation:floatA 7s ease-in-out infinite; z-index:2; }
        .float-b { width:38%; aspect-ratio:4/5;  right:6%; top:4%;  animation:floatB 6s ease-in-out infinite -2s; z-index:3; }
        .float-c { width:46%; aspect-ratio:5/4;  right:2%; bottom:8%; animation:floatC 8s ease-in-out infinite -4s; z-index:1; }
        @keyframes floatA { 0%,100% { transform:translateY(0) rotate(-4deg); } 50% { transform:translateY(-16px) rotate(-4deg); } }
        @keyframes floatB { 0%,100% { transform:translateY(0) rotate(3deg); }  50% { transform:translateY(-12px) rotate(3deg); } }
        @keyframes floatC { 0%,100% { transform:translateY(0) rotate(-2deg); } 50% { transform:translateY(-20px) rotate(-2deg); } }
        @media (prefers-reduced-motion: reduce) {
          .float-a, .float-b, .float-c, .login-fade-in, .login-reset-check { animation:none; }
        }
        @media (max-width: 900px) {
          .login-right { display:none !important; }
          .login-left { width:100% !important; max-width:100% !important; }
        }
      ` }} />

      {/* ── Left: form ── */}
      <div className="login-left" style={{ width:"460px", maxWidth:"100%", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", padding:"48px 32px", overflow:"hidden" }}>
        <div className="login-fade-in" style={{ width:"100%", maxWidth:"340px", position:"relative", zIndex:1 }}>

          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"8px" }}>
            <div style={{ width:"38px", height:"38px", background:"#fff", borderRadius:"9px", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, overflow:"hidden", boxShadow:"0 2px 8px rgba(11,31,58,0.14)", border:"1px solid rgba(11,31,58,0.06)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/aseka-logo-icon.png" alt="ASEKA" style={{ width:"30px", height:"30px", objectFit:"contain", display:"block" }} />
            </div>
            <span style={{ fontSize:"23px", fontWeight:800, color:navy, letterSpacing:"0.08em" }}>ASEKA</span>
          </div>
          <p style={{ fontSize:"14px", color:"#3F4552", marginBottom:"8px", lineHeight:1.6 }}>
            求人紹介サービス「Asekaキャリア」<br/>
            <span style={{ fontSize:"12px", color:"#64748B" }}>Dịch vụ giới thiệu việc làm tại Nhật Bản</span>
          </p>

          {/* Heading — changes with mode instead of a tab bar, so "forgot password" reads
              as a small recovery step tucked under normal login, not an equally-weighted
              alternative way to sign in. */}
          <div key={mode} className="login-fade-in" style={{ marginBottom:"22px", paddingTop:"14px", borderTop:"1px solid #EDE7E7" }}>
            {mode === "password" ? (
              <div style={{ fontSize:"15px", fontWeight:800, color:navy }}>ログイン / Đăng nhập</div>
            ) : (
              <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                <button type="button" onClick={() => { setMode("password"); setError(""); }}
                  style={{ background:"#F1EEEE", border:"none", borderRadius:"8px", width:"30px", height:"30px", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:navy, flexShrink:0 }}
                  aria-label="ログインに戻る">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                </button>
                <div style={{ fontSize:"15px", fontWeight:800, color:navy }}>パスワードを再設定 / Đặt lại mật khẩu</div>
              </div>
            )}
          </div>

          {mode === "password" ? (
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom:"14px" }}>
                <FieldLabel>メールアドレス</FieldLabel>
                <input
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="login-input"
                  style={{ width:"100%", padding:"13px 16px", borderRadius:"9px", border:"1.5px solid #E0E3E9", fontSize:"15px", outline:"none", background:"#F7F8FA", boxSizing:"border-box", color:navy }}
                />
              </div>

              <div style={{ marginBottom:"7px" }}>
                <FieldLabel>パスワード</FieldLabel>
                <div style={{ position:"relative" }}>
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="login-input"
                    style={{ width:"100%", padding:"13px 44px 13px 16px", borderRadius:"9px", border:"1.5px solid #E0E3E9", fontSize:"15px", outline:"none", background:"#F7F8FA", boxSizing:"border-box", color:navy }}
                  />
                  <button type="button" className="login-eye-btn" onClick={() => setShowPw(p => !p)}
                    style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#64748B", fontSize:"18px" }}>
                    {showPw ? "🙈" : "👁"}
                  </button>
                </div>
              </div>
              <p style={{ fontSize:"12px", color:"#64748B", margin:"0 0 16px", lineHeight:1.7, background:"#F7F8FA", borderRadius:"7px", padding:"8px 10px" }}>
                💡 初回ログインは生年月日8桁（DDMMYYYY）例: 1998年9月14日 → <strong style={{color:navy}}>14091998</strong>
              </p>

              <label style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"20px", cursor:"pointer", userSelect:"none" }}>
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                  style={{ width:"17px", height:"17px", accentColor:navy, cursor:"pointer" }} />
                <span style={{ fontSize:"14px", color:"#3F4552" }}>次回から入力を省略する</span>
              </label>

              {error && (
                <div style={{ background:"#FCEBEB", border:"1px solid #C8002A22", borderRadius:"8px", padding:"11px 13px", fontSize:"13px", color:"#A32D2D", marginBottom:"14px", fontWeight:600 }}>
                  ⚠️ {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="login-submit-btn"
                style={{ width:"100%", padding:"15px", borderRadius:"9px", background: loading ? "#64748B" : navy, color:"#fff", fontSize:"15px", fontWeight:700, border:"none", cursor: loading ? "not-allowed" : "pointer", letterSpacing:"0.06em" }}>
                {loading ? "ログイン中..." : "ログインする"}
              </button>

              <div style={{ marginTop:"16px", textAlign:"center" }}>
                <button type="button" className="login-text-link" onClick={() => { setMode("forgot"); setError(""); }}
                  style={{ background:"none", border:"none", color:"#64748B", fontSize:"13px", fontWeight:600, cursor:"pointer", padding:0, textDecoration:"underline", textUnderlineOffset:"3px" }}>
                  パスワードをお忘れですか？ / Quên mật khẩu?
                </button>
              </div>
            </form>
          ) : resetSent ? (
            <div style={{ textAlign:"center", padding:"8px 0 4px" }}>
              <div className="login-reset-check" style={{ width:"56px", height:"56px", borderRadius:"50%", background:"#EAF3DE", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"26px", margin:"0 auto 16px" }}>✉️</div>
              <div style={{ fontSize:"15px", fontWeight:800, color:navy, marginBottom:"6px" }}>メールを送信しました</div>
              <p style={{ fontSize:"13px", color:"#3F4552", lineHeight:1.7, margin:"0 0 4px" }}>
                受信箱をご確認のうえ、メール内のリンクから<br/>新しいパスワードを設定してください（有効期限30分）。
              </p>
              <p style={{ fontSize:"12px", color:"#64748B", margin:"0 0 22px" }}>
                Vui lòng kiểm tra hộp thư và nhấn vào link trong email để đặt mật khẩu mới (có hiệu lực trong 30 phút).
              </p>
              <button type="button" className="login-text-link" onClick={() => { setMode("password"); setResetSent(false); setError(""); }}
                style={{ background:"none", border:`1.5px solid ${navy}`, borderRadius:"9px", color:navy, fontSize:"13px", fontWeight:700, cursor:"pointer", padding:"10px 20px" }}>
                ← ログインページへ戻る
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword}>
              <div style={{ background:"#F7F8FA", border:"1px solid #EDE7E7", borderRadius:"10px", padding:"12px 14px", marginBottom:"18px", display:"flex", gap:"10px", alignItems:"flex-start" }}>
                <span style={{ fontSize:"16px", flexShrink:0 }}>🔑</span>
                <p style={{ fontSize:"12.5px", color:"#3F4552", margin:0, lineHeight:1.7 }}>
                  登録済みのメールアドレスに、パスワード再設定用のリンクを送ります。<br/>
                  <span style={{ fontSize:"11.5px", color:"#64748B" }}>Nhập email đã đăng ký để nhận link đặt lại mật khẩu mới.</span>
                </p>
              </div>
              <div style={{ marginBottom:"16px" }}>
                <FieldLabel>メールアドレス</FieldLabel>
                <input
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="login-input"
                  style={{ width:"100%", padding:"13px 16px", borderRadius:"9px", border:"1.5px solid #E0E3E9", fontSize:"15px", outline:"none", background:"#F7F8FA", boxSizing:"border-box", color:navy }}
                />
              </div>

              {error && (
                <div style={{ background:"#FCEBEB", border:"1px solid #C8002A22", borderRadius:"8px", padding:"11px 13px", fontSize:"13px", color:"#A32D2D", marginBottom:"14px", fontWeight:600 }}>
                  ⚠️ {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="login-submit-btn"
                style={{ width:"100%", padding:"15px", borderRadius:"9px", background: loading ? "#64748B" : red, color:"#fff", fontSize:"15px", fontWeight:700, border:"none", cursor: loading ? "not-allowed" : "pointer", letterSpacing:"0.06em" }}>
                {loading ? "送信中..." : "再設定用リンクを送信"}
              </button>
            </form>
          )}

          {/* Help */}
          <div style={{ marginTop:"24px", fontSize:"13px", color:"#3F4552", lineHeight:1.8 }}>
            <p style={{ margin:"0 0 8px" }}>
              マイページIDをお忘れの方は、<strong style={{color:navy}}>担当のキャリアアドバイザー</strong>までご連絡ください。
            </p>
            <p style={{ margin:0, color:"#64748B" }}>
              アカウントについてご不明な点は担当スタッフまでお問合せください。
            </p>
          </div>

          <div style={{ borderTop:"1px solid #EDE7E7", marginTop:"24px", paddingTop:"18px", textAlign:"center" }}>
            <Link href={MAIN_SITE_URL} className="login-text-link" style={{ fontSize:"13px", color:"#185FA5", textDecoration:"none", fontWeight:600 }}>← Asekaトップへ戻る</Link>
            <span style={{ color:"#D8DCE3", margin:"0 10px" }}>|</span>
            <Link href={`${MAIN_SITE_URL}/dang-ky`} className="login-text-link" style={{ fontSize:"13px", color:red, textDecoration:"none", fontWeight:600 }}>新規登録はこちら →</Link>
          </div>
        </div>
      </div>

      {/* ── Right: floating photo cards ── */}
      <div className="login-right" style={{
        flex:1, position:"relative", overflow:"hidden",
        background:"linear-gradient(160deg, #E0143F 0%, #C8002A 45%, #8F0019 100%)",
      }}>
        {/* Decorative glow blobs */}
        <div style={{ position:"absolute", width:"520px", height:"520px", borderRadius:"50%", top:"-160px", right:"-140px", background:"radial-gradient(circle, rgba(255,255,255,0.14) 0%, transparent 70%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", width:"460px", height:"460px", borderRadius:"50%", bottom:"-180px", left:"-120px", background:"radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 70%)", pointerEvents:"none" }} />

        {/* Tagline */}
        <div style={{ position:"absolute", left:"6%", bottom:"6%", zIndex:4, maxWidth:"320px", color:"#fff" }}>
          <div style={{ fontSize:"21px", fontWeight:800, lineHeight:1.4, letterSpacing:"0.02em", textShadow:"0 2px 12px rgba(0,0,0,0.25)" }}>
            日本で、次のキャリアへ。
          </div>
          <div style={{ fontSize:"13px", color:"rgba(255,255,255,0.9)", marginTop:"7px", lineHeight:1.6 }}>
            Bước tiếp theo trong sự nghiệp của bạn tại Nhật Bản
          </div>
        </div>

        {FLOATING.map(p => (
          <div key={p.src} className={`float-card ${p.cls}`}>
            <Image src={p.src} alt={p.alt} fill sizes="(max-width: 900px) 0px, 30vw"
              style={{ objectFit:"cover", objectPosition:p.pos }} />
          </div>
        ))}
      </div>
    </div>
  );
}
