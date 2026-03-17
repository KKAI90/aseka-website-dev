import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Verify admin session. Returns user email if valid, or a 401 NextResponse.
 * Usage:
 *   const auth = await requireAdmin(req);
 *   if (auth instanceof NextResponse) return auth;
 */
export async function requireAdmin(req: NextRequest): Promise<string | NextResponse> {
  const token = req.cookies.get("sb-access-token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return user.email ?? "unknown";
}

/** Generic sanitized error response — never expose raw DB errors */
export function apiError(message: string, status = 500): NextResponse {
  return NextResponse.json({ error: message }, { status });
}
