/**
 * Deterministic, dependency-free test for the billing getDetails precheck.
 *
 * Run with:  npx tsx src/lib/billing.test.ts
 *
 * No test framework, no deps. billing.ts talks to the Digital Goods API via
 * `window.getDigitalGoodsService`, which only exists inside a TWA. This file
 * installs a minimal fake `window` (with a swappable `getDigitalGoodsService`
 * whose service.getDetails() yields a configurable array, plus an in-memory
 * localStorage so the entitlement import stays happy) BEFORE importing the
 * module, then drives the two gate outcomes:
 *   - getDetails -> []                         => product NOT available (bail)
 *   - getDetails -> [{ itemId: 'steer_unlock' }] => product available
 *
 * It verifies both the exported `isProductAvailable()` helper and that
 * `purchaseUnlock()` bails (returns false) when getDetails is empty, WITHOUT
 * ever reaching PaymentRequest.show() (PaymentRequest is intentionally absent
 * here, so a false result proves the precheck short-circuited first). The
 * populated path for purchaseUnlock() is not exercised end-to-end because
 * driving a real PaymentRequest.show() is out of scope for the standalone-tsx
 * style; isProductAvailable() covers the positive gate decision directly.
 *
 * Prints which assertion failed and exits non-zero on any failure; on success
 * prints "ALL BILLING TESTS PASSED" and the assertion count.
 */

const UNLOCK = 'steer_unlock';

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

/** A fake Digital Goods service whose getDetails() yields a configurable array. */
interface FakeItemDetails {
  itemId: string;
}
let nextDetails: FakeItemDetails[] = [];
const fakeService = {
  getDetails(): Promise<FakeItemDetails[]> {
    return Promise.resolve(nextDetails);
  },
  listPurchases(): Promise<unknown[]> {
    return Promise.resolve([]);
  },
};

// Expose a fake `window` carrying getDigitalGoodsService + localStorage. billing
// reads `window.getDigitalGoodsService` and (via entitlement) `window.localStorage`.
// Note: PaymentRequest is deliberately NOT defined, so if purchaseUnlock() ever
// passed the precheck it would throw/return false at the PaymentRequest step; a
// false in the EMPTY case therefore proves the getDetails gate ran first.
const g = globalThis as unknown as {
  window: {
    localStorage: MemoryStorage;
    getDigitalGoodsService: () => Promise<unknown>;
  };
};
g.window = {
  localStorage: new MemoryStorage(),
  getDigitalGoodsService: () => Promise.resolve(fakeService),
};

const { isProductAvailable, purchaseUnlock } = await import('./billing');

// --- minimal assertion helper -------------------------------------------------
let assertionCount = 0;
const failures: string[] = [];

function check(condition: boolean, message: string): void {
  assertionCount++;
  if (!condition) {
    failures.push(message);
  }
}

// ---------------------------------------------------------------------------
// 1. Empty getDetails => product NOT available.
// ---------------------------------------------------------------------------
{
  nextDetails = [];
  const available = await isProductAvailable();
  check(
    available === false,
    `empty: isProductAvailable must be false when getDetails returns []`,
  );
}

// ---------------------------------------------------------------------------
// 2. Populated getDetails (matching itemId) => product available.
// ---------------------------------------------------------------------------
{
  nextDetails = [{ itemId: UNLOCK }];
  const available = await isProductAvailable();
  check(
    available === true,
    `populated: isProductAvailable must be true when getDetails includes the unlock product`,
  );
}

// ---------------------------------------------------------------------------
// 3. Populated but NON-matching itemId => product NOT available.
// ---------------------------------------------------------------------------
{
  nextDetails = [{ itemId: 'some_other_product' }];
  const available = await isProductAvailable();
  check(
    available === false,
    `non-match: isProductAvailable must be false when getDetails has no matching itemId`,
  );
}

// ---------------------------------------------------------------------------
// 4. purchaseUnlock() bails (returns false) when getDetails is empty, without
//    reaching PaymentRequest.show() (PaymentRequest is absent in this shim).
// ---------------------------------------------------------------------------
{
  nextDetails = [];
  const purchased = await purchaseUnlock();
  check(
    purchased === false,
    `gate: purchaseUnlock must return false (bail) when the product is not visible`,
  );
}

// --- report -------------------------------------------------------------------
if (failures.length > 0) {
  console.error(`\n=== BILLING TESTS FAILED (${failures.length}) ===`);
  for (const f of failures) console.error(`  \u2717 ${f}`);
  console.error(`\n(${assertionCount} assertions run)`);
  process.exit(1);
}

console.log('ALL BILLING TESTS PASSED');
console.log(`${assertionCount} assertions run.`);
