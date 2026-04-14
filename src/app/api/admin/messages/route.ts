import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, apiError } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const data = await prisma.contact_submissions.findMany({
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json({ data });
  } catch {
    return apiError("データの取得に失敗しました", 500);
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id, status } = await req.json();
    if (!id) return apiError("IDが必要です", 400);
    await prisma.contact_submissions.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json({ success: true });
  } catch {
    return apiError("データの取得に失敗しました", 500);
  }
}
