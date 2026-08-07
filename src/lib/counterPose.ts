/**
 * counterPose - the pure counter-pose inclusion rule for the sequence builder.
 *
 * TASK 1 SCOPE: pure, shared rule logic only. No React, no DOM, no imports from
 * `../data/poses`. It operates purely on pose id strings so both the practice
 * generator (Task 2) and the manual-selection handler (Task 3) can call it as a
 * single normalizer, and PoseMap (Task 4) can read the lock state.
 *
 * === the safety rule ===
 * The deep backbends Bridge (`setu_bandhasana`) and Wheel
 * (`urdhva_dhanurasana`) are intense spinal extensions. A practice that
 * contains either of them MUST also contain the closing forward-fold counter
 * `paschimottanasana_closing`, which safely neutralizes the backbend. This is a
 * mandatory safety counter-pose, not an optional stylistic choice.
 *
 * Therefore the counter's presence is fully DERIVED from backbend presence:
 *   - any backbend present  -> the counter is included (added if missing)
 *   - no backbend present   -> the counter is excluded (removed if present)
 *
 * {@link applyCounterPoseRule} is the normalizer that enforces exactly this.
 *
 * === placement is NOT this module's job ===
 * This is purely an INCLUSION rule operating on sets of pose ids. Where the
 * counter sits in the final sequence is handled elsewhere by canonical order:
 * the counter is canonical order 450, the backbends are 430 (Bridge) and 440
 * (Wheel), so ordering naturally places the counter after the backbends. This
 * module neither knows nor cares about order.
 */

/**
 * The deep backbends that require the closing forward-fold counter.
 * Any of these in the practice locks the counter in.
 */
export const BACKBEND_IDS = ['setu_bandhasana', 'urdhva_dhanurasana'] as const;

/**
 * The mandatory closing forward-fold counter-pose for the deep backbends.
 */
export const COUNTER_POSE_ID = 'paschimottanasana_closing';

/**
 * True if the given pose ids contain ANY of the deep backbends
 * ({@link BACKBEND_IDS}). Pure: reads the input without mutating it.
 */
export function hasBackbend(ids: Iterable<string>): boolean {
  const set = ids instanceof Set ? ids : new Set(ids);
  for (const backbend of BACKBEND_IDS) {
    if (set.has(backbend)) {
      return true;
    }
  }
  return false;
}

/**
 * Normalize a set of pose ids so the counter's presence matches the safety
 * rule. Returns a NEW Set (the input is never mutated):
 *   - if a backbend is present, the counter is ADDED (kept if already there)
 *   - if no backbend is present, the counter is REMOVED (even if it was passed
 *     in explicitly)
 *
 * Both the generator and the manual-selection handler call this as the single
 * source of truth. Pure, deterministic, and idempotent: applying it twice
 * yields the same result as applying it once.
 */
export function applyCounterPoseRule(ids: Iterable<string>): Set<string> {
  const result = new Set(ids);
  if (hasBackbend(result)) {
    result.add(COUNTER_POSE_ID);
  } else {
    result.delete(COUNTER_POSE_ID);
  }
  return result;
}

/**
 * Whether the counter-pose is currently rule-locked, i.e. its presence is
 * forced by the rule and a user must not toggle it off. This is exactly
 * "a backbend is present" ({@link hasBackbend}); the named function exists so
 * call sites (e.g. PoseMap locking the checkbox) read by intent.
 */
export function isCounterPoseLocked(ids: Iterable<string>): boolean {
  return hasBackbend(ids);
}
