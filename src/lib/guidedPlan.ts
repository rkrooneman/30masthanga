/**
 * Guided-practice planner.
 *
 * SLICE 5a SCOPE: pure logic only. No UI, no React, no timers.
 *
 * Turns a practice (an ordered `Pose[]` + a seconds-per-breath pace) into a
 * FLAT timeline of renderable `GuidedStep`s so the guided screen (Slice 5b) can
 * play the practice by walking the array — never re-deriving side/round/breath
 * logic itself.
 *
 * === the practice model ===
 * Each pose is performed `sides` (1 or 2) times AND `repeat` (salutations = 3)
 * times back-to-back, so a pose is split into `sides * repeat` SEGMENTS. Each
 * segment is `breaths` breaths. A normal breath is inhale-then-exhale on a 50/50
 * split (at 5s/breath: 2.5s in, 2.5s out).
 *
 * Salutation flows are the exception: a vinyasa MOVEMENT is a single breath
 * PHASE (one inhale OR one exhale, `breathSeconds / 2`) — see the salutation
 * section below.
 *
 * A countdown is inserted BEFORE every segment except the very first segment of
 * the whole practice — that covers switching sides, moving to the next
 * salutation round, AND moving to the next pose. There is no leading transition
 * before the first breath and no trailing transition after the final breath.
 *
 * === variable transition durations ===
 * Each transition's length is computed by the centralized model in timing.ts
 * (`transitionSecondsBetween`), so the runtime and the generator budget always
 * agree:
 *   - a transition into a LATER segment of the SAME pose (switch sides / next
 *     round) is a same-pose transition → `TRANSITION_SAME_POSE_SECONDS` (1s);
 *   - a transition entering a NEW pose is sized by section change →
 *     `transitionSecondsBetween(prevPose, nextPose, false)` (3s within a
 *     section, 8s across sections).
 *
 * === timing reconciliation with timing.ts ===
 * `sequenceDurationSeconds` counts, per pose, only `(repeat - 1)` internal
 * same-pose transitions (via `poseHoldSeconds`, at 1s each) plus one variable
 * between-pose transition for each of the `(n - 1)` adjacent pairs. The guided
 * plan additionally inserts a same-pose transition between the SIDES of a
 * multi-sided pose (`sides > 1`), which `poseHoldSeconds` does NOT count. Those
 * extra transitions are same-pose (1s each), and the per-pose count is
 * `repeat * (sides - 1)`. Between-pose transitions themselves are identical in
 * both computations (same model, same 3s/8s tiers), so they cancel. Therefore,
 * for a given sequence:
 *
 *   guidedPlan.totalMs / 1000
 *     === sequenceDurationSeconds(poses, breathSeconds)
 *       + (Σ over poses of repeat * (sides - 1)) * TRANSITION_SAME_POSE_SECONDS
 *
 * The unit test asserts this exact delta from the catalog. Everything here is
 * PURE so it stays fully unit-testable.
 *
 * === salutation vinyasa flows (half-breath movements + whole-breath holds) ===
 * A pose MAY carry an ordered `flow` (see FlowStep) — currently the two Sun
 * Salutations. When it does, each SEGMENT (round) is expanded by walking the
 * flow rather than emitting `pose.breaths` identical breaths. A flow step is
 * EITHER a single half-breath MOVEMENT (`phase` set) or a whole-breath HOLD
 * (`phase` absent):
 *   - a MOVEMENT emits ONE BreathStep that plays only its `phase` for
 *     `breathSeconds / 2` (a single inhale OR exhale). Its `singlePhase` field
 *     carries the phase so the player schedules only that one phase (not
 *     inhale+exhale) and advances after half a breath. `inhaleMs`/`exhaleMs` are
 *     set so the ACTIVE half equals `breathSeconds / 2` and the other is 0. The
 *     breath counter is HIDDEN for movements (breathNumber/breathCount are still
 *     set to 1/1 for completeness, but the player suppresses the counter for
 *     single-phase steps and shows only the phase word + sub-pose label);
 *   - a HOLD emits `breaths` full inhale+exhale BreathSteps (no `singlePhase`),
 *     with `breathNumber`/`breathCount` counting WITHIN the hold so the Down Dog
 *     reads "Breath 1..5 of 5" — the ONLY place the counter shows during a flow;
 *   - every emitted step is tagged with `subPoseLabel = flowStep.label` so the
 *     guided screen shows the current sub-pose ("Adho Mukha Svanasana") instead
 *     of just "Surya Namaskara A";
 *   - a flow step's `cueId` becomes `BreathStep.voiceCueId`: for a HOLD it is
 *     placed on the first/last breath per `cueOn` (e.g. `last_breath` on the
 *     Down Dog's 5th); for a MOVEMENT it fires on the single phase.
 *
 * The `step_jump_forward` cue is a data-driven MOVEMENT cue on the jump-forward
 * (Ardha Uttanasana) inhale movement; the `samasthiti` cue is on the closing
 * Samasthiti exhale movement. They fire once per round on those movements, never
 * on a TransitionStep. No transition carries a voice cue.
 *
 * === duration accounting ===
 * Each MOVEMENT adds `breathSeconds / 2 * 1000` ms; each HOLD breath adds
 * `breathSeconds * 1000` ms (inhale+exhale). Because a card's `breaths` is
 * defined as the whole-breath-equivalent (movements count 0.5, holds count their
 * whole breaths — validated in validate-poses.ts), the per-segment duration
 * equals `pose.breaths * breathSeconds` exactly, so `totalMs` and the timing.ts
 * `poseHoldSeconds` reconciliation identity stay in agreement with fractional
 * `breaths` representing real time.
 */

import type { Pose } from '../types/pose';
import { transitionSecondsBetween } from './timing';

/** Which half of a single breath a `BreathStep` phase refers to. */
export type GuidedPhase = 'inhale' | 'exhale';

/** One breath (inhale + exhale) within a segment of a pose. */
export interface BreathStep {
  kind: 'breath';
  /** Index into `practice.poses`. */
  poseIndex: number;
  pose: Pose;
  /** 0-based segment index within this pose (0..sides*repeat-1). */
  segmentIndex: number;
  /** Total segments for this pose (= sides * repeat). */
  segmentCount: number;
  /** Human label for the segment, e.g. "First side", "Round 2 of 3", or null. */
  segmentLabel: string | null;
  /**
   * 1-based breath number. For a flow HOLD this counts WITHIN the hold (so the
   * Down Dog reads 1..5); for a single-phase MOVEMENT it is 1; otherwise it
   * counts within the whole segment. The player HIDES this counter for
   * single-phase movements (`singlePhase` set) and shows it only for holds and
   * non-flow breaths.
   */
  breathNumber: number;
  /**
   * Total breaths for the counter. For a flow HOLD this is the hold's `breaths`
   * (5 for the Down Dog); for a single-phase MOVEMENT it is 1; otherwise it is
   * `pose.breaths`.
   */
  breathCount: number;
  /**
   * Inhale duration in ms. For a full breath (hold breath / non-flow) it is
   * `breathSeconds / 2 * 1000`. For an EXHALE movement it is 0. For an INHALE
   * movement it is `breathSeconds / 2 * 1000` (the whole movement).
   */
  inhaleMs: number;
  /**
   * Exhale duration in ms. For a full breath it is `breathSeconds / 2 * 1000`.
   * For an INHALE movement it is 0. For an EXHALE movement it is
   * `breathSeconds / 2 * 1000` (the whole movement).
   */
  exhaleMs: number;
  /**
   * When set, this breath step is a single half-breath MOVEMENT (a vinyasa
   * step): the player plays ONLY this phase for `breathSeconds / 2` and then
   * advances, without scheduling the opposite phase. Undefined for a full breath
   * (a Down Dog hold breath or any non-flow breath), which plays inhale then
   * exhale as usual.
   */
  singlePhase?: GuidedPhase;
  /**
   * For a flow (salutation) pose: the current flow step's label, shown on
   * screen as the sub-pose name (e.g. "Adho Mukha Svanasana"). Undefined for
   * non-flow poses.
   */
  subPoseLabel?: string;
  /**
   * A prerecorded voice cue id to play WHEN this breath begins (maps to
   * `/audio/voice/<id>.mp3`). Set on the flow step's cue breath (per `cueOn`) —
   * e.g. `'last_breath'` on the Down Dog's 5th breath. Undefined for silent
   * breaths.
   */
  voiceCueId?: string;
}

/** A countdown gap shown before entering the next segment/pose. */
export interface TransitionStep {
  kind: 'transition';
  /**
   * Countdown length in seconds, sized by the centralized transition model:
   * 1s for a same-pose (switch sides / next round) transition, or 3s/8s for a
   * new pose depending on whether it stays in the same display section.
   */
  seconds: number;
  /** Index of the pose being left, or null before the first pose's later segments. */
  fromPoseIndex: number | null;
  /** Index of the pose being entered. */
  toPoseIndex: number;
  toPose: Pose;
  /** Human cue for what's next: "Switch sides", "Round 2 of 3", "Next: <english>". */
  cue: string;
}

/** A single step on the guided timeline. */
export type GuidedStep = BreathStep | TransitionStep;

/** The full flattened plan the guided screen consumes. */
export interface GuidedPlan {
  steps: GuidedStep[];
  /** Sum of all step durations: every breath (in+ex) + every transition. */
  totalMs: number;
  /** The seconds-per-breath pace this plan was built with. */
  breathSeconds: number;
}

/**
 * Label for a segment of a pose, given its 0-based index.
 *
 * - sides === 2  → "First side" / "Second side".
 * - repeat > 1   → "Round N of M".
 * - both > 1     → combined "First side · Round 1 of 3" (does not occur in the
 *   current catalog, but handled gracefully).
 * - single segment → null.
 */
function segmentLabelFor(pose: Pose, segmentIndex: number): string | null {
  const { sides, repeat } = pose;
  const hasSides = sides > 1;
  const hasRounds = repeat > 1;

  if (!hasSides && !hasRounds) return null;

  // segmentIndex is laid out as: for each round, then each side.
  // With sides s and repeat r, segmentCount = s * r. Decompose so the label
  // reads naturally even in the (unused) combined case.
  const parts: string[] = [];

  if (hasSides) {
    const sideIndex = segmentIndex % sides; // 0 or 1
    parts.push(sideIndex === 0 ? 'First side' : 'Second side');
  }
  if (hasRounds) {
    const roundIndex = Math.floor(segmentIndex / sides); // 0-based round
    parts.push(`Round ${roundIndex + 1} of ${repeat}`);
  }

  return parts.join(' \u00b7 ');
}

/**
 * The transition cue INTO a segment.
 *
 * - New pose (segment 0, not the first pose overall) → "Next: <english>".
 * - Switching to side 2 of a 2-sided (non-repeating) pose → "Switch sides".
 * - Otherwise (new round / generic new segment within a pose) → the segment
 *   label, e.g. "Round 2 of 3".
 */
function cueFor(
  pose: Pose,
  segmentIndex: number,
  enteringNewPose: boolean,
): string {
  if (enteringNewPose) {
    return `Next: ${pose.english}`;
  }
  // Same pose, later segment. Plain switch of sides on a non-repeating pose.
  if (pose.sides === 2 && pose.repeat === 1) {
    return 'Switch sides';
  }
  // New round (or combined) — fall back to the segment label; it always exists
  // here because this branch only runs for multi-segment poses.
  return segmentLabelFor(pose, segmentIndex) ?? 'Continue';
}

/**
 * Emit the BreathSteps for ONE segment (round) of a pose.
 *
 * - If the pose has a `flow`, walk it (half-breath movement model):
 *     - a MOVEMENT step (`phase` set) emits ONE single-phase BreathStep lasting
 *       `halfMs` (breathSeconds / 2), with `singlePhase` = its phase, the ACTIVE
 *       half's ms set to `halfMs` and the other to 0, `subPoseLabel` = its label,
 *       and its `cueId` on that single phase (`voiceCueId`) — e.g.
 *       `step_jump_forward` on the jump-forward inhale movement and `samasthiti`
 *       on the closing Samasthiti exhale movement;
 *     - a HOLD step (`phase` absent) emits `breaths` FULL inhale+exhale
 *       BreathSteps with per-hold `breathNumber`/`breathCount` (so it reads
 *       "N of 5") and its `cueId` on the first/last breath per `cueOn` — e.g.
 *       `last_breath` on the Down Dog hold's last breath.
 * - Otherwise, emit `pose.breaths` plain full BreathSteps with whole-segment
 *   `breathNumber`/`breathCount` (unchanged legacy behaviour).
 *
 * Returns the added milliseconds so the caller can keep `totalMs` exact: each
 * movement adds `halfMs`, each full breath (hold / non-flow) adds `halfMs * 2`.
 */
function emitSegmentBreaths(
  steps: GuidedStep[],
  pose: Pose,
  poseIndex: number,
  segmentIndex: number,
  segmentCount: number,
  segmentLabel: string | null,
  halfMs: number,
): number {
  let addedMs = 0;

  /** Push a FULL breath (inhale + exhale), used by holds and non-flow poses. */
  const pushFullBreath = (
    breathNumber: number,
    breathCount: number,
    extras: Pick<BreathStep, 'subPoseLabel' | 'voiceCueId'>,
  ): void => {
    steps.push({
      kind: 'breath',
      poseIndex,
      pose,
      segmentIndex,
      segmentCount,
      segmentLabel,
      breathNumber,
      breathCount,
      inhaleMs: halfMs,
      exhaleMs: halfMs,
      ...extras,
    });
    addedMs += halfMs * 2;
  };

  /** Push a single half-breath MOVEMENT playing only `phase` for `halfMs`. */
  const pushMovement = (
    phase: GuidedPhase,
    extras: Pick<BreathStep, 'subPoseLabel' | 'voiceCueId'>,
  ): void => {
    steps.push({
      kind: 'breath',
      poseIndex,
      pose,
      segmentIndex,
      segmentCount,
      segmentLabel,
      breathNumber: 1,
      breathCount: 1,
      // Only the active half has duration; the other is 0 so the player and the
      // BreathingCircle bind the transition to the movement's own half.
      inhaleMs: phase === 'inhale' ? halfMs : 0,
      exhaleMs: phase === 'exhale' ? halfMs : 0,
      singlePhase: phase,
      ...extras,
    });
    addedMs += halfMs;
  };

  if (pose.flow && pose.flow.length > 0) {
    // Flow-driven expansion: movements are single half-breaths; only the Down
    // Dog HOLD is whole breaths (counted "N of 5").
    for (const flowStep of pose.flow) {
      if (flowStep.phase !== undefined) {
        // MOVEMENT: a single half-breath phase. Its cue (if any) fires on this
        // one phase — there is only one, so cueOn is irrelevant.
        pushMovement(flowStep.phase, {
          subPoseLabel: flowStep.label,
          voiceCueId: flowStep.cueId,
        });
        continue;
      }
      // HOLD: whole breaths, each a full inhale+exhale.
      for (let b = 1; b <= flowStep.breaths; b++) {
        const isCueBreath =
          flowStep.cueId !== undefined &&
          (flowStep.cueOn === 'first'
            ? b === 1
            : // default / 'last' → last breath of the step
              b === flowStep.breaths);
        pushFullBreath(b, flowStep.breaths, {
          subPoseLabel: flowStep.label,
          voiceCueId: isCueBreath ? flowStep.cueId : undefined,
        });
      }
    }
    return addedMs;
  }

  // Legacy expansion: flat, whole-segment counts.
  for (let breath = 1; breath <= pose.breaths; breath++) {
    pushFullBreath(breath, pose.breaths, {});
  }
  return addedMs;
}

/**
 * Build the flat guided timeline for a sequence at a given breath pace.
 *
 * Emits, per pose, `sides * repeat` segments of `breaths` breaths, with a
 * `TransitionStep` before every segment EXCEPT the very first segment of the
 * whole practice. `totalMs` is the exact sum of every step's duration.
 *
 * Salutation poses carry a `flow`; those segments are expanded via
 * `emitSegmentBreaths` (single-phase movements + a whole-breath Down Dog hold,
 * sub-pose labels + movement/hold voice cues, including `step_jump_forward` on
 * the jump-forward inhale movement and `samasthiti` on the closing exhale
 * movement). Transitions never carry a voice cue.
 */
export function buildGuidedPlan(poses: Pose[], breathSeconds: number): GuidedPlan {
  const halfMs = (breathSeconds / 2) * 1000;

  const steps: GuidedStep[] = [];
  let totalMs = 0;
  let sawFirstSegment = false;
  // The pose of the immediately preceding segment (null before the first).
  let prevPose: Pose | null = null;

  for (let poseIndex = 0; poseIndex < poses.length; poseIndex++) {
    const pose = poses[poseIndex];
    const segmentCount = pose.sides * pose.repeat;

    for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex++) {
      const enteringNewPose = segmentIndex === 0;

      // Transition before this segment, unless it's the very first segment of
      // the whole practice.
      if (sawFirstSegment) {
        // A later segment of the SAME pose (switch sides / next round) is a
        // same-pose transition (1s); entering a NEW pose is sized by section
        // change (3s / 8s) via the centralized model. `prevPose` is guaranteed
        // non-null here (sawFirstSegment is true).
        const samePose = !enteringNewPose;
        const seconds = transitionSecondsBetween(
          prevPose as Pose,
          pose,
          samePose,
        );
        // Transitions carry no voice cue: the `step_jump_forward` cue is now a
        // data-driven breath cue on the salutation's jump-forward flow step (see
        // emitSegmentBreaths), not a transition cue.
        const transition: TransitionStep = {
          kind: 'transition',
          seconds,
          fromPoseIndex: enteringNewPose ? poseIndex - 1 : poseIndex,
          toPoseIndex: poseIndex,
          toPose: pose,
          cue: cueFor(pose, segmentIndex, enteringNewPose && poseIndex > 0),
        };
        steps.push(transition);
        totalMs += seconds * 1000;
      }
      sawFirstSegment = true;
      prevPose = pose;

      const segmentLabel = segmentLabelFor(pose, segmentIndex);

      totalMs += emitSegmentBreaths(
        steps,
        pose,
        poseIndex,
        segmentIndex,
        segmentCount,
        segmentLabel,
        halfMs,
      );
    }
  }

  return { steps, totalMs, breathSeconds };
}

export default buildGuidedPlan;
