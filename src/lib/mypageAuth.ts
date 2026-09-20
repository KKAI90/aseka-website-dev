import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import type { NextRequest } from "next/server";

const SECRET = process.env.JWT_SECRET || "aseka-secret-change-in-prod";
const PASSWORD_RESET_PURPOSE = "mypage-password-reset";
const PASSWORD_RESET_EXPIRES_IN = "30m";
const SESSION_PURPOSE = "mypage-session";
// 30d ceiling matches the longest-lived cookie (remember=true) — the browser cookie's own
// maxAge (or absence of one, for a session-only cookie) governs the actual UX; this is just
// the token's own outer validity window.
const SESSION_EXPIRES_IN = "30d";

// The mypage-id cookie used to hold the candidate's raw UUID, unsigned — httpOnly + secure
// + sameSite=lax + a 128-bit random ID make it hard to guess, but if that ID ever leaked
// through some other channel (an admin deep-link URL like /admin/jobs?forCandidate=...,
// a log line, a shared screenshot), anyone holding it could set the same cookie value
// themselves and be treated as that candidate — no forgery needed, the server never
// verified anything about the value. Signing it the same way the admin side's session
// token already is closes that: the cookie's value is now a JWT bound to this specific
// purpose, so a bare leaked UUID is no longer sufficient on its own.
export function signMypageSessionToken(candidateId: string): string {
  return jwt.sign({ candidateId, purpose: SESSION_PURPOSE }, SECRET, { expiresIn: SESSION_EXPIRES_IN });
}

export function verifyMypageSessionToken(token: string): { candidateId: string } | null {
  try {
    const decoded = jwt.verify(token, SECRET) as { candidateId: string; purpose: string };
    if (decoded.purpose !== SESSION_PURPOSE) return null;
    return { candidateId: decoded.candidateId };
  } catch {
    return null;
  }
}

// Every mypage API route reads the same cookie the same way — centralized here so each
// route's auth check is one line instead of repeating the verify-or-null pattern six times.
// Returns null for a missing cookie AND for one that fails verification (wrong signature,
// wrong purpose, expired, or a stale pre-migration raw-UUID value) — callers don't need to
// distinguish "not logged in" from "invalid session", both just mean 401.
export function getMypageCandidateId(req: NextRequest): string | null {
  const token = req.cookies.get("mypage-id")?.value;
  if (!token) return null;
  return verifyMypageSessionToken(token)?.candidateId ?? null;
}

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
