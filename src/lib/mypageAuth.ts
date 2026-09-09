import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const SECRET = process.env.JWT_SECRET || "aseka-secret-change-in-prod";
const MAGIC_LINK_PURPOSE = "mypage-magiclink";
const MAGIC_LINK_EXPIRES_IN = "15m";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signMagicLinkToken(candidateId: string): string {
  return jwt.sign({ candidateId, purpose: MAGIC_LINK_PURPOSE }, SECRET, { expiresIn: MAGIC_LINK_EXPIRES_IN });
}

export function verifyMagicLinkToken(token: string): { candidateId: string } | null {
  try {
    const decoded = jwt.verify(token, SECRET) as { candidateId: string; purpose: string };
    if (decoded.purpose !== MAGIC_LINK_PURPOSE) return null;
    return { candidateId: decoded.candidateId };
  } catch {
    return null;
  }
}

// Default first-login password: date of birth as DDMMYYYY.
// candidates.date_of_birth is a free-text column (mostly ISO "YYYY-MM-DD"
// from CV import, but not guaranteed) — parse defensively via Date.
export function dobToDefaultPassword(dob: string | null | undefined): string | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return null;
  const day   = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year  = d.getUTCFullYear();
  return `${day}${month}${year}`;
}

export function normalizeDigits(input: string): string {
  return String(input).replace(/[^0-9]/g, "");
}
