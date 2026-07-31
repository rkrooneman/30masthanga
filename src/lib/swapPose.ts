/**
 * Pose-swap engine for the Overview detail carousel.
 *
 * Pure logic only. No UI, no React.
 *
 * Lets the practitioner replace one currently-shown selectable pose with an
 * alternative chosen by the SAME rules the generator uses:
 *   - same `category` as the swapped pose (no cross-category swaps),
 *   - `selectable` and NOT part of the fixed frame (`alwaysInclude`),
 *   - NOT already present in the current practice,
 *   - and only if adding it keeps the whole practice within the target
 *     duration (a HARD ceiling — never exceed the 30-minute budget).
 *
 * The replacement is inserted in canonical `order`, so it will NOT necessarily
 * land in the slot the removed card occupied. The RNG is injectable so callers
 * (and tests) can be fully deterministic.
 */

import type { Pose } from '../types/pose';
import { poses as catalog } from '../data/poses';
import { TARGET_SECONDS, sequenceDurationSeconds } from './timing';

/** The result of a successful swap. */
export interface SwapResult {
  /** New sequence, strictly in ascending canonical `order`, swap applied. */
  poses: Pose[];
  /** sequenceDurationSeconds(poses, breathSeconds). Always <= targetSeconds. */
  totalSeconds: number;
  /** The id of the pose that was added in place of the removed one. */
  swappedInId: string;
}

/** Options for {@link swapPose} (and, via reuse, the candidate scan). */
export interface SwapOptions {
  /** Injectable RNG returning [0,1). Default Math.random. */
  rng?: () => number;
  /** Target (and hard-ceiling) duration in seconds. Default TARGET_SECONDS. */
  targetSeconds?: number;
}

/**
 * Compute the same-category replacement candidates for `poseIdToRemove` that
 * would keep the practice within `targetSeconds`.
 *
 * Returns the removed pose plus the fitting candidate list. Returns null when
 * the pose is missing from `current` or is a fixed (`alwaysInclude`) pose that
 * must never be swapped. The candidate array may be empty (no alternative fits).
 */
function findCandidates(
  current: Pose[],
  breathSeconds: number,
  poseIdToRemove: string,
  targetSeconds: number,
): { removed: Pose; candidates: Pose[] } | null {
  const removed = current.find((p) => p.id === poseIdToRemove);
  // Missing, or a fixed-frame pose: not swappable (caller should have disabled).
  if (!removed || removed.alwaysInclude) return null;

  // The sequence with the removed pose taken out; the base every candidate is
  // measured against.
  const withoutRemoved = current.filter((p) => p.id !== poseIdToRemove);
  const presentIds = new Set(current.map((p) => p.id));

  const candidates = catalog.filter((cand) => {
    if (cand.category !== removed.category) return false;
    if (!cand.selectable || cand.alwaysInclude) return false;
    if (presentIds.has(cand.id)) return false; // already in the practice
    // Budget check: the full list (base + candidate) must fit the ceiling.
    // Sorting is order-independent for duration but kept for consistency.
    const tentative = [...withoutRemoved, cand].sort((a, b) => a.order - b.order);
    return sequenceDurationSeconds(tentative, breathSeconds) <= targetSeconds;
  });

  return { removed, candidates };
}

/**
 * Whether at least one valid same-category, budget-fitting alternative exists
 * for `poseId` in the given practice. Cheap enough to call from the UI on every
 * render to drive the swap control's enabled/disabled state — it does the same
 * filtering as {@link swapPose} but commits nothing.
 *
 * Returns false for fixed (`alwaysInclude`) poses and for poses not present.
 */
export function hasSwapCandidate(
  current: Pose[],
  breathSeconds: number,
  poseId: string,
  options?: SwapOptions,
): boolean {
  const targetSeconds = options?.targetSeconds ?? TARGET_SECONDS;
  const found = findCandidates(current, breathSeconds, poseId, targetSeconds);
  return found !== null && found.candidates.length > 0;
}

/**
 * Swap `poseIdToRemove` for a random valid same-category alternative.
 *
 * Returns the new canonical-ordered practice (with recomputed total) and the id
 * of the pose that was swapped in, or null when there is no valid alternative
 * (fixed pose, pose not present, every same-category pose already used, or none
 * that fit the budget).
 */
export function swapPose(
  current: Pose[],
  breathSeconds: number,
  poseIdToRemove: string,
  options?: SwapOptions,
): SwapResult | null {
  const rng = options?.rng ?? Math.random;
  const targetSeconds = options?.targetSeconds ?? TARGET_SECONDS;

  const found = findCandidates(
    current,
    breathSeconds,
    poseIdToRemove,
    targetSeconds,
  );
  if (!found || found.candidates.length === 0) return null;

  // Pick uniformly at random among the fitting candidates.
  const { candidates } = found;
  const chosen = candidates[Math.floor(rng() * candidates.length)];

  const withoutRemoved = current.filter((p) => p.id !== poseIdToRemove);
  const nextPoses = [...withoutRemoved, chosen].sort(
    (a, b) => a.order - b.order,
  );
  const totalSeconds = sequenceDurationSeconds(nextPoses, breathSeconds);

  return {
    poses: nextPoses,
    totalSeconds,
    swappedInId: chosen.id,
  };
}

export default swapPose;
