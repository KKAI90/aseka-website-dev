import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    const { loginId, password } = await req.json();
    if (!loginId || !password) {
      return NextResponse.json({ error: "IDとパスワードを入力してください" }, { status: 400 });
    }

    // Normalize: strip non-digit for phone comparison
    const idNorm = loginId.trim();
    const pwNorm = password.replace(/[-\/]/g, "").trim(); // YYYYMMDD or YYYY/MM/DD

    // Try to find candidate by email OR phone
    const supabase = db();
    const { data: byEmail } = await supabase
      .from("candidates")
      .select("id,name,email,phone,date_of_birth,status,skill,jlpt,preferred_job,visa_type,match_job_name")
      .eq("email", idNorm)
      .single();

    const { data: byPhone } = !byEmail
      ? await supabase
          .from("candidates")
          .select("id,name,email,phone,date_of_birth,status,skill,jlpt,preferred_job,visa_type,match_job_name")
          .eq("phone", idNorm)
          .single()
      : { data: null };

    const cand = byEmail || byPhone;
    if (!cand) {
      return NextResponse.json({ error: "IDが見つかりません / Không tìm thấy tài khoản" }, { status: 401 });
    }

    // Password = date_of_birth in YYYYMMDD format
    const dobNorm = (cand.date_of_birth || "").replace(/[-\/]/g, "");
    if (!dobNorm || dobNorm !== pwNorm) {
      return NextResponse.json({ error: "パスワードが正しくありません / Sai mật khẩu" }, { status: 401 });
    }

    const res = NextResponse.json({ success: true, name: cand.name });
    res.cookies.set("mypage-id", cand.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
    return res;
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
