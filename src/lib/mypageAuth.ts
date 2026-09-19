import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const SECRET = process.env.JWT_SECRET || "aseka-secret-change-in-prod";
const PASSWORD_RESET_PURPOSE = "mypage-password-reset";
const PASSWORD_RESET_EXPIRES_IN = "30m";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// "パスワードをお忘れの方" (forgot password) — a candidate proves ownership of their
// registered email by clicking a time-limited link, then sets a brand-new password from
// there. Replaces the earlier "magic link" passwordless-login feature at this same spot:
// that let someone in without ever touching a password, whereas this scopes the token to
// ONE purpose only (set a new password) via the `purpose` claim, so a leaked/forwarded
// reset link can't be replayed as a general login token.
export function signPasswordResetToken(candidateId: string): string {
  return jwt.sign({ candidateId, purpose: PASSWORD_RESET_PURPOSE }, SECRET, { expiresIn: PASSWORD_RESET_EXPIRES_IN });
}

export function verifyPasswordResetToken(token: string): { candidateId: string } | null {
  try {
    const decoded = jwt.verify(token, SECRET) as { candidateId: string; purpose: string };
    if (decoded.purpose !== PASSWORD_RESET_PURPOSE) return null;
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
