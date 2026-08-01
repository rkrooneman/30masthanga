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
 * segment is `breaths` breaths. Every breath is inhale-then-exhale on a 50/50
 * split (at 5s/breath: 2.5s in, 2.5s out).
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
 * === salutation vinyasa flows (voice cues + sub-pose labels) ===
 * A pose MAY carry an ordered `flow` (see FlowStep) — currently the two Sun
 * Salutations. When it does, each SEGMENT (round) is expanded by walking the
 * flow rather than emitting `pose.breaths` identical breaths:
 *   - each flow step contributes its own `breaths` BreathSteps, tagged with
 *     `subPoseLabel = flowStep.label` so the guided screen can show the current
 *     sub-pose ("Adho Mukha Svanasana") instead of just "Surya Namaskara A";
 *   - `breathNumber`/`breathCount` count WITHIN the flow step, so the Down Dog
 *     hold reads "Breath 1..5 of 5" (chosen for a meaningful on-screen counter
 *     during the hold — this is the ONLY behavioural change to those fields, and
 *     only for flow poses; non-flow poses keep whole-segment counts);
 *   - a flow step's `cueId` is placed on the FIRST or LAST breath of that step
 *     per `cueOn`, as `BreathStep.voiceCueId`, to fire a prerecorded clip at
 *     that exact breath (used for `last_breath` on the Down Dog's 5th breath).
 *
 * The `step_jump_forward` cue is a data-driven BREATH cue: the salutation flow
 * places it on the jump-forward (Ardha Uttanasana) exit step with
 * `cueOn: 'first'`, so `emitSegmentBreaths` tags it onto the FIRST breath of
 * that step (like any other flow-step cue). It therefore fires once per round,
 * on the jump-forward breath itself, rather than on a TransitionStep. No
 * transition carries a voice cue.
 *
 * Because sum(flow.breaths) === pose.breaths (validated in validate-poses.ts),
 * the breath COUNT per segment is unchanged, so `totalMs` and the timing.ts
 * reconciliation identity are entirely unaffected by the flow expansion.
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
   * 1-based breath number. For a flow pose this counts WITHIN the current flow
   * step (so the Down Dog hold reads 1..5); otherwise it counts within the
   * whole segment.
   */
  breathNumber: number;
  /**
   * Total breaths for the counter. For a flow pose this is the current flow
   * step's `breaths` (5 for the Down Dog hold); otherwise it is `pose.breaths`.
   */
  breathCount: number;
  /** Inhale duration in ms (breathSeconds / 2 * 1000). */
  inhaleMs: number;
  /** Exhale duration in ms (breathSeconds / 2 * 1000). */
  exhaleMs: number;
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
 * - If the pose has a `flow`, walk it: each flow step contributes its own
 *   `breaths` BreathSteps, with `subPoseLabel` set to the step's label,
 *   per-flow-step `breathNumber`/`breathCount`, and the step's `cueId` placed on
 *   the first or last breath per `cueOn` (`voiceCueId`) — e.g. `last_breath` on
 *   the Down Dog hold's last breath and `step_jump_forward` on the jump-forward
 *   step's first breath.
 * - Otherwise, emit `pose.breaths` plain BreathSteps with whole-segment
 *   `breathNumber`/`breathCount` (unchanged legacy behaviour).
 *
 * Returns the added milliseconds so the caller can keep `totalMs` exact.
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

  const pushBreath = (
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

  if (pose.flow && pose.flow.length > 0) {
    // Flow-driven expansion: per-flow-step counts so a hold reads "N of 5".
    for (const flowStep of pose.flow) {
      for (let b = 1; b <= flowStep.breaths; b++) {
        const isCueBreath =
          flowStep.cueId !== undefined &&
          (flowStep.cueOn === 'first'
            ? b === 1
            : // default / 'last' → last breath of the step
              b === flowStep.breaths);
        pushBreath(b, flowStep.breaths, {
          subPoseLabel: flowStep.label,
          voiceCueId: isCueBreath ? flowStep.cueId : undefined,
        });
      }
    }
    return addedMs;
  }

  // Legacy expansion: flat, whole-segment counts.
  for (let breath = 1; breath <= pose.breaths; breath++) {
    pushBreath(breath, pose.breaths, {});
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
 * `emitSegmentBreaths` (sub-pose labels + per-breath voice cues, including
 * `step_jump_forward` on the jump-forward exit breath). Transitions never carry
 * a voice cue.
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
