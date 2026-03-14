"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#F6F7F9" }}
    >
      <div
        className="w-full max-w-sm p-8 rounded-2xl"
        style={{ background: "#fff", border: "0.5px solid rgba(11,31,58,0.1)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: "#0B1F3A" }}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L18 7V13L10 18L2 13V7Z" stroke="white" strokeWidth="1.4" />
              <circle cx="10" cy="10" r="3" fill="white" />
            </svg>
          </div>
          <div>
            <div className="text-base font-bold" style={{ color: "#0B1F3A", letterSpacing: "0.08em" }}>ASEKA</div>
            <div className="text-xs" style={{ color: "#6B6B6B" }}>Back Office</div>
          </div>
        </div>

        <h1 className="text-lg font-bold mb-1" style={{ color: "#0B1F3A" }}>ログイン</h1>
        <p className="text-xs mb-6" style={{ color: "#6B6B6B" }}>Đăng nhập quản trị</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#6B6B6B" }}>
              メールアドレス / Email
            </label>
            <input
              required
              type="email"
              className="w-full"
              placeholder="admin@aseka.jp"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#6B6B6B" }}>
              パスワード / Mật khẩu
            </label>
            <input
              required
              type="password"
              className="w-full"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-xs text-center" style={{ color: "#C8002A" }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-all"
            style={{ background: loading ? "#888" : "#0B1F3A", border: "none", cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "ログイン中..." : "ログイン →"}
          </button>
        </form>
      </div>
    </div>
  );
}
