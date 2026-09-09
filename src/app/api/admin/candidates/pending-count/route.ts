import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

// Lightweight count for the sidebar badge — how many candidates self-applied
// via mypage and haven't been marked reviewed by staff yet.
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const count = await prisma.candidates.count({
    where: { applied_via: "self", applied_reviewed: false },
  });
  return NextResponse.json({ count });
}
