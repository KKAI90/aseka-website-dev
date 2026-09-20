/** @type {import('next').NextConfig} */
const nextConfig = {
  serverRuntimeConfig: {
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    JWT_SECRET:   process.env.JWT_SECRET,
  },
  // No response headers were configured at all — admin and mypage carry real candidate PII
  // (visa status, DOB, contact info) and deep-link URLs that embed candidate/job IDs in
  // query strings (e.g. /admin/jobs?id=...&forCandidate=...), so a missing Referrer-Policy
  // would leak those IDs to any third-party link an admin clicks from that page. Kept to the
  // safe, behavior-neutral headers only — a real Content-Security-Policy would need careful
  // testing against this app's extensive inline `style={{}}` usage before shipping, so it's
  // deliberately left as a follow-up rather than risking breakage right before a prod push.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Blocks this site from being embedded in an <iframe> elsewhere — closes
          // clickjacking on the login/registration forms.
          { key: "X-Frame-Options", value: "DENY" },
          // Stops browsers from MIME-sniffing a response into executing as something other
          // than its declared Content-Type.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Sends the full URL as a Referer only to same-origin requests; cross-origin gets
          // just the origin, so candidate/job IDs in query strings never leak off-site.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};
module.exports = nextConfig;
