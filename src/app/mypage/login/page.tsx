"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const navy = "#0B1F3A";

export default function MypageLogin() {
  const router = useRouter();
  const [loginId, setLoginId]   = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/mypage/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loginId, password }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }
    router.push("/mypage");
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
        <p style={{ fontSize:"13px", color:"#6B6B6B", marginBottom:"28px", lineHeight:1.5 }}>
          求人紹介サービス「Asekaキャリア」<br/>
          <span style={{ fontSize:"11px" }}>Dịch vụ giới thiệu việc làm tại Nhật Bản</span>
        </p>

        <form onSubmit={handleLogin}>
          {/* Login ID */}
          <div style={{ marginBottom:"12px" }}>
            <input
              type="text"
              placeholder="マイページID（電話番号またはメール）"
              value={loginId}
              onChange={e => setLoginId(e.target.value)}
              required
              style={{ width:"100%", padding:"14px 16px", borderRadius:"8px", border:"1.5px solid #E0E3E9", fontSize:"14px", outline:"none", background:"#F7F8FA", boxSizing:"border-box" }}
              onFocus={e => e.target.style.borderColor = navy}
              onBlur={e => e.target.style.borderColor = "#E0E3E9"}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom:"16px", position:"relative" }}>
            <input
              type={showPw ? "text" : "password"}
              placeholder="パスワード（生年月日 YYYYMMDD）"
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

          {/* Error */}
          {error && (
            <div style={{ background:"#FCEBEB", border:"1px solid #C8002A22", borderRadius:"7px", padding:"10px 12px", fontSize:"12px", color:"#C8002A", marginBottom:"14px" }}>
              ⚠️ {error}
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading}
            style={{ width:"100%", padding:"14px", borderRadius:"8px", background: loading ? "#9BA0AC" : navy, color:"#fff", fontSize:"15px", fontWeight:700, border:"none", cursor: loading ? "not-allowed" : "pointer", letterSpacing:"0.06em" }}>
            {loading ? "ログイン中..." : "ログインする"}
          </button>
        </form>

        {/* Help */}
        <div style={{ marginTop:"20px", fontSize:"12px", color:"#6B6B6B", lineHeight:1.8 }}>
          <p style={{ margin:"0 0 6px" }}>
            <strong>マイページIDをお忘れの方</strong>は、担当スタッフまでご連絡ください。
          </p>
          <p style={{ margin:0, fontSize:"11px", color:"#9BA0AC" }}>
            💡 初期パスワード = 生年月日8桁 (例: 19950315)<br/>
            Mật khẩu mặc định = ngày sinh 8 số (VD: 19950315)
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
