/**
 * Flow-label icon map for the sun-salutation and UHP vinyasa flows.
 *
 * The {@link poseIcons} registry in `registry.ts` is keyed by catalog pose `id`
 * (snake_case, from `src/data/poses.ts`). The positions INSIDE a salutation or
 * UHP flow are not catalog poses though: they are `flow[].label` STRINGS (e.g.
 * "Urdhva Hastasana", "Adho Mukha Svanasana", "Virabhadrasana A (right)"), and
 * most of them have no catalog `id` at all. This module provides the separate
 * label-based lookup {@link flowIconFor} that maps those flow labels to their
 * silhouette icon components.
 *
 * Reuse: three of the flow labels DO correspond to real catalog poses, so we
 * reuse the exact same icon components the registry already uses for them:
 *   - "Utkatasana"                     -> Utkatasana        (catalog `utkatasana`)
 *   - "Virabhadrasana A (right/left)"  -> VirabhadrasanaA   (catalog `virabhadrasana_a`)
 *   - "Utthita Hasta Padangusthasana"  -> UtthitaHastaPadangusthasana
 *                                         (catalog `utthita_hasta_padangusthasana`)
 * The remaining labels use the dedicated silhouettes added for the flow strip.
 *
 * Side suffixes: Virabhadrasana A appears in Surya B as "Virabhadrasana A
 * (right)" and "Virabhadrasana A (left)". We normalize by stripping a trailing
 * " (right)" / " (left)" side suffix so both resolve to the same VirabhadrasanaA
 * icon. The UHP " (head to knee)" / " (hands on hips)" suffixes are NOT side
 * suffixes (they are distinct stages with their own icons), so they are mapped
 * explicitly and are not stripped.
 */

import type { PoseIconComponent } from './registry';

// Dedicated flow silhouettes (no catalog id of their own).
import UrdhvaHastasana from './UrdhvaHastasana';
import Uttanasana from './Uttanasana';
import ArdhaUttanasana from './ArdhaUttanasana';
import ChaturangaDandasana from './ChaturangaDandasana';
import UrdhvaMukhaSvanasana from './UrdhvaMukhaSvanasana';
import AdhoMukhaSvanasana from './AdhoMukhaSvanasana';
import Samasthiti from './Samasthiti';
import UhpHeadToKnee from './UhpHeadToKnee';
import UhpHandsOnHips from './UhpHandsOnHips';
import ParsvaHastaPadangusthasana from './ParsvaHastaPadangusthasana';

// Reused catalog icons (same components the registry maps by id).
import Utkatasana from './Utkatasana';
import VirabhadrasanaA from './VirabhadrasanaA';
import UtthitaHastaPadangusthasana from './UtthitaHastaPadangusthasana';

/**
 * Map of flow-position label -> icon component. Keys are the exact
 * `flow[].label` strings from `src/data/poses.ts`, except the Virabhadrasana A
 * side variants, which are normalized (see {@link flowIconFor}).
 */
export const flowIcons: Record<string, PoseIconComponent> = {
  'Urdhva Hastasana': UrdhvaHastasana,
  Uttanasana: Uttanasana,
  'Ardha Uttanasana': ArdhaUttanasana,
  'Chaturanga Dandasana': ChaturangaDandasana,
  'Urdhva Mukha Svanasana': UrdhvaMukhaSvanasana,
  'Adho Mukha Svanasana': AdhoMukhaSvanasana,
  Samasthiti: Samasthiti,
  Utkatasana: Utkatasana,
  // Virabhadrasana A is stored side-suffixed in the flow; the suffix is stripped
  // before lookup so both "(right)" and "(left)" land on this single entry.
  'Virabhadrasana A': VirabhadrasanaA,
  'Utthita Hasta Padangusthasana': UtthitaHastaPadangusthasana,
  'Utthita Hasta Padangusthasana (head to knee)': UhpHeadToKnee,
  'Utthita Hasta Padangusthasana (hands on hips)': UhpHandsOnHips,
  'Parsva Hasta Padangusthasana': ParsvaHastaPadangusthasana,
};

/**
 * Strip a trailing " (right)" / " (left)" SIDE suffix from a flow label so both
 * sides of a side-labelled pose (e.g. Virabhadrasana A) resolve to one icon.
 * Only these two side words are stripped; descriptive suffixes such as
 * "(head to knee)" or "(hands on hips)" are left intact.
 */
function stripSideSuffix(label: string): string {
  return label.replace(/ \((?:right|left)\)$/, '');
}

/**
 * Look up the icon component for a salutation / UHP flow-position label.
 * Returns undefined for an unknown label so callers can render a placeholder
 * (or nothing). Virabhadrasana A "(right)"/"(left)" both resolve to the same
 * VirabhadrasanaA icon.
 */
export function flowIconFor(label: string): PoseIconComponent | undefined {
  const direct = flowIcons[label];
  if (direct !== undefined) return direct;
  return flowIcons[stripSideSuffix(label)];
}
