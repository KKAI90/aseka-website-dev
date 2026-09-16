import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, apiError } from "@/lib/adminAuth";
import { presignCandidateFile } from "@/lib/s3";

const ALLOWED_FIELDS = new Set([
  "photo_url", "id_front_url", "id_back_url",
  "jlpt_cert_url", "senmonkyu_url", "other_cert_url",
]);

// Returns a short-lived presigned S3 URL for one candidate file — never the permanent
// key/URL directly, since these are ID scans and portraits. Looks the key up from the DB
// by candidate id rather than trusting a raw key from the client.
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const field = searchParams.get("field");
  if (!id || !field || !ALLOWED_FIELDS.has(field)) return apiError("Invalid request", 400);

  const cand = await prisma.candidates.findUnique({
    where: { id },
    select: { [field]: true } as Record<string, true>,
  });
  const key = cand ? (cand as unknown as Record<string, string | null>)[field] : null;
  if (!key) return apiError("File not found", 404);

  const url = await presignCandidateFile(key);
  if (!url) return apiError("Could not generate file URL", 500);
  return NextResponse.json({ url });
}
