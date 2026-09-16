import { NextRequest, NextResponse } from "next/server";
import { uploadCandidateFile, s3Configured } from "@/lib/s3";

export const maxDuration = 30;

// Public endpoint (used by the unauthenticated /dang-ky registration form) — a candidate
// hasn't created any account yet at this point, so there's no session to require. The
// upload lib itself enforces MIME-type and size limits; this route just wires HTTP <-> S3.
export async function POST(req: NextRequest) {
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
