"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const navy = "#0B1F3A";

export default function MypageLogin() {
  const router = useRouter();
  const [mode, setMode] = useState<"password" | "magic">("password");

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/mypage/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
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
    <div style={{ minHeight:"100vh", background:"#F4F5F7", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"'Noto Sans JP','Yu Gothic UI',sans-serif" }}>

      <div style={{ background:"#fff", borderRadius:"12px", padding:"40px 40px 32px", width:"100%", maxWidth:"420px", boxShadow:"0 2px 24px rgba(0,0,0,0.08)" }}>

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
            <p style={{ fontSize:"11px", color:"#9BA0AC", margin:"0 0 16px", lineHeight:1.6 }}>
              💡 初回ログインは生年月日8桁（日日月月年年年年）例: 1998年9月14日 → <strong>14091998</strong><br/>
              <span>Lần đầu đăng nhập dùng ngày sinh dạng DDMMYYYY (VD: 14/09/1998 → 14091998)</span>
            </p>

            {error && (
              <div style={{ background:"#FCEBEB", border:"1px solid #C8002A22", borderRadius:"7px", padding:"10px 12px", fontSize:"12px", color:"#C8002A", marginBottom:"14px" }}>
                ⚠️ {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ width:"100%", padding:"14px", borderRadius:"8px", background: loading ? "#9BA0AC" : navy, color:"#fff", fontSize:"15px", fontWeight:700, border:"none", cursor: loading ? "not-allowed" : "pointer", letterSpacing:"0.06em" }}>
              {loading ? "ログイン中..." : "ログインする"}
            </button>

            <div style={{ marginTop:"12px", textAlign:"center" }}>
              <button type="button" onClick={() => { setMode("magic"); setError(""); }}
                style={{ background:"none", border:"none", color:"#185FA5", fontSize:"12px", cursor:"pointer", textDecoration:"underline" }}>
                パスワードをお忘れの方はこちら
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
        <div style={{ marginTop:"20px", fontSize:"12px", color:"#6B6B6B", lineHeight:1.8 }}>
          <p style={{ margin:0 }}>
            アカウントについてご不明な点は<strong>担当スタッフ</strong>までご連絡ください。
          </p>
        </div>

        <div style={{ borderTop:"1px solid #F0F1F4", marginTop:"24px", paddingTop:"16px", textAlign:"center" }}>
          <Link href="/" style={{ fontSize:"12px", color:"#185FA5", textDecoration:"none" }}>← Asekaトップへ戻る</Link>
          <span style={{ color:"#ddd", margin:"0 10px" }}>|</span>
          <Link href="/dang-ky" style={{ fontSize:"12px", color:"#C8002A", textDecoration:"none" }}>新規登録はこちら →</Link>
        </div>
      </div>
    </div>
  );
}
