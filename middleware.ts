import { NextRequest, NextResponse } from "next/server";

/**
 * Routing logic — supports 2 modes:
 *
 * ── MODE 1: Separate Vercel projects (test env) ──────────────────────────
 *   Set NEXT_PUBLIC_APP_TYPE in each project's Environment Variables:
 *   - (not set)  → main website   aseka-website-dev.vercel.app
 *   - "admin"    → admin panel    aseka-admin-dev.vercel.app
 *   - "mypage"   → candidate hub  aseka-mypage-dev.vercel.app
 *
 * ── MODE 2: Real custom subdomains (production) ──────────────────────────
 *   Add custom domains to ONE project in Vercel:
 *   - aseka.jp            → main
 *   - admin.aseka.jp      → admin
 *   - mypage.aseka.jp     → mypage
 */

const PUBLIC_PATHS = ["/api/", "/_next/", "/favicon", "/robots", "/sitemap"];

function isPublic(path: string) {
  return PUBLIC_PATHS.some(p => path.startsWith(p));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (isPublic(pathname)) return NextResponse.next();

  const host     = req.headers.get("host") ?? "";
  const appType  = process.env.NEXT_PUBLIC_APP_TYPE ?? "";

  // ── Detect context (hostname wins over env var) ────────────────────────
  // Supports: admin.aseka.jp (prod) OR aseka-admin-dev.vercel.app (test)
  const isAdminHost  = host.startsWith("admin.")  || host.includes("-admin-")  || host.includes("-admin.") || appType === "admin";
  const isMypageHost = host.startsWith("mypage.") || host.includes("-mypage-") || host.includes("-mypage.") || appType === "mypage";

  // ── ADMIN context ──────────────────────────────────────────────────────
  if (isAdminHost) {
    // Block main website & mypage routes on admin project
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    // Block non-admin routes
    if (!pathname.startsWith("/admin") && !pathname.startsWith("/api/admin")) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }

  // ── MYPAGE context ─────────────────────────────────────────────────────
  if (isMypageHost) {
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/mypage/login", req.url));
    }
    // Block non-mypage routes
    if (!pathname.startsWith("/mypage") && !pathname.startsWith("/api/mypage")) {
      return NextResponse.redirect(new URL("/mypage/login", req.url));
    }
    return NextResponse.next();
  }

  // ── MAIN website context ───────────────────────────────────────────────
  // Block /admin completely on main website — use aseka-admin-dev.vercel.app instead
  if (pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
