/**
 * Standalone validation script for the pose catalog.
 *
 * Run with:  npx tsx src/data/validate-poses.ts
 *
 * Asserts structural invariants and prints a summary (count per category,
 * total, and a rough full-practice time estimate at 5s/breath). Exits non-zero
 * with a clear message on any failure.
 */

import type { PoseCategory } from '../types/pose';
import { poses } from './poses';
import { poseHoldSeconds } from '../lib/timing';

const SECONDS_PER_BREATH = 5;

const VALID_CATEGORIES: readonly PoseCategory[] = [
  'sun_a',
  'sun_b',
  'standing',
  'seated',
  'closing',
  'finishing',
];

const errors: string[] = [];

// --- 1. unique ids ---
const seen = new Set<string>();
for (const p of poses) {
  if (seen.has(p.id)) {
    errors.push(`Duplicate id: "${p.id}"`);
  }
  seen.add(p.id);
}

// --- 2. order strictly increasing ---
for (let i = 1; i < poses.length; i++) {
  const prev = poses[i - 1];
  const cur = poses[i];
  if (cur.order <= prev.order) {
    errors.push(
      `order not strictly increasing: "${cur.id}" (order ${cur.order}) ` +
        `follows "${prev.id}" (order ${prev.order})`,
    );
  }
}

// --- 3/4/5. per-pose field checks ---
for (const p of poses) {
  if (!VALID_CATEGORIES.includes(p.category)) {
    errors.push(`Invalid category "${p.category}" on pose "${p.id}"`);
  }
  if (!p.sanskrit || p.sanskrit.trim() === '') {
    errors.push(`Empty sanskrit on pose "${p.id}"`);
  }
  if (!p.phonetic || p.phonetic.trim() === '') {
    errors.push(`Empty phonetic on pose "${p.id}"`);
  }
  if (!p.english || p.english.trim() === '') {
    errors.push(`Empty english on pose "${p.id}"`);
  }
  if (typeof p.drishti !== 'string' || p.drishti.trim() === '') {
    errors.push(`Empty drishti on pose "${p.id}"`);
  }
  if (p.sides !== 1 && p.sides !== 2) {
    errors.push(`sides must be 1 or 2 on pose "${p.id}" (got ${p.sides})`);
  }
  // `breaths` must be positive. Non-flow poses must be whole breaths; a
  // salutation FLOW pose may be fractional (the half-breath movement model:
  // movements count 0.5, holds count whole breaths — e.g. Surya A = 9.5). Flow
  // poses are additionally required to be a whole number of HALF-breaths (breaths
  // * 2 integer) so the flow can be built from whole half-breath units.
  const hasFlow = Boolean(p.flow && p.flow.length > 0);
  if (typeof p.breaths !== 'number' || p.breaths <= 0) {
    errors.push(
      `breaths must be a positive number on pose "${p.id}" (got ${p.breaths})`,
    );
  } else if (!hasFlow && !Number.isInteger(p.breaths)) {
    errors.push(
      `breaths must be a positive integer on non-flow pose "${p.id}" ` +
        `(got ${p.breaths})`,
    );
  } else if (hasFlow && !Number.isInteger(p.breaths * 2)) {
    errors.push(
      `breaths must be a whole number of half-breaths on flow pose "${p.id}" ` +
        `(got ${p.breaths}, i.e. ${p.breaths * 2} half-breaths)`,
    );
  }
  if (!Number.isInteger(p.repeat) || p.repeat <= 0) {
    errors.push(
      `repeat must be a positive integer on pose "${p.id}" (got ${p.repeat})`,
    );
  }
}

// --- flow: if a pose carries a vinyasa `flow`, its total HALF-breaths must
// equal the card's `breaths * 2` (half-breath movement model), so the timing
// budget (poseHoldSeconds / sequenceDuration) is unaffected by the flow
// expansion. A single-phase MOVEMENT (`phase` set) contributes 1 half-breath; a
// whole-breath HOLD (`phase` absent) contributes `breaths * 2` half-breaths.
// Also sanity-check each flow step's fields. ---
for (const p of poses) {
  if (!p.flow) continue;
  if (p.flow.length === 0) {
    errors.push(`Pose "${p.id}" has an empty flow array`);
    continue;
  }
  let flowHalfBreaths = 0;
  for (const [i, step] of p.flow.entries()) {
    if (!step.label || step.label.trim() === '') {
      errors.push(`Pose "${p.id}" flow[${i}] has an empty label`);
    }
    if (
      step.phase !== undefined &&
      step.phase !== 'inhale' &&
      step.phase !== 'exhale'
    ) {
      errors.push(
        `Pose "${p.id}" flow[${i}] phase must be 'inhale' or 'exhale' ` +
          `(got ${String(step.phase)})`,
      );
    }
    if (!Number.isInteger(step.breaths) || step.breaths <= 0) {
      errors.push(
        `Pose "${p.id}" flow[${i}] breaths must be a positive integer ` +
          `(got ${step.breaths})`,
      );
    } else if (step.phase !== undefined) {
      // MOVEMENT: a single half-breath phase regardless of `breaths` (which is
      // pinned to 1 for schema consistency but ignored for counting).
      flowHalfBreaths += 1;
    } else {
      // HOLD: whole breaths, each a full inhale+exhale = 2 half-breaths.
      flowHalfBreaths += step.breaths * 2;
    }
    if (
      step.cueOn !== undefined &&
      step.cueOn !== 'first' &&
      step.cueOn !== 'last'
    ) {
      errors.push(
        `Pose "${p.id}" flow[${i}] cueOn must be 'first' or 'last' ` +
          `(got ${String(step.cueOn)})`,
      );
    }
  }
  // card.breaths is the whole-breath-equivalent, so breaths * 2 = total
  // half-breaths.
  const expectedHalfBreaths = p.breaths * 2;
  if (flowHalfBreaths !== expectedHalfBreaths) {
    errors.push(
      `Pose "${p.id}" flow half-breaths (${flowHalfBreaths}) must equal ` +
        `pose.breaths * 2 (${expectedHalfBreaths}) — half-breath movement model`,
    );
  }
}

// --- repeat: a known set of poses are repeated in traditional Ashtanga, each
// with its own expected count. The two Sun Salutations (x3), plus Navasana
// (Boat, x5) and Setu Bandhasana (Bridge, x3). Every other pose must be x1. ---
const expectedRepeats = new Map<string, number>([
  ['surya_namaskara_a', 3],
  ['surya_namaskara_b', 3],
  ['navasana', 5],
  ['setu_bandhasana', 3],
]);
const repeatedIds = poses.filter((p) => p.repeat > 1).map((p) => p.id);
for (const p of poses) {
  const expected = expectedRepeats.get(p.id);
  if (expected !== undefined) {
    if (p.repeat !== expected) {
      errors.push(
        `${p.id} is expected to have repeat === ${expected} (got ${p.repeat})`,
      );
    }
  } else if (p.repeat > 1) {
    errors.push(
      `Unexpected repeat > 1 on pose "${p.id}" (got ${p.repeat}); only ` +
        `${[...expectedRepeats.keys()].join(', ')} should repeat`,
    );
  }
}

// --- 6. alwaysInclude reporting ---
const alwaysIncludeIds = poses
  .filter((p) => p.alwaysInclude)
  .map((p) => p.id);
const expectedAlways = new Set([
  'surya_namaskara_a',
  'surya_namaskara_b',
  'salamba_sarvangasana',
  'savasana',
]);
const extraAlways = alwaysIncludeIds.filter((id) => !expectedAlways.has(id));

// --- Print report ---
console.log('=== Pose catalog validation ===\n');

console.log('alwaysInclude:true poses:');
for (const id of alwaysIncludeIds) {
  const tag = expectedAlways.has(id) ? '(expected)' : '(EXTRA)';
  console.log(`  - ${id} ${tag}`);
}
if (extraAlways.length > 0) {
  console.log(
    `\n  NOTE: ${extraAlways.length} pose(s) beyond salutations+savasana ` +
      `marked alwaysInclude: ${extraAlways.join(', ')}`,
  );
} else {
  console.log(
    '\n  Exactly the salutations + savasana are alwaysInclude:true. OK.',
  );
}

// counts per category
console.log('\nCount per category:');
const counts = new Map<PoseCategory, number>();
for (const c of VALID_CATEGORIES) counts.set(c, 0);
for (const p of poses) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
for (const c of VALID_CATEGORIES) {
  console.log(`  ${c.padEnd(10)} ${counts.get(c)}`);
}
console.log(`  ${'TOTAL'.padEnd(10)} ${poses.length}`);

// repeated poses report
console.log('\nRepeated poses (repeat > 1):');
if (repeatedIds.length === 0) {
  console.log('  (none)');
} else {
  for (const id of repeatedIds) {
    const p = poses.find((x) => x.id === id)!;
    const tag = expectedRepeats.has(id) ? '(expected)' : '(UNEXPECTED)';
    console.log(`  - ${id} \u00d7${p.repeat} ${tag}`);
  }
}

// full-practice time estimate (accounts for sides AND repeat via poseHoldSeconds)
let totalBreaths = 0;
for (const p of poses) totalBreaths += p.breaths * p.sides * p.repeat;
let totalSeconds = 0;
for (const p of poses) totalSeconds += poseHoldSeconds(p, SECONDS_PER_BREATH);
const minutes = Math.floor(totalSeconds / 60);
const seconds = totalSeconds % 60;
console.log('\nFull-practice estimate (all poses, both sides, all repeats):');
console.log(`  total breath-units (breaths * sides * repeat): ${totalBreaths}`);
console.log(`  at ${SECONDS_PER_BREATH}s/breath (incl. internal repeat ` +
  `transitions): ${totalSeconds}s = ${minutes}m ${seconds}s`);

// --- Result ---
if (errors.length > 0) {
  console.error(`\n=== VALIDATION FAILED (${errors.length} error(s)) ===`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}

console.log('\n=== VALIDATION PASSED ===');
