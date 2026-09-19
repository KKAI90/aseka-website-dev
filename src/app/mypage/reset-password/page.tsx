"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const navy = "#0B1F3A";
const red  = "#C8002A";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordInner />
    </Suspense>
  );
}

function ResetPasswordInner() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") || "";

  const [pw, setPw]           = useState("");
  const [pw2, setPw2]         = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [done, setDone]       = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!token) { setError("リンクが無効です / Link không hợp lệ"); return; }
    if (pw.length < 6) { setError("パスワードは6文字以上にしてください / Mật khẩu cần từ 6 ký tự"); return; }
    if (pw !== pw2) { setError("パスワードが一致しません / Mật khẩu nhập lại không khớp"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/mypage/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: pw }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "エラーが発生しました"); setLoading(false); return; }
      setDone(true);
      setTimeout(() => router.push("/mypage"), 1500);
    } catch {
      setError("通信エラーが発生しました / Lỗi kết nối");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg, #FFFFFF 0%, #FDF8F8 55%, #FCF4F4 100%)", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px", fontFamily:"'Noto Sans JP','Yu Gothic UI',sans-serif" }}>
      <style>{`
        .rp-input { transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease; }
        .rp-input:focus { border-color:${navy} !important; box-shadow:0 0 0 3px rgba(11,31,58,0.1); background:#fff !important; }
        .rp-eye-btn { transition: color 0.15s ease, transform 0.15s ease; }
        .rp-eye-btn:hover { color:${navy} !important; transform:translateY(-50%) scale(1.1); }
        .rp-submit-btn { transition: opacity 0.15s ease, transform 0.15s ease, box-shadow 0.2s ease; box-shadow:0 4px 14px rgba(11,31,58,0.18); }
        .rp-submit-btn:hover:not(:disabled) { opacity:0.92; transform:translateY(-1px); box-shadow:0 6px 18px rgba(11,31,58,0.24); }
        .rp-submit-btn:active:not(:disabled) { transform:translateY(0); }
        .rp-fade-in { animation: rpFadeIn 0.45s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes rpFadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes rpPop { 0% { transform:scale(0.6); opacity:0; } 70% { transform:scale(1.08); } 100% { transform:scale(1); opacity:1; } }
        .rp-check { animation: rpPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
        @media (prefers-reduced-motion: reduce) { .rp-fade-in, .rp-check { animation:none; } }
      `}</style>

      <div className="rp-fade-in" style={{ width:"100%", maxWidth:"400px", background:"#fff", borderRadius:"18px", padding:"40px 36px", boxShadow:"0 24px 60px rgba(11,31,58,0.12)", border:"1px solid rgba(11,31,58,0.06)" }}>

        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"22px" }}>
          <div style={{ width:"36px", height:"36px", background:"#fff", borderRadius:"9px", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, overflow:"hidden", boxShadow:"0 2px 8px rgba(11,31,58,0.14)", border:"1px solid rgba(11,31,58,0.06)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/aseka-logo-icon.png" alt="ASEKA" style={{ width:"28px", height:"28px", objectFit:"contain", display:"block" }} />
          </div>
          <span style={{ fontSize:"21px", fontWeight:800, color:navy, letterSpacing:"0.08em" }}>ASEKA</span>
        </div>

        {!token ? (
          <div style={{ textAlign:"center", padding:"12px 0" }}>
            <div style={{ width:"64px", height:"64px", borderRadius:"50%", background:"#FCEBEB", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"28px", margin:"0 auto 18px" }}>⚠️</div>
            <h2 style={{ fontSize:"16px", fontWeight:800, color:red, margin:"0 0 6px" }}>リンクが無効です</h2>
            <p style={{ fontSize:"13px", color:"#64748B", margin:"0 0 20px" }}>Link không hợp lệ hoặc đã hết hạn (30 phút)</p>
            <Link href="/mypage/login" style={{ display:"inline-block", padding:"11px 26px", borderRadius:"9px", background:navy, color:"#fff", textDecoration:"none", fontSize:"13px", fontWeight:700 }}>
              ログインページへ戻る
            </Link>
          </div>
        ) : !done ? (
          <>
            <div style={{ width:"48px", height:"48px", borderRadius:"14px", background:"#FCEBEB", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"22px", marginBottom:"14px" }}>🔑</div>
            <h1 style={{ fontSize:"18px", fontWeight:800, color:navy, margin:"0 0 6px" }}>新しいパスワードを設定</h1>
            <p style={{ fontSize:"12px", color:"#64748B", margin:"0 0 24px", lineHeight:1.6 }}>Đặt mật khẩu mới cho tài khoản của bạn</p>

            <form onSubmit={submit}>
              <div style={{ marginBottom:"14px" }}>
                <label style={{ display:"block", fontSize:"12px", fontWeight:700, color:"#3F4552", marginBottom:"6px" }}>新しいパスワード</label>
                <div style={{ position:"relative" }}>
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="6文字以上"
                    value={pw}
                    onChange={e => setPw(e.target.value)}
                    required
                    autoFocus
                    className="rp-input"
                    style={{ width:"100%", padding:"13px 44px 13px 16px", borderRadius:"9px", border:"1.5px solid #E0E3E9", fontSize:"15px", outline:"none", background:"#F7F8FA", boxSizing:"border-box", color:navy }}
                  />
                  <button type="button" className="rp-eye-btn" onClick={() => setShowPw(p => !p)}
                    style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#64748B", fontSize:"18px" }}>
                    {showPw ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom:"18px" }}>
                <label style={{ display:"block", fontSize:"12px", fontWeight:700, color:"#3F4552", marginBottom:"6px" }}>パスワード（確認）</label>
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="もう一度入力してください"
                  value={pw2}
                  onChange={e => setPw2(e.target.value)}
                  required
                  className="rp-input"
                  style={{ width:"100%", padding:"13px 16px", borderRadius:"9px", border:"1.5px solid #E0E3E9", fontSize:"15px", outline:"none", background:"#F7F8FA", boxSizing:"border-box", color:navy }}
                />
              </div>

              {error && (
                <div style={{ background:"#FCEBEB", border:"1px solid #C8002A22", borderRadius:"8px", padding:"11px 13px", fontSize:"13px", color:"#A32D2D", marginBottom:"16px", fontWeight:600 }}>
                  ⚠️ {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="rp-submit-btn"
                style={{ width:"100%", padding:"15px", borderRadius:"9px", background: loading ? "#64748B" : navy, color:"#fff", fontSize:"15px", fontWeight:700, border:"none", cursor: loading ? "not-allowed" : "pointer", letterSpacing:"0.06em" }}>
                {loading ? "設定中..." : "パスワードを設定する"}
              </button>
            </form>

            <div style={{ marginTop:"20px", textAlign:"center" }}>
              <Link href="/mypage/login" style={{ fontSize:"13px", color:"#64748B", textDecoration:"none" }}>← ログインページへ戻る</Link>
            </div>
          </>
        ) : (
          <div style={{ textAlign:"center", padding:"12px 0" }}>
            <div className="rp-check" style={{ width:"64px", height:"64px", borderRadius:"50%", background:"#EAF3DE", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"30px", margin:"0 auto 18px" }}>✅</div>
            <h2 style={{ fontSize:"17px", fontWeight:800, color:navy, margin:"0 0 6px" }}>設定完了！</h2>
            <p style={{ fontSize:"13px", fontWeight:600, color:"#1E4009", margin:"0 0 4px" }}>Đặt mật khẩu mới thành công!</p>
            <p style={{ fontSize:"12px", color:"#64748B", margin:0 }}>マイページへ移動しています... / Đang chuyển đến Mypage...</p>
          </div>
        )}
      </div>
    </div>
  );
}
