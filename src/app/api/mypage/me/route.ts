import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  const id = req.cookies.get("mypage-id")?.value;
  if (!id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await db()
    .from("candidates")
    .select("id,name,name_kana,email,phone,date_of_birth,gender,skill,jlpt,preferred_job,visa_type,visa_expiry,status,match_job_name,motivation,availability,work_hours,address,nationality,created_at")
    .eq("id", id)
    .single();

  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data });
}
