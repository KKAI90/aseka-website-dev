import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./auth";

export async function requireAdmin(req: NextRequest): Promise<string | NextResponse> {
  const token = req.cookies.get("sb-access-token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return payload.email;
}

export function apiError(message: string, status = 500): NextResponse {
  return NextResponse.json({ error: message }, { status });
}
