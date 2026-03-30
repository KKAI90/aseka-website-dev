import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Map flexible field names (JP/VN/EN variations) to canonical keys
function pick(data: Record<string, string>, ...keys: string[]): string {
  for (const k of keys) {
    const found = Object.entries(data).find(
      ([key]) => key.trim().toLowerCase() === k.trim().toLowerCase()
    );
    if (found && found[1]) return String(found[1]).trim();
  }
  return "";
}

export async function POST(req: NextRequest) {
  try {
    // ── Auth: verify webhook secret ──────────────────────
    const secret = process.env.WEBHOOK_SECRET;
    if (secret) {
      const token =
        req.headers.get("x-webhook-secret") ||
        req.headers.get("authorization")?.replace("Bearer ", "");
      if (token !== secret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = await req.json();

    // body.responses: { "フィールド名": "値", ... } from Google Apps Script
    const r: Record<string, string> = body.responses || body || {};

    // ── Map form fields → candidate record ───────────────
    const name = pick(r,
      "氏名", "名前", "フルネーム", "full name", "họ và tên", "tên đầy đủ", "name"
    );
    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const record = {
      name,
      name_kana:      pick(r, "フリガナ", "ふりがな", "name_kana", "kana") || null,
      email:          pick(r, "メールアドレス", "email", "メール", "e-mail", "địa chỉ email") || null,
      phone:          pick(r, "電話番号", "phone", "tel", "số điện thoại", "điện thoại") || null,
      gender:         pick(r, "性別", "gender", "giới tính") || null,
      date_of_birth:  pick(r, "生年月日", "誕生日", "date of birth", "birthday", "ngày sinh", "năm sinh") || null,
      nationality:    pick(r, "国籍", "nationality", "quốc tịch") || "Vietnam",
      address:        pick(r, "住所", "address", "địa chỉ") || null,
      visa_type:      pick(r, "在留資格", "ビザ種別", "visa type", "visa", "loại visa", "tư cách lưu trú") || null,
      visa_expiry:    pick(r, "在留期限", "ビザ有効期限", "visa expiry", "hạn visa") || null,
      jlpt:           pick(r, "日本語レベル", "jlpt", "日本語能力", "trình độ tiếng nhật", "n1", "n2", "n3", "n4", "n5") || "N4",
      skill:          pick(r, "希望業種", "業種", "industry", "skill", "ngành nghề", "ngành mong muốn", "lĩnh vực", "chuyên ngành") || "その他",
      preferred_job:  pick(r, "希望職種", "希望の仕事", "preferred job", "job type", "công việc mong muốn", "vị trí mong muốn") || null,
      work_hours:     pick(r, "勤務時間", "work hours", "giờ làm việc") || null,
      availability:   pick(r, "来日可能時期", "渡航可能時期", "availability", "thời gian có thể sang nhật", "thời gian đến nhật") || null,
      marital_status: pick(r, "婚姻状況", "marital status", "tình trạng hôn nhân") || null,
      dependents:     Number(pick(r, "扶養家族数", "dependents", "số người phụ thuộc")) || null,
      motivation:     pick(r, "志望動機", "来日理由", "motivation", "lý do sang nhật", "động lực") || null,
      self_pr:        pick(r, "自己pr", "自己PR", "自己アピール", "self pr", "giới thiệu bản thân") || null,
      note:           pick(r, "備考", "note", "ghi chú", "その他", "other") || null,
      status:         "new",
      match_job_name: null,
      education:      [],
      work_history:   [],
      certifications: [],
      cv_filename:    `google-form-${Date.now()}`,
    };

    const data = await prisma.candidates.create({ data: record });

    console.log("[webhook] new candidate from Google Form:", data.id, name);
    return NextResponse.json({ success: true, id: data.id, name });

  } catch (err) {
    console.error("[webhook] error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// Allow GET for connection test
export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "Google Form Webhook",
    method: "POST",
    note: "Send { responses: { 'fieldName': 'value' } } with x-webhook-secret header",
  });
}
