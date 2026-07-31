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
  if (!Number.isInteger(p.breaths) || p.breaths <= 0) {
    errors.push(
      `breaths must be a positive integer on pose "${p.id}" (got ${p.breaths})`,
    );
  }
  if (!Number.isInteger(p.repeat) || p.repeat <= 0) {
    errors.push(
      `repeat must be a positive integer on pose "${p.id}" (got ${p.repeat})`,
    );
  }
}

// --- repeat: only the two salutations may have repeat > 1 (both === 3) ---
const expectedRepeated = new Set([
  'surya_namaskara_a',
  'surya_namaskara_b',
]);
const repeatedIds = poses.filter((p) => p.repeat > 1).map((p) => p.id);
for (const p of poses) {
  if (expectedRepeated.has(p.id)) {
    if (p.repeat !== 3) {
      errors.push(
        `${p.id} is expected to have repeat === 3 (got ${p.repeat})`,
      );
    }
  } else if (p.repeat > 1) {
    errors.push(
      `Unexpected repeat > 1 on pose "${p.id}" (got ${p.repeat}); only ` +
        `surya_namaskara_a and surya_namaskara_b should repeat`,
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
    const tag = expectedRepeated.has(id) ? '(expected)' : '(UNEXPECTED)';
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
