import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import heicConvert from "heic-convert";

// Shared S3 upload helper for public file uploads (/dang-ky: portrait photo, ID scans,
// certificates). Everything here is written and ready to go — it just needs real AWS
// credentials + a **private** bucket, which have to be provisioned by hand in the AWS
// Console (this environment has no AWS CLI/API access to create them). Until those env
// vars exist, s3Configured() returns false and callers should degrade gracefully rather
// than fail the whole form submission over an optional attachment.
//
// The bucket MUST stay private (block all public access) — these are ID document scans
// and portrait photos. We store only the object key in the DB, never a public URL, and
// mint a short-lived presigned GET URL on demand when an admin actually opens a file.
export function s3Configured(): boolean {
  return !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.S3_BUCKET_NAME &&
    process.env.AWS_REGION
  );
}

let cachedClient: S3Client | null = null;
function getClient(): S3Client {
  if (!cachedClient) {
    cachedClient = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }
  return cachedClient;
}

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
// iPhone/iPad save camera-roll photos as HEIC/HEIF by default — a candidate picking an
// existing photo (not one freshly taken through this form) can hand us one of these instead
// of JPEG. Accepted as *input* but always converted to JPEG below before it ever reaches S3:
// HEIC isn't just "another format" here, it's one most non-Apple browsers (any admin on
// Windows/Android Chrome, the overwhelming majority of this app's actual admin users) can't
// render at all in an <img> tag — accepting it without converting would silently trade "the
// upload fails" for "the upload succeeds and then no one can ever see the photo."
const HEIC_MIME = new Set(["image/heic", "image/heif"]);
const MAX_BYTES = 15 * 1024 * 1024; // 15MB — generous for a phone-camera photo or scanned PDF

/** Uploads a candidate-submitted file to the private bucket. Returns the S3 *key* — not
 *  a URL — since the bucket has no public access; use presignCandidateFile() to view it. */
export async function uploadCandidateFile(opts: {
  buffer: Buffer;
  mimeType: string;
  fieldKey: string; // e.g. "photo", "id_front" — used only to namespace the S3 key
}): Promise<{ key: string } | { error: string }> {
  if (!s3Configured()) return { error: "S3 not configured" };
  if (!ALLOWED_MIME.has(opts.mimeType) && !HEIC_MIME.has(opts.mimeType)) {
    return { error: "Unsupported file type" };
  }
  // Checked on the ORIGINAL upload too (cheap, rejects an obviously-too-large file before
  // spending CPU converting it) — HEIC's own compression is often smaller than the JPEG
  // it becomes, so the real, authoritative check happens again below on the converted bytes.
  if (opts.buffer.length > MAX_BYTES) return { error: "File too large (max 15MB)" };

  let buffer = opts.buffer;
  let mimeType = opts.mimeType;
  if (HEIC_MIME.has(opts.mimeType)) {
    try {
      const converted = await heicConvert({ buffer: opts.buffer, format: "JPEG", quality: 0.9 });
      buffer = Buffer.from(converted);
      mimeType = "image/jpeg";
    } catch (err) {
      console.error("HEIC→JPEG conversion failed:", err);
      return { error: "heic_conversion_failed" };
    }
    if (buffer.length > MAX_BYTES) return { error: "File too large (max 15MB)" };
  }

  const ext = mimeType === "application/pdf" ? "pdf" : mimeType.split("/")[1];
  const key = `candidates/${opts.fieldKey}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

  try {
    await getClient().send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    }));
    return { key };
  } catch (err) {
    console.error("S3 upload failed:", err);
    return { error: "Upload failed" };
  }
}

/** Mints a short-lived (10min) signed URL so an admin can view/download a private file. */
export async function presignCandidateFile(key: string): Promise<string | null> {
  if (!s3Configured()) return null;
  try {
    return await getSignedUrl(
      getClient(),
      new GetObjectCommand({ Bucket: process.env.S3_BUCKET_NAME!, Key: key }),
      { expiresIn: 600 }
    );
  } catch (err) {
    console.error("S3 presign failed:", err);
    return null;
  }
}
