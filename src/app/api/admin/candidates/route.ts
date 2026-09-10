import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, apiError } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const skill = searchParams.get("skill");
  const jlpt = searchParams.get("jlpt");
  const id = searchParams.get("id");
  const matchJobId = searchParams.get("matchJobId");

  // password_hash never leaves the server — admin UI has no use for it and
  // it doesn't belong in a network response even hashed.
  const safeSelect = {
    id: true, name: true, name_kana: true, email: true, phone: true,
    gender: true, date_of_birth: true, nationality: true, address: true,
    visa_type: true, visa_expiry: true, jlpt: true, jlpt_actual: true,
    height_cm: true, weight_kg: true, skill: true, preferred_job: true,
    work_hours: true, availability: true, marital_status: true, dependents: true,
    education: true, work_history: true, certifications: true,
    motivation: true, self_pr: true, status: true,
    match_job_id: true, match_job_name: true, note: true, cv_filename: true,
    applied_via: true, applied_at: true, applied_reviewed: true,
    created_at: true, updated_at: true,
  };

  if (id) {
    const data = await prisma.candidates.findUnique({ where: { id }, select: safeSelect });
    if (!data) return apiError("データの取得に失敗しました");
    return NextResponse.json({ data });
  }

  const where: Record<string, unknown> = {};
  if (status && status !== "all") where.status = status;
  if (skill && skill !== "all") where.skill = skill;
  if (jlpt && jlpt !== "all") where.jlpt = jlpt;
  if (matchJobId) where.match_job_id = matchJobId;
  if (search) {
    const safe = search.slice(0, 100);
    where.OR = [
      { name: { contains: safe, mode: "insensitive" } },
      { email: { contains: safe, mode: "insensitive" } },
      { preferred_job: { contains: safe, mode: "insensitive" } },
    ];
  }

  const data = await prisma.candidates.findMany({
    where,
    orderBy: { created_at: "desc" },
    select: safeSelect,
  });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const isPublic = searchParams.get("public") === "1";
  if (!isPublic) {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;
  }

  try {
    const body = await req.json();
    const data = await prisma.candidates.create({
      data: {
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
        dependents:     body.dependents || null,
        education:      body.education || [],
        work_history:   body.work_history || [],
        certifications: body.certifications || [],
        motivation:     body.motivation || null,
        self_pr:        body.self_pr || null,
        status:         body.status || "新規",
        match_job_id:   body.match_job_id || null,
        match_job_name: body.match_job_name || null,
        note:           body.note || null,
        cv_filename:    body.cv_filename || null,
        applied_via:    body.applied_via || null,
        applied_at:     body.applied_at ? new Date(body.applied_at) : null,
      },
    });
    const { password_hash: _ph1, ...safeData } = data;
    return NextResponse.json({ data: safeData });
  } catch {
    return apiError("登録に失敗しました", 400);
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id, ...updates } = await req.json();
    if (!id) return apiError("IDが必要です", 400);
    const { created_at: _ca, password_hash: _ph2, ...safeUpdates } = updates;
    const data = await prisma.candidates.update({
      where: { id },
      data: { ...safeUpdates, updated_at: new Date() },
    });
    const { password_hash: _ph3, ...safeData } = data;
    return NextResponse.json({ data: safeData });
  } catch {
    return apiError("更新に失敗しました");
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return apiError("IDが必要です", 400);
  await prisma.candidates.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
