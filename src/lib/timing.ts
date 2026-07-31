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

/** Countdown gap (seconds) shown BETWEEN two consecutive poses. */
export const TRANSITION_SECONDS = 3;

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
 * How long a single card takes in total, in whole seconds — INCLUDING the
 * internal transitions between its own repeats.
 *
 * Counts BOTH sides: `breaths` is per-side, so a 5-breath / 2-side pose at
 * 5s/breath holds for 5 * 2 * 5 = 50s. For salutation cards `sides` is 1 and
 * `breaths` already carries the whole-flow count, so the math still holds.
 *
 * Counts ALL repeats: a card performed `repeat` times holds for
 * breaths * sides * repeat * breathSeconds.
 *
 * Internal repeat transitions: a card performed `repeat` times is `repeat`
 * back-to-back flows with a transition gap BETWEEN each pair — i.e.
 * (repeat - 1) gaps. That internal transition time is folded into this card's
 * total here (e.g. Sun A ×3 = 3 flows + 2 internal gaps). The between-card gap
 * that follows this card is NOT included here — `sequenceDurationSeconds` adds
 * the (n-1) between-card gaps separately, so there is no double counting: the
 * single between-card transition after a salutation still moves to the next
 * card, exactly as before.
 */
export function poseHoldSeconds(pose: Pose, breathSeconds: number): number {
  const hold = pose.breaths * pose.sides * pose.repeat * breathSeconds;
  const internalTransitions = (pose.repeat - 1) * TRANSITION_SECONDS;
  return hold + internalTransitions;
}

/**
 * Total duration of an ordered sequence, in whole seconds.
 *
 * = sum of every pose's hold time
 * + one TRANSITION_SECONDS gap between each consecutive pair (n-1 gaps for n
 *   poses; no leading or trailing transition).
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
  total += (seq.length - 1) * TRANSITION_SECONDS;
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
