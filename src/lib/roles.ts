export type Role = "superadmin" | "admin";

/** Email → role mapping (source of truth) */
export const ROLE_MAP: Record<string, Role> = {
  "leminhkien.jpy@gmail.com": "superadmin",
  "asekathao@gmail.com": "admin",
};

/** Paths each role is allowed to visit */
export const ALLOWED_PATHS: Record<Role, string[]> = {
  superadmin: [
    "/admin/dashboard",
    "/admin/jobs",
    "/admin/candidates",
    "/admin/messages",
    "/admin/settings",
  ],
  admin: ["/admin/messages"],
};

export function getRoleFromEmail(email: string): Role {
  return ROLE_MAP[email] ?? "admin";
}

export function canAccess(role: Role, pathname: string): boolean {
  return ALLOWED_PATHS[role].some(p => pathname.startsWith(p));
}
