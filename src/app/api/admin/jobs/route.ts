import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, apiError } from "@/lib/adminAuth";
import { translateJobFields } from "@/lib/translate";

export const maxDuration = 30;

// Free-text fields worth machine-translating for mypage's EN/VI candidates. Deliberately
// excludes: company (a proper noun), industry/employment_type/visa_type (small fixed
// vocabularies translated once in src/lib/mypageI18n.tsx instead, more reliable than
// re-translating the same handful of values per job), work_location/location (a real
// Japanese address — translating it would make it useless for mail/visits), and anything
// numeric (salary/annual_income/count). position_name IS included for English — for
// Vietnamese, mypage prefers the human-curated position_vn over this machine translation
// when one exists, falling back to it only when position_vn is empty.
const TRANSLATABLE_FIELDS = [
  "position_name", "job_description", "requirements", "qualifications", "osusume_point",
  "position_note", "work_environment", "selection_process", "salary_note",
  "remarks", "education_req", "language_skills",
  "work_hours", "holidays", "insurance", "trial_period", "salary_type",
] as const;

// Fire-and-forget: this process runs persistently under PM2 (not serverless), so an
// unawaited async call started here keeps running after the response is sent — the admin
// isn't stuck waiting ~5-10s for ~20 translation API calls on every save. Failures are
// swallowed (translateJobFields already returns partial results on its own); mypage simply
// falls back to Japanese for whichever fields/languages didn't come through.
function translateInBackground(jobId: string, data: Record<string, unknown>) {
  const fields: Record<string, string | null | undefined> = {};
  for (const k of TRANSLATABLE_FIELDS) fields[k] = data[k] as string | null | undefined;
  translateJobFields(fields)
    .then(translations => {
      if (Object.keys(translations).length === 0) return; // nothing to translate — e.g. a listing with no free-text fields filled in yet
      return prisma.job_listings.update({ where: { id: jobId }, data: { translations } });
    })
    .catch(err => console.error(`translateInBackground failed for job ${jobId}:`, err));
}

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
    const { id: _id, created_at: _ca, updated_at: _ua, ...fields } = body;
    const data = await prisma.job_listings.create({
      data: { ...fields, count: Number(body.count) || 1 },
    });
    translateInBackground(data.id, data);
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
    // Only the fields relevant to this update need re-translating, but re-running all of
    // them keeps this simple and cheap enough (still ~1 job's worth of MyMemory calls) not
    // to bother diffing which fields actually changed.
    translateInBackground(data.id, data);
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
