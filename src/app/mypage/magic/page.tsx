"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const navy = "#0B1F3A";

export default function MagicLinkLanding() {
  return (
    <Suspense fallback={null}>
      <MagicLinkInner />
    </Suspense>
  );
}

function MagicLinkInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState<"checking" | "error">("checking");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = params.get("token");
    if (!token) { setStatus("error"); setError("リンクが無効です / Link không hợp lệ"); return; }

    fetch("/api/mypage/magic-link/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).then(async res => {
      const data = await res.json();
      if (!res.ok) { setStatus("error"); setError(data.error || "エラーが発生しました"); return; }
      router.push("/mypage");
    }).catch(() => { setStatus("error"); setError("通信エラーが発生しました / Lỗi kết nối"); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ minHeight:"100vh", background:"#F4F5F7", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Noto Sans JP','Yu Gothic UI',sans-serif" }}>
      <div style={{ background:"#fff", borderRadius:"12px", padding:"40px", width:"100%", maxWidth:"400px", boxShadow:"0 2px 24px rgba(0,0,0,0.08)", textAlign:"center" }}>
        {status === "checking" ? (
          <>
            <div style={{ fontSize:"32px", marginBottom:"12px" }}>⏳</div>
            <div style={{ fontSize:"14px", color:navy, fontWeight:600 }}>ログイン確認中...</div>
            <div style={{ fontSize:"11px", color:"#9BA0AC", marginTop:"4px" }}>Đang xác nhận đăng nhập...</div>
          </>
        ) : (
          <>
            <div style={{ fontSize:"32px", marginBottom:"12px" }}>⚠️</div>
            <div style={{ fontSize:"14px", color:"#C8002A", fontWeight:600, marginBottom:"6px" }}>{error}</div>
            <div style={{ fontSize:"11px", color:"#9BA0AC", marginBottom:"20px" }}>
              リンクの有効期限は15分間です。もう一度お試しください。
            </div>
            <Link href="/mypage/login" style={{ display:"inline-block", padding:"10px 24px", borderRadius:"8px", background:navy, color:"#fff", textDecoration:"none", fontSize:"13px", fontWeight:700 }}>
              ログインページへ戻る
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
