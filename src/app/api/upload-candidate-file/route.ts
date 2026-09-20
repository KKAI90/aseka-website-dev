import { NextRequest, NextResponse } from "next/server";
import { uploadCandidateFile, s3Configured } from "@/lib/s3";
import { rateLimit } from "@/lib/rateLimit";

export const maxDuration = 30;

// Public endpoint (used by the unauthenticated /dang-ky registration form, and also by the
// admin CV-import review screen) — a candidate hasn't created any account yet at dang-ky
// time, so there's no session to require, and this route itself has no auth check either
// way. The upload lib enforces MIME-type and size limits; without a rate limit, that alone
// still leaves an anonymous caller free to flood S3 storage/cost with repeated 15MB uploads
// that never turn into an actual registration. 20/hour per IP comfortably covers one real
// candidate (max 6 files) or one admin processing several CVs, while blocking automated abuse.
export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "upload-candidate-file", { max: 20, windowMs: 60 * 60_000 });
  if (limited) return limited;

  if (!s3Configured()) {
    return NextResponse.json({ error: "upload_not_configured" }, { status: 503 });
  }

  try {
    const form = await req.formData();
    const file = form.get("file");
    const fieldKey = String(form.get("fieldKey") || "misc").replace(/[^a-z_]/gi, "");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "no_file" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadCandidateFile({ buffer, mimeType: file.type, fieldKey });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ key: result.key });
  } catch (err) {
    console.error("upload-candidate-file error:", err);
    return NextResponse.json({ error: "upload_failed" }, { status: 500 });
  }
}
