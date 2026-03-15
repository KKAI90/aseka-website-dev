import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
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
    const body = await req.json();
    console.log("INSERT body keys:", Object.keys(body));

    // Only insert valid columns
    const record = {
      name:           body.name || "",
      email:          body.email || null,
      phone:          body.phone || null,
      skill:          body.skill || null,
      jlpt:           body.jlpt || null,
      status:         body.status || "new",
      match_job_id:   body.match_job_id || null,
      match_job_name: body.match_job_name || null,
      note:           body.note || null,
      cv_filename:    body.cv_filename || null,
      ai_data:        body.ai_data || null,
    };

    const { data, error } = await db()
      .from("candidates")
      .insert(record)
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }
    return NextResponse.json({ data });
  } catch (err) {
    console.error("POST candidates error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json();
    const { data, error } = await db()
      .from("candidates")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id");
  const { error } = await db().from("candidates").delete().eq("id", id!);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}