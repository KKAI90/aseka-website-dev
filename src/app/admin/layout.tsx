"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { type Role, canAccess } from "@/lib/roles";
import { AdminLangProvider, useAdminLang } from "@/lib/adminI18n";
import AdminLangSwitcher from "@/components/AdminLangSwitcher";

type NavItem = { href: string; labelKey: string; subKey: string; icon: string };

const ALL_NAV: { sectionKey: string; role: Role | "all"; items: NavItem[] }[] = [
  {
    sectionKey: "sidebar.overview",
    role: "superadmin",
    items: [{ href: "/admin/dashboard", labelKey: "sidebar.dashboard", subKey: "sidebar.dashboard", icon: "grid" }],
  },
  {
    sectionKey: "sidebar.management",
    role: "all",
    items: [
      { href: "/admin/jobs",       labelKey: "sidebar.jobs",       subKey: "sidebar.jobs",       icon: "briefcase" },
      { href: "/admin/candidates", labelKey: "sidebar.candidates", subKey: "sidebar.candidates", icon: "users" },
      { href: "/admin/messages",   labelKey: "sidebar.messages",   subKey: "sidebar.messages",   icon: "message" },
    ],
  },
  {
    sectionKey: "sidebar.system",
    role: "superadmin",
    items: [{ href: "/admin/settings", labelKey: "sidebar.settings", subKey: "sidebar.settingsSub", icon: "settings" }],
  },
];

function NavIcon({ name }: { name: string }) {
  const p = { width: 15, height: 15, viewBox: "0 0 24 24", fill: "none", stroke: "white", strokeWidth: "1.8" } as React.SVGProps<SVGSVGElement>;
  if (name === "grid")      return <svg {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
  if (name === "briefcase") return <svg {...p}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>;
  if (name === "users")     return <svg {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
  if (name === "message")   return <svg {...p}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
  if (name === "settings")  return <svg {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;
  return null;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminLangProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminLangProvider>
  );
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { t } = useAdminLang();
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<Role | null>(null);
  const [email, setEmail] = useState<string>("");
  const [accessChecked, setAccessChecked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingApplies, setPendingApplies] = useState(0);

  useEffect(() => {
    if (!accessChecked) return;
    const load = () => fetch("/api/admin/candidates/pending-count").then(r => r.ok ? r.json() : null).then(d => { if (d) setPendingApplies(d.count); });
    load();
    const onVisible = () => { if (!document.hidden) load(); };
    document.addEventListener("visibilitychange", onVisible);
    const interval = setInterval(load, 60000);
    return () => { document.removeEventListener("visibilitychange", onVisible); clearInterval(interval); };
  }, [accessChecked]);

  useEffect(() => {
    if (pathname === "/admin/login") return;
    setAccessChecked(false);
    fetch("/api/admin/me").then(async res => {
      if (!res.ok) { router.replace("/admin/login"); return; }
      const data = await res.json();
      const userRole: Role = data.role;
      setRole(userRole);
      setEmail(data.email);
      if (!canAccess(userRole, pathname)) {
        router.replace("/admin/messages");
      } else {
        setAccessChecked(true);
      }
    });
  }, [pathname, router]);

  // Close sidebar on route change (mobile)
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  if (pathname === "/admin/login") return <>{children}</>;

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const visibleNav = ALL_NAV
    .filter(g => g.role === "all" || g.role === role)
    .map(g => ({
      ...g,
      items: g.role === "all" && role === "admin"
        ? g.items.filter(i => i.href === "/admin/messages")
        : g.items,
    }))
    .filter(g => g.items.length > 0);

  const initials = email ? email.slice(0, 2).toUpperCase() : "AD";
  const roleLabel = role === "superadmin" ? t("common.superAdmin") : role === "admin" ? t("common.admin") : "…";
  const roleBadgeColor = role === "superadmin" ? "#F59E0B" : "#60A5FA";

  const Sidebar = (
    <div style={{ width: "232px", background: "linear-gradient(180deg, #1a3358 0%, #152844 100%)", display: "flex", flexDirection: "column", height: "100%", flexShrink: 0 }}>
      {/* Logo */}
      <div style={{ padding: "18px 18px 16px", display: "flex", alignItems: "center", gap: "11px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "11px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/aseka-logo-icon.png" alt="ASEKA" style={{ width: "30px", height: "30px", objectFit: "contain", display: "block" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "16px", fontWeight: 800, color: "#fff", letterSpacing: "0.08em" }}>ASEKA</div>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", marginTop: "1px" }}>{t("common.backOffice")}</div>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="sidebar-close-btn"
          style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "7px", cursor: "pointer", color: "rgba(255,255,255,0.6)", padding: "5px", display: "none", alignItems: "center", justifyContent: "center" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      {/* Nav */}
      <div style={{ padding: "12px 10px", flex: 1, overflowY: "auto" }}>
        {visibleNav.map(g => (
          <div key={g.sectionKey}>
            <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.3)", padding: "12px 10px 5px", textTransform: "uppercase" }}>
              {t(g.sectionKey)}
            </div>
            {g.items.map(item => {
              const active = pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href}
                  className={`admin-nav-link${active ? " active" : ""}`}
                  style={{
                    display: "flex", alignItems: "center", gap: "11px",
                    padding: "11px 12px", borderRadius: "10px", marginBottom: "3px",
                    textDecoration: "none",
                    background: active ? "rgba(255,255,255,0.14)" : "transparent",
                    borderLeft: active ? "3px solid #60A5FA" : "3px solid transparent",
                  }}>
                  <div className="admin-nav-icon" style={{ width: "20px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, opacity: active ? 1 : 0.7 }}>
                    <NavIcon name={item.icon} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", color: active ? "#fff" : "rgba(255,255,255,0.78)", fontWeight: active ? 700 : 400, lineHeight: 1.2 }}>{t(item.labelKey)}</div>
                    {item.subKey !== item.labelKey && <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.38)", marginTop: "2px" }}>{t(item.subKey)}</div>}
                  </div>
                  {item.href === "/admin/candidates" && pendingApplies > 0 && (
                    <span className="admin-nav-badge" style={{ background: "#C8002A", color: "#fff", fontSize: "10px", fontWeight: 700, borderRadius: "20px", padding: "1px 6px", minWidth: "16px", textAlign: "center", flexShrink: 0 }}>{pendingApplies}</span>
                  )}
                  {active && <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#60A5FA", flexShrink: 0 }} />}
                </Link>
              );
            })}
          </div>
        ))}
        <div style={{ padding: "14px 10px 6px" }}>
          <AdminLangSwitcher />
        </div>
      </div>

      {/* User footer */}
      <div style={{ padding: "14px", borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #3B82F6, #1D4ED8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: "#fff", flexShrink: 0, boxShadow: "0 2px 6px rgba(59,130,246,0.4)" }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.85)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 }}>{email || "…"}</div>
            <span style={{ fontSize: "10px", fontWeight: 700, padding: "1px 7px", borderRadius: "20px", background: `${roleBadgeColor}25`, color: roleBadgeColor, border: `1px solid ${roleBadgeColor}50`, letterSpacing: "0.04em", display: "inline-block", marginTop: "3px" }}>
              {roleLabel}
            </span>
          </div>
          <button onClick={handleLogout} title={t("sidebar.logout")}
            style={{ background: "rgba(255,255,255,0.07)", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)", padding: "7px", borderRadius: "8px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.14)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes adminFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes adminBadgePop { 0% { transform: scale(0.6); opacity: 0; } 60% { transform: scale(1.15); } 100% { transform: scale(1); opacity: 1; } }

        /* ── Nav link interactions ── */
        .admin-nav-link { transition: background 0.18s ease, transform 0.18s ease; }
        .admin-nav-link:hover { background: rgba(255,255,255,0.09) !important; transform: translateX(2px); }
        .admin-nav-link.active:hover { background: rgba(255,255,255,0.18) !important; }
        .admin-nav-icon { transition: opacity 0.18s ease, transform 0.18s ease; }
        .admin-nav-link:hover .admin-nav-icon { opacity: 1 !important; transform: scale(1.08); }
        .admin-nav-badge { animation: adminBadgePop 0.35s cubic-bezier(0.34,1.56,0.64,1); }

        /* ── Page content: soft entrance on route change ── */
        .admin-main > div { animation: adminFadeIn 0.3s ease both; }

        @media (prefers-reduced-motion: reduce) {
          .admin-nav-link, .admin-nav-icon, .admin-main > div { animation: none !important; transition: none !important; }
        }

        /* ── Desktop layout ── */
        .admin-root { display: flex; height: 100vh; overflow: hidden; font-family: 'Noto Sans JP','Yu Gothic UI',sans-serif; }
        .admin-sidebar-desktop { display: flex; flex-direction: column; height: 100vh; }
        .admin-sidebar-mobile { display: none; }
        .admin-overlay { display: none; }
        .admin-topbar-mobile { display: none; }
        .sidebar-close-btn { display: none !important; }

        /* ── Mobile layout (≤ 768px) ── */
        @media (max-width: 768px) {
          .admin-sidebar-desktop { display: none; }

          /* Mobile top bar */
          .admin-topbar-mobile {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 0 14px;
            height: 52px;
            background: #0B1F3A;
            flex-shrink: 0;
          }

          /* Drawer */
          .admin-sidebar-mobile {
            display: flex;
            position: fixed;
            top: 0; left: 0;
            height: 100vh;
            z-index: 300;
            transform: translateX(-100%);
            transition: transform 0.25s cubic-bezier(0.4,0,0.2,1);
            width: 240px;
          }
          .admin-sidebar-mobile.open {
            transform: translateX(0);
            box-shadow: 4px 0 24px rgba(0,0,0,0.3);
          }
          .sidebar-close-btn { display: flex !important; }

          /* Backdrop */
          .admin-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.45);
            z-index: 299;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.25s ease;
          }
          .admin-overlay.open {
            opacity: 1;
            pointer-events: all;
          }

          /* Main takes full width */
          .admin-root { flex-direction: column; }
          .admin-main { flex: 1; overflow: auto; background: #F6F7F9; }
        }
      `}</style>

      <div className="admin-root">

        {/* Desktop sidebar */}
        <div className="admin-sidebar-desktop">
          {Sidebar}
        </div>

        {/* Mobile drawer */}
        <div className={`admin-sidebar-mobile${sidebarOpen ? " open" : ""}`}>
          {Sidebar}
        </div>

        {/* Backdrop */}
        <div className={`admin-overlay${sidebarOpen ? " open" : ""}`} onClick={() => setSidebarOpen(false)} />

        {/* Mobile top bar */}
        <div className="admin-topbar-mobile">
          <button onClick={() => setSidebarOpen(true)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", padding: "4px", display: "flex", alignItems: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
          </button>
          <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/aseka-logo-icon.png" alt="ASEKA" style={{ width: "22px", height: "22px", objectFit: "contain" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#fff", letterSpacing: "0.04em" }}>ASEKA</div>
            <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.45)" }}>{t("common.backOffice")}</div>
          </div>
          <button onClick={handleLogout} style={{ background: "none", border: "none", cursor: "pointer", opacity: 0.55, padding: "4px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          </button>
        </div>

        {/* Main content */}
        <div className="admin-main" style={{ flex: 1, overflow: "auto", background: "#F6F7F9" }}>
          {accessChecked ? children : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", flexDirection: "column", gap: "12px" }}>
              <div style={{ width: "28px", height: "28px", border: "3px solid #E5E7EB", borderTopColor: "#2563EB", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
