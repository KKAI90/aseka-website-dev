import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const url = request.nextUrl.clone();

  // admin.aseka.co.jp → rewrite to /admin/*
  if (host.startsWith("admin.")) {
    const pathname = url.pathname;

    // Already under /admin — pass through
    if (pathname.startsWith("/admin")) {
      return NextResponse.next();
    }

    // Root → redirect to /admin/login
    url.pathname = "/admin" + (pathname === "/" ? "/login" : pathname);
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on all routes except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|images/).*)",
  ],
};
