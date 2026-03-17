import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin, apiError } from "@/lib/adminAuth";

export const maxDuration = 30;

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const id = searchParams.get("id");

  if (id) {
    const { data, error } = await db().from("job_listings").select("*").eq("id", id).single();
    if (error) return apiError("データの取得に失敗しました");
    return NextResponse.json({ data });
  }

  let q = db().from("job_listings").select("*").order("created_at", { ascending: false });
  if (status && status !== "all") q = q.eq("status", status);
  const { data, error } = await q;
  if (error) return apiError("データの取得に失敗しました");
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { data, error } = await db()
      .from("job_listings")
      .insert({ ...body, count: Number(body.count) || 1 })
      .select().single();
    if (error) return apiError("登録に失敗しました");
    return NextResponse.json({ data });
  } catch {
    return apiError("リクエストが無効です", 400);
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id, ...updates } = await req.json();
    if (!id) return apiError("IDが必要です", 400);
    const { data, error } = await db()
      .from("job_listings")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id).select().single();
    if (error) return apiError("更新に失敗しました");
    return NextResponse.json({ data });
  } catch {
    return apiError("リクエストが無効です", 400);
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return apiError("IDが必要です", 400);
  const { error } = await db().from("job_listings").delete().eq("id", id);
  if (error) return apiError("削除に失敗しました");
  return NextResponse.json({ success: true });
}
