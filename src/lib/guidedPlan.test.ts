/**
 * Deterministic, dependency-free test for the guided-practice planner.
 *
 * Run with:  npx tsx src/lib/guidedPlan.test.ts
 *
 * No test framework, no deps. Builds tiny synthetic sequences to exercise the
 * segment/label/transition rules, then validates the full-catalog plan's
 * `totalMs` against `sequenceDurationSeconds` from timing.ts via the exact
 * side-transition delta (see the reconciliation comment in guidedPlan.ts).
 * Prints which assertion failed and exits non-zero on any failure; on success
 * prints "ALL GUIDED PLAN TESTS PASSED" and the assertion count.
 */

import type { Pose } from '../types/pose';
import { poses } from '../data/poses';
import { buildGuidedPlan } from './guidedPlan';
import type { BreathStep, TransitionStep } from './guidedPlan';
import {
  DEFAULT_BREATH_SECONDS,
  TRANSITION_SECONDS,
  sequenceDurationSeconds,
} from './timing';

// --- minimal assertion helper ---
let assertionCount = 0;
const failures: string[] = [];

function check(condition: boolean, message: string): void {
  assertionCount++;
  if (!condition) {
    failures.push(message);
  }
}

// --- test pose factory ---
let orderSeq = 0;
function makePose(overrides: Partial<Pose>): Pose {
  orderSeq += 10;
  return {
    id: `test_${orderSeq}`,
    sanskrit: 'Test',
    phonetic: 'test',
    english: 'Test Pose',
    category: 'standing',
    group: 'test',
    order: orderSeq,
    breaths: 5,
    sides: 1,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Nasagrai (tip of the nose)',
    ...overrides,
  };
}

const isBreath = (s: { kind: string }): s is BreathStep => s.kind === 'breath';
const isTransition = (s: { kind: string }): s is TransitionStep =>
  s.kind === 'transition';

// ---------------------------------------------------------------------------
// 1. A plain 1-segment 5-breath pose, alone: 5 breath steps, NO leading
//    transition (it's the first segment of the whole practice).
// ---------------------------------------------------------------------------
{
  const plan = buildGuidedPlan([makePose({ breaths: 5 })], 5);
  const breaths = plan.steps.filter(isBreath);
  const transitions = plan.steps.filter(isTransition);

  check(breaths.length === 5, `plain pose: expected 5 breath steps, got ${breaths.length}`);
  check(
    transitions.length === 0,
    `plain pose: expected 0 transitions, got ${transitions.length}`,
  );
  check(plan.steps.length === 5, `plain pose: expected 5 total steps, got ${plan.steps.length}`);
  check(
    plan.steps[0].kind === 'breath',
    `plain pose: first step must be a breath (no leading transition)`,
  );
  check(
    breaths.every((b) => b.segmentLabel === null),
    `plain pose: single-segment label must be null`,
  );
  check(
    breaths.every((b) => b.segmentCount === 1),
    `plain pose: segmentCount must be 1`,
  );
  check(
    breaths[0].breathNumber === 1 && breaths[4].breathNumber === 5,
    `plain pose: breathNumber must run 1..5`,
  );
  check(
    breaths.every((b) => b.inhaleMs === 2500 && b.exhaleMs === 2500),
    `plain pose: at 5s/breath each half must be 2500ms`,
  );
  // totalMs = 5 breaths * (2500 + 2500) = 25000
  check(plan.totalMs === 25000, `plain pose: totalMs expected 25000, got ${plan.totalMs}`);
}

// ---------------------------------------------------------------------------
// 2. A 2-sided pose: 2 segments, a single "Switch sides" transition between
//    them, correct "First side"/"Second side" labels.
// ---------------------------------------------------------------------------
{
  const plan = buildGuidedPlan([makePose({ breaths: 5, sides: 2 })], 5);
  const breaths = plan.steps.filter(isBreath);
  const transitions = plan.steps.filter(isTransition);

  check(breaths.length === 10, `2-sided: expected 10 breath steps, got ${breaths.length}`);
  check(
    transitions.length === 1,
    `2-sided: expected exactly 1 (between-side) transition, got ${transitions.length}`,
  );
  check(
    transitions[0].cue === 'Switch sides',
    `2-sided: transition cue must be "Switch sides", got "${transitions[0]?.cue}"`,
  );
  check(
    plan.steps[0].kind === 'breath',
    `2-sided: must start with a breath, not a transition`,
  );
  // The transition sits between segment 0 and segment 1 (after 5 breaths).
  const transitionIndex = plan.steps.findIndex(isTransition);
  check(
    transitionIndex === 5,
    `2-sided: transition must sit after the 5 first-side breaths (index 5), got ${transitionIndex}`,
  );
  const seg0 = breaths.filter((b) => b.segmentIndex === 0);
  const seg1 = breaths.filter((b) => b.segmentIndex === 1);
  check(seg0.length === 5 && seg1.length === 5, `2-sided: each side must have 5 breaths`);
  check(
    seg0.every((b) => b.segmentLabel === 'First side'),
    `2-sided: segment 0 label must be "First side"`,
  );
  check(
    seg1.every((b) => b.segmentLabel === 'Second side'),
    `2-sided: segment 1 label must be "Second side"`,
  );
  check(
    breaths.every((b) => b.segmentCount === 2),
    `2-sided: segmentCount must be 2`,
  );
  // totalMs = 10 breaths * 5000 + 1 transition * 3000 = 50000 + 3000 = 53000
  check(plan.totalMs === 53000, `2-sided: totalMs expected 53000, got ${plan.totalMs}`);
}

// ---------------------------------------------------------------------------
// 3. A salutation (sides 1, repeat 3, breaths 9): 3 segments of 9 breaths,
//    "Round 2 of 3" / "Round 3 of 3" transitions.
// ---------------------------------------------------------------------------
{
  const plan = buildGuidedPlan(
    [makePose({ breaths: 9, sides: 1, repeat: 3 })],
    5,
  );
  const breaths = plan.steps.filter(isBreath);
  const transitions = plan.steps.filter(isTransition);

  check(breaths.length === 27, `salutation: expected 27 breath steps, got ${breaths.length}`);
  check(
    transitions.length === 2,
    `salutation: expected 2 between-round transitions, got ${transitions.length}`,
  );
  check(
    transitions[0].cue === 'Round 2 of 3',
    `salutation: first transition cue must be "Round 2 of 3", got "${transitions[0]?.cue}"`,
  );
  check(
    transitions[1].cue === 'Round 3 of 3',
    `salutation: second transition cue must be "Round 3 of 3", got "${transitions[1]?.cue}"`,
  );
  check(
    plan.steps[0].kind === 'breath',
    `salutation: must start with a breath (no leading transition)`,
  );
  for (let seg = 0; seg < 3; seg++) {
    const segBreaths = breaths.filter((b) => b.segmentIndex === seg);
    check(
      segBreaths.length === 9,
      `salutation: round ${seg + 1} must have 9 breaths, got ${segBreaths.length}`,
    );
    check(
      segBreaths.every((b) => b.segmentLabel === `Round ${seg + 1} of 3`),
      `salutation: round ${seg + 1} label must be "Round ${seg + 1} of 3"`,
    );
    check(
      segBreaths.every((b) => b.segmentCount === 3),
      `salutation: segmentCount must be 3`,
    );
  }
  // totalMs = 27 breaths * 5000 + 2 transitions * 3000 = 135000 + 6000 = 141000
  check(
    plan.totalMs === 141000,
    `salutation: totalMs expected 141000, got ${plan.totalMs}`,
  );
}

// ---------------------------------------------------------------------------
// 4. Two different poses: NO transition before the very first step; a
//    transition exists between the two poses with a cue starting "Next:".
// ---------------------------------------------------------------------------
{
  const a = makePose({ english: 'Alpha Pose', breaths: 3 });
  const b = makePose({ english: 'Beta Pose', breaths: 3 });
  const plan = buildGuidedPlan([a, b], 5);

  check(
    plan.steps[0].kind === 'breath',
    `two-pose: the very first step of the whole plan must NOT be a transition`,
  );
  const transitions = plan.steps.filter(isTransition);
  check(
    transitions.length === 1,
    `two-pose: expected 1 between-pose transition, got ${transitions.length}`,
  );
  const t = transitions[0];
  check(
    t.cue === 'Next: Beta Pose',
    `two-pose: cue must be "Next: Beta Pose", got "${t?.cue}"`,
  );
  check(
    t.cue.startsWith('Next:'),
    `two-pose: between-pose cue must start with "Next:"`,
  );
  check(
    t.fromPoseIndex === 0 && t.toPoseIndex === 1,
    `two-pose: transition must go from pose 0 to pose 1 ` +
      `(got from ${t?.fromPoseIndex} to ${t?.toPoseIndex})`,
  );
  check(
    t.toPose.english === 'Beta Pose',
    `two-pose: transition.toPose must be Beta Pose`,
  );
  // The transition sits between the two poses (after A's 3 breaths).
  const transitionIndex = plan.steps.findIndex(isTransition);
  check(
    transitionIndex === 3,
    `two-pose: transition must sit after pose A's 3 breaths (index 3), got ${transitionIndex}`,
  );
}

// ---------------------------------------------------------------------------
// 5. totalMs consistency against sequenceDurationSeconds, with the EXACT
//    side-transition delta computed from the catalog.
//
//    guidedTotalSeconds
//      === sequenceDurationSeconds(poses, bs)
//        + (Σ repeat * (sides - 1)) * TRANSITION_SECONDS
//
//    In the current catalog every 2-sided pose has repeat === 1, so the delta
//    is simply (number of 2-sided poses) * TRANSITION_SECONDS.
// ---------------------------------------------------------------------------
{
  const bs = DEFAULT_BREATH_SECONDS;
  const plan = buildGuidedPlan(poses, bs);

  // guided plan uses breathSeconds/2 per half -> per breath == breathSeconds
  // exactly, so totalMs is an integer number of ms and divides cleanly.
  const guidedSeconds = plan.totalMs / 1000;
  const baseSeconds = sequenceDurationSeconds(poses, bs);

  // extra side-transitions the guided plan inserts that timing.ts does not.
  let extraSideTransitions = 0;
  for (const p of poses) extraSideTransitions += p.repeat * (p.sides - 1);
  const twoSidedCount = poses.filter((p) => p.sides === 2).length;

  // Sanity: in this catalog the delta reduces to the 2-sided pose count.
  check(
    extraSideTransitions === twoSidedCount,
    `catalog: extra side-transitions (${extraSideTransitions}) should equal ` +
      `the 2-sided pose count (${twoSidedCount}) since all 2-sided poses ` +
      `have repeat === 1`,
  );

  const expectedSeconds = baseSeconds + extraSideTransitions * TRANSITION_SECONDS;
  check(
    guidedSeconds === expectedSeconds,
    `catalog: guided totalMs/1000 (${guidedSeconds}) must equal ` +
      `sequenceDurationSeconds (${baseSeconds}) + ${extraSideTransitions} ` +
      `side-transitions * ${TRANSITION_SECONDS}s (= ${expectedSeconds})`,
  );

  // totalMs must equal the independent sum of every step's own duration.
  let recomputedMs = 0;
  for (const step of plan.steps) {
    if (step.kind === 'breath') recomputedMs += step.inhaleMs + step.exhaleMs;
    else recomputedMs += step.seconds * 1000;
  }
  check(
    recomputedMs === plan.totalMs,
    `catalog: recomputed step-sum (${recomputedMs}) must equal reported ` +
      `totalMs (${plan.totalMs})`,
  );

  // report the reconciliation for the human reading test output
  console.log(
    `reconciliation @ ${bs}s/breath: guided=${guidedSeconds}s, ` +
      `base=${baseSeconds}s, delta=${extraSideTransitions} side-transitions ` +
      `x ${TRANSITION_SECONDS}s = ${extraSideTransitions * TRANSITION_SECONDS}s ` +
      `(2-sided poses in catalog: ${twoSidedCount})`,
  );
}

// ---------------------------------------------------------------------------
// 6. Empty sequence -> empty plan, zero total.
// ---------------------------------------------------------------------------
{
  const plan = buildGuidedPlan([], 5);
  check(plan.steps.length === 0, `empty: expected 0 steps, got ${plan.steps.length}`);
  check(plan.totalMs === 0, `empty: expected totalMs 0, got ${plan.totalMs}`);
  check(plan.breathSeconds === 5, `empty: breathSeconds must be echoed back`);
}

// --- report ---
if (failures.length > 0) {
  console.error(`\n=== GUIDED PLAN TESTS FAILED (${failures.length}) ===`);
  for (const f of failures) console.error(`  \u2717 ${f}`);
  console.error(`\n(${assertionCount} assertions run)`);
  process.exit(1);
}

console.log('ALL GUIDED PLAN TESTS PASSED');
console.log(`${assertionCount} assertions run.`);
