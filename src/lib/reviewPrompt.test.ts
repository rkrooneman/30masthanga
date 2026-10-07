/**
 * Deterministic, dependency-free test for the on-device reviewPrompt module.
 *
 * Run with:  npx tsx src/lib/reviewPrompt.test.ts
 *
 * No test framework, no deps. reviewPrompt reads/writes `window.localStorage`
 * and feature-detects `window.requestReview`, so this file installs a minimal
 * in-memory localStorage shim and a swappable `window` (assigned to both
 * globalThis.localStorage and globalThis.window) BEFORE importing the module.
 * A separate throwing shim verifies graceful degradation on storage failure.
 * Prints which assertion failed and exits non-zero on any failure; on success
 * prints "ALL REVIEW PROMPT TESTS PASSED" and the assertion count.
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

/**
 * A storage shim whose every access throws, to exercise the try/catch graceful
 * fallbacks (private mode / disabled storage / quota). Mirrors the same minimal
 * surface as MemoryStorage.
 */
class ThrowingStorage {
  getItem(): string | null {
    throw new Error('storage unavailable');
  }
  setItem(): void {
    throw new Error('storage unavailable');
  }
  removeItem(): void {
    throw new Error('storage unavailable');
  }
  clear(): void {
    throw new Error('storage unavailable');
  }
}

const memory = new MemoryStorage();

// reviewPrompt reads `window.localStorage` and `window.requestReview`, so
// expose both on a global `window`. The `window` object is MUTATED in place
// below so the already-imported module keeps reading the live references.
const g = globalThis as unknown as {
  localStorage: MemoryStorage | ThrowingStorage;
  window: {
    localStorage: MemoryStorage | ThrowingStorage;
    requestReview?: () => Promise<void>;
  };
};
g.localStorage = memory;
g.window = { localStorage: memory };

const { hasReviewBeenRequested, markReviewRequested, requestReviewIfEligible } =
  await import('./reviewPrompt');

// --- minimal assertion helper -------------------------------------------------
let assertionCount = 0;
const failures: string[] = [];

function check(condition: boolean, message: string): void {
  assertionCount++;
  if (!condition) {
    failures.push(message);
  }
}

/** Reset to a clean in-memory store and a plain window (no requestReview). */
function reset(): void {
  memory.clear();
  g.window = { localStorage: memory };
}

// ---------------------------------------------------------------------------
// 1. Default is NOT requested: a fresh store returns false; true after mark.
// ---------------------------------------------------------------------------
{
  reset();
  check(
    hasReviewBeenRequested() === false,
    'default: hasReviewBeenRequested must be false when nothing is stored',
  );
  markReviewRequested();
  check(
    hasReviewBeenRequested() === true,
    'after mark: hasReviewBeenRequested must be true after markReviewRequested',
  );
}

// ---------------------------------------------------------------------------
// 2. requestReviewIfEligible with count < 5 does nothing and does NOT mark.
// ---------------------------------------------------------------------------
{
  reset();
  await requestReviewIfEligible(0);
  check(
    hasReviewBeenRequested() === false,
    'count 0: must not mark when count < 5',
  );
  await requestReviewIfEligible(4);
  check(
    hasReviewBeenRequested() === false,
    'count 4: must not mark when count < 5',
  );
}

// ---------------------------------------------------------------------------
// 3. requestReviewIfEligible with count >= 5 marks the flag.
// ---------------------------------------------------------------------------
{
  reset();
  await requestReviewIfEligible(5);
  check(
    hasReviewBeenRequested() === true,
    'count 5: must mark the flag after triggering',
  );
}

// ---------------------------------------------------------------------------
// 4. requestReviewIfEligible with count >= 5 but already marked does NOT call
//    requestReview again.
// ---------------------------------------------------------------------------
{
  reset();
  let callCount = 0;
  g.window.requestReview = async () => {
    callCount++;
  };
  markReviewRequested();
  await requestReviewIfEligible(10);
  check(
    callCount === 0,
    'already marked: must not call requestReview when flag is already set',
  );
}

// ---------------------------------------------------------------------------
// 5. requestReviewIfEligible calls window.requestReview when available.
// ---------------------------------------------------------------------------
{
  reset();
  let callCount = 0;
  g.window.requestReview = async () => {
    callCount++;
  };
  await requestReviewIfEligible(5);
  check(
    callCount === 1,
    'TWA: must call window.requestReview once when it is available',
  );
  // Calling again must NOT re-invoke (already marked).
  await requestReviewIfEligible(5);
  check(
    callCount === 1,
    'TWA second call: must not call requestReview again when already marked',
  );
}

// ---------------------------------------------------------------------------
// 6. Graceful when window.requestReview throws: must not propagate.
// ---------------------------------------------------------------------------
{
  reset();
  g.window.requestReview = async () => {
    throw new Error('Play API unavailable');
  };
  let threw = false;
  try {
    await requestReviewIfEligible(5);
  } catch {
    threw = true;
  }
  check(
    threw === false,
    'throwing requestReview: requestReviewIfEligible must not throw',
  );
  check(
    hasReviewBeenRequested() === true,
    'throwing requestReview: flag must still be marked even when the API throws',
  );
}

// ---------------------------------------------------------------------------
// 7. Graceful when localStorage throws: hasReviewBeenRequested returns false,
//    markReviewRequested does not throw, requestReviewIfEligible does not throw.
// ---------------------------------------------------------------------------
{
  reset();
  g.window.localStorage = new ThrowingStorage();
  check(
    hasReviewBeenRequested() === false,
    'throwing storage: hasReviewBeenRequested must return false',
  );
  let threw = false;
  try {
    markReviewRequested();
  } catch {
    threw = true;
  }
  check(
    threw === false,
    'throwing storage: markReviewRequested must not throw',
  );
  let threw2 = false;
  try {
    await requestReviewIfEligible(5);
  } catch {
    threw2 = true;
  }
  check(
    threw2 === false,
    'throwing storage: requestReviewIfEligible must not throw',
  );
}

// --- report -------------------------------------------------------------------
if (failures.length > 0) {
  console.error(`\n=== REVIEW PROMPT TESTS FAILED (${failures.length}) ===`);
  for (const f of failures) console.error(`  \u2717 ${f}`);
  console.error(`\n(${assertionCount} assertions run)`);
  process.exit(1);
}

console.log('ALL REVIEW PROMPT TESTS PASSED');
console.log(`${assertionCount} assertions run.`);
