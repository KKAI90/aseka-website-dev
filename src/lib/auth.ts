import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "aseka-secret-change-in-prod";

export function signToken(payload: { email: string }) {
  return jwt.sign(payload, SECRET, { expiresIn: "8h" });
}

export function verifyToken(token: string): { email: string } | null {
  try {
    return jwt.verify(token, SECRET) as { email: string };
  } catch {
    return null;
  }
}
