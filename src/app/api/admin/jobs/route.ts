import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET — lấy danh sách jobs
export async function GET(req: NextRequest) {
  const token = req.cookies.get("sb-access-token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const supabase = getAdmin();
  let query = supabase
    .from("job_listings")
    .select("*")
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// POST — thêm job mới
export async function POST(req: NextRequest) {
  const token = req.cookies.get("sb-access-token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { company, location, position_ja, position_vn, industry, count, salary, jlpt_min, status } = body;

  if (!company || !position_ja || !industry) {
    return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
  }

  const supabase = getAdmin();
  const { data, error } = await supabase
    .from("job_listings")
    .insert({ company, location, position_ja, position_vn, industry, count: Number(count) || 1, salary, jlpt_min: jlpt_min || "N5", status: status || "open" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// PATCH — cập nhật job
export async function PATCH(req: NextRequest) {
  const token = req.cookies.get("sb-access-token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "IDが必要です" }, { status: 400 });

  const supabase = getAdmin();
  const { data, error } = await supabase
    .from("job_listings")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// DELETE — xóa job
export async function DELETE(req: NextRequest) {
  const token = req.cookies.get("sb-access-token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "IDが必要です" }, { status: 400 });

  const supabase = getAdmin();
  const { error } = await supabase.from("job_listings").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
