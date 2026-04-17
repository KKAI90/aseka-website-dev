import jwt from "jsonwebtoken";
import { type Role, getRoleFromEmail } from "@/lib/roles";

const SECRET = process.env.JWT_SECRET || "aseka-secret-change-in-prod";

export function signToken(payload: { email: string }) {
  const role: Role = getRoleFromEmail(payload.email);
  return jwt.sign({ ...payload, role }, SECRET, { expiresIn: "8h" });
}

export function verifyToken(token: string): { email: string; role: Role } | null {
  try {
    return jwt.verify(token, SECRET) as { email: string; role: Role };
  } catch {
    return null;
  }
}
