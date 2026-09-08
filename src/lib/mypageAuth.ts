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
