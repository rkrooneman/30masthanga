/**
 * Deterministic, dependency-free test for the practice generator.
 *
 * Run with:  npx tsx src/lib/generatePractice.test.ts
 *
 * Uses a tiny seedable mulberry32 RNG (no test framework, no deps). Runs every
 * invariant across many seeds and every supported breathSeconds value. Prints
 * which invariant/seed failed and exits non-zero on any failure; on success
 * prints "ALL GENERATOR TESTS PASSED" and the assertion count.
 */

import type { Pose } from '../types/pose';
import { poses } from '../data/poses';
import { generatePractice } from './generatePractice';
import {
  MAX_BREATH_SECONDS,
  MIN_BREATH_SECONDS,
  TARGET_SECONDS,
  sequenceDurationSeconds,
} from './timing';

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

// --- expected fixed frame ---
const FIXED_IDS = [
  'surya_namaskara_a',
  'surya_namaskara_b',
  'salamba_sarvangasana',
  'savasana',
];

const catalogIds = new Set(poses.map((p) => p.id));

// Ids allowed in "Basics only" mode: any curated basic pose (isBasic) plus the
// always-present fixed frame (which is itself marked isBasic, but list the
// frame explicitly for clarity).
const basicIds = new Set(
  poses.filter((p) => p.isBasic).map((p) => p.id),
);

const SEEDS = Array.from({ length: 20 }, (_, i) => i + 1);
const BREATHS = [
  MIN_BREATH_SECONDS, // 4
  5,
  6,
  MAX_BREATH_SECONDS, // 7
];

function runInvariants(seq: Pose[], totalSeconds: number, ctx: string): void {
  // 1. starts with Surya A then Surya B
  check(
    seq.length >= 2 &&
      seq[0].id === 'surya_namaskara_a' &&
      seq[1].id === 'surya_namaskara_b',
    `${ctx}: must start with surya_namaskara_a then surya_namaskara_b ` +
      `(got ${seq[0]?.id}, ${seq[1]?.id})`,
  );

  // 2. ends with savasana
  check(
    seq.length >= 1 && seq[seq.length - 1].id === 'savasana',
    `${ctx}: must end with savasana (got ${seq[seq.length - 1]?.id})`,
  );

  // 3. shoulderstand present and before savasana
  const shoulderIdx = seq.findIndex((p) => p.id === 'salamba_sarvangasana');
  const savasanaIdx = seq.findIndex((p) => p.id === 'savasana');
  check(shoulderIdx !== -1, `${ctx}: salamba_sarvangasana must be present`);
  check(
    shoulderIdx !== -1 && savasanaIdx !== -1 && shoulderIdx < savasanaIdx,
    `${ctx}: salamba_sarvangasana must appear before savasana`,
  );

  // 4. strictly ascending order
  let ascending = true;
  for (let i = 1; i < seq.length; i++) {
    if (seq[i].order <= seq[i - 1].order) {
      ascending = false;
      break;
    }
  }
  check(ascending, `${ctx}: sequence must be strictly ascending by order`);

  // 5. no duplicates
  const ids = seq.map((p) => p.id);
  check(
    new Set(ids).size === ids.length,
    `${ctx}: no pose may appear twice (dupes: ${ids
      .filter((id, i) => ids.indexOf(id) !== i)
      .join(', ')})`,
  );

  // 6. only catalog poses appear
  check(
    seq.every((p) => catalogIds.has(p.id)),
    `${ctx}: only poses from the input catalog may appear`,
  );

  // 7. hard ceiling
  check(
    totalSeconds <= TARGET_SECONDS,
    `${ctx}: totalSeconds (${totalSeconds}) must be <= target (${TARGET_SECONDS})`,
  );

  // 8. all 4 alwaysInclude poses present
  check(
    FIXED_IDS.every((id) => ids.includes(id)),
    `${ctx}: all four alwaysInclude poses must be present ` +
      `(missing: ${FIXED_IDS.filter((id) => !ids.includes(id)).join(', ')})`,
  );

  // 8b. protected finisher: at least one `closing` pose is always present. The
  // fixed-frame Shoulderstand is a closing pose so this always holds, but the
  // check guards the protected-finisher rule in BOTH modes regardless.
  check(
    seq.some((p) => p.category === 'closing'),
    `${ctx}: at least one closing pose must be present (protected finisher)`,
  );

  // 9. reported totalSeconds matches recomputation
  // (uses the same breathSeconds embedded in ctx via closure below)
}

for (const breathSeconds of BREATHS) {
  for (const seed of SEEDS) {
    const ctx = `seed=${seed} breathSeconds=${breathSeconds}`;
    const result = generatePractice(poses, {
      breathSeconds,
      rng: mulberry32(seed),
    });

    runInvariants(result.poses, result.totalSeconds, ctx);

    // 9. reported totalSeconds is internally consistent
    const recomputed = sequenceDurationSeconds(result.poses, breathSeconds);
    check(
      recomputed === result.totalSeconds,
      `${ctx}: reported totalSeconds (${result.totalSeconds}) must equal ` +
        `sequenceDurationSeconds recomputation (${recomputed})`,
    );

    // 10. breathSeconds echoed back
    check(
      result.breathSeconds === breathSeconds,
      `${ctx}: result.breathSeconds (${result.breathSeconds}) must equal ` +
        `requested (${breathSeconds})`,
    );

    // 11. determinism: same seed => identical output
    const again = generatePractice(poses, {
      breathSeconds,
      rng: mulberry32(seed),
    });
    check(
      again.poses.map((p) => p.id).join(',') ===
        result.poses.map((p) => p.id).join(','),
      `${ctx}: generation must be deterministic for a fixed seed`,
    );
  }
}

// ---------------------------------------------------------------------------
// Basics only (Smart Start) mode.
//   (i)  every pose in a basics-only practice is in the basic set (fixed frame
//        included — the frame is itself marked isBasic).
//   (ii) all the standard invariants still hold, including the protected
//        finisher (>= 1 closing pose).
// ---------------------------------------------------------------------------
for (const breathSeconds of BREATHS) {
  for (const seed of SEEDS) {
    const ctx = `basicsOnly seed=${seed} breathSeconds=${breathSeconds}`;
    const result = generatePractice(poses, {
      breathSeconds,
      basicsOnly: true,
      rng: mulberry32(seed),
    });

    // All standard invariants hold in basics mode too (fixed frame, ordering,
    // ceiling, protected finisher, etc.).
    runInvariants(result.poses, result.totalSeconds, ctx);

    // (i) only basic-set poses appear.
    const nonBasic = result.poses.filter((p) => !basicIds.has(p.id));
    check(
      nonBasic.length === 0,
      `${ctx}: only basic-set poses may appear ` +
        `(offenders: ${nonBasic.map((p) => p.id).join(', ')})`,
    );
    // Every appearing pose is also flagged isBasic in the catalog.
    check(
      result.poses.every((p) => p.isBasic),
      `${ctx}: every pose in a basics-only practice must have isBasic === true`,
    );
  }
}

// --- report ---
if (failures.length > 0) {
  console.error(`\n=== GENERATOR TESTS FAILED (${failures.length}) ===`);
  for (const f of failures) console.error(`  \u2717 ${f}`);
  console.error(`\n(${assertionCount} assertions run)`);
  process.exit(1);
}

console.log('ALL GENERATOR TESTS PASSED');
console.log(
  `${assertionCount} assertions run across ${SEEDS.length} seeds ` +
    `x ${BREATHS.length} breathSeconds values.`,
);
