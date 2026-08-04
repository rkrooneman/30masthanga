/**
 * Deterministic, dependency-free test for the flow-label icon lookup.
 *
 * Run with:  npx tsx src/components/poses/flowIcons.test.ts
 *
 * No test framework, no deps. Asserts that `flowIconFor` returns a defined icon
 * component for every one of the 14 distinct salutation / UHP flow labels, that
 * an unknown label returns undefined, and that the two Virabhadrasana A side
 * variants ("(right)" / "(left)") normalize to the SAME component. Prints which
 * assertion failed and exits non-zero on any failure; on success prints
 * "ALL FLOW ICON TESTS PASSED" and the assertion count.
 */

import { flowIconFor } from './flowIcons';

// --- minimal assertion helper ---
let assertionCount = 0;
const failures: string[] = [];

function check(condition: boolean, message: string): void {
  assertionCount++;
  if (!condition) {
    failures.push(message);
  }
}

// The complete set of distinct flow labels that appear in the Surya A/B and UHP
// flows in `src/data/poses.ts` (14 total).
const FLOW_LABELS = [
  'Urdhva Hastasana',
  'Uttanasana',
  'Ardha Uttanasana',
  'Chaturanga Dandasana',
  'Urdhva Mukha Svanasana',
  'Adho Mukha Svanasana',
  'Samasthiti',
  'Utkatasana',
  'Virabhadrasana A (right)',
  'Virabhadrasana A (left)',
  'Utthita Hasta Padangusthasana',
  'Utthita Hasta Padangusthasana (head to knee)',
  'Utthita Hasta Padangusthasana (hands on hips)',
  'Parsva Hasta Padangusthasana',
];

// ---------------------------------------------------------------------------
// 1. Every one of the 14 flow labels resolves to a defined icon component.
// ---------------------------------------------------------------------------
check(
  FLOW_LABELS.length === 14,
  `expected 14 distinct flow labels, got ${FLOW_LABELS.length}`,
);

for (const label of FLOW_LABELS) {
  const icon = flowIconFor(label);
  check(
    typeof icon === 'function',
    `flowIconFor("${label}") must return a defined component (got ${String(icon)})`,
  );
}

// ---------------------------------------------------------------------------
// 2. Both Virabhadrasana A sides normalize to the SAME component.
// ---------------------------------------------------------------------------
{
  const right = flowIconFor('Virabhadrasana A (right)');
  const left = flowIconFor('Virabhadrasana A (left)');
  check(
    right !== undefined && left !== undefined && right === left,
    `Virabhadrasana A "(right)" and "(left)" must resolve to the same component`,
  );
  // The bare (un-suffixed) label must also resolve to that same component.
  check(
    flowIconFor('Virabhadrasana A') === right,
    `bare "Virabhadrasana A" must resolve to the same component as its sides`,
  );
}

// ---------------------------------------------------------------------------
// 3. The two UHP descriptive suffixes are distinct icons (NOT stripped).
// ---------------------------------------------------------------------------
{
  const base = flowIconFor('Utthita Hasta Padangusthasana');
  const headToKnee = flowIconFor('Utthita Hasta Padangusthasana (head to knee)');
  const handsOnHips = flowIconFor('Utthita Hasta Padangusthasana (hands on hips)');
  check(
    base !== undefined && headToKnee !== undefined && handsOnHips !== undefined,
    `all three UHP stage labels must resolve`,
  );
  check(
    headToKnee !== base && handsOnHips !== base && headToKnee !== handsOnHips,
    `the UHP stage suffixes must map to distinct icons (not stripped/merged)`,
  );
}

// ---------------------------------------------------------------------------
// 4. An unknown label returns undefined.
// ---------------------------------------------------------------------------
check(
  flowIconFor('Definitely Not A Pose') === undefined,
  `unknown label must return undefined`,
);
check(
  flowIconFor('') === undefined,
  `empty label must return undefined`,
);

// --- report ---
if (failures.length > 0) {
  console.error(`\n=== FLOW ICON TESTS FAILED (${failures.length}) ===`);
  for (const f of failures) console.error(`  \u2717 ${f}`);
  console.error(`\n(${assertionCount} assertions run)`);
  process.exit(1);
}

console.log('ALL FLOW ICON TESTS PASSED');
console.log(`${assertionCount} assertions run.`);
