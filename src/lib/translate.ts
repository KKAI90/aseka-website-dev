import https from "node:https";

// Free machine translation for job-listing content (job_description, requirements, etc.)
// via MyMemory (api.mymemory.translated.net) — no API key, no per-request cost. Chosen over
// an LLM (Groq, already used elsewhere in this app) specifically because the user wanted a
// genuinely $0 option, not just a cheap one.
//
// Translation runs ONCE per job — triggered when admin creates/updates a listing (see
// src/app/api/admin/jobs/route.ts) — and the result is cached in job_listings.translations.
// Candidates on mypage never trigger a live translation call; they only ever read the
// cached result, falling back to the original Japanese if it's missing (MyMemory failed, or
// this job predates the feature and hasn't been backfilled yet).

const MYMEMORY_ENDPOINT = "https://api.mymemory.translated.net/get";
// MyMemory's anonymous daily quota is 5,000 words; including a real contact email in `de=`
// raises it to 10,000/day per MyMemory's own documented policy, with no signup required.
const CONTACT_EMAIL = "contact@aseka.jp";
// Anonymous requests are capped around 500 characters per call — chunk longer text on
// sentence-ish boundaries (Japanese full-width period/comma, or plain punctuation) and
// translate each piece separately, then rejoin.
const MAX_CHUNK = 450;

export type TranslateLang = "en" | "vi";
export type TranslatableFields = Record<string, string | null | undefined>;
export type Translations = Partial<Record<TranslateLang, Record<string, string>>>;

function chunkText(text: string): string[] {
  if (text.length <= MAX_CHUNK) return [text];
  const parts = text.split(/(?<=[。、\n.!?])/);
  const chunks: string[] = [];
  let cur = "";
  for (const p of parts) {
    if ((cur + p).length > MAX_CHUNK) {
      if (cur) chunks.push(cur);
      cur = p.length > MAX_CHUNK ? p.slice(0, MAX_CHUNK) : p;
    } else {
      cur += p;
    }
  }
  if (cur) chunks.push(cur);
  return chunks;
}

// Uses Node's built-in https module rather than global fetch(): this runs fire-and-forget
// AFTER an API route has already sent its response (see translateInBackground in
// src/app/api/admin/jobs/route.ts), and Next.js patches globalThis.fetch for its Data Cache
// in a way that's tied to the request's own lifecycle — https.get has no such dependency,
// so translation work started after the response is sent isn't relying on undocumented
// behavior of code that's no longer "inside" a request.
async function translateOnce(text: string, target: TranslateLang): Promise<string | null> {
  return new Promise(resolve => {
    const url = `${MYMEMORY_ENDPOINT}?q=${encodeURIComponent(text)}&langpair=ja|${target}&de=${encodeURIComponent(CONTACT_EMAIL)}`;
    const req = https.get(url, { timeout: 10000 }, res => {
      if (res.statusCode !== 200) {
        console.error(`translateOnce: HTTP ${res.statusCode} for "${text.slice(0,30)}..."`);
        res.resume();
        resolve(null);
        return;
      }
      let body = "";
      res.on("data", chunk => { body += chunk; });
      res.on("end", () => {
        try {
          const data = JSON.parse(body);
          const translated = data?.responseData?.translatedText;
          // MyMemory echoes an error string as "translatedText" with a low match score
          // instead of a non-2xx status when the quota is exceeded — treat a very low
          // quality score as failure rather than caching garbage.
          if (!translated || (typeof data?.responseData?.match === "number" && data.responseData.match < 0.3)) {
            console.error(`translateOnce: low/no match for "${text.slice(0,30)}...":`, body.slice(0,200));
            resolve(null);
            return;
          }
          resolve(translated);
        } catch (e) {
          console.error(`translateOnce: JSON parse failed for "${text.slice(0,30)}...":`, e);
          resolve(null);
        }
      });
    });
    req.on("timeout", () => { console.error(`translateOnce: timed out for "${text.slice(0,30)}..."`); req.destroy(); resolve(null); });
    req.on("error", e => { console.error(`translateOnce: request errored for "${text.slice(0,30)}...":`, e); resolve(null); });
  });
}

async function translateField(text: string, target: TranslateLang): Promise<string | null> {
  const chunks = chunkText(text);
  const results: string[] = [];
  for (const chunk of chunks) {
    const t = await translateOnce(chunk, target);
    if (t === null) return null; // partial translation would read worse than none — skip the whole field
    results.push(t);
    // Be a polite anonymous client — MyMemory has no official rate-limit-per-second doc, but
    // spacing requests avoids bursts that are more likely to get throttled.
    await new Promise(r => setTimeout(r, 150));
  }
  return results.join(" ");
}

/** Translates every non-empty field in `fields` into both en/vi, returning only the
 *  languages/fields that actually succeeded — a partial result (some fields missing) is
 *  expected and fine, since mypage falls back to Japanese per-field, not per-job. */
export async function translateJobFields(fields: TranslatableFields): Promise<Translations> {
  const out: Translations = { en: {}, vi: {} };
  const entries = Object.entries(fields).filter(([, v]) => v && v.trim());

  for (const [key, value] of entries) {
    for (const target of ["en", "vi"] as const) {
      const translated = await translateField(value as string, target);
      if (translated) out[target]![key] = translated;
    }
  }
  // Drop languages that ended up empty (every field failed) instead of caching {}
  if (out.en && Object.keys(out.en).length === 0) delete out.en;
  if (out.vi && Object.keys(out.vi).length === 0) delete out.vi;
  return out;
}
