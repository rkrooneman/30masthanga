/**
 * Deterministic, dependency-free test for buildSelectedPractice.
 *
 * Run with:  npx tsx src/lib/selectedPractice.test.ts
 *
 * No test framework, no deps. Verifies:
 *   - the derived practice contains exactly the selected ids, in canonical order
 *   - totalSeconds equals sequenceDurationSeconds of those poses
 *   - ids not in the catalog are ignored
 *   - an empty selection yields an empty practice with 0s total
 *   - selecting the WHOLE catalog (Full series) yields every pose, in order
 * Prints which assertion failed and exits non-zero on any failure; on success
 * prints "ALL SELECTED-PRACTICE TESTS PASSED" and the assertion count.
 */

import { poses } from '../data/poses';
import { buildSelectedPractice } from './selectedPractice';
import { sequenceDurationSeconds } from './timing';

// --- minimal assertion helper ---
let assertionCount = 0;
const failures: string[] = [];

function check(condition: boolean, message: string): void {
  assertionCount++;
  if (!condition) {
    failures.push(message);
  }
}

const BREATH_SECONDS = 5;

// ---------------------------------------------------------------------------
// 1. A mixed selection: derived poses are exactly the selected ids, canonically
//    ordered, with a total that matches sequenceDurationSeconds.
// ---------------------------------------------------------------------------
{
  const ids = new Set([
    'savasana',
    'surya_namaskara_a',
    'utthita_trikonasana',
    'navasana',
    'salamba_sarvangasana',
  ]);
  const practice = buildSelectedPractice(poses, ids, BREATH_SECONDS);

  const outIds = practice.poses.map((p) => p.id);
  check(
    outIds.length === ids.size,
    `mixed: expected ${ids.size} poses, got ${outIds.length}`,
  );
  check(
    outIds.every((id) => ids.has(id)),
    `mixed: every derived pose must be in the selection`,
  );
  check(
    [...ids].every((id) => outIds.includes(id)),
    `mixed: every selected id must be present in the derived practice`,
  );

  let ascending = true;
  for (let i = 1; i < practice.poses.length; i++) {
    if (practice.poses[i].order <= practice.poses[i - 1].order) {
      ascending = false;
      break;
    }
  }
  check(ascending, `mixed: derived poses must be strictly ascending by order`);

  check(
    practice.totalSeconds ===
      sequenceDurationSeconds(practice.poses, BREATH_SECONDS),
    `mixed: totalSeconds must equal sequenceDurationSeconds of the poses`,
  );
  check(
    practice.breathSeconds === BREATH_SECONDS,
    `mixed: breathSeconds must be echoed back`,
  );
}

// ---------------------------------------------------------------------------
// 2. Unknown ids are ignored (never appear, never crash).
// ---------------------------------------------------------------------------
{
  const ids = new Set(['savasana', 'not_a_real_pose', 'another_fake']);
  const practice = buildSelectedPractice(poses, ids, BREATH_SECONDS);
  const outIds = practice.poses.map((p) => p.id);
  check(
    outIds.length === 1 && outIds[0] === 'savasana',
    `unknown: only the real selected id should survive (got ${outIds.join(',')})`,
  );
}

// ---------------------------------------------------------------------------
// 3. An empty selection yields an empty practice with a 0s total.
// ---------------------------------------------------------------------------
{
  const practice = buildSelectedPractice(poses, new Set(), BREATH_SECONDS);
  check(
    practice.poses.length === 0,
    `empty: an empty selection must yield no poses`,
  );
  check(practice.totalSeconds === 0, `empty: an empty practice is 0s`);
}

// ---------------------------------------------------------------------------
// 4. Full series: selecting every catalog id yields every pose, in canonical
//    order, with a total matching the whole catalog. May freely exceed 30 min.
// ---------------------------------------------------------------------------
{
  const ids = new Set(poses.map((p) => p.id));
  const practice = buildSelectedPractice(poses, ids, BREATH_SECONDS);
  check(
    practice.poses.length === poses.length,
    `full: selecting all ids must yield the whole catalog`,
  );
  const canonical = poses.slice().sort((a, b) => a.order - b.order);
  check(
    practice.poses.every((p, i) => p.id === canonical[i].id),
    `full: derived order must equal the canonical catalog order`,
  );
  check(
    practice.totalSeconds ===
      sequenceDurationSeconds(canonical, BREATH_SECONDS),
    `full: totalSeconds must equal the whole-catalog duration`,
  );
}

// --- report ---
if (failures.length > 0) {
  console.error(`\n=== SELECTED-PRACTICE TESTS FAILED (${failures.length}) ===`);
  for (const f of failures) console.error(`  \u2717 ${f}`);
  console.error(`\n(${assertionCount} assertions run)`);
  process.exit(1);
}

console.log('ALL SELECTED-PRACTICE TESTS PASSED');
console.log(`${assertionCount} assertions run.`);
