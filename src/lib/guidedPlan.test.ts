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
import { buildGuidedPlan, HALF_VINYASA_FLOW } from './guidedPlan';
import type { BreathStep, TransitionStep } from './guidedPlan';
import {
  DEFAULT_BREATH_SECONDS,
  TRANSITION_SAME_POSE_SECONDS,
  sequenceDurationSeconds,
  vinyasaSeconds,
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
//    `transitionSecondsBetween` model, same 3s/8s tiers), so they cancel. Two
//    deltas remain, both derived from the catalog (never hardcoded):
//
//      (a) the extra SAME-pose side/round transitions the guided plan inserts
//          between segments of a multi-segment pose, at 1s each; and
//      (b) the half-breath ENTRY MOVEMENTS the guided plan emits for every flow
//          HOLD that carries an `enterPhase` (e.g. the held Down Dog entered on
//          an exhale). Each entry is a single half-breath (breathSeconds / 2)
//          emitted ONCE PER ROUND (pose.repeat), and it is NOT counted in the
//          card's `breaths` (which stays the whole-breath-equivalent), so
//          `sequenceDurationSeconds` / `poseHoldSeconds` do NOT include it.
//
//    guidedTotalSeconds
//      === sequenceDurationSeconds(poses, bs)
//        + (Σ repeat * (sides - 1)) * TRANSITION_SAME_POSE_SECONDS
//        + (Σ over flow HOLDs with enterPhase of repeat) * (bs / 2)
//
//    In the current catalog every 2-sided pose has repeat === 1, so delta (a)
//    is simply (number of 2-sided poses) * TRANSITION_SAME_POSE_SECONDS, and
//    delta (b) is the two held Down Dogs (Surya A step 6, Surya B step 14),
//    each once per round over 3 rounds = 6 entry half-breaths.
// ---------------------------------------------------------------------------
{
  const bs = DEFAULT_BREATH_SECONDS;
  const plan = buildGuidedPlan(poses, bs);

  // guided plan uses breathSeconds/2 per half -> at bs=5 each half is 2500ms, so
  // every step (full breath = 5000ms, single-phase movement = 2500ms, whole-
  // second transitions) is an integer number of ms. `guidedSeconds` may be
  // fractional (salutation movements are half-breaths), but it must exactly match
  // `sequenceDurationSeconds` (which uses the same fractional card `breaths`)
  // plus the two model-derived deltas below.
  const guidedSeconds = plan.totalMs / 1000;
  const baseSeconds = sequenceDurationSeconds(poses, bs);

  // (a) extra same-pose side/round transitions the guided plan inserts that
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

  // (b) entry half-breaths: one per flow HOLD carrying an `enterPhase`, emitted
  // once per round (pose.repeat). Derived from the catalog, not hardcoded.
  let entryHalfBreaths = 0;
  for (const p of poses) {
    const holdsWithEntry =
      p.flow?.filter((s) => s.phase === undefined && s.enterPhase !== undefined)
        .length ?? 0;
    entryHalfBreaths += holdsWithEntry * p.repeat;
  }
  // Sanity: exactly the two held Down Dogs (Surya A + Surya B) x 3 rounds = 6.
  check(
    entryHalfBreaths === 6,
    `catalog: entry half-breaths (${entryHalfBreaths}) should be 6 (the two ` +
      `held Down Dogs, Surya A + Surya B, each entered on an exhale once per ` +
      `round over 3 rounds)`,
  );
  const halfBreathSeconds = bs / 2;

  const expectedSeconds =
    baseSeconds +
    extraSideTransitions * TRANSITION_SAME_POSE_SECONDS +
    entryHalfBreaths * halfBreathSeconds;
  check(
    guidedSeconds === expectedSeconds,
    `catalog: guided totalMs/1000 (${guidedSeconds}) must equal ` +
      `sequenceDurationSeconds (${baseSeconds}) + ${extraSideTransitions} ` +
      `same-pose side-transitions * ${TRANSITION_SAME_POSE_SECONDS}s + ` +
      `${entryHalfBreaths} entry half-breaths * ${halfBreathSeconds}s ` +
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
      `${extraSideTransitions * TRANSITION_SAME_POSE_SECONDS}s + ` +
      `${entryHalfBreaths} entry half-breaths x ${halfBreathSeconds}s = ` +
      `${entryHalfBreaths * halfBreathSeconds}s ` +
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
// 7. Salutation vinyasa flow expansion (Surya A, half-breath movement model):
//    9 single-phase MOVEMENTS (alternating inhale/exhale) around a 5-breath Down
//    Dog HOLD that is ENTERED ON AN EXHALE. Card breaths = 9.5 (whole-breath-
//    equivalent). Movements are single half-breaths (breathSeconds/2, singlePhase
//    set, counter hidden); the Down Dog is entered with a half-breath EXHALE
//    ENTRY movement (singlePhase exhale, sharing the hold's flowIndex + label, NO
//    cue) and then HELD for 5 whole breaths counted "1..5 of 5". So per round the
//    steps are 9 vinyasa movements + 1 Down Dog entry exhale + 5 hold breaths =
//    15 breath steps (10 single-phase movements + 5 full hold breaths).
//    `last_breath` on the hold's 5th FULL breath (not the entry), and
//    `step_jump_forward` on the jump-forward inhale movement (step 7), and
//    `samasthiti` on the closing Samasthiti exhale movement (step 10).
// ---------------------------------------------------------------------------
{
  const suryaA = poses.find((p) => p.id === 'surya_namaskara_a');
  check(suryaA !== undefined, `flow: surya_namaskara_a must exist in the catalog`);
  check(
    !!suryaA && suryaA.flow !== undefined && suryaA.flow.length === 10,
    `flow: surya_namaskara_a should carry a 10-entry flow`,
  );
  // The card's breaths is the whole-breath-equivalent: 9 movement half-breaths
  // (=4.5) + the 5-breath Down Dog hold = 9.5.
  check(
    suryaA?.breaths === 9.5,
    `flow: Surya A card breaths must be 9.5 (got ${suryaA?.breaths})`,
  );
  // Half-breath invariant: movements count 1 half-breath, the hold counts
  // breaths*2; total must equal card.breaths * 2 = 19.
  const halfBreathsA =
    suryaA?.flow?.reduce(
      (n, s) => n + (s.phase !== undefined ? 1 : s.breaths * 2),
      0,
    ) ?? -1;
  check(
    halfBreathsA === (suryaA?.breaths ?? -2) * 2,
    `flow: Surya A flow half-breaths (${halfBreathsA}) must equal ` +
      `pose.breaths * 2 (${(suryaA?.breaths ?? -2) * 2})`,
  );
  check(
    halfBreathsA === 19,
    `flow: Surya A flow must sum to 19 half-breaths (got ${halfBreathsA})`,
  );

  // Flow labels are exactly the authentic choreography, in order, ending with
  // the Samasthiti return movement.
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
  // Phases: every step is a MOVEMENT except flow index 5 (the Down Dog HOLD,
  // `phase` absent). Movements alternate inhale/exhale.
  check(
    suryaA?.flow?.map((s) => s.phase ?? 'HOLD').join(',') ===
      'inhale,exhale,inhale,exhale,inhale,HOLD,inhale,exhale,inhale,exhale',
    `flow: Surya A phases must be inhale/exhale movements around the Down Dog ` +
      `HOLD (got ${suryaA?.flow?.map((s) => s.phase ?? 'HOLD').join(',')})`,
  );
  // Only the Down Dog step is a whole-breath hold (breaths 5, hold true).
  const holdStepA = suryaA?.flow?.[5];
  check(
    !!holdStepA &&
      holdStepA.label === 'Adho Mukha Svanasana' &&
      holdStepA.phase === undefined &&
      holdStepA.hold === true &&
      holdStepA.breaths === 5 &&
      holdStepA.cueId === 'last_breath' &&
      holdStepA.cueOn === 'last',
    `flow: Surya A's 6th flow step must be the 5-breath Down Dog HOLD with ` +
      `last_breath on its last breath`,
  );
  // The final flow step is the Samasthiti return EXHALE movement carrying the
  // samasthiti cue.
  const samasthitiStepA = suryaA?.flow?.[suryaA.flow.length - 1];
  check(
    !!samasthitiStepA &&
      samasthitiStepA.label === 'Samasthiti' &&
      samasthitiStepA.phase === 'exhale' &&
      samasthitiStepA.cueId === 'samasthiti',
    `flow: Surya A's final flow step must be the Samasthiti return exhale ` +
      `movement carrying the samasthiti cue`,
  );

  const plan = buildGuidedPlan([suryaA as Pose], 5);
  const breaths = plan.steps.filter(isBreath);
  const transitions = plan.steps.filter(isTransition);

  // Per round: 9 vinyasa movement steps + 1 Down Dog EXHALE ENTRY movement + 5
  // hold breath steps = 15 breath steps. x3 rounds = 45 breath steps; 2
  // between-round transitions. (The entry exhale is the extra step vs. the old
  // 14: the held Down Dog is now entered on an exhale before its 5 breaths.)
  check(breaths.length === 45, `flow: Surya A expands to 45 breath steps, got ${breaths.length}`);
  check(
    transitions.length === 2,
    `flow: Surya A should have 2 between-round transitions, got ${transitions.length}`,
  );

  // Every salutation breath carries a subPoseLabel.
  check(
    breaths.every((b) => typeof b.subPoseLabel === 'string' && b.subPoseLabel.length > 0),
    `flow: every Surya A breath must carry a non-empty subPoseLabel`,
  );

  // Movements are single half-breaths: `singlePhase` set, one of inhale/exhale
  // ms is 2500 and the other 0. 10 movements per round (the 9 vinyasa movements
  // + the 1 Down Dog EXHALE ENTRY movement) x 3 = 30 movement steps.
  const movements = breaths.filter((b) => b.singlePhase !== undefined);
  check(
    movements.length === 30,
    `flow: Surya A should have 10 movements x 3 rounds = 30 movement steps ` +
      `(9 vinyasa + 1 Down Dog entry exhale per round), got ` +
      `${movements.length}`,
  );
  check(
    movements.every(
      (b) =>
        (b.singlePhase === 'inhale' && b.inhaleMs === 2500 && b.exhaleMs === 0) ||
        (b.singlePhase === 'exhale' && b.exhaleMs === 2500 && b.inhaleMs === 0),
    ),
    `flow: each movement must be a single half-breath (2500ms) on its phase`,
  );
  // Movements carry breathNumber/breathCount 1/1 (the counter is hidden for them
  // by the player, but the fields are set for completeness).
  check(
    movements.every((b) => b.breathNumber === 1 && b.breathCount === 1),
    `flow: movements must carry breathNumber/breathCount = 1/1`,
  );

  // The Down Dog is flow step 6, entered on an EXHALE: per round there is 1
  // EXHALE ENTRY movement (singlePhase exhale) + 5 FULL hold breaths (no
  // singlePhase), all labelled "Adho Mukha Svanasana". So there are 6 steps with
  // that label per round (18 total), but the intent is a 5-breath HOLD preceded
  // by a half-breath entry - assert each precisely rather than the conflated 18.
  const downDogSteps = breaths.filter(
    (b) => b.subPoseLabel === 'Adho Mukha Svanasana',
  );
  check(
    downDogSteps.length === 18,
    `flow: Surya A Down Dog label should appear on 6 steps per round ` +
      `(1 entry exhale + 5 hold breaths) x 3 rounds = 18, got ` +
      `${downDogSteps.length}`,
  );
  // The HOLD proper: FULL breaths only (singlePhase undefined) = 5 per round x 3.
  const holdBreaths = downDogSteps.filter((b) => b.singlePhase === undefined);
  check(
    holdBreaths.length === 15,
    `flow: Surya A Down Dog HOLD should be 5 FULL breaths x 3 rounds = 15, got ` +
      `${holdBreaths.length}`,
  );
  check(
    holdBreaths.every(
      (b) =>
        b.singlePhase === undefined &&
        b.breathCount === 5 &&
        b.inhaleMs === 2500 &&
        b.exhaleMs === 2500,
    ),
    `flow: Down Dog HOLD breaths must be FULL breaths reading "of 5"`,
  );
  // The ENTRY: exactly 1 single-phase EXHALE movement with the Down Dog label
  // per round (3 total), carrying NO voice cue.
  const downDogEntries = downDogSteps.filter((b) => b.singlePhase === 'exhale');
  check(
    downDogEntries.length === 3,
    `flow: Surya A Down Dog entry should be 1 exhale movement per round x 3 ` +
      `rounds = 3, got ${downDogEntries.length}`,
  );
  check(
    downDogEntries.every(
      (b) =>
        b.singlePhase === 'exhale' &&
        b.exhaleMs === 2500 &&
        b.inhaleMs === 0 &&
        b.voiceCueId === undefined,
    ),
    `flow: each Down Dog entry must be a silent single half-breath EXHALE ` +
      `movement (no voice cue)`,
  );
  // The HOLD's FULL breaths count 1..5 within the step (the entry is NOT counted
  // in the hold's breathNumber).
  const firstRoundHold = breaths.filter(
    (b) =>
      b.segmentIndex === 0 &&
      b.subPoseLabel === 'Adho Mukha Svanasana' &&
      b.singlePhase === undefined,
  );
  check(
    firstRoundHold.map((b) => b.breathNumber).join(',') === '1,2,3,4,5',
    `flow: Down Dog HOLD must count 1..5 within the step ` +
      `(got ${firstRoundHold.map((b) => b.breathNumber).join(',')})`,
  );

  // `last_breath` fires on the LAST (5th) breath of each Down Dog hold - exactly
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

  // `step_jump_forward` is a MOVEMENT cue on the jump-forward inhale movement
  // (flow step 7 = the exit Ardha Uttanasana), fired once per round (3 total).
  // NO transition carries a voice cue.
  const jumpForwardCues = breaths.filter(
    (b) => b.voiceCueId === 'step_jump_forward',
  );
  check(
    jumpForwardCues.length === 3,
    `flow: step_jump_forward should fire once per round (3 total) on a movement, ` +
      `got ${jumpForwardCues.length}`,
  );
  check(
    jumpForwardCues.every(
      (b) => b.subPoseLabel === 'Ardha Uttanasana' && b.singlePhase === 'inhale',
    ),
    `flow: step_jump_forward must land on the jump-forward Ardha Uttanasana ` +
      `inhale movement`,
  );
  // `samasthiti` fires on the closing Samasthiti exhale MOVEMENT - once per round
  // (3 total), and it is the VERY LAST breath step of each round.
  const samasthitiCues = breaths.filter((b) => b.voiceCueId === 'samasthiti');
  check(
    samasthitiCues.length === 3,
    `flow: samasthiti cue should fire once per round (3 total), got ${samasthitiCues.length}`,
  );
  check(
    samasthitiCues.every(
      (b) => b.subPoseLabel === 'Samasthiti' && b.singlePhase === 'exhale',
    ),
    `flow: samasthiti must land on the Samasthiti exhale movement`,
  );
  // The samasthiti cue is the last breath step of each round: the 15th breath
  // step of each of the 3 segments carries it and is labelled Samasthiti. (The
  // Down Dog entry exhale was inserted mid-round, so a round is now 15 steps;
  // the ENDING is unchanged - still the Samasthiti movement with its cue.)
  for (let seg = 0; seg < 3; seg++) {
    const segBreaths = breaths.filter((b) => b.segmentIndex === seg);
    const lastBreath = segBreaths[segBreaths.length - 1];
    check(
      segBreaths.length === 15 &&
        lastBreath.subPoseLabel === 'Samasthiti' &&
        lastBreath.voiceCueId === 'samasthiti',
      `flow: Surya A round ${seg + 1} must be 15 breath steps ending on the ` +
        `Samasthiti movement carrying the samasthiti cue`,
    );
  }
  // Only the 3 last_breath + 3 step_jump_forward + 3 samasthiti cues are tagged
  // on breaths.
  check(
    breaths.filter((b) => b.voiceCueId !== undefined).length === 9,
    `flow: exactly 9 breath cues expected (3 last_breath + 3 step_jump_forward ` +
      `+ 3 samasthiti)`,
  );

  // flowIndex: every flow-derived breath carries the 0-based index of its
  // originating FlowStep in pose.flow. For the 10-entry Surya A flow (index 5 is
  // the 5-breath Down Dog HOLD, entered on an exhale), one round's 15 breath
  // steps carry the sequence 0,1,2,3,4,5,5,5,5,5,5,6,7,8,9 - flowIndex 5 now
  // appears SIX times (the 1 EXHALE ENTRY movement + the 5 consecutive hold
  // breaths, since the entry shares the hold's index), and the movements around
  // it map 1:1.
  const expectedFlowIndexSeq = [0, 1, 2, 3, 4, 5, 5, 5, 5, 5, 5, 6, 7, 8, 9];
  for (let seg = 0; seg < 3; seg++) {
    const segBreaths = breaths.filter((b) => b.segmentIndex === seg);
    check(
      segBreaths.map((b) => b.flowIndex).join(',') ===
        expectedFlowIndexSeq.join(','),
      `flow: Surya A round ${seg + 1} flowIndex sequence must be ` +
        `${expectedFlowIndexSeq.join(',')} (got ` +
        `${segBreaths.map((b) => b.flowIndex).join(',')})`,
    );
  }
  // (a) The Down Dog entry + hold all share ONE flowIndex (5), so a strip
  // highlights a single flow position for the whole entry + hold. There are SIX
  // such steps per round: the 1 EXHALE ENTRY movement + the 5 hold breaths.
  const firstRoundDownDog = breaths.filter(
    (b) => b.segmentIndex === 0 && b.subPoseLabel === 'Adho Mukha Svanasana',
  );
  check(
    firstRoundDownDog.length === 6 &&
      firstRoundDownDog.every((b) => b.flowIndex === 5),
    `flow: the Down Dog entry + hold (6 steps: 1 entry exhale + 5 hold breaths) ` +
      `must all share flowIndex 5 ` +
      `(got ${firstRoundDownDog.map((b) => b.flowIndex).join(',')})`,
  );

  // === LOCK-IN: the held Down Dog is ENTERED ON AN EXHALE (issue #5). ===
  // These assertions fail if the entry exhale movement regresses (e.g. if the
  // planner stops emitting it, emits it as an inhale, or misplaces it). They pin
  // the exact ordering around the FIRST hold breath of each round.
  for (let seg = 0; seg < 3; seg++) {
    const segBreaths = breaths.filter((b) => b.segmentIndex === seg);
    // The first FULL hold breath (singlePhase undefined, Down Dog label).
    const firstHoldIdx = segBreaths.findIndex(
      (b) =>
        b.subPoseLabel === 'Adho Mukha Svanasana' && b.singlePhase === undefined,
    );
    check(
      firstHoldIdx >= 2,
      `lock-in: Surya A round ${seg + 1} must have at least 2 steps before the ` +
        `first Down Dog hold breath (Up Dog inhale + Down Dog entry exhale)`,
    );
    const entry = segBreaths[firstHoldIdx - 1];
    const beforeEntry = segBreaths[firstHoldIdx - 2];
    const firstHold = segBreaths[firstHoldIdx];
    const afterHoldIdx =
      firstHoldIdx +
      segBreaths
        .slice(firstHoldIdx)
        .filter(
          (b) =>
            b.subPoseLabel === 'Adho Mukha Svanasana' &&
            b.singlePhase === undefined,
        ).length;
    const afterHold = segBreaths[afterHoldIdx];

    // The step immediately BEFORE the first hold breath is a single half-breath
    // EXHALE movement, same Down Dog label + flowIndex (5), carrying NO cue.
    check(
      entry.singlePhase === 'exhale' &&
        entry.subPoseLabel === 'Adho Mukha Svanasana' &&
        entry.flowIndex === firstHold.flowIndex &&
        entry.flowIndex === 5 &&
        entry.inhaleMs === 0 &&
        entry.exhaleMs === 2500 &&
        entry.voiceCueId === undefined,
      `lock-in: Surya A round ${seg + 1} - the step before the first Down Dog ` +
        `hold breath must be a silent EXHALE entry movement sharing flowIndex 5 ` +
        `(got singlePhase=${entry.singlePhase}, label=${entry.subPoseLabel}, ` +
        `flowIndex=${entry.flowIndex}, cue=${entry.voiceCueId})`,
    );
    // The step BEFORE the entry (Up Dog) is a single-phase INHALE movement.
    check(
      beforeEntry.singlePhase === 'inhale' &&
        beforeEntry.subPoseLabel === 'Urdhva Mukha Svanasana',
      `lock-in: Surya A round ${seg + 1} - the step before the Down Dog entry ` +
        `must be the Up Dog inhale movement (got ` +
        `singlePhase=${beforeEntry.singlePhase}, label=${beforeEntry.subPoseLabel})`,
    );
    // The step AFTER the hold (jump forward) is a single-phase INHALE movement.
    check(
      afterHold.singlePhase === 'inhale' &&
        afterHold.subPoseLabel === 'Ardha Uttanasana',
      `lock-in: Surya A round ${seg + 1} - the step after the Down Dog hold must ` +
        `be the jump-forward inhale movement (got ` +
        `singlePhase=${afterHold?.singlePhase}, label=${afterHold?.subPoseLabel})`,
    );
    // The `last_breath` cue is on the hold's LAST full breath, NOT on the entry.
    const lastHold = segBreaths[afterHoldIdx - 1];
    check(
      lastHold.singlePhase === undefined &&
        lastHold.breathNumber === 5 &&
        lastHold.voiceCueId === 'last_breath',
      `lock-in: Surya A round ${seg + 1} - last_breath must be on the hold's ` +
        `5th FULL breath, not the entry (got breathNumber=${lastHold.breathNumber}, ` +
        `singlePhase=${lastHold.singlePhase}, cue=${lastHold.voiceCueId})`,
    );
    check(
      entry.voiceCueId === undefined,
      `lock-in: Surya A round ${seg + 1} - the Down Dog entry movement must ` +
        `carry NO voice cue (the cue stays on the hold's breaths)`,
    );
  }

  // (b) flowIndex values are 0-based and match pose.flow positions: the
  // originating flow step at each breath's flowIndex must have the same label.
  check(
    breaths.every((b) => {
      const fs = suryaA?.flow?.[b.flowIndex as number];
      return fs !== undefined && fs.label === b.subPoseLabel;
    }),
    `flow: each breath's flowIndex must point at the FlowStep whose label ` +
      `matches its subPoseLabel`,
  );
  // Every flow breath carries a defined, in-range flowIndex.
  check(
    breaths.every(
      (b) =>
        typeof b.flowIndex === 'number' &&
        b.flowIndex >= 0 &&
        b.flowIndex < (suryaA?.flow?.length ?? 0),
    ),
    `flow: every Surya A breath must carry an in-range 0-based flowIndex`,
  );
  // pose.flow is reachable from a BreathStep (it carries `pose`), so a strip can
  // read step.pose.flow.length for "N of M" without a separate flowCount field.
  check(
    breaths.every((b) => b.pose.flow?.length === 10),
    `flow: pose.flow must be reachable from a BreathStep (length 10) so no ` +
      `separate flowCount field is needed`,
  );

  // Non-flow legacy expansion is unchanged: a plain flow-less pose emits no
  // subPoseLabel / voiceCueId / singlePhase and keeps whole-segment counts.
  const plain = buildGuidedPlan([makePose({ breaths: 5 })], 5).steps.filter(isBreath);
  check(
    plain.every(
      (b) =>
        b.subPoseLabel === undefined &&
        b.voiceCueId === undefined &&
        b.singlePhase === undefined,
    ),
    `flow: flow-less poses must not carry subPoseLabel/voiceCueId/singlePhase`,
  );
  // (c) Non-flow poses carry an undefined flowIndex.
  check(
    plain.every((b) => b.flowIndex === undefined),
    `flow: flow-less poses must not carry a flowIndex`,
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
//    Samasthiti return breath (flow step 18) - NOT on any transition.
// ---------------------------------------------------------------------------
{
  const suryaB = poses.find((p) => p.id === 'surya_namaskara_b');
  check(
    !!suryaB && suryaB.flow !== undefined && suryaB.flow.length === 18,
    `flow: surya_namaskara_b should carry an 18-entry flow`,
  );
  // Half-breath invariant: movements count 1 half-breath, the hold counts
  // breaths*2; total must equal card.breaths * 2 = 27 (17 movement half-breaths
  // + a 5-breath Down Dog hold = 10 half-breaths).
  const halfBreathsB =
    suryaB?.flow?.reduce(
      (n, s) => n + (s.phase !== undefined ? 1 : s.breaths * 2),
      0,
    ) ?? -1;
  check(
    halfBreathsB === (suryaB?.breaths ?? -2) * 2,
    `flow: Surya B flow half-breaths (${halfBreathsB}) must equal ` +
      `pose.breaths * 2 (${(suryaB?.breaths ?? -2) * 2})`,
  );
  check(
    halfBreathsB === 27,
    `flow: Surya B flow must sum to 27 half-breaths (got ${halfBreathsB})`,
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
  // 3 segments is 23 breaths and ends on the Samasthiti breath carrying the cue.
  // (Surya B's FINAL Down Dog is now entered on an exhale, adding 1 entry
  // movement per round vs. the old 22; the ending is unchanged.)
  const suryaBBreaths = b.filter((s) => s.poseIndex === 0);
  for (let seg = 0; seg < 3; seg++) {
    const segBreaths = suryaBBreaths.filter((s) => s.segmentIndex === seg);
    const lastBreath = segBreaths[segBreaths.length - 1];
    check(
      segBreaths.length === 23 &&
        lastBreath.subPoseLabel === 'Samasthiti' &&
        lastBreath.voiceCueId === 'samasthiti',
      `flow: Surya B round ${seg + 1} must be 23 breaths ending on the ` +
        `Samasthiti breath carrying the samasthiti cue`,
    );
  }
  // The next (flow-less) pose's breaths never carry a voice cue.
  check(
    b.filter((s) => s.poseIndex === 1).every((s) => s.voiceCueId === undefined),
    `flow: the following plain pose must not inherit any voice cue`,
  );

  // === LOCK-IN: Surya B's FINAL Down Dog is ENTERED ON AN EXHALE (issue #5). ===
  // The final Down Dog is flow index 13 (the 5-breath HOLD). Per round it must
  // now be a single-phase EXHALE ENTRY movement (sharing flowIndex 13 + the Down
  // Dog label, NO cue) immediately followed by its 5 FULL hold breaths.
  for (let seg = 0; seg < 3; seg++) {
    const segBreaths = suryaBBreaths.filter((s) => s.segmentIndex === seg);
    // All steps at flowIndex 13 = the final Down Dog: 1 entry exhale + 5 holds.
    const finalDownDog = segBreaths.filter((s) => s.flowIndex === 13);
    check(
      finalDownDog.length === 6 &&
        finalDownDog.every((s) => s.subPoseLabel === 'Adho Mukha Svanasana'),
      `lock-in: Surya B round ${seg + 1} - the final Down Dog (flowIndex 13) ` +
        `must be 6 steps (1 entry exhale + 5 hold breaths), got ` +
        `${finalDownDog.length}`,
    );
    const finalEntry = finalDownDog[0];
    const finalHoldBreaths = finalDownDog.slice(1);
    // The FIRST of them is the silent EXHALE entry movement (no cue).
    check(
      finalEntry.singlePhase === 'exhale' &&
        finalEntry.inhaleMs === 0 &&
        finalEntry.exhaleMs === 2500 &&
        finalEntry.flowIndex === 13 &&
        finalEntry.voiceCueId === undefined,
      `lock-in: Surya B round ${seg + 1} - the final Down Dog entry must be a ` +
        `silent EXHALE movement sharing flowIndex 13 (got ` +
        `singlePhase=${finalEntry.singlePhase}, flowIndex=${finalEntry.flowIndex}, ` +
        `cue=${finalEntry.voiceCueId})`,
    );
    // The following 5 are FULL hold breaths counted 1..5; last_breath on the 5th.
    check(
      finalHoldBreaths.length === 5 &&
        finalHoldBreaths.every((s) => s.singlePhase === undefined) &&
        finalHoldBreaths.map((s) => s.breathNumber).join(',') === '1,2,3,4,5',
      `lock-in: Surya B round ${seg + 1} - the final Down Dog hold must be 5 ` +
        `FULL breaths counted 1..5 (got ` +
        `${finalHoldBreaths.map((s) => s.breathNumber).join(',')})`,
    );
    check(
      finalHoldBreaths[4].voiceCueId === 'last_breath',
      `lock-in: Surya B round ${seg + 1} - last_breath must be on the final ` +
        `Down Dog hold's 5th breath, not the entry`,
    );
  }

  // === LOCK-IN: the INTERMEDIATE Down Dogs (flow steps 6, 10) are UNCHANGED. ===
  // They must remain SINGLE EXHALE movements (breathNumber 1) and NOT gain a
  // duplicate entry movement - only the FINAL held Down Dog is entered on an
  // exhale. flow index 5 = step 6, flow index 9 = step 10.
  for (const idx of [5, 9]) {
    const intermediate = suryaBBreaths.filter((s) => s.flowIndex === idx);
    check(
      intermediate.length === 3 &&
        intermediate.every(
          (s) =>
            s.subPoseLabel === 'Adho Mukha Svanasana' &&
            s.singlePhase === 'exhale' &&
            s.inhaleMs === 0 &&
            s.exhaleMs === 2500 &&
            s.breathNumber === 1 &&
            s.voiceCueId === undefined,
        ),
      `lock-in: Surya B intermediate Down Dog (flowIndex ${idx}) must stay a ` +
        `single silent EXHALE movement (1 per round x 3 = 3, breathNumber 1, no ` +
        `duplicate entry), got ${intermediate.length} steps ` +
        `[${intermediate.map((s) => `${s.singlePhase}/${s.breathNumber}`).join(', ')}]`,
    );
  }
}

// ---------------------------------------------------------------------------
// 9. Vinyasas toggle: a half-vinyasa is inserted BETWEEN two consecutive
//    DISTINCT SEATED poses (replacing the plain transition) - and ONLY there.
//    Verifies: correct 4 movement steps (labels + phases exhale/inhale/exhale/
//    inhale, single-phase, silent); NONE with vinyasas OFF; none standing->
//    seated, none seated->closing, none between the two SIDES of a seated pose;
//    and the reconciliation identity holds for BOTH vinyasas on and off on a
//    synthetic seated sequence.
// ---------------------------------------------------------------------------
{
  const seatedA = makePose({
    english: 'Seated A',
    category: 'seated',
    breaths: 5,
  });
  const seatedB = makePose({
    english: 'Seated B',
    category: 'seated',
    breaths: 5,
  });

  const VINYASA_LABELS = HALF_VINYASA_FLOW.map((s) => s.label);
  const VINYASA_PHASES = HALF_VINYASA_FLOW.map((s) => s.phase);

  // Sanity: the shared definition is the confirmed 4-movement mini-flow.
  check(
    VINYASA_LABELS.join('|') ===
      [
        'Chaturanga Dandasana',
        'Urdhva Mukha Svanasana',
        'Adho Mukha Svanasana',
        'Jump through',
      ].join('|'),
    `vinyasa: HALF_VINYASA_FLOW labels must be the confirmed choreography ` +
      `(got ${VINYASA_LABELS.join('|')})`,
  );
  check(
    VINYASA_PHASES.join(',') === 'exhale,inhale,exhale,inhale',
    `vinyasa: HALF_VINYASA_FLOW phases must be exhale,inhale,exhale,inhale ` +
      `(got ${VINYASA_PHASES.join(',')})`,
  );

  // --- 9a. vinyasas OFF: no vinyasa steps, a plain transition between them. ---
  {
    const plan = buildGuidedPlan([seatedA, seatedB], 5); // default: vinyasas off
    const breaths = plan.steps.filter(isBreath);
    const transitions = plan.steps.filter(isTransition);
    check(
      breaths.every((b) => b.subPoseLabel === undefined),
      `vinyasa OFF: no breath step should carry a vinyasa subPoseLabel`,
    );
    check(
      transitions.length === 1 && transitions[0].cue === 'Next: Seated B',
      `vinyasa OFF: a single plain "Next:" transition sits between the poses`,
    );
    // 10 plain breaths, no movements.
    check(
      breaths.length === 10 && breaths.every((b) => b.singlePhase === undefined),
      `vinyasa OFF: two 5-breath seated poses expand to 10 full breaths`,
    );
  }

  // --- 9b. vinyasas ON: the 4 movement steps replace the transition. ---
  {
    const plan = buildGuidedPlan([seatedA, seatedB], 5, { vinyasas: true });
    const breaths = plan.steps.filter(isBreath);
    const transitions = plan.steps.filter(isTransition);

    // The plain between-pose transition is REPLACED by the vinyasa, so there
    // are NO transition steps at all in this two-seated-pose plan.
    check(
      transitions.length === 0,
      `vinyasa ON: the seated->seated transition is replaced by the vinyasa ` +
        `(expected 0 transitions, got ${transitions.length})`,
    );

    const vinyasaSteps = breaths.filter((b) =>
      VINYASA_LABELS.includes(b.subPoseLabel ?? ''),
    );
    check(
      vinyasaSteps.length === 4,
      `vinyasa ON: exactly 4 half-vinyasa movement steps inserted (got ` +
        `${vinyasaSteps.length})`,
    );
    check(
      vinyasaSteps.map((b) => b.subPoseLabel).join('|') ===
        VINYASA_LABELS.join('|'),
      `vinyasa ON: the 4 steps carry the vinyasa labels in order`,
    );
    check(
      vinyasaSteps.map((b) => b.singlePhase).join(',') ===
        'exhale,inhale,exhale,inhale',
      `vinyasa ON: the 4 steps are single-phase movements ` +
        `exhale/inhale/exhale/inhale`,
    );
    check(
      vinyasaSteps.every(
        (b) =>
          (b.singlePhase === 'inhale' &&
            b.inhaleMs === 2500 &&
            b.exhaleMs === 0) ||
          (b.singlePhase === 'exhale' &&
            b.exhaleMs === 2500 &&
            b.inhaleMs === 0),
      ),
      `vinyasa ON: each movement is a single half-breath (2500ms) on its phase`,
    );
    check(
      vinyasaSteps.every((b) => b.voiceCueId === undefined),
      `vinyasa ON: half-vinyasa movements are silent (no voice cue)`,
    );
    // Half-vinyasa steps are out of scope for the flow strip: flowIndex stays
    // undefined so it never collides with a real pose's flow semantics.
    check(
      vinyasaSteps.every((b) => b.flowIndex === undefined),
      `vinyasa ON: half-vinyasa movements must not carry a flowIndex`,
    );
    // The vinyasa sits BETWEEN the two poses: after Seated A's 5 breaths, before
    // Seated B's 5 breaths. It is tagged to the ENTERED pose (Seated B / index 1).
    check(
      vinyasaSteps.every((b) => b.poseIndex === 1),
      `vinyasa ON: the vinyasa movements are tagged to the entered pose (index 1)`,
    );
    const firstVinyasaIdx = plan.steps.findIndex(
      (s) => s.kind === 'breath' && (s as BreathStep).subPoseLabel === 'Chaturanga Dandasana',
    );
    check(
      firstVinyasaIdx === 5,
      `vinyasa ON: the vinyasa begins right after Seated A's 5 breaths (index 5)`,
    );
  }

  // --- 9c. NO vinyasa on non-seated boundaries. ---
  {
    const standing = makePose({
      english: 'Standing',
      category: 'standing',
      breaths: 5,
    });
    const seated = makePose({
      english: 'Seated',
      category: 'seated',
      breaths: 5,
    });
    const closing = makePose({
      english: 'Closing',
      category: 'closing',
      breaths: 5,
    });
    // standing -> seated -> closing, vinyasas ON.
    const plan = buildGuidedPlan([standing, seated, closing], 5, {
      vinyasas: true,
    });
    const breaths = plan.steps.filter(isBreath);
    const vinyasaSteps = breaths.filter((b) =>
      HALF_VINYASA_FLOW.map((s) => s.label).includes(b.subPoseLabel ?? ''),
    );
    check(
      vinyasaSteps.length === 0,
      `vinyasa boundaries: NO vinyasa on standing->seated or seated->closing ` +
        `(got ${vinyasaSteps.length})`,
    );
    // Both boundaries keep normal transitions (standing->seated and seated->
    // closing are both section changes → 2 transitions).
    check(
      plan.steps.filter(isTransition).length === 2,
      `vinyasa boundaries: both non-seated boundaries keep a plain transition`,
    );
  }

  // --- 9d. NO vinyasa between the two SIDES of a single 2-sided seated pose. ---
  {
    const twoSidedSeated = makePose({
      english: 'Two-sided Seated',
      category: 'seated',
      breaths: 5,
      sides: 2,
    });
    const plan = buildGuidedPlan([twoSidedSeated], 5, { vinyasas: true });
    const breaths = plan.steps.filter(isBreath);
    const transitions = plan.steps.filter(isTransition);
    const vinyasaSteps = breaths.filter((b) =>
      HALF_VINYASA_FLOW.map((s) => s.label).includes(b.subPoseLabel ?? ''),
    );
    check(
      vinyasaSteps.length === 0,
      `vinyasa sides: NO vinyasa between the two sides of one seated pose`,
    );
    check(
      transitions.length === 1 && transitions[0].cue === 'Switch sides',
      `vinyasa sides: the side switch stays a plain "Switch sides" transition`,
    );
  }

  // --- 9e. reconciliation identity holds for BOTH vinyasas on and off. ---
  //     guidedTotalSeconds
  //       === sequenceDurationSeconds(seq, bs, {vinyasas}) + sideDelta
  //     where sideDelta = Σ repeat*(sides-1) * TRANSITION_SAME_POSE_SECONDS.
  {
    const bs = DEFAULT_BREATH_SECONDS;
    // A 4-pose seated run (3 seated->seated adjacencies) plus a 2-sided seated
    // pose to exercise the side-delta, and a standing lead-in + closing tail so
    // the seated block has non-seated neighbours.
    const seq = [
      makePose({ english: 'Lead Standing', category: 'standing', breaths: 5 }),
      makePose({ english: 'S1', category: 'seated', breaths: 5 }),
      makePose({ english: 'S2', category: 'seated', breaths: 5, sides: 2 }),
      makePose({ english: 'S3', category: 'seated', breaths: 5 }),
      makePose({ english: 'Tail Closing', category: 'closing', breaths: 5 }),
    ];
    for (const vinyasas of [false, true]) {
      const plan = buildGuidedPlan(seq, bs, { vinyasas });
      const guidedSeconds = plan.totalMs / 1000;
      const base = sequenceDurationSeconds(seq, bs, { vinyasas });
      let sideDelta = 0;
      for (const p of seq) sideDelta += p.repeat * (p.sides - 1);
      const expected = base + sideDelta * TRANSITION_SAME_POSE_SECONDS;
      check(
        guidedSeconds === expected,
        `vinyasa reconciliation (vinyasas=${vinyasas}): guided=${guidedSeconds}s ` +
          `must equal base=${base}s + sideDelta=${sideDelta}*` +
          `${TRANSITION_SAME_POSE_SECONDS}s (=${expected})`,
      );
    }

    // Sanity: turning vinyasas ON must ADD time - exactly 3 seated->seated
    // adjacencies (S1->S2, S2->S3; note S2 is one pose with two sides, and the
    // S1->S2 / S2->S3 pairs are the two distinct-seated adjacencies) each
    // swapping a 3s in-section gap for a vinyasa (2*bs seconds).
    const off = buildGuidedPlan(seq, bs, { vinyasas: false }).totalMs / 1000;
    const on = buildGuidedPlan(seq, bs, { vinyasas: true }).totalMs / 1000;
    const seatedAdjacencies = 2; // S1->S2 and S2->S3
    const expectedDelta =
      seatedAdjacencies * (vinyasaSeconds(bs) - 3); // 3s = TRANSITION_SIMILAR
    check(
      on - off === expectedDelta,
      `vinyasa delta: turning vinyasas on must add ` +
        `${expectedDelta}s (2 seated adjacencies * (vinyasa - 3s)); got ` +
        `${on - off}s`,
    );
  }
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
