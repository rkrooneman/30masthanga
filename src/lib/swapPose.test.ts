/**
 * Deterministic, dependency-free test for the pose-swap engine.
 *
 * Run with:  npx tsx src/lib/swapPose.test.ts
 *
 * Uses a tiny seedable mulberry32 RNG (no test framework, no deps). Exercises
 * the swap rules against a generated practice and against hand-built edge cases:
 *   - swapping a selectable pose yields a same-category, not-already-present pose
 *   - the result stays within the target budget (hard ceiling)
 *   - the result is canonically ordered (strictly ascending by `order`)
 *   - swapping an alwaysInclude (fixed) pose returns null
 *   - when every same-category pose is already present, it returns null
 *   - hasSwapCandidate agrees with swapPose on enabled/disabled
 * Prints which assertion failed and exits non-zero on any failure; on success
 * prints "ALL SWAP TESTS PASSED" and the assertion count.
 */

import { poses } from '../data/poses';
import { generatePractice } from './generatePractice';
import { hasSwapCandidate, swapPose } from './swapPose';
import { TARGET_SECONDS, sequenceDurationSeconds } from './timing';

// --- tiny seedable RNG (mulberry32) ---
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- minimal assertion helper ---
let assertionCount = 0;
const failures: string[] = [];

function check(condition: boolean, message: string): void {
  assertionCount++;
  if (!condition) {
    failures.push(message);
  }
}

const FIXED_IDS = [
  'surya_namaskara_a',
  'surya_namaskara_b',
  'salamba_sarvangasana',
  'savasana',
];

const catalogById = new Map(poses.map((p) => [p.id, p]));

const BREATH_SECONDS = 5;

// ---------------------------------------------------------------------------
// 1. Swapping a selectable pose across many seeds: the swapped-in pose is
//    same-category, not previously present, the result is canonically ordered,
//    within budget, and preserves length and the fixed frame.
// ---------------------------------------------------------------------------
{
  for (let seed = 1; seed <= 30; seed++) {
    const practice = generatePractice(poses, {
      breathSeconds: BREATH_SECONDS,
      rng: mulberry32(seed),
    });
    const before = practice.poses;
    const beforeIds = new Set(before.map((p) => p.id));

    // Pick the first selectable (non-fixed) pose in the sequence to swap.
    const target = before.find((p) => p.selectable && !p.alwaysInclude);
    if (!target) {
      check(false, `seed=${seed}: expected at least one selectable pose`);
      continue;
    }

    const result = swapPose(before, BREATH_SECONDS, target.id, {
      rng: mulberry32(seed + 1000),
    });

    // If a candidate exists at all, the swap must succeed; both must agree.
    const canSwap = hasSwapCandidate(before, BREATH_SECONDS, target.id);
    check(
      canSwap === (result !== null),
      `seed=${seed}: hasSwapCandidate (${canSwap}) must agree with swapPose ` +
        `(${result !== null})`,
    );

    if (!result) continue;

    const swappedIn = catalogById.get(result.swappedInId);
    check(
      swappedIn !== undefined,
      `seed=${seed}: swappedInId (${result.swappedInId}) must be a catalog pose`,
    );
    if (!swappedIn) continue;

    // same category as the removed pose
    check(
      swappedIn.category === target.category,
      `seed=${seed}: swapped-in category (${swappedIn.category}) must equal ` +
        `removed category (${target.category})`,
    );
    // selectable, not fixed
    check(
      swappedIn.selectable && !swappedIn.alwaysInclude,
      `seed=${seed}: swapped-in pose must be selectable and not alwaysInclude`,
    );
    // not already present before the swap
    check(
      !beforeIds.has(swappedIn.id),
      `seed=${seed}: swapped-in pose (${swappedIn.id}) must not have been ` +
        `present already`,
    );
    // removed pose is gone; swapped-in pose is present
    const afterIds = result.poses.map((p) => p.id);
    check(
      !afterIds.includes(target.id),
      `seed=${seed}: removed pose (${target.id}) must be gone`,
    );
    check(
      afterIds.includes(swappedIn.id),
      `seed=${seed}: swapped-in pose (${swappedIn.id}) must be present`,
    );
    // length preserved (one out, one in)
    check(
      result.poses.length === before.length,
      `seed=${seed}: length must be preserved (before ${before.length}, ` +
        `after ${result.poses.length})`,
    );
    // canonical (strictly ascending) order
    let ascending = true;
    for (let i = 1; i < result.poses.length; i++) {
      if (result.poses[i].order <= result.poses[i - 1].order) {
        ascending = false;
        break;
      }
    }
    check(
      ascending,
      `seed=${seed}: result must be strictly ascending by order`,
    );
    // no duplicates
    check(
      new Set(afterIds).size === afterIds.length,
      `seed=${seed}: result must not contain duplicates`,
    );
    // hard ceiling respected
    check(
      result.totalSeconds <= TARGET_SECONDS,
      `seed=${seed}: totalSeconds (${result.totalSeconds}) must be <= target ` +
        `(${TARGET_SECONDS})`,
    );
    // reported total is internally consistent
    const recomputed = sequenceDurationSeconds(result.poses, BREATH_SECONDS);
    check(
      recomputed === result.totalSeconds,
      `seed=${seed}: reported totalSeconds (${result.totalSeconds}) must equal ` +
        `recomputation (${recomputed})`,
    );
    // fixed frame still fully present
    check(
      FIXED_IDS.every((id) => afterIds.includes(id)),
      `seed=${seed}: all four fixed poses must remain after a swap`,
    );
  }
}

// ---------------------------------------------------------------------------
// 2. Swapping a fixed (alwaysInclude) pose returns null, and hasSwapCandidate
//    reports false for it.
// ---------------------------------------------------------------------------
{
  const practice = generatePractice(poses, {
    breathSeconds: BREATH_SECONDS,
    rng: mulberry32(7),
  });
  for (const id of FIXED_IDS) {
    check(
      swapPose(practice.poses, BREATH_SECONDS, id) === null,
      `fixed: swapping ${id} must return null`,
    );
    check(
      hasSwapCandidate(practice.poses, BREATH_SECONDS, id) === false,
      `fixed: hasSwapCandidate for ${id} must be false`,
    );
  }
}

// ---------------------------------------------------------------------------
// 3. A pose that is not present in the practice cannot be swapped.
// ---------------------------------------------------------------------------
{
  const practice = generatePractice(poses, {
    breathSeconds: BREATH_SECONDS,
    rng: mulberry32(3),
  });
  const presentIds = new Set(practice.poses.map((p) => p.id));
  const absent = poses.find((p) => !presentIds.has(p.id));
  check(absent !== undefined, `absent: catalog should have an unused pose`);
  if (absent) {
    check(
      swapPose(practice.poses, BREATH_SECONDS, absent.id) === null,
      `absent: swapping a not-present pose (${absent.id}) must return null`,
    );
    check(
      hasSwapCandidate(practice.poses, BREATH_SECONDS, absent.id) === false,
      `absent: hasSwapCandidate for a not-present pose must be false`,
    );
  }
}

// ---------------------------------------------------------------------------
// 4. When EVERY same-category selectable pose is already present, there is no
//    alternative -> null. Build a synthetic "current" that already holds all
//    'standing' selectable poses, then try to swap one of them.
// ---------------------------------------------------------------------------
{
  const allStanding = poses.filter(
    (p) => p.category === 'standing' && p.selectable && !p.alwaysInclude,
  );
  // A minimal current list = every standing pose (no budget concern for the
  // "all present" invariant: even at 0s budget the candidate pool is empty).
  const current = allStanding.slice().sort((a, b) => a.order - b.order);
  const victim = current[0];
  check(
    swapPose(current, BREATH_SECONDS, victim.id, {
      targetSeconds: TARGET_SECONDS,
    }) === null,
    `exhausted: swapping when all same-category poses are present returns null`,
  );
  check(
    hasSwapCandidate(current, BREATH_SECONDS, victim.id) === false,
    `exhausted: hasSwapCandidate must be false when the pool is exhausted`,
  );
}

// ---------------------------------------------------------------------------
// 5. Budget ceiling: with a target so small that no candidate can be added,
//    swapPose returns null even though same-category alternatives exist.
// ---------------------------------------------------------------------------
{
  const standing = poses
    .filter((p) => p.category === 'standing' && p.selectable && !p.alwaysInclude)
    .sort((a, b) => a.order - b.order);
  // Current holds just the first standing pose; many alternatives exist, but a
  // 1-second ceiling admits none of them.
  const current = [standing[0]];
  const result = swapPose(current, BREATH_SECONDS, standing[0].id, {
    targetSeconds: 1,
    rng: mulberry32(9),
  });
  check(
    result === null,
    `budget: an impossibly small target must yield no valid swap (null)`,
  );
  check(
    hasSwapCandidate(current, BREATH_SECONDS, standing[0].id, {
      targetSeconds: 1,
    }) === false,
    `budget: hasSwapCandidate must be false under an impossibly small target`,
  );
  // Sanity: with a generous target the same swap succeeds.
  const ok = swapPose(current, BREATH_SECONDS, standing[0].id, {
    targetSeconds: TARGET_SECONDS,
    rng: mulberry32(9),
  });
  check(
    ok !== null && ok.poses.length === 1,
    `budget: with a generous target the swap succeeds and preserves length`,
  );
}

// --- report ---
if (failures.length > 0) {
  console.error(`\n=== SWAP TESTS FAILED (${failures.length}) ===`);
  for (const f of failures) console.error(`  \u2717 ${f}`);
  console.error(`\n(${assertionCount} assertions run)`);
  process.exit(1);
}

console.log('ALL SWAP TESTS PASSED');
console.log(`${assertionCount} assertions run.`);
