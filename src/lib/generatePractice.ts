/**
 * Practice generation engine.
 *
 * SLICE 2 SCOPE: pure logic only. No UI, no React.
 *
 * Given the full pose catalog and a target duration, build a ~30-minute
 * practice that:
 *   - always contains the fixed frame (Surya A, Surya B, Shoulderstand, Savasana),
 *   - fills the remaining time budget with a proportional mix of standing,
 *     seated and closing poses,
 *   - is always returned in canonical `order` (never reordered/mixed),
 *   - never exceeds the target duration (a HARD ceiling).
 *
 * The RNG is injectable so tests can be fully deterministic.
 */

import type { Pose, PoseCategory } from '../types/pose';
import {
  DEFAULT_BREATH_SECONDS,
  TARGET_SECONDS,
  TRANSITION_SECONDS,
  poseHoldSeconds,
  sequenceDurationSeconds,
} from './timing';

export interface GenerateOptions {
  /** Seconds per breath. Default DEFAULT_BREATH_SECONDS. */
  breathSeconds?: number;
  /** Target (and hard-ceiling) duration in seconds. Default TARGET_SECONDS. */
  targetSeconds?: number;
  /** Injectable RNG returning [0,1). Default Math.random. */
  rng?: () => number;
}

export interface GeneratedPractice {
  /** Final sequence, strictly in ascending canonical `order`. */
  poses: Pose[];
  /** sequenceDurationSeconds(poses, breathSeconds). Always <= targetSeconds. */
  totalSeconds: number;
  /** The breathSeconds actually used. */
  breathSeconds: number;
}

/** The three fillable middle sections, in canonical progression order. */
type Section = 'standing' | 'seated' | 'closing';

/** Weighting of the free budget across sections (traditional emphasis). */
const SECTION_WEIGHTS: Record<Section, number> = {
  standing: 0.35,
  seated: 0.45,
  closing: 0.2,
};

/** The canonical ids that make up the always-present fixed frame. */
const FIXED_FRAME_IDS = new Set<string>([
  'surya_namaskara_a',
  'surya_namaskara_b',
  'salamba_sarvangasana',
  'savasana',
]);

/**
 * In-place Fisher–Yates shuffle of a COPY of `items`, driven by the given RNG.
 * Returns a new array; does not mutate the input.
 */
function shuffle<T>(items: T[], rng: () => number): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

/**
 * Which fillable section a selectable pose belongs to.
 * Only 'standing', 'seated', and 'closing' categories are fillable; everything
 * else (salutations, savasana) is part of the fixed frame and never selected.
 */
function sectionOf(pose: Pose): Section | null {
  const c: PoseCategory = pose.category;
  if (c === 'standing') return 'standing';
  if (c === 'seated') return 'seated';
  if (c === 'closing') return 'closing';
  return null;
}

/**
 * The marginal cost of ADDING one pose to a growing section: its hold time
 * plus one transition (every added pose introduces one more gap).
 */
function marginalCost(pose: Pose, breathSeconds: number): number {
  return poseHoldSeconds(pose, breathSeconds) + TRANSITION_SECONDS;
}

/**
 * Greedily fill a single section from its shuffled pool within `share` seconds.
 *
 * Variety pass: when choosing the next pose, prefer one whose `group` differs
 * from the previously added pose's group. If the very next candidate repeats
 * the previous group but a later candidate has a different group (and still
 * fits), pick that different-group one instead. If no different-group candidate
 * fits, fall back to the repeating one. Simple, order-preserving, cheap.
 */
function fillSection(
  pool: Pose[],
  share: number,
  breathSeconds: number,
  rng: () => number,
): Pose[] {
  const shuffled = shuffle(pool, rng);
  const chosen: Pose[] = [];
  const used = new Set<string>();
  let spent = 0;
  let prevGroup: string | null = null;

  // Keep scanning until no affordable pose can be added.
  // Each outer pass adds at most one pose (the best variety-respecting fit).
  for (;;) {
    let pick: Pose | null = null;
    let fallback: Pose | null = null;

    for (const cand of shuffled) {
      if (used.has(cand.id)) continue;
      const cost = marginalCost(cand, breathSeconds);
      if (spent + cost > share) continue; // doesn't fit this section's share
      // First affordable candidate becomes the fallback (allows same-group).
      if (fallback === null) fallback = cand;
      // Prefer a different-group candidate for variety.
      if (prevGroup === null || cand.group !== prevGroup) {
        pick = cand;
        break;
      }
    }

    const next = pick ?? fallback;
    if (next === null) break; // nothing else fits

    chosen.push(next);
    used.add(next.id);
    spent += marginalCost(next, breathSeconds);
    prevGroup = next.group;
  }

  return chosen;
}

/**
 * Try to seed a starved section with its single cheapest affordable pose.
 * Returns the pose to add (not yet in `used`) or null if none affordable within
 * `share`. Used by the "at least one per section" guarantee (step F).
 */
function cheapestFor(
  pool: Pose[],
  share: number,
  breathSeconds: number,
): Pose | null {
  let best: Pose | null = null;
  let bestCost = Infinity;
  for (const cand of pool) {
    const cost = marginalCost(cand, breathSeconds);
    if (cost > share) continue;
    if (cost < bestCost) {
      best = cand;
      bestCost = cost;
    }
  }
  return best;
}

/**
 * Generate a practice. See module docstring and the algorithm steps A–G.
 */
export function generatePractice(
  all: Pose[],
  options?: GenerateOptions,
): GeneratedPractice {
  const breathSeconds = options?.breathSeconds ?? DEFAULT_BREATH_SECONDS;
  const targetSeconds = options?.targetSeconds ?? TARGET_SECONDS;
  const rng = options?.rng ?? Math.random;

  // --- A. Fixed frame (always include, in whatever order they appear) ---
  const fixed = all.filter((p) => p.alwaysInclude);

  // --- B. Free budget = target - duration of the fixed frame alone ---
  const fixedDuration = sequenceDurationSeconds(fixed, breathSeconds);
  const freeBudget = Math.max(0, targetSeconds - fixedDuration);

  // --- C. Candidate pools (selectable only; excludes the fixed frame) ---
  const selectable = all.filter(
    (p) => p.selectable && !p.alwaysInclude && sectionOf(p) !== null,
  );
  const pools: Record<Section, Pose[]> = {
    standing: selectable.filter((p) => sectionOf(p) === 'standing'),
    seated: selectable.filter((p) => sectionOf(p) === 'seated'),
    closing: selectable.filter((p) => sectionOf(p) === 'closing'),
  };

  // --- D. Proportional allocation across the three sections ---
  const selected: Pose[] = [];
  const sectionOfSelected = new Map<string, Section>();
  const sections: Section[] = ['standing', 'seated', 'closing'];
  for (const section of sections) {
    const share = freeBudget * SECTION_WEIGHTS[section];
    const chosen = fillSection(pools[section], share, breathSeconds, rng);
    for (const p of chosen) {
      selected.push(p);
      sectionOfSelected.set(p.id, section);
    }
  }

  // --- F (part 1). Guarantee at least one pose per section if it fits ---
  // Done before the ceiling trim so the trim can rebalance if needed.
  for (const section of sections) {
    const hasAny = selected.some((p) => sectionOfSelected.get(p.id) === section);
    if (hasAny) continue;
    const alreadyUsed = new Set(selected.map((p) => p.id));
    const availablePool = pools[section].filter((p) => !alreadyUsed.has(p.id));
    // Allow using the whole free budget for this seeding attempt; the ceiling
    // trim below will remove overflow elsewhere if this pushes us over.
    const cheapest = cheapestFor(availablePool, freeBudget, breathSeconds);
    if (cheapest) {
      selected.push(cheapest);
      sectionOfSelected.set(cheapest.id, section);
    }
  }

  // --- E. Assemble, sort by canonical order, enforce the hard ceiling ---
  const assemble = (sel: Pose[]): Pose[] =>
    [...fixed, ...sel].sort((a, b) => a.order - b.order);

  let sequence = assemble(selected);
  let total = sequenceDurationSeconds(sequence, breathSeconds);

  if (total > targetSeconds) {
    // Track current per-section actual cost so we can remove from the section
    // most over its proportional share.
    const shareOf: Record<Section, number> = {
      standing: freeBudget * SECTION_WEIGHTS.standing,
      seated: freeBudget * SECTION_WEIGHTS.seated,
      closing: freeBudget * SECTION_WEIGHTS.closing,
    };

    const working = selected.slice();

    while (total > targetSeconds) {
      // Only selectable, non-fixed poses may be removed.
      const removable = working.filter((p) => !FIXED_FRAME_IDS.has(p.id));
      if (removable.length === 0) break; // can't trim further (should not happen)

      // Current actual cost per section (hold + one transition per pose).
      const actual: Record<Section, number> = {
        standing: 0,
        seated: 0,
        closing: 0,
      };
      for (const p of working) {
        const s = sectionOfSelected.get(p.id);
        if (s) actual[s] += marginalCost(p, breathSeconds);
      }

      // Pick the section most over its share (largest actual - share) that
      // still has a removable pose.
      let targetSection: Section | null = null;
      let worstOver = -Infinity;
      for (const s of sections) {
        const hasRemovable = removable.some(
          (p) => sectionOfSelected.get(p.id) === s,
        );
        if (!hasRemovable) continue;
        const over = actual[s] - shareOf[s];
        if (over > worstOver) {
          worstOver = over;
          targetSection = s;
        }
      }
      if (targetSection === null) break;

      // Within that section, remove the later-order pose (tie-break rule).
      const candidates = removable.filter(
        (p) => sectionOfSelected.get(p.id) === targetSection,
      );
      candidates.sort((a, b) => b.order - a.order); // later order first
      const toRemove = candidates[0];

      const idx = working.findIndex((p) => p.id === toRemove.id);
      if (idx >= 0) working.splice(idx, 1);

      sequence = assemble(working);
      total = sequenceDurationSeconds(sequence, breathSeconds);
    }

    // Reflect the trimmed selection.
    selected.length = 0;
    selected.push(...working);
    sequence = assemble(working);
    total = sequenceDurationSeconds(sequence, breathSeconds);
  }

  // --- G. Return canonical-ordered result ---
  return {
    poses: sequence,
    totalSeconds: total,
    breathSeconds,
  };
}

export default generatePractice;
