import { NextRequest, NextResponse } from "next/server";

// In-memory, per-process rate limiter. This app was found to have ZERO rate limiting
// anywhere (admin login, mypage login, or the public dang-ky submission endpoint) during a
// pre-production security pass — this closes that gap without adding new infrastructure
// (Redis, Nginx config) this session has no access to change.
//
// Safe specifically because deploy-aws-dev.yml runs a single PM2 process in fork mode
// (`pm2 start npm --name aseka-dev -- start`, no `-i`/cluster flag) — one Node process
// means one shared Map, so counts are accurate. This would silently under-count (each
// process tracking its own separate state) if the app ever moves to PM2 cluster mode or
// multiple instances — a Redis-backed limiter would be needed at that point instead.
// Counts also reset on every deploy/restart, which is an acceptable tradeoff for how cheap
// this is to add versus standing up external infra.
const buckets = new Map<string, { count: number; resetAt: number }>();

// Sweep expired buckets occasionally so this Map doesn't grow unbounded over a long-running
// process — triggered opportunistically on calls rather than a setInterval, so it costs
// nothing when the app is idle.
let lastSweep = 0;
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  Array.from(buckets.entries()).forEach(([key, b]) => { if (b.resetAt <= now) buckets.delete(key); });
}

function clientIp(req: NextRequest): string {
  // Behind Nginx — the real client IP is the first entry in X-Forwarded-For, not
  // req.ip (which would just be the Nginx proxy's own loopback address).
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

/**
 * Returns null if the request is within its limit (caller proceeds normally), or a 429
 * NextResponse to return immediately if the limit has been exceeded.
 * @param scope a short key namespacing this limiter from others (e.g. "admin-login") so
 *   the same IP gets independent budgets per endpoint rather than sharing one global count.
 */
export function rateLimit(req: NextRequest, scope: string, opts: { max: number; windowMs: number }): NextResponse | null {
  const now = Date.now();
  sweep(now);

  const key = `${scope}:${clientIp(req)}`;
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    return null;
  }

  bucket.count += 1;
  if (bucket.count > opts.max) {
    const retryAfterSec = Math.ceil((bucket.resetAt - now) / 1000);
    return NextResponse.json(
      { error: `リクエストが多すぎます。しばらくしてから再度お試しください / Quá nhiều yêu cầu, vui lòng thử lại sau ${retryAfterSec}s` },
      { status: 429, headers: { "Retry-After": String(retryAfterSec) } }
    );
  }
  return null;
}
