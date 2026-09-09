"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const navy = "#0B1F3A";
const red  = "#C8002A";

/* Real Aseka office/team photos (same set already used on the site's
   home page PhotoStrip), arranged into a PASONA-style mosaic.
   Grid: 3 cols (1.15fr 1fr 1fr) x 3 rows (1fr 1fr 0.9fr)
     a a b b b     a = tall left column (rows 1-2)
     a a c d       b = wide top-right, c/d = mid squares
     e e e         e = full-width bottom band */
const MOSAIC: { src:string; alt:string; pos:string; col:string; row:string }[] = [
  { src:"/images/office-meeting.jpg", alt:"打ち合わせ風景",       pos:"center 25%", col:"1",         row:"1 / span 2" },
  { src:"/images/team-office-1.jpg",  alt:"オフィスチーム",       pos:"center 55%", col:"2 / span 2", row:"1" },
  { src:"/images/contact.jpg",        alt:"業務の様子",          pos:"75% 70%",    col:"2",          row:"2" },
  { src:"/images/team-office-2.jpg",  alt:"スタッフミーティング", pos:"35% 25%",    col:"3",          row:"2" },
  { src:"/images/teamwork.jpg",       alt:"チームでの検討",       pos:"center 15%", col:"1 / span 3", row:"3" },
];

export default function MypageLogin() {
  const router = useRouter();
  const [mode, setMode] = useState<"password" | "magic">("password");

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [magicSent, setMagicSent] = useState(false);

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

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(""); setMagicSent(false);
    const res = await fetch("/api/mypage/magic-link/request", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "エラーが発生しました"); return; }
    setMagicSent(true);
    if (data._devLink) console.log("[dev] magic link:", data._devLink);
  };

  return (
    <div className="login-split" style={{ minHeight:"100vh", display:"flex", fontFamily:"'Noto Sans JP','Yu Gothic UI',sans-serif" }}>
      <style>{`
        .login-split { background:#fff; }
        .login-right { display:flex; }
        @media (max-width: 900px) {
          .login-right { display:none !important; }
          .login-left { width:100% !important; max-width:100% !important; }
        }
      `}</style>

      {/* ── Left: form ── */}
      <div className="login-left" style={{ width:"460px", maxWidth:"100%", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 24px" }}>
        <div style={{ width:"100%", maxWidth:"340px" }}>

          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"6px" }}>
            <div style={{ width:"36px", height:"36px", background:navy, borderRadius:"8px", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2L18 7V13L10 18L2 13V7Z" stroke="white" strokeWidth="1.4"/><circle cx="10" cy="10" r="3" fill="white"/></svg>
            </div>
            <span style={{ fontSize:"22px", fontWeight:800, color:navy, letterSpacing:"0.08em" }}>ASEKA</span>
          </div>
          <p style={{ fontSize:"13px", color:"#6B6B6B", marginBottom:"24px", lineHeight:1.5 }}>
            求人紹介サービス「Asekaキャリア」<br/>
            <span style={{ fontSize:"11px" }}>Dịch vụ giới thiệu việc làm tại Nhật Bản</span>
          </p>

          {/* Mode switch */}
          <div style={{ display:"flex", gap:"2px", background:"#F1F1EF", borderRadius:"8px", padding:"3px", marginBottom:"20px" }}>
            {[{ k:"password" as const, l:"パスワードでログイン" }, { k:"magic" as const, l:"マジックリンク" }].map(m => (
              <button key={m.k} type="button" onClick={() => { setMode(m.k); setError(""); setMagicSent(false); }}
                style={{ flex:1, padding:"8px 4px", borderRadius:"6px", fontSize:"12px", fontWeight:700, border:"none", cursor:"pointer",
                  background: mode===m.k ? "#fff" : "transparent", color: mode===m.k ? navy : "#9BA0AC",
                  boxShadow: mode===m.k ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>
                {m.l}
              </button>
            ))}
          </div>

          {mode === "password" ? (
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom:"12px" }}>
                <input
                  type="email"
                  placeholder="メールアドレス"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{ width:"100%", padding:"14px 16px", borderRadius:"8px", border:"1.5px solid #E0E3E9", fontSize:"14px", outline:"none", background:"#F7F8FA", boxSizing:"border-box" }}
                  onFocus={e => e.target.style.borderColor = navy}
                  onBlur={e => e.target.style.borderColor = "#E0E3E9"}
                />
              </div>

              <div style={{ marginBottom:"6px", position:"relative" }}>
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="パスワード"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ width:"100%", padding:"14px 44px 14px 16px", borderRadius:"8px", border:"1.5px solid #E0E3E9", fontSize:"14px", outline:"none", background:"#F7F8FA", boxSizing:"border-box" }}
                  onFocus={e => e.target.style.borderColor = navy}
                  onBlur={e => e.target.style.borderColor = "#E0E3E9"}
                />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#9BA0AC", fontSize:"18px" }}>
                  {showPw ? "🙈" : "👁"}
                </button>
              </div>
              <p style={{ fontSize:"11px", color:"#9BA0AC", margin:"0 0 14px", lineHeight:1.6 }}>
                💡 初回ログインは生年月日8桁（DDMMYYYY）例: 1998年9月14日 → <strong>14091998</strong>
              </p>

              <label style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"18px", cursor:"pointer", userSelect:"none" }}>
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                  style={{ width:"16px", height:"16px", accentColor:navy, cursor:"pointer" }} />
                <span style={{ fontSize:"13px", color:"#374151" }}>次回から入力を省略する</span>
              </label>

              {error && (
                <div style={{ background:"#FCEBEB", border:"1px solid #C8002A22", borderRadius:"7px", padding:"10px 12px", fontSize:"12px", color:"#C8002A", marginBottom:"14px" }}>
                  ⚠️ {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                style={{ width:"100%", padding:"14px", borderRadius:"8px", background: loading ? "#9BA0AC" : navy, color:"#fff", fontSize:"15px", fontWeight:700, border:"none", cursor: loading ? "not-allowed" : "pointer", letterSpacing:"0.06em" }}>
                {loading ? "ログイン中..." : "ログインする"}
              </button>

              <div style={{ marginTop:"14px" }}>
                <button type="button" onClick={() => { setMode("magic"); setError(""); }}
                  style={{ background:"none", border:"none", color:navy, fontSize:"13px", cursor:"pointer", padding:0 }}>
                  パスワードをお忘れの方は<span style={{ textDecoration:"underline" }}>こちら</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleMagicLink}>
              <p style={{ fontSize:"12px", color:"#6B6B6B", marginBottom:"14px", lineHeight:1.6 }}>
                登録済みのメールアドレスにログイン用リンクを送ります。<br/>
                <span style={{ fontSize:"11px" }}>Gửi link đăng nhập tới email đã đăng ký (không cần mật khẩu).</span>
              </p>
              <div style={{ marginBottom:"16px" }}>
                <input
                  type="email"
                  placeholder="メールアドレス"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{ width:"100%", padding:"14px 16px", borderRadius:"8px", border:"1.5px solid #E0E3E9", fontSize:"14px", outline:"none", background:"#F7F8FA", boxSizing:"border-box" }}
                  onFocus={e => e.target.style.borderColor = navy}
                  onBlur={e => e.target.style.borderColor = "#E0E3E9"}
                />
              </div>

              {error && (
                <div style={{ background:"#FCEBEB", border:"1px solid #C8002A22", borderRadius:"7px", padding:"10px 12px", fontSize:"12px", color:"#C8002A", marginBottom:"14px" }}>
                  ⚠️ {error}
                </div>
              )}
              {magicSent && (
                <div style={{ background:"#EAF3DE", border:"1px solid #27500A22", borderRadius:"7px", padding:"10px 12px", fontSize:"12px", color:"#27500A", marginBottom:"14px" }}>
                  ✓ メールを送信しました。受信箱をご確認ください（登録済みの場合）。<br/>
                  <span style={{ fontSize:"11px" }}>Đã gửi email — vui lòng kiểm tra hộp thư (nếu đã đăng ký).</span>
                </div>
              )}

              <button type="submit" disabled={loading}
                style={{ width:"100%", padding:"14px", borderRadius:"8px", background: loading ? "#9BA0AC" : navy, color:"#fff", fontSize:"15px", fontWeight:700, border:"none", cursor: loading ? "not-allowed" : "pointer", letterSpacing:"0.06em" }}>
                {loading ? "送信中..." : "ログインリンクを送信"}
              </button>
            </form>
          )}

          {/* Help */}
          <div style={{ marginTop:"22px", fontSize:"12px", color:"#6B6B6B", lineHeight:1.8 }}>
            <p style={{ margin:"0 0 8px" }}>
              マイページIDをお忘れの方は、<strong>担当のキャリアアドバイザー</strong>までご連絡ください。
            </p>
            <p style={{ margin:0 }}>
              アカウントについてご不明な点は担当スタッフまでお問合せください。
            </p>
          </div>

          <div style={{ borderTop:"1px solid #F0F1F4", marginTop:"22px", paddingTop:"16px", textAlign:"center" }}>
            <Link href="/" style={{ fontSize:"12px", color:"#185FA5", textDecoration:"none" }}>← Asekaトップへ戻る</Link>
            <span style={{ color:"#ddd", margin:"0 10px" }}>|</span>
            <Link href="/dang-ky" style={{ fontSize:"12px", color:red, textDecoration:"none" }}>新規登録はこちら →</Link>
          </div>
        </div>
      </div>

      {/* ── Right: photo mosaic ── */}
      <div className="login-right" style={{ flex:1, background:red, padding:"14px", alignItems:"stretch", justifyContent:"stretch" }}>
        <div style={{
          display:"grid", width:"100%", height:"100%",
          gridTemplateColumns:"1.15fr 1fr 1fr",
          gridTemplateRows:"1fr 1fr 0.9fr",
          gap:"5px",
        }}>
          {MOSAIC.map(p => (
            <div key={p.src} style={{ position:"relative", overflow:"hidden", gridColumn:p.col, gridRow:p.row }}>
              <Image src={p.src} alt={p.alt} fill sizes="(max-width: 900px) 0px, 40vw"
                style={{ objectFit:"cover", objectPosition:p.pos }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
