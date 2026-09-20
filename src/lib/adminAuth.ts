import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./auth";
import { type Role, getRoleFromEmail } from "./roles";

// Historically only checked "is this a valid admin JWT" — never the role on it. The UI
// (admin/layout.tsx + roles.ts's ALLOWED_PATHS) restricts the "admin" role to /admin/messages
// only, but that was a client-side redirect alone: nothing stopped an "admin"-role session
// from calling /api/admin/candidates, /api/admin/jobs, etc. directly and getting full access
// to candidate PII anyway (found via a pre-prod security audit — the page-level restriction
// existing at all only makes sense if some admin accounts are meant to see less, so the API
// silently granting everyone the same access defeated the whole point of having two roles).
//
// `allowedRoles` defaults to both roles (i.e. "any authenticated admin") for endpoints that
// were never meant to be restricted — callers that need message-only vs. full-access
// enforcement now pass an explicit role list matching what ALLOWED_PATHS already promises.
export async function requireAdmin(req: NextRequest, allowedRoles?: Role[]): Promise<string | NextResponse> {
  const token = req.cookies.get("sb-access-token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (allowedRoles) {
    const role = getRoleFromEmail(payload.email);
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }
  return payload.email;
}

export function apiError(message: string, status = 500): NextResponse {
  return NextResponse.json({ error: message }, { status });
}
