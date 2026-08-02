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
  TRANSITION_SAME_POSE_SECONDS,
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
    isBasic: false,
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
  // totalMs = 10 breaths * 5000 + 1 same-pose (switch-sides) transition * 1000
  //         = 50000 + 1000 = 51000
  check(plan.totalMs === 51000, `2-sided: totalMs expected 51000, got ${plan.totalMs}`);
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
  // totalMs = 27 breaths * 5000 + 2 same-pose (next-round) transitions * 1000
  //         = 135000 + 2000 = 137000
  check(
    plan.totalMs === 137000,
    `salutation: totalMs expected 137000, got ${plan.totalMs}`,
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
//    side-transition delta computed from the catalog under the VARIABLE model.
//
//    The between-pose transitions are identical in both computations (same
//    `transitionSecondsBetween` model, same 3s/8s tiers), so they cancel. The
//    only delta is the extra SAME-pose side/round transitions the guided plan
//    inserts between segments of a multi-segment pose, at 1s each:
//
//    guidedTotalSeconds
//      === sequenceDurationSeconds(poses, bs)
//        + (Σ repeat * (sides - 1)) * TRANSITION_SAME_POSE_SECONDS
//
//    In the current catalog every 2-sided pose has repeat === 1, so the delta
//    is simply (number of 2-sided poses) * TRANSITION_SAME_POSE_SECONDS.
// ---------------------------------------------------------------------------
{
  const bs = DEFAULT_BREATH_SECONDS;
  const plan = buildGuidedPlan(poses, bs);

  // guided plan uses breathSeconds/2 per half -> per breath == breathSeconds
  // exactly, so totalMs is an integer number of ms and divides cleanly.
  const guidedSeconds = plan.totalMs / 1000;
  const baseSeconds = sequenceDurationSeconds(poses, bs);

  // extra same-pose side/round transitions the guided plan inserts that
  // timing.ts does not.
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

  const expectedSeconds =
    baseSeconds + extraSideTransitions * TRANSITION_SAME_POSE_SECONDS;
  check(
    guidedSeconds === expectedSeconds,
    `catalog: guided totalMs/1000 (${guidedSeconds}) must equal ` +
      `sequenceDurationSeconds (${baseSeconds}) + ${extraSideTransitions} ` +
      `same-pose side-transitions * ${TRANSITION_SAME_POSE_SECONDS}s ` +
      `(= ${expectedSeconds})`,
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
      `base=${baseSeconds}s, delta=${extraSideTransitions} same-pose ` +
      `side-transitions x ${TRANSITION_SAME_POSE_SECONDS}s = ` +
      `${extraSideTransitions * TRANSITION_SAME_POSE_SECONDS}s ` +
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

// ---------------------------------------------------------------------------
// 7. Salutation vinyasa flow expansion (Surya A, 14 breaths): sub-pose labels in
//    order, per-flow-step breath counts, the `last_breath` cue on the Down Dog
//    hold's 5th breath, the `step_jump_forward` cue on the jump-forward BREATH
//    step (flow step 7), and the `samasthiti` cue on the closing Samasthiti
//    return breath (flow step 10) — all data-driven breath cues.
// ---------------------------------------------------------------------------
{
  const suryaA = poses.find((p) => p.id === 'surya_namaskara_a');
  check(suryaA !== undefined, `flow: surya_namaskara_a must exist in the catalog`);
  check(
    !!suryaA && suryaA.flow !== undefined && suryaA.flow.length === 10,
    `flow: surya_namaskara_a should carry a 10-entry flow`,
  );
  // Invariant the whole feature rests on: flow breaths sum to pose.breaths (14).
  const flowSumA =
    suryaA?.flow?.reduce((n, s) => n + s.breaths, 0) ?? -1;
  check(
    flowSumA === (suryaA?.breaths ?? -2),
    `flow: Surya A flow breaths (${flowSumA}) must equal pose.breaths ` +
      `(${suryaA?.breaths})`,
  );
  check(flowSumA === 14, `flow: Surya A flow must sum to 14 breaths (got ${flowSumA})`);

  // Flow labels are exactly the authentic choreography, in order, ending with
  // the Samasthiti return breath.
  check(
    suryaA?.flow?.map((s) => s.label).join('|') ===
      [
        'Urdhva Hastasana',
        'Uttanasana',
        'Ardha Uttanasana',
        'Chaturanga Dandasana',
        'Urdhva Mukha Svanasana',
        'Adho Mukha Svanasana',
        'Ardha Uttanasana',
        'Uttanasana',
        'Urdhva Hastasana',
        'Samasthiti',
      ].join('|'),
    `flow: Surya A flow labels must match the authentic choreography in order`,
  );
  // Per-flow-step breath counts: all 1 except the Down Dog hold (5).
  check(
    suryaA?.flow?.map((s) => s.breaths).join(',') === '1,1,1,1,1,5,1,1,1,1',
    `flow: Surya A per-step breaths must be 1,1,1,1,1,5,1,1,1,1`,
  );
  // The final flow step is the Samasthiti return breath carrying the samasthiti
  // cue on its first (only) breath.
  const samasthitiStepA = suryaA?.flow?.[suryaA.flow.length - 1];
  check(
    !!samasthitiStepA &&
      samasthitiStepA.label === 'Samasthiti' &&
      samasthitiStepA.breaths === 1 &&
      samasthitiStepA.cueId === 'samasthiti' &&
      samasthitiStepA.cueOn === 'first',
    `flow: Surya A's final flow step must be the Samasthiti return breath ` +
      `carrying the samasthiti cue on its first breath`,
  );

  const plan = buildGuidedPlan([suryaA as Pose], 5);
  const breaths = plan.steps.filter(isBreath);
  const transitions = plan.steps.filter(isTransition);

  // 3 rounds x 14 breaths = 42 breath steps; 2 between-round transitions.
  check(breaths.length === 42, `flow: Surya A expands to 42 breath steps, got ${breaths.length}`);
  check(
    transitions.length === 2,
    `flow: Surya A should have 2 between-round transitions, got ${transitions.length}`,
  );

  // Every salutation breath carries a subPoseLabel.
  check(
    breaths.every((b) => typeof b.subPoseLabel === 'string' && b.subPoseLabel.length > 0),
    `flow: every Surya A breath must carry a non-empty subPoseLabel`,
  );

  // The Down Dog hold is flow step 6: 5 breaths per round, all labelled
  // "Adho Mukha Svanasana", counted 1..5 of 5. (Surya A has a single Down Dog.)
  const holdBreaths = breaths.filter((b) => b.subPoseLabel === 'Adho Mukha Svanasana');
  check(
    holdBreaths.length === 15,
    `flow: Surya A Down Dog hold should be 5 breaths x 3 rounds = 15, got ${holdBreaths.length}`,
  );
  check(
    holdBreaths.every((b) => b.breathCount === 5),
    `flow: Down Dog hold breaths must read "of 5"`,
  );
  const firstRoundHold = breaths.filter(
    (b) => b.segmentIndex === 0 && b.subPoseLabel === 'Adho Mukha Svanasana',
  );
  check(
    firstRoundHold.map((b) => b.breathNumber).join(',') === '1,2,3,4,5',
    `flow: Down Dog hold must count 1..5 within the step ` +
      `(got ${firstRoundHold.map((b) => b.breathNumber).join(',')})`,
  );

  // `last_breath` fires on the LAST (5th) breath of each Down Dog hold — exactly
  // once per round (3 total), and only on hold breaths.
  const lastBreathCues = breaths.filter((b) => b.voiceCueId === 'last_breath');
  check(
    lastBreathCues.length === 3,
    `flow: last_breath cue should fire once per round (3 total), got ${lastBreathCues.length}`,
  );
  check(
    lastBreathCues.every(
      (b) => b.subPoseLabel === 'Adho Mukha Svanasana' && b.breathNumber === 5,
    ),
    `flow: last_breath must land on the Down Dog hold's 5th breath`,
  );

  // `step_jump_forward` is now a BREATH cue on the jump-forward step (flow step
  // 7 = the exit Ardha Uttanasana), fired once per round (3 total) on that
  // step's FIRST (and only) breath. NO transition carries a voice cue any more.
  const jumpForwardCues = breaths.filter(
    (b) => b.voiceCueId === 'step_jump_forward',
  );
  check(
    jumpForwardCues.length === 3,
    `flow: step_jump_forward should fire once per round (3 total) on a breath, ` +
      `got ${jumpForwardCues.length}`,
  );
  check(
    jumpForwardCues.every(
      (b) => b.subPoseLabel === 'Ardha Uttanasana' && b.breathNumber === 1,
    ),
    `flow: step_jump_forward must land on the jump-forward Ardha Uttanasana ` +
      `breath (breath 1 of that step)`,
  );
  // `samasthiti` fires on the closing Samasthiti return breath — once per round
  // (3 total), on that step's FIRST (and only) breath, and it is the VERY LAST
  // breath of each round.
  const samasthitiCues = breaths.filter((b) => b.voiceCueId === 'samasthiti');
  check(
    samasthitiCues.length === 3,
    `flow: samasthiti cue should fire once per round (3 total), got ${samasthitiCues.length}`,
  );
  check(
    samasthitiCues.every(
      (b) => b.subPoseLabel === 'Samasthiti' && b.breathNumber === 1,
    ),
    `flow: samasthiti must land on the Samasthiti return breath (breath 1 of ` +
      `that step)`,
  );
  // The samasthiti cue is the last breath step of each round: the 14th breath of
  // each of the 3 segments carries it and is labelled Samasthiti.
  for (let seg = 0; seg < 3; seg++) {
    const segBreaths = breaths.filter((b) => b.segmentIndex === seg);
    const lastBreath = segBreaths[segBreaths.length - 1];
    check(
      segBreaths.length === 14 &&
        lastBreath.subPoseLabel === 'Samasthiti' &&
        lastBreath.voiceCueId === 'samasthiti',
      `flow: Surya A round ${seg + 1} must be 14 breaths ending on the ` +
        `Samasthiti breath carrying the samasthiti cue`,
    );
  }
  // Only the 3 last_breath + 3 step_jump_forward + 3 samasthiti cues are tagged
  // on breaths.
  check(
    breaths.filter((b) => b.voiceCueId !== undefined).length === 9,
    `flow: exactly 9 breath cues expected (3 last_breath + 3 step_jump_forward ` +
      `+ 3 samasthiti)`,
  );

  // Non-flow legacy expansion is unchanged: a plain flow-less pose emits no
  // subPoseLabel / voiceCueId and keeps whole-segment counts.
  const plain = buildGuidedPlan([makePose({ breaths: 5 })], 5).steps.filter(isBreath);
  check(
    plain.every((b) => b.subPoseLabel === undefined && b.voiceCueId === undefined),
    `flow: flow-less poses must not carry subPoseLabel/voiceCueId`,
  );
  check(
    plain.every((b) => b.breathCount === 5),
    `flow: flow-less pose keeps whole-segment breathCount`,
  );
}

// ---------------------------------------------------------------------------
// 8. Surya B flow (22 breaths): the FINAL Down Dog is the 5-breath hold, BOTH
//    intermediate Down Dogs are present, both Warrior A sides are labelled
//    (right / left), `step_jump_forward` fires on the jump-forward BREATH step
//    (flow step 15), and the round closes with the `samasthiti` cue on the
//    Samasthiti return breath (flow step 18) — NOT on any transition.
// ---------------------------------------------------------------------------
{
  const suryaB = poses.find((p) => p.id === 'surya_namaskara_b');
  check(
    !!suryaB && suryaB.flow !== undefined && suryaB.flow.length === 18,
    `flow: surya_namaskara_b should carry an 18-entry flow`,
  );
  const flowSumB = suryaB?.flow?.reduce((n, s) => n + s.breaths, 0) ?? -1;
  check(flowSumB === 22, `flow: Surya B flow must sum to 22 breaths (got ${flowSumB})`);
  check(
    flowSumB === (suryaB?.breaths ?? -2),
    `flow: Surya B flow breaths (${flowSumB}) must equal pose.breaths (${suryaB?.breaths})`,
  );

  // The final flow step is now the Samasthiti return breath carrying the
  // samasthiti cue on its first (only) breath.
  const lastFlow = suryaB?.flow?.[suryaB.flow.length - 1];
  check(
    !!lastFlow &&
      lastFlow.label === 'Samasthiti' &&
      lastFlow.breaths === 1 &&
      lastFlow.cueId === 'samasthiti' &&
      lastFlow.cueOn === 'first',
    `flow: Surya B's final flow step must be the Samasthiti return breath ` +
      `carrying the samasthiti cue on its first breath`,
  );
  // The closing chair (Utkatasana) is now the second-to-last flow step.
  const chairFlow = suryaB?.flow?.[(suryaB?.flow?.length ?? 0) - 2];
  check(
    !!chairFlow && chairFlow.label === 'Utkatasana' && chairFlow.breaths === 1,
    `flow: Surya B's second-to-last flow step must be the closing Utkatasana ` +
      `(chair) breath`,
  );
  // The 5-breath hold is flow index 13 (14th entry), with last_breath on 'last'.
  const holdStep = suryaB?.flow?.[13];
  check(
    !!holdStep &&
      holdStep.label === 'Adho Mukha Svanasana' &&
      holdStep.hold === true &&
      holdStep.breaths === 5 &&
      holdStep.cueId === 'last_breath' &&
      holdStep.cueOn === 'last',
    `flow: Surya B's 14th flow step must be the 5-breath Down Dog hold with ` +
      `last_breath on its last breath`,
  );

  // Both intermediate Down Dogs are present: three "Adho Mukha Svanasana" steps
  // total (two single intermediates + the final 5-breath hold).
  const downDogSteps =
    suryaB?.flow?.filter((s) => s.label === 'Adho Mukha Svanasana') ?? [];
  check(
    downDogSteps.length === 3,
    `flow: Surya B must have 3 Down Dog steps (2 intermediate + 1 hold), got ` +
      `${downDogSteps.length}`,
  );

  // Both Warrior A sides are present and distinctly labelled.
  check(
    !!suryaB?.flow?.some((s) => s.label === 'Virabhadrasana A (right)') &&
      !!suryaB?.flow?.some((s) => s.label === 'Virabhadrasana A (left)'),
    `flow: Surya B must label both Warrior A sides "(right)" and "(left)"`,
  );

  // The jump-forward exit step (flow index 14, the 15th entry) carries
  // step_jump_forward on its first breath.
  const jumpForwardStep = suryaB?.flow?.[14];
  check(
    !!jumpForwardStep &&
      jumpForwardStep.label === 'Ardha Uttanasana' &&
      jumpForwardStep.breaths === 1 &&
      jumpForwardStep.cueId === 'step_jump_forward' &&
      jumpForwardStep.cueOn === 'first',
    `flow: Surya B's 15th flow step must be the jump-forward Ardha Uttanasana ` +
      `carrying step_jump_forward on its first breath`,
  );

  // A salutation followed by a plain pose: NO transition carries a voice cue,
  // and step_jump_forward fires once per round on the jump-forward breath.
  const next = makePose({ id: 'after_b', english: 'After B', breaths: 5 });
  const plan = buildGuidedPlan([suryaB as Pose, next], 5);
  const transitions = plan.steps.filter(isTransition);
  // 2 between-round transitions + 1 between-pose transition = 3.
  check(
    transitions.length === 3,
    `flow: Surya B (x3) + next pose should have 3 transitions, got ${transitions.length}`,
  );
  check(
    transitions.every((t) => (t as { voiceCueId?: string }).voiceCueId === undefined),
    `flow: no Surya B transition should carry a voice cue any more`,
  );
  const exitTransition = transitions[transitions.length - 1];
  check(
    exitTransition.cue.startsWith('Next:'),
    `flow: the between-pose exit transition should still cue "Next: ..."`,
  );

  const b = plan.steps.filter(isBreath);
  // step_jump_forward fires once per Surya B round (3 total), on the jump-forward
  // Ardha Uttanasana breath, all within Surya B (poseIndex 0).
  const jumpForwardCues = b.filter((s) => s.voiceCueId === 'step_jump_forward');
  check(
    jumpForwardCues.length === 3,
    `flow: step_jump_forward should fire 3 times (once per Surya B round), got ` +
      `${jumpForwardCues.length}`,
  );
  check(
    jumpForwardCues.every(
      (s) =>
        s.poseIndex === 0 &&
        s.subPoseLabel === 'Ardha Uttanasana' &&
        s.breathNumber === 1,
    ),
    `flow: step_jump_forward must land on Surya B's jump-forward Ardha ` +
      `Uttanasana breath`,
  );
  // samasthiti fires once per Surya B round (3 total), on the closing Samasthiti
  // return breath, all within Surya B (poseIndex 0).
  const samasthitiCuesB = b.filter((s) => s.voiceCueId === 'samasthiti');
  check(
    samasthitiCuesB.length === 3,
    `flow: samasthiti should fire 3 times (once per Surya B round), got ` +
      `${samasthitiCuesB.length}`,
  );
  check(
    samasthitiCuesB.every(
      (s) =>
        s.poseIndex === 0 &&
        s.subPoseLabel === 'Samasthiti' &&
        s.breathNumber === 1,
    ),
    `flow: samasthiti must land on Surya B's closing Samasthiti return breath`,
  );
  // The samasthiti cue is the VERY LAST breath of each Surya B round: each of the
  // 3 segments is 22 breaths and ends on the Samasthiti breath carrying the cue.
  const suryaBBreaths = b.filter((s) => s.poseIndex === 0);
  for (let seg = 0; seg < 3; seg++) {
    const segBreaths = suryaBBreaths.filter((s) => s.segmentIndex === seg);
    const lastBreath = segBreaths[segBreaths.length - 1];
    check(
      segBreaths.length === 22 &&
        lastBreath.subPoseLabel === 'Samasthiti' &&
        lastBreath.voiceCueId === 'samasthiti',
      `flow: Surya B round ${seg + 1} must be 22 breaths ending on the ` +
        `Samasthiti breath carrying the samasthiti cue`,
    );
  }
  // The next (flow-less) pose's breaths never carry a voice cue.
  check(
    b.filter((s) => s.poseIndex === 1).every((s) => s.voiceCueId === undefined),
    `flow: the following plain pose must not inherit any voice cue`,
  );
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
