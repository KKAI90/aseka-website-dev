import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET — lấy danh sách ứng viên
export async function GET(req: NextRequest) {
  const token = req.cookies.get("sb-access-token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const supabase = getAdmin();
  let query = supabase
    .from("candidates")
    .select("*")
    .order("created_at", { ascending: false });

  if (status && status !== "all") query = query.eq("status", status);
  if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,match_job_name.ilike.%${search}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// POST — thêm ứng viên mới
export async function POST(req: NextRequest) {
  const token = req.cookies.get("sb-access-token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, email, phone, skill, jlpt, status, match_job_id, match_job_name, note, cv_filename, ai_data } = body;

  if (!name) return NextResponse.json({ error: "名前は必須です" }, { status: 400 });

  const supabase = getAdmin();
  const { data, error } = await supabase
    .from("candidates")
    .insert({ name, email, phone, skill, jlpt, status: status || "new", match_job_id, match_job_name, note, cv_filename, ai_data })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// PATCH — cập nhật ứng viên (status, match_job, v.v.)
export async function PATCH(req: NextRequest) {
  const token = req.cookies.get("sb-access-token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "IDが必要です" }, { status: 400 });

  const supabase = getAdmin();
  const { data, error } = await supabase
    .from("candidates")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// DELETE — xóa ứng viên
export async function DELETE(req: NextRequest) {
  const token = req.cookies.get("sb-access-token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "IDが必要です" }, { status: 400 });

  const supabase = getAdmin();
  const { error } = await supabase.from("candidates").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
