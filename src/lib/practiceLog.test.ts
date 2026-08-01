/**
 * Deterministic, dependency-free test for the practice-log module.
 *
 * Run with:  npx tsx src/lib/practiceLog.test.ts
 *
 * No test framework, no deps. practiceLog persists to `window.localStorage`, so
 * this file installs a minimal in-memory localStorage shim (assigned to both
 * globalThis.localStorage and a globalThis.window) before importing the module,
 * letting the pure logic run under node/tsx. Each block resets the shim so tests
 * are independent. Prints which assertion failed and exits non-zero on any
 * failure; on success prints "ALL PRACTICE LOG TESTS PASSED" and the count.
 */

// --- minimal in-memory localStorage shim (installed BEFORE importing) ---------
class MemoryStorage {
  private store = new Map<string, string>();
  getItem(key: string): string | null {
    return this.store.has(key) ? (this.store.get(key) as string) : null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
  }
}

const memory = new MemoryStorage();
// practiceLog reads `window.localStorage`, so expose it on a global `window`
// (and on globalThis directly for good measure).
const g = globalThis as unknown as {
  localStorage: MemoryStorage;
  window: { localStorage: MemoryStorage };
};
g.localStorage = memory;
g.window = { localStorage: memory };

const {
  todayKey,
  recordPractice,
  loadPracticedDays,
  getLastNDays,
  seedFakePractice,
} = await import('./practiceLog');

// --- minimal assertion helper -------------------------------------------------
let assertionCount = 0;
const failures: string[] = [];

function check(condition: boolean, message: string): void {
  assertionCount++;
  if (!condition) {
    failures.push(message);
  }
}

/** Clear stored state so each block starts from an empty log. */
function reset(): void {
  memory.clear();
}

// ---------------------------------------------------------------------------
// 1. todayKey formats a LOCAL YYYY-MM-DD with zero-padding for a fixed date.
//    March 2 2025 -> "2025-03-02" (month padded from 3, day padded from 2).
// ---------------------------------------------------------------------------
{
  reset();
  // Local Date constructor (year, monthIndex, day) — Jan is 0, so 2 == March.
  const fixed = new Date(2025, 2, 2, 9, 30, 0);
  check(
    todayKey(fixed) === '2025-03-02',
    `todayKey: expected "2025-03-02", got "${todayKey(fixed)}"`,
  );
  // A single-digit month AND day both pad: Jan 5 2025 -> "2025-01-05".
  const early = new Date(2025, 0, 5);
  check(
    todayKey(early) === '2025-01-05',
    `todayKey: expected "2025-01-05", got "${todayKey(early)}"`,
  );
}

// ---------------------------------------------------------------------------
// 2. getLastNDays(7, fixedNow) — 7 entries, chronological, last === today,
//    correct isToday flags, correct keys ACROSS a month boundary. Pick
//    now = 2025-03-02 so the 7-day window is Feb 24 .. Mar 2.
// ---------------------------------------------------------------------------
{
  reset();
  const now = new Date(2025, 2, 2, 12, 0, 0); // 2 March 2025
  const days = getLastNDays(7, now);

  check(days.length === 7, `getLastNDays: expected 7 entries, got ${days.length}`);

  const expectedKeys = [
    '2025-02-24',
    '2025-02-25',
    '2025-02-26',
    '2025-02-27',
    '2025-02-28',
    '2025-03-01',
    '2025-03-02',
  ];
  check(
    days.map((d) => d.key).join(',') === expectedKeys.join(','),
    `getLastNDays: keys must cross the Feb/Mar boundary in order, ` +
      `expected [${expectedKeys.join(', ')}], got [${days.map((d) => d.key).join(', ')}]`,
  );

  check(
    days[6].key === todayKey(now),
    `getLastNDays: last entry must be today (${todayKey(now)}), got ${days[6].key}`,
  );
  check(days[6].isToday === true, `getLastNDays: last entry isToday must be true`);
  check(
    days.slice(0, 6).every((d) => d.isToday === false),
    `getLastNDays: only the last entry may be flagged isToday`,
  );
  // Dates should line up with their keys (local).
  check(
    days.every((d) => todayKey(d.date) === d.key),
    `getLastNDays: each entry.date must match its key`,
  );
  // Nothing recorded yet -> all not practiced.
  check(
    days.every((d) => d.practiced === false),
    `getLastNDays: with an empty log, no day may be practiced`,
  );
}

// ---------------------------------------------------------------------------
// 3. recordPractice dedups (recording twice == one entry) and marks the right
//    day practiced in getLastNDays.
// ---------------------------------------------------------------------------
{
  reset();
  const now = new Date(2025, 2, 2, 20, 0, 0); // 2 March 2025, evening
  recordPractice(now);
  recordPractice(now); // second call must be a no-op

  const set = loadPracticedDays();
  check(set.size === 1, `recordPractice: dedup — expected 1 stored day, got ${set.size}`);
  check(
    set.has('2025-03-02'),
    `recordPractice: expected the log to contain "2025-03-02"`,
  );

  const days = getLastNDays(7, now);
  const today = days[6];
  check(today.practiced === true, `recordPractice: today must read as practiced`);
  check(
    days.slice(0, 6).every((d) => d.practiced === false),
    `recordPractice: only today should be practiced after recording today once`,
  );
}

// ---------------------------------------------------------------------------
// 4. practiced flags line up: after recording today AND (today - 2), exactly
//    those two entries are practiced and the rest are not.
// ---------------------------------------------------------------------------
{
  reset();
  const now = new Date(2025, 2, 2, 8, 0, 0); // 2 March 2025
  recordPractice(now); // today = 2025-03-02
  const twoDaysAgo = new Date(2025, 2, 0, 8, 0, 0); // March 0 == Feb 28 2025
  recordPractice(twoDaysAgo); // 2025-02-28

  const days = getLastNDays(7, now);
  const practicedKeys = days.filter((d) => d.practiced).map((d) => d.key);
  check(
    practicedKeys.join(',') === ['2025-02-28', '2025-03-02'].join(','),
    `flags: exactly today and today-2 should be practiced, got [${practicedKeys.join(', ')}]`,
  );
  // Positionally: index 6 (today) and index 4 (today - 2) are practiced.
  check(
    days[6].practiced === true && days[4].practiced === true,
    `flags: today (index 6) and today-2 (index 4) must be practiced`,
  );
  check(
    [0, 1, 2, 3, 5].every((i) => days[i].practiced === false),
    `flags: all other days must be not practiced`,
  );
}

// ---------------------------------------------------------------------------
// 5. seedFakePractice([0, 1, 3]) marks exactly those three days (today,
//    yesterday, three days ago) and nothing else.
// ---------------------------------------------------------------------------
{
  reset();
  const now = new Date(2025, 2, 10, 8, 0, 0); // 10 March 2025
  seedFakePractice([0, 1, 3], now);

  const set = loadPracticedDays();
  check(set.size === 3, `seed: expected exactly 3 seeded days, got ${set.size}`);
  const expected = ['2025-03-10', '2025-03-09', '2025-03-07']; // 0,1,3 days back
  check(
    expected.every((k) => set.has(k)),
    `seed: expected days [${expected.join(', ')}] to be present, got [${[...set].join(', ')}]`,
  );

  const days = getLastNDays(7, now);
  const practicedKeys = days
    .filter((d) => d.practiced)
    .map((d) => d.key)
    .sort();
  check(
    practicedKeys.join(',') === [...expected].sort().join(','),
    `seed: getLastNDays practiced flags must match the seeded days, got [${practicedKeys.join(', ')}]`,
  );
}

// --- report -------------------------------------------------------------------
if (failures.length > 0) {
  console.error(`\n=== PRACTICE LOG TESTS FAILED (${failures.length}) ===`);
  for (const f of failures) console.error(`  \u2717 ${f}`);
  console.error(`\n(${assertionCount} assertions run)`);
  process.exit(1);
}

console.log('ALL PRACTICE LOG TESTS PASSED');
console.log(`${assertionCount} assertions run.`);
