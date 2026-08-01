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
  /** 1-based breath number within the segment. */
  breathNumber: number;
  /** Total breaths in the segment (= pose.breaths). */
  breathCount: number;
  /** Inhale duration in ms (breathSeconds / 2 * 1000). */
  inhaleMs: number;
  /** Exhale duration in ms (breathSeconds / 2 * 1000). */
  exhaleMs: number;
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
 * Build the flat guided timeline for a sequence at a given breath pace.
 *
 * Emits, per pose, `sides * repeat` segments of `breaths` breaths, with a
 * `TransitionStep` before every segment EXCEPT the very first segment of the
 * whole practice. `totalMs` is the exact sum of every step's duration.
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

      for (let breath = 1; breath <= pose.breaths; breath++) {
        const step: BreathStep = {
          kind: 'breath',
          poseIndex,
          pose,
          segmentIndex,
          segmentCount,
          segmentLabel,
          breathNumber: breath,
          breathCount: pose.breaths,
          inhaleMs: halfMs,
          exhaleMs: halfMs,
        };
        steps.push(step);
        totalMs += halfMs * 2;
      }
    }
  }

  return { steps, totalMs, breathSeconds };
}

export default buildGuidedPlan;
