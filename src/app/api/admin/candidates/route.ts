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
  const id = searchParams.get("id");

  if (id) {
    const { data, error } = await db().from("candidates").select("*").eq("id", id).single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  let q = db().from("candidates").select("*").order("created_at", { ascending: false });
  if (status && status !== "all") q = q.eq("status", status);
  if (search) q = q.or(`name.ilike.%${search}%,email.ilike.%${search}%,preferred_job.ilike.%${search}%`);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const record = {
      name:           body.name || "",
      name_kana:      body.name_kana || null,
      email:          body.email || null,
      phone:          body.phone || null,
      gender:         body.gender || null,
      date_of_birth:  body.date_of_birth || null,
      nationality:    body.nationality || "Vietnam",
      address:        body.address || null,
      visa_type:      body.visa_type || null,
      visa_expiry:    body.visa_expiry || null,
      jlpt:           body.jlpt || null,
      jlpt_actual:    body.jlpt_actual || null,
      height_cm:      body.height_cm || null,
      weight_kg:      body.weight_kg || null,
      skill:          body.skill || null,
      preferred_job:  body.preferred_job || null,
      work_hours:     body.work_hours || null,
      availability:   body.availability || null,
      marital_status: body.marital_status || null,
      dependents:     body.dependents || 0,
      education:      body.education || [],
      work_history:   body.work_history || [],
      certifications: body.certifications || [],
      motivation:     body.motivation || null,
      self_pr:        body.self_pr || null,
      status:         body.status || "new",
      match_job_id:   null,
      match_job_name: body.match_job_name || null,
      note:           body.note || null,
      cv_filename:    body.cv_filename || null,
      ai_data:        body.ai_data || null,
    };
    const { data, error } = await db().from("candidates").insert(record).select().single();
    if (error) {
      console.error("Insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json();
    const { data, error } = await db()
      .from("candidates")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id).select().single();
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