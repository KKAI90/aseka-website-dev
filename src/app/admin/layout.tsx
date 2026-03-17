"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const NAV = [
  { section: "概要 / Tổng quan", items: [
    { href: "/admin/dashboard", label: "ダッシュボード", sub: "Dashboard", icon: "grid" },
  ]},
  { section: "管理 / Quản lý", items: [
    { href: "/admin/jobs",       label: "求人管理",   sub: "Công việc",  icon: "briefcase" },
    { href: "/admin/candidates", label: "人材管理",   sub: "Ứng viên",   icon: "users" },
    { href: "/admin/messages",   label: "メッセージ", sub: "Tin nhắn",   icon: "message" },
  ]},
  { section: "システム / Hệ thống", items: [
    { href: "/admin/settings",   label: "設定",       sub: "Google Form連携", icon: "settings" },
  ]},
];

function NavIcon({ name }: { name: string }) {
  const p = { width:15,height:15,viewBox:"0 0 24 24",fill:"none",stroke:"white",strokeWidth:"1.8" } as React.SVGProps<SVGSVGElement>;
  if(name==="grid") return <svg {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
  if(name==="briefcase") return <svg {...p}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>;
  if(name==="users") return <svg {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
  if(name==="message") return <svg {...p}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
  if(name==="settings") return <svg {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;
  return null;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  if (pathname === "/admin/login") return <>{children}</>;

  // Block admin on main website (client-side guard)
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const isAdminHost = host.includes("-admin-") || host.includes("-admin.") || host.startsWith("admin.") || host === "localhost";
    if (!isAdminHost) {
      window.location.href = "/";
      return null;
    }
  }

  // Auth check — verify session on every page mount
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    fetch("/api/admin/me").then(res => {
      if (!res.ok) router.replace("/admin/login");
    });
  }, [pathname]);
  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };
  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", fontFamily:"'Noto Sans JP','Yu Gothic UI',sans-serif" }}>
      {/* SIDEBAR */}
      <div style={{ width:"210px", background:"#0B1F3A", display:"flex", flexDirection:"column", flexShrink:0 }}>
        <div style={{ padding:"14px 16px", display:"flex", alignItems:"center", gap:"9px", borderBottom:"0.5px solid rgba(255,255,255,0.08)" }}>
          <div style={{ width:"32px", height:"32px", background:"rgba(255,255,255,0.1)", borderRadius:"7px", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 2L18 7V13L10 18L2 13V7Z" stroke="white" strokeWidth="1.4"/><circle cx="10" cy="10" r="3" fill="white"/></svg>
          </div>
          <div>
            <div style={{ fontSize:"14px", fontWeight:700, color:"#fff", letterSpacing:"0.06em" }}>ASEKA</div>
            <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.4)" }}>Back Office · 管理画面</div>
          </div>
        </div>
        <div style={{ padding:"10px 8px", flex:1 }}>
          {NAV.map(g => (
            <div key={g.section}>
              <div style={{ fontSize:"9px", fontWeight:700, letterSpacing:"0.1em", color:"rgba(255,255,255,0.28)", padding:"10px 8px 4px", textTransform:"uppercase" }}>{g.section}</div>
              {g.items.map(item => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href} style={{ display:"flex", alignItems:"center", gap:"8px", padding:"9px 10px", borderRadius:"7px", marginBottom:"2px", textDecoration:"none", background:active?"rgba(255,255,255,0.13)":"transparent" }}>
                    <NavIcon name={item.icon} />
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:"12px", color:active?"#fff":"rgba(255,255,255,0.72)", fontWeight:active?700:400 }}>{item.label}</div>
                      <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.35)", marginTop:"1px" }}>{item.sub}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
        <div style={{ padding:"12px", borderTop:"0.5px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", gap:"8px" }}>
          <div style={{ width:"30px", height:"30px", borderRadius:"50%", background:"rgba(255,255,255,0.12)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:700, color:"#fff", flexShrink:0 }}>AD</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.7)" }}>Admin</div>
            <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.35)" }}>管理者</div>
          </div>
          <button onClick={handleLogout} style={{ background:"none", border:"none", cursor:"pointer", opacity:0.45 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          </button>
        </div>
      </div>
      <div style={{ flex:1, overflow:"auto", background:"#F6F7F9" }}>{children}</div>
    </div>
  );
}