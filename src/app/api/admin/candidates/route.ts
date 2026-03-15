import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get("sb-access-token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  let q = db().from("candidates").select("*").order("created_at", { ascending: false });
  if (status && status !== "all") q = q.eq("status", status);
  if (search) q = q.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    // Chỉ lấy những trường CÓ THỰC trong bảng Database của bạn
    // Loại bỏ những trường thừa từ AI như 'suggestions', 'score', 'matchPct'
    const candidateData = {
      name: rawBody.name || "Unknown",
      email: rawBody.email || "",
      phone: rawBody.phone || "",
      jlpt: rawBody.jlpt || "なし",
      industry: rawBody.industry || "その他",
      experience_years: rawBody.experienceYears || 0, // Lưu ý: DB thường dùng snake_case
      summary: rawBody.summary || "",
      status: "新規登録", // Trạng thái mặc định khi mới lưu
      created_at: new Date().toISOString(),
    };

    const { data, error } = await db()
      .from("candidates")
      .insert([candidateData]) // Luôn dùng mảng [] để an toàn
      .select()
      .single();

    if (error) {
      console.error("Supabase Insert Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get("sb-access-token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, ...updates } = await req.json();
  const { data, error } = await db()
    .from("candidates")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get("sb-access-token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  const { error } = await db().from("candidates").delete().eq("id", id!);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}