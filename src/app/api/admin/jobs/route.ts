import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, apiError } from "@/lib/adminAuth";

export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const id = searchParams.get("id");

  if (id) {
    const data = await prisma.job_listings.findUnique({ where: { id } });
    if (!data) return apiError("データの取得に失敗しました");
    return NextResponse.json({ data });
  }

  const where = status && status !== "all" ? { status } : {};
  const data = await prisma.job_listings.findMany({
    where,
    orderBy: { created_at: "desc" },
  });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, created_at, updated_at, ...fields } = body;
    const data = await prisma.job_listings.create({
      data: { ...fields, count: Number(body.count) || 1 },
    });
    return NextResponse.json({ data });
  } catch {
    return apiError("登録に失敗しました", 400);
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id, created_at, ...updates } = await req.json();
    if (!id) return apiError("IDが必要です", 400);
    const data = await prisma.job_listings.update({
      where: { id },
      data: { ...updates, updated_at: new Date() },
    });
    return NextResponse.json({ data });
  } catch {
    return apiError("更新に失敗しました");
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return apiError("IDが必要です", 400);
  await prisma.job_listings.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
