import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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
const MAX_BYTES = 15 * 1024 * 1024; // 15MB — generous for a phone-camera photo or scanned PDF

/** Uploads a candidate-submitted file to the private bucket. Returns the S3 *key* — not
 *  a URL — since the bucket has no public access; use presignCandidateFile() to view it. */
export async function uploadCandidateFile(opts: {
  buffer: Buffer;
  mimeType: string;
  fieldKey: string; // e.g. "photo", "id_front" — used only to namespace the S3 key
}): Promise<{ key: string } | { error: string }> {
  if (!s3Configured()) return { error: "S3 not configured" };
  if (!ALLOWED_MIME.has(opts.mimeType)) return { error: "Unsupported file type" };
  if (opts.buffer.length > MAX_BYTES) return { error: "File too large (max 15MB)" };

  const ext = opts.mimeType === "application/pdf" ? "pdf" : opts.mimeType.split("/")[1];
  const key = `candidates/${opts.fieldKey}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

  try {
    await getClient().send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
      Body: opts.buffer,
      ContentType: opts.mimeType,
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
