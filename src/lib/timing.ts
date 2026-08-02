/**
 * Timing helpers and constants for the practice generation engine.
 *
 * SLICE 2 SCOPE: pure logic only. No UI, no React.
 *
 * All durations are expressed in whole seconds. The single source of truth for
 * how long a pose is held, how long the whole sequence runs, and how a duration
 * is rendered for humans lives here so the generator, the preview script, and
 * (later) the UI all agree.
 */

import type { Pose } from '../types/pose';

/**
 * === centralized transition model ===
 *
 * The gap (in whole seconds) shown between two consecutive segments/poses is no
 * longer a single flat value. It varies with how big a change the practitioner
 * is making, and there is ONE source of truth — `transitionSecondsBetween` —
 * used by BOTH the guided plan (runtime) and the generator budget so the two can
 * never disagree.
 *
 * Three tiers:
 *   - SAME pose (other side / next round of the SAME card) → very short (1s).
 *   - NEW pose within the SAME display section → medium (3s).
 *   - NEW pose crossing into a DIFFERENT display section → long (8s).
 *
 * `TRANSITION_SECONDS` is retained (= the medium/similar tier, 3) purely as a
 * backward-compatible alias for the "new pose, same section" gap. It is no
 * longer used for a pose's INTERNAL repeat transitions — those are same-pose
 * repeats and use `TRANSITION_SAME_POSE_SECONDS` (1) instead (see
 * `poseHoldSeconds`). Keeping the two constants distinct makes the model
 * explicit at every call site.
 */

/** Same pose, other side / next round of the same card. */
export const TRANSITION_SAME_POSE_SECONDS = 1;

/**
 * Between rounds of a SALUTATION (a pose with a `flow`). The exit choreography
 * (jump forward, fold, rise up / chair to Samasthiti) is now a COUNTED breath
 * step at the END of each flow, so by the time a round finishes the practitioner
 * is already standing at the front of the mat. The between-round gap is
 * therefore just a short settling pause before the next round's lead-in, not the
 * whole exit-and-restart — 3s, the same as the medium in-section gap.
 */
export const TRANSITION_SALUTATION_ROUND_SECONDS = 3;

/** New pose, same display section (similar or same-section-different-group). */
export const TRANSITION_SIMILAR_SECONDS = 3;

/** New pose, crossing into a different display section. */
export const TRANSITION_SECTION_CHANGE_SECONDS = 8;

/**
 * Backward-compatible alias for the "new pose, same section" gap (the medium
 * tier). Prefer `transitionSecondsBetween` / the named tier constants above at
 * new call sites; this remains so existing references keep the same meaning.
 */
export const TRANSITION_SECONDS = TRANSITION_SIMILAR_SECONDS;

/**
 * Seconds of "get ready" countdown before the very first breath of a practice.
 * Single-sourced here and imported by GuidedScreen so the runtime and any
 * future duration math agree on it.
 */
export const OPENING_COUNTDOWN_SECONDS = 5;

/** Default seconds-per-breath used when the caller doesn't specify one. */
export const DEFAULT_BREATH_SECONDS = 5;

/** Lower bound for the seconds-per-breath slider (used later in the UI). */
export const MIN_BREATH_SECONDS = 4;

/** Upper bound for the seconds-per-breath slider (used later in the UI). */
export const MAX_BREATH_SECONDS = 7;

/** Target practice length in minutes. */
export const TARGET_MINUTES = 30;

/** Target practice length in seconds (derived from TARGET_MINUTES). */
export const TARGET_SECONDS = TARGET_MINUTES * 60; // 1800

/**
 * The DISPLAY section a pose belongs to, mirroring the Overview PoseMap grouping
 * (Sun Salutations / Standing / Seated / Closing / Rest). Both salutation
 * categories collapse to a single 'sun' section, so Sun A → Sun B is an
 * in-section change (medium gap), not a section change.
 *
 * This is the granularity the transition model reasons about: crossing from one
 * of these sections into another is the "big" transition (8s).
 */
export function displaySection(pose: Pose): string {
  switch (pose.category) {
    case 'sun_a':
    case 'sun_b':
      return 'sun';
    case 'standing':
      return 'standing';
    case 'seated':
      return 'seated';
    case 'closing':
      return 'closing';
    case 'finishing':
      return 'rest';
  }
}

/**
 * The single source of truth for the transition gap (whole seconds) between two
 * consecutive poses, used by BOTH the guided plan and the generator budget.
 *
 * Rules, in order:
 *   1. `samePose` true and the pose is a SALUTATION (has a `flow`) → a short
 *      settling pause between rounds (the exit is a counted breath step) → 3s
 *      (`TRANSITION_SALUTATION_ROUND_SECONDS`).
 *   2. `samePose` true otherwise → the same card, other side / next round → 1s
 *      (`TRANSITION_SAME_POSE_SECONDS`).
 *   3. Different display section → a big change → 8s
 *      (`TRANSITION_SECTION_CHANGE_SECONDS`).
 *   4. Otherwise (a new pose within the same section, whether the same `group`
 *      "similar" or a different group) → 3s (`TRANSITION_SIMILAR_SECONDS`).
 *
 * Note Sun A → Sun B are both section 'sun', so they get the 3s in-section gap.
 */
export function transitionSecondsBetween(
  prevPose: Pose,
  nextPose: Pose,
  samePose: boolean,
): number {
  if (samePose) {
    // A salutation round repeat is just a short settling pause: the exit
    // choreography is now a counted breath step at the end of the flow.
    return prevPose.flow && prevPose.flow.length > 0
      ? TRANSITION_SALUTATION_ROUND_SECONDS
      : TRANSITION_SAME_POSE_SECONDS;
  }
  if (displaySection(prevPose) !== displaySection(nextPose)) {
    return TRANSITION_SECTION_CHANGE_SECONDS;
  }
  return TRANSITION_SIMILAR_SECONDS;
}

/**
 * How long a single card takes in total, in whole seconds — INCLUDING the
 * internal transitions between its own repeats.
 *
 * Counts BOTH sides: `breaths` is per-side, so a 5-breath / 2-side pose at
 * 5s/breath holds for 5 * 2 * 5 = 50s. For salutation cards `sides` is 1 and
 * `breaths` is the whole-flow WHOLE-BREATH-EQUIVALENT (half-breath movement
 * model): each single-phase movement counts as 0.5 and the Down Dog hold as its
 * whole breaths, so `breaths` is fractional (Surya A = 9.5, Surya B = 13.5) and
 * equals the flow's true duration in breaths. `breaths * breathSeconds`
 * therefore gives the correct per-round flow time with no special-casing —
 * exactly matching the sum the guided plan builds from half-breath movements +
 * whole-breath hold breaths.
 *
 * Counts ALL repeats: a card performed `repeat` times holds for
 * breaths * sides * repeat * breathSeconds.
 *
 * Internal repeat transitions: a card performed `repeat` times is `repeat`
 * back-to-back flows with a transition gap BETWEEN each pair — i.e.
 * (repeat - 1) gaps. Those gaps are SAME-pose repeats (next round of the same
 * card): a normal card's cost `TRANSITION_SAME_POSE_SECONDS` (1s) each, but a
 * SALUTATION round repeat costs `TRANSITION_SALUTATION_ROUND_SECONDS` (3s) each
 * — a short settling pause between rounds (the exit is a counted breath step) —
 * the same per-round rate the guided plan uses, so the two stay reconciled. That
 * internal transition time is folded into this card's total here (e.g. Sun A ×3
 * = 3 flows + 2 internal 3s gaps). The between-card gap that follows this card
 * is NOT included here —
 * `sequenceDurationSeconds` adds the (n-1) between-card gaps separately (via
 * `transitionSecondsBetween`), so there is no double counting.
 */
export function poseHoldSeconds(pose: Pose, breathSeconds: number): number {
  const hold = pose.breaths * pose.sides * pose.repeat * breathSeconds;
  const isSalutationFlow = Boolean(pose.flow && pose.flow.length > 0);
  const perRoundGap = isSalutationFlow
    ? TRANSITION_SALUTATION_ROUND_SECONDS
    : TRANSITION_SAME_POSE_SECONDS;
  const internalTransitions = (pose.repeat - 1) * perRoundGap;
  return hold + internalTransitions;
}

/**
 * Total duration of an ordered sequence, in whole seconds.
 *
 * = sum of every pose's hold time (incl. its internal same-pose repeat gaps)
 * + one VARIABLE between-pose gap for each consecutive pair, sized by
 *   `transitionSecondsBetween(prev, next, false)` — the sequence has one card
 *   per pose, so every adjacent pair is a NEW pose (3s within a section, 8s
 *   across sections). Multi-side/round expansion happens only in the guided
 *   plan, not here; the reconciliation identity in guidedPlan.ts accounts for
 *   the extra same-pose side/round gaps the plan inserts.
 *
 * An empty sequence is 0s; a single-pose sequence is just its hold time.
 */
export function sequenceDurationSeconds(
  seq: Pose[],
  breathSeconds: number,
): number {
  if (seq.length === 0) return 0;
  let total = 0;
  for (const pose of seq) {
    total += poseHoldSeconds(pose, breathSeconds);
  }
  for (let i = 1; i < seq.length; i++) {
    total += transitionSecondsBetween(seq[i - 1], seq[i], false);
  }
  return total;
}

/**
 * Render a whole-second duration as "MM:SS" (zero-padded, minutes uncapped).
 * e.g. 339 -> "05:39", 1800 -> "30:00", 3661 -> "61:01".
 */
export function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return `${mm}:${ss}`;
}
