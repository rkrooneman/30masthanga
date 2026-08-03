/**
 * selectedPractice — build a GeneratedPractice from a user-editable selection.
 *
 * Pure logic only. No UI, no React.
 *
 * The Overview is now a SELECTION over the full catalog: the practice is the set
 * of pose ids the practitioner has checked, always rendered in canonical
 * `order`. This helper turns that selected-id set (plus the full catalog and a
 * breath pace) into the `GeneratedPractice`-shaped object the guided run and the
 * duration totals consume:
 *   - `poses`        = every catalog pose whose id is in `selectedIds`, sorted
 *                      strictly ascending by canonical `order`.
 *   - `totalSeconds` = sequenceDurationSeconds(those poses, breathSeconds).
 *   - `breathSeconds`= the pace passed in.
 *
 * Unlike the generator this imposes NO 30-minute ceiling: a manual selection may
 * exceed the target freely (the total is shown honestly). The fixed frame is not
 * special-cased here — callers seed/keep the `alwaysInclude` ids in the set; this
 * helper simply materialises whatever is selected, in order.
 *
 * When `vinyasas` is true the total ACCOUNTS for the half-vinyasa inserted
 * between every pair of consecutive seated poses (via the vinyasa-flagged
 * `sequenceDurationSeconds`), so the Overview total the practitioner sees matches
 * what the guided run will actually play.
 */

import type { Pose } from '../types/pose';
import type { GeneratedPractice } from './generatePractice';
import { sequenceDurationSeconds } from './timing';

/**
 * Build the derived practice from a selected-id set. `selectedIds` may be a Set
 * or any iterable-membership container; ids not present in `catalog` are simply
 * ignored. The result is always in canonical order. `vinyasas` (default false)
 * makes the total include the seated→seated half-vinyasas.
 */
export function buildSelectedPractice(
  catalog: Pose[],
  selectedIds: ReadonlySet<string>,
  breathSeconds: number,
  options?: { vinyasas?: boolean },
): GeneratedPractice {
  const poses = catalog
    .filter((p) => selectedIds.has(p.id))
    .sort((a, b) => a.order - b.order);
  return {
    poses,
    totalSeconds: sequenceDurationSeconds(poses, breathSeconds, {
      vinyasas: options?.vinyasas ?? false,
    }),
    breathSeconds,
  };
}

export default buildSelectedPractice;
