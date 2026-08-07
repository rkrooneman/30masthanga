/**
 * Deterministic, dependency-free test for the pure counter-pose rule.
 *
 * Run with:  npx tsx src/lib/counterPose.test.ts
 *
 * No test framework, no deps. Exercises the safety rule that any deep backbend
 * (Bridge / Wheel) forces the closing forward-fold counter to be present, and
 * that the counter is removed when no backbend is present. Verifies:
 *   - hasBackbend detects any single backbend, both, or a backbend among others,
 *     and is false for empty / non-backbend sets
 *   - applyCounterPoseRule ADDS the counter when a backbend is present and
 *     REMOVES it when none is, keeps exactly one counter for both backbends,
 *     never mutates the input (returns a new Set), and is idempotent
 *   - isCounterPoseLocked agrees with hasBackbend
 * Prints which assertion failed and exits non-zero on any failure; on success
 * prints "ALL COUNTER-POSE TESTS PASSED" and the assertion count.
 */

import {
  BACKBEND_IDS,
  COUNTER_POSE_ID,
  applyCounterPoseRule,
  hasBackbend,
  isCounterPoseLocked,
} from './counterPose';

// --- minimal assertion helper ---
let assertionCount = 0;
const failures: string[] = [];

function check(condition: boolean, message: string): void {
  assertionCount++;
  if (!condition) {
    failures.push(message);
  }
}

const SETU = 'setu_bandhasana';
const WHEEL = 'urdhva_dhanurasana';

// Sanity: the constants are what the rest of the app relies on.
{
  check(
    BACKBEND_IDS.length === 2 &&
      BACKBEND_IDS[0] === SETU &&
      BACKBEND_IDS[1] === WHEEL,
    `constants: BACKBEND_IDS must be [${SETU}, ${WHEEL}] (got ${BACKBEND_IDS.join(',')})`,
  );
  check(
    COUNTER_POSE_ID === 'paschimottanasana_closing',
    `constants: COUNTER_POSE_ID must be paschimottanasana_closing (got ${COUNTER_POSE_ID})`,
  );
}

// ---------------------------------------------------------------------------
// 1. hasBackbend: true for any backbend, both, or a backbend among others;
//    false for empty / non-backbend-only sets.
// ---------------------------------------------------------------------------
{
  check(hasBackbend([SETU]), `hasBackbend: {setu} must be true`);
  check(hasBackbend([WHEEL]), `hasBackbend: {wheel} must be true`);
  check(hasBackbend([SETU, WHEEL]), `hasBackbend: {setu, wheel} must be true`);
  check(
    hasBackbend([SETU, 'tadasana', 'balasana']),
    `hasBackbend: {setu, other...} must be true`,
  );
  check(!hasBackbend([]), `hasBackbend: {} must be false`);
  check(
    !hasBackbend(['tadasana', 'balasana', COUNTER_POSE_ID]),
    `hasBackbend: non-backbend poses (even with the counter) must be false`,
  );
}

// ---------------------------------------------------------------------------
// 2. applyCounterPoseRule ADDS the counter when a backbend is present, keeping
//    the backbend and the other ids.
// ---------------------------------------------------------------------------
{
  const result = applyCounterPoseRule([SETU, 'tadasana']);
  check(
    result.has(COUNTER_POSE_ID),
    `applyRule(add): backbend present must include the counter`,
  );
  check(
    result.has(SETU),
    `applyRule(add): must retain the backbend (${SETU})`,
  );
  check(
    result.has('tadasana'),
    `applyRule(add): must retain the other ids (tadasana)`,
  );
}

// ---------------------------------------------------------------------------
// 3. Both backbends -> exactly ONE counter, both backbends retained. (A Set
//    guarantees uniqueness; assert the count and membership explicitly.)
// ---------------------------------------------------------------------------
{
  const result = applyCounterPoseRule([SETU, WHEEL, 'tadasana']);
  check(result.has(SETU), `applyRule(both): must retain ${SETU}`);
  check(result.has(WHEEL), `applyRule(both): must retain ${WHEEL}`);
  check(
    result.has(COUNTER_POSE_ID),
    `applyRule(both): must include the counter`,
  );
  const counterCount = [...result].filter((id) => id === COUNTER_POSE_ID)
    .length;
  check(
    counterCount === 1,
    `applyRule(both): must contain exactly one counter (got ${counterCount})`,
  );
}

// ---------------------------------------------------------------------------
// 4. No backbend -> the counter is REMOVED, even when passed in explicitly.
// ---------------------------------------------------------------------------
{
  const result = applyCounterPoseRule([COUNTER_POSE_ID, 'some_standing']);
  check(
    !result.has(COUNTER_POSE_ID),
    `applyRule(remove): no backbend must strip the counter even if it was in the input`,
  );
  check(
    result.has('some_standing'),
    `applyRule(remove): must retain the non-backbend ids (some_standing)`,
  );
}

// ---------------------------------------------------------------------------
// 5. Purity: the input Set is not mutated, and a NEW Set is returned.
// ---------------------------------------------------------------------------
{
  const input = new Set([SETU, 'tadasana']);
  const result = applyCounterPoseRule(input);
  check(result !== input, `purity: must return a NEW Set (not the input)`);
  check(
    input.size === 2 && input.has(SETU) && input.has('tadasana'),
    `purity: input Set (add case) must be unchanged (got ${[...input].join(',')})`,
  );
  check(
    !input.has(COUNTER_POSE_ID),
    `purity: input Set must not gain the counter`,
  );

  const removeInput = new Set([COUNTER_POSE_ID, 'some_standing']);
  applyCounterPoseRule(removeInput);
  check(
    removeInput.has(COUNTER_POSE_ID) && removeInput.size === 2,
    `purity: input Set (remove case) must still contain the counter it started with`,
  );
}

// ---------------------------------------------------------------------------
// 6. Idempotent: applying twice equals applying once, for both branches.
// ---------------------------------------------------------------------------
{
  function sortedIds(s: Set<string>): string {
    return [...s].sort().join(',');
  }
  for (const input of [
    [SETU, 'tadasana'],
    [WHEEL, COUNTER_POSE_ID, 'tadasana'],
    [COUNTER_POSE_ID, 'some_standing'],
    ['tadasana', 'balasana'],
  ]) {
    const once = applyCounterPoseRule(input);
    const twice = applyCounterPoseRule(once);
    check(
      sortedIds(once) === sortedIds(twice),
      `idempotent: applying twice must equal once for {${input.join(',')}} ` +
        `(once=${sortedIds(once)} twice=${sortedIds(twice)})`,
    );
  }
}

// ---------------------------------------------------------------------------
// 7. isCounterPoseLocked agrees with hasBackbend across representative inputs.
// ---------------------------------------------------------------------------
{
  for (const input of [
    [SETU],
    [WHEEL],
    [SETU, WHEEL],
    [SETU, 'tadasana'],
    [],
    ['tadasana', 'balasana', COUNTER_POSE_ID],
  ]) {
    check(
      isCounterPoseLocked(input) === hasBackbend(input),
      `lock: isCounterPoseLocked must equal hasBackbend for {${input.join(',')}}`,
    );
  }
}

// --- report ---
if (failures.length > 0) {
  console.error(`\n=== COUNTER-POSE TESTS FAILED (${failures.length}) ===`);
  for (const f of failures) console.error(`  \u2717 ${f}`);
  console.error(`\n(${assertionCount} assertions run)`);
  process.exit(1);
}

console.log('ALL COUNTER-POSE TESTS PASSED');
console.log(`${assertionCount} assertions run.`);
