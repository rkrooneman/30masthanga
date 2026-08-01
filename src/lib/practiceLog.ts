/**
 * practiceLog — tiny, safe on-device log of days a practice was COMPLETED.
 *
 * Powers the calm "last 7 days" row on Home: NOT a streak counter, just a quiet
 * record of which days a practice was finished. Days are stored as LOCAL calendar
 * dates in `YYYY-MM-DD` form (derived from a Date's local getFullYear/getMonth/
 * getDate, zero-padded) — never UTC — so a late-evening practice counts for the
 * day the practitioner actually experienced, regardless of timezone.
 *
 * Persistence is a JSON array of unique date strings under a single key. All
 * access is wrapped in try/catch, mirroring preferences.ts: localStorage can
 * throw (private mode, disabled storage, quota), and this feature must degrade
 * gracefully to an empty log rather than crash the app.
 */

const PRACTICE_LOG_KEY = 'ashtanga30.practiceLog';

/** Single-letter weekday labels, Sunday-first to match Date.getDay() (0..6). */
const WEEKDAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

/** Two-digit zero-pad for month/day components. */
function pad2(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

/**
 * The LOCAL `YYYY-MM-DD` key for a given date (defaults to now). Derived from the
 * local calendar fields (not UTC / not toISOString) so the day boundary matches
 * the practitioner's wall clock. `now` is injectable for testing.
 */
export function todayKey(now: Date = new Date()): string {
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

/**
 * The set of recorded date keys (empty set on any storage failure or if nothing
 * has been stored). Ignores malformed persisted data defensively.
 */
export function loadPracticedDays(): Set<string> {
  try {
    const raw = window.localStorage.getItem(PRACTICE_LOG_KEY);
    if (raw === null) return new Set();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    // Keep only well-formed string entries; drop anything unexpected.
    return new Set(parsed.filter((item): item is string => typeof item === 'string'));
  } catch {
    return new Set();
  }
}

/**
 * Persist a set of date keys as a JSON array. Best-effort: silently no-ops if
 * storage is unavailable, matching the preferences.ts convention.
 */
function savePracticedDays(days: Set<string>): void {
  try {
    window.localStorage.setItem(PRACTICE_LOG_KEY, JSON.stringify([...days]));
  } catch {
    /* storage unavailable — ignore, the record simply won't persist */
  }
}

/**
 * Record that a practice was completed today (defaults to now). Deduplicates —
 * recording an already-present day is a no-op. Best-effort; injectable `now` for
 * testing.
 */
export function recordPractice(now: Date = new Date()): void {
  const key = todayKey(now);
  const days = loadPracticedDays();
  if (days.has(key)) return; // already recorded today — nothing to do
  days.add(key);
  savePracticedDays(days);
}

/** One trailing-7-days entry. */
export interface DayEntry {
  /** The entry's local `YYYY-MM-DD` key. */
  key: string;
  /** The entry's date (local midnight of that day). */
  date: Date;
  /** Whether a practice was recorded on this day. */
  practiced: boolean;
  /** Whether this entry is today. */
  isToday: boolean;
}

/**
 * The last `n` days in CHRONOLOGICAL order ENDING WITH TODAY, so index `n - 1` is
 * today (today is rightmost). Each entry carries its local date key, a Date, the
 * practiced flag, and whether it is today. The practiced set is read ONCE.
 * Injectable `now` for testing.
 */
export function getLastNDays(n: number, now: Date = new Date()): DayEntry[] {
  const practiced = loadPracticedDays();
  const todayIso = todayKey(now);
  const entries: DayEntry[] = [];

  // Walk from (n - 1) days ago up to today so the array is chronological and ends
  // on today. Build each day from the local calendar fields of `now` to stay on
  // local dates across month/year boundaries (Date normalises overflow).
  for (let offset = n - 1; offset >= 0; offset--) {
    const date = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - offset,
    );
    const key = todayKey(date);
    entries.push({
      key,
      date,
      practiced: practiced.has(key),
      isToday: key === todayIso,
    });
  }

  return entries;
}

/**
 * Single-letter weekday for a date (e.g. 'M','T','W','T','F','S','S'), from the
 * LOCAL day-of-week. A small helper the week component can use for its labels.
 */
export function weekdayLetter(date: Date): string {
  return WEEKDAY_LETTERS[date.getDay()];
}

/**
 * DEV-ONLY test seed: record practice on today minus each offset in `dayOffsets`
 * (e.g. `[0, 1, 3]` = today, yesterday, and three days ago). Used by the
 * `?seedweek` dev hatch to preview filled petals without practicing for real.
 * Deduplicates via the practiced set; best-effort. This module intentionally does
 * NOT gate on the environment — callers must guard (the App hatch is DEV-only).
 * Injectable `now` for testing.
 */
export function seedFakePractice(dayOffsets: number[], now: Date = new Date()): void {
  const days = loadPracticedDays();
  for (const offset of dayOffsets) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
    days.add(todayKey(date));
  }
  savePracticedDays(days);
}
