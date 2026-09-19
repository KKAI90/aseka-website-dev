import { redirect } from "next/navigation";

// Bare /admin isn't in any role's ALLOWED_PATHS (see src/lib/roles.ts), so
// admin/layout.tsx already redirects real users away from here before this
// would ever render. This route used to hold a leftover prototype page —
// hardcoded fake candidates, a CV-upload handler that posted to a different
// contract than /api/admin/analyze-cv actually expects, and a "save" button
// that only ever touched local React state and never persisted anything.
// None of that was reachable, but keep the route itself alive (avoid a 404)
// by sending anyone who lands here straight to the real dashboard.
export default function AdminRoot() {
  redirect("/admin/dashboard");
}
