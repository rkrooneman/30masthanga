/**
 * Deterministic, dependency-free test for the on-device entitlement module.
 *
 * Run with:  npx tsx src/lib/entitlement.test.ts
 *
 * No test framework, no deps. entitlement reads/writes `window.localStorage`, so
 * this file installs a minimal in-memory localStorage shim (assigned to both
 * globalThis.localStorage and a globalThis.window) BEFORE importing the module,
 * letting the pure logic run under node/tsx with no Play APIs present (the whole
 * point of keeping entitlement decoupled from billing). A separate throwing shim
 * verifies graceful degradation. Prints which assertion failed and exits
 * non-zero on any failure; on success prints "ALL ENTITLEMENT TESTS PASSED" and
 * the assertion count.
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
// entitlement reads `window.localStorage`, so expose it on a global `window`
// (and on globalThis directly for good measure). The `window` object is MUTATED
// in place below (its `localStorage` swapped) so the already-imported module
// keeps reading the live reference.
const g = globalThis as unknown as {
  localStorage: MemoryStorage | ThrowingStorage;
  window: { localStorage: MemoryStorage | ThrowingStorage };
};
g.localStorage = memory;
g.window = { localStorage: memory };

const { loadEntitlement, saveEntitlement, isUnlocked } = await import(
  './entitlement'
);

// --- minimal assertion helper -------------------------------------------------
let assertionCount = 0;
const failures: string[] = [];

function check(condition: boolean, message: string): void {
  assertionCount++;
  if (!condition) {
    failures.push(message);
  }
}

/** Reset to a clean in-memory store between blocks. */
function reset(): void {
  memory.clear();
  g.window.localStorage = memory;
}

// ---------------------------------------------------------------------------
// 1. Default is LOCKED: a fresh store (nothing saved) reads false, and
//    isUnlocked agrees with loadEntitlement.
// ---------------------------------------------------------------------------
{
  reset();
  check(
    loadEntitlement() === false,
    `default: loadEntitlement must be false when nothing is stored`,
  );
  check(
    isUnlocked() === false,
    `default: isUnlocked must be false when nothing is stored`,
  );
}

// ---------------------------------------------------------------------------
// 2. Save true then load round-trips to true (and isUnlocked agrees).
// ---------------------------------------------------------------------------
{
  reset();
  saveEntitlement(true);
  check(
    loadEntitlement() === true,
    `round-trip: after saveEntitlement(true), loadEntitlement must be true`,
  );
  check(
    isUnlocked() === true,
    `round-trip: after saveEntitlement(true), isUnlocked must be true`,
  );
}

// ---------------------------------------------------------------------------
// 3. Save false then load round-trips back to false (explicit re-lock).
// ---------------------------------------------------------------------------
{
  reset();
  saveEntitlement(true);
  saveEntitlement(false);
  check(
    loadEntitlement() === false,
    `round-trip: after saveEntitlement(false), loadEntitlement must be false`,
  );
}

// ---------------------------------------------------------------------------
// 4. Only an explicit "1" unlocks: any other stored raw value reads as locked.
// ---------------------------------------------------------------------------
{
  reset();
  memory.setItem('ashtanga30.unlocked', '1');
  check(loadEntitlement() === true, `raw: stored "1" must read as unlocked`);
  memory.setItem('ashtanga30.unlocked', '0');
  check(loadEntitlement() === false, `raw: stored "0" must read as locked`);
  memory.setItem('ashtanga30.unlocked', 'true');
  check(
    loadEntitlement() === false,
    `raw: a non-"1" value ("true") must read as locked`,
  );
}

// ---------------------------------------------------------------------------
// 5. Graceful on storage failure: when localStorage throws, loadEntitlement
//    returns the locked default and saveEntitlement is a silent no-op (does not
//    throw).
// ---------------------------------------------------------------------------
{
  reset();
  g.window.localStorage = new ThrowingStorage();
  check(
    loadEntitlement() === false,
    `throwing: loadEntitlement must return false (locked) when storage throws`,
  );
  let threw = false;
  try {
    saveEntitlement(true);
  } catch {
    threw = true;
  }
  check(
    threw === false,
    `throwing: saveEntitlement must not throw when storage throws`,
  );
  check(
    isUnlocked() === false,
    `throwing: isUnlocked must return false (locked) when storage throws`,
  );
}

// --- report -------------------------------------------------------------------
if (failures.length > 0) {
  console.error(`\n=== ENTITLEMENT TESTS FAILED (${failures.length}) ===`);
  for (const f of failures) console.error(`  \u2717 ${f}`);
  console.error(`\n(${assertionCount} assertions run)`);
  process.exit(1);
}

console.log('ALL ENTITLEMENT TESTS PASSED');
console.log(`${assertionCount} assertions run.`);
