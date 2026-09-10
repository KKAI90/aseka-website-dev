// Shared work-experience calculator — used by both the Candidates admin UI
// (to show "N年Mヶ月の経験" next to 職歴) and the AI matching route (to feed
// real computed experience instead of a raw work_history.length count).

export type WorkEntry = { year?: string | null; month?: string | null; event?: string | null };

function toMonthIndex(year?: string | null, month?: string | null): number | null {
  const yr = parseInt(String(year ?? ""), 10);
  if (!yr) return null;
  const mo = parseInt(String(month ?? ""), 10) || 1;
  return yr * 12 + (mo - 1);
}

/**
 * Sums 入社→退社 (or still-ongoing) periods from a work_history timeline into
 * total months of experience. Entries with neither a join nor leave marker in
 * `event` are ignored for the duration math (still shown as-is in the raw list).
 */
export function calcExperienceMonths(workHistory: WorkEntry[] | null | undefined): number {
  if (!workHistory || workHistory.length === 0) return 0;
  const now = new Date();
  const nowIdx = now.getFullYear() * 12 + now.getMonth();

  const sorted = workHistory
    .map(w => ({ idx: toMonthIndex(w.year, w.month), event: w.event || "" }))
    .filter((w): w is { idx: number; event: string } => w.idx !== null)
    .sort((a, b) => a.idx - b.idx);

  let totalMonths = 0;
  let openStart: number | null = null;
  for (const w of sorted) {
    const isStart = w.event.includes("入");
    const isEnd = w.event.includes("退");
    if (isStart) {
      if (openStart === null) openStart = w.idx;
    } else if (isEnd) {
      if (openStart !== null) {
        totalMonths += Math.max(0, w.idx - openStart);
        openStart = null;
      }
    }
  }
  if (openStart !== null) totalMonths += Math.max(0, nowIdx - openStart);
  return totalMonths;
}

export function formatExperienceJa(totalMonths: number): string | null {
  if (totalMonths <= 0) return null;
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (years === 0) return `${months}ヶ月`;
  if (months === 0) return `${years}年`;
  return `${years}年${months}ヶ月`;
}

export function formatExperienceVn(totalMonths: number): string | null {
  if (totalMonths <= 0) return null;
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (years === 0) return `${months} tháng`;
  if (months === 0) return `${years} năm`;
  return `${years} năm ${months} tháng`;
}
