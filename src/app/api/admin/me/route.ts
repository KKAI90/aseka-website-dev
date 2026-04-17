import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getRoleFromEmail } from "@/lib/roles";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("sb-access-token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Always derive role from email so it stays up-to-date even for old tokens
  const role = getRoleFromEmail(payload.email);
  return NextResponse.json({ email: payload.email, role });
}
