"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "ログインに失敗しました");
      setLoading(false);
      return;
    }
    router.push("/admin/dashboard");
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .login-root { min-height:100vh; display:flex; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
        /* Left panel */
        .login-left { width:420px; flex-shrink:0; background:linear-gradient(160deg,#0d2444 0%,#1a3a6b 60%,#1e4080 100%); display:flex; flex-direction:column; justify-content:space-between; padding:48px 44px; position:relative; overflow:hidden; }
        .login-left::before { content:""; position:absolute; top:-80px; right:-80px; width:300px; height:300px; background:radial-gradient(circle,rgba(96,165,250,0.15) 0%,transparent 70%); pointer-events:none; }
        .login-left::after { content:""; position:absolute; bottom:-60px; left:-60px; width:240px; height:240px; background:radial-gradient(circle,rgba(37,99,235,0.2) 0%,transparent 70%); pointer-events:none; }
        /* Right panel */
        .login-right { flex:1; background:#F8F9FC; display:flex; align-items:center; justify-content:center; padding:32px 24px; }
        .login-card { background:#fff; border-radius:20px; padding:44px 40px; width:100%; max-width:420px; box-shadow:0 4px 32px rgba(0,0,0,0.08); animation:fadeIn 0.4s ease; }
        /* Input field */
        .field { margin-bottom:18px; }
        .field-label { display:block; font-size:11px; font-weight:700; color:#6B7280; letter-spacing:0.06em; text-transform:uppercase; margin-bottom:7px; }
        .field-wrap { position:relative; }
        .field-input { width:100%; height:48px; padding:0 14px; border-radius:10px; border:1.5px solid #E5E7EB; font-size:14px; color:#111827; background:#FAFAFA; outline:none; transition:border-color 0.15s,box-shadow 0.15s,background 0.15s; box-sizing:border-box; }
        .field-input:focus { border-color:#2563EB; box-shadow:0 0 0 3px rgba(37,99,235,0.1); background:#fff; }
        .field-input::placeholder { color:#C4CAD4; }
        .pw-toggle { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#9CA3AF; padding:4px; display:flex; align-items:center; }
        .pw-toggle:hover { color:#6B7280; }
        .login-btn { width:100%; height:50px; border-radius:12px; background:linear-gradient(135deg,#1a3a6b,#2563EB); border:none; color:#fff; font-size:15px; font-weight:700; cursor:pointer; transition:opacity 0.15s,transform 0.1s; letter-spacing:0.02em; display:flex; align-items:center; justify-content:center; gap:8px; }
        .login-btn:hover:not(:disabled) { opacity:0.92; transform:translateY(-1px); }
        .login-btn:active:not(:disabled) { transform:translateY(0); }
        .login-btn:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
        .error-box { background:#FEF2F2; border:1px solid #FECACA; border-radius:8px; padding:10px 14px; font-size:12px; color:#DC2626; margin-bottom:16px; display:flex; align-items:center; gap:7px; }
        @keyframes spin { to { transform:rotate(360deg); } }
        .spinner { width:16px; height:16px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:spin 0.7s linear infinite; flex-shrink:0; }
        /* Mobile: stack vertically */
        @media (max-width:768px) {
          .login-left { display:none; }
          .login-right { background:#fff; padding:24px 20px; }
          .login-card { box-shadow:none; padding:32px 24px; }
        }
      `}</style>

      <div className="login-root">
        {/* ── Left branding panel ── */}
        <div className="login-left">
          <div>
            {/* Logo */}
            <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"48px" }}>
              <div style={{ width:"44px", height:"44px", borderRadius:"12px", background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:"0 2px 12px rgba(0,0,0,0.2)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/aseka-logo-icon.png" alt="ASEKA" style={{ width:"32px", height:"32px", objectFit:"contain" }} />
              </div>
              <div>
                <div style={{ fontSize:"20px", fontWeight:800, color:"#fff", letterSpacing:"0.1em" }}>ASEKA</div>
                <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.5)", marginTop:"1px" }}>Back Office</div>
              </div>
            </div>

            {/* Tagline */}
            <div style={{ fontSize:"26px", fontWeight:700, color:"#fff", lineHeight:1.35, letterSpacing:"-0.01em", marginBottom:"16px" }}>
              管理画面へ<br />ようこそ
            </div>
            <div style={{ fontSize:"13px", color:"rgba(255,255,255,0.5)", lineHeight:1.7 }}>
              ASEKAのバックオフィス管理システムです。<br />
              承認されたアカウントでログインしてください。
            </div>
          </div>

          {/* Bottom decoration */}
          <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.25)" }}>
            © 2026 ASEKA Co., Ltd.
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div className="login-right">
          <div className="login-card">
            {/* Mobile logo (shown only on mobile) */}
            <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"32px" }}>
              <div style={{ width:"40px", height:"40px", borderRadius:"11px", background:"linear-gradient(135deg,#0d2444,#2563EB)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/aseka-logo-icon.png" alt="ASEKA" style={{ width:"26px", height:"26px", objectFit:"contain", filter:"brightness(10)" }} />
              </div>
              <div>
                <div style={{ fontSize:"16px", fontWeight:800, color:"#111827", letterSpacing:"0.06em" }}>ASEKA</div>
                <div style={{ fontSize:"11px", color:"#9CA3AF" }}>Back Office · 管理画面</div>
              </div>
            </div>

            <div style={{ marginBottom:"28px" }}>
              <h1 style={{ fontSize:"22px", fontWeight:800, color:"#111827", margin:0, letterSpacing:"-0.02em" }}>ログイン</h1>
              <p style={{ fontSize:"13px", color:"#9CA3AF", marginTop:"6px" }}>アカウント情報を入力してください</p>
            </div>

            <form onSubmit={handleLogin}>
              {/* Email */}
              <div className="field">
                <label className="field-label">メールアドレス</label>
                <div className="field-wrap">
                  <input
                    className="field-input"
                    type="email"
                    required
                    placeholder="admin@aseka.co.jp"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{ paddingLeft: "42px" }}
                  />
                  <span style={{ position:"absolute", left:"14px", top:"50%", transform:"translateY(-50%)", color:"#C4CAD4", pointerEvents:"none" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </span>
                </div>
              </div>

              {/* Password */}
              <div className="field">
                <label className="field-label">パスワード</label>
                <div className="field-wrap">
                  <input
                    className="field-input"
                    type={showPw ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ paddingLeft: "42px", paddingRight: "42px" }}
                  />
                  <span style={{ position:"absolute", left:"14px", top:"50%", transform:"translateY(-50%)", color:"#C4CAD4", pointerEvents:"none" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                  </span>
                  <button type="button" className="pw-toggle" onClick={() => setShowPw(p => !p)}>
                    {showPw
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="error-box">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button type="submit" className="login-btn" disabled={loading} style={{ marginTop: error ? "0" : "8px" }}>
                {loading ? (
                  <><div className="spinner" /> ログイン中...</>
                ) : (
                  <>ログイン
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
