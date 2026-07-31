/**
 * Pose type definitions for the 30-minute Ashtanga companion.
 *
 * === drishti convention ===
 * `drishti` is the only remaining yoga-instruction field (the earlier
 * `description` and `bandha` fields were removed in Slice 4). It carries the
 * standardized Ashtanga Primary Series gaze point and MUST be correct before the
 * app can be trusted, so each value is the traditional gaze as codified in the
 * KPJAYI tradition and David Swenson's "The Practice Manual".
 *
 * Any pose whose standardized gaze the drafter was not confident about carries
 * the exact sentinel string `"__UNVERIFIED__"` — treat that as "do not trust,
 * verify me". The older `"NEEDS VERIFICATION"` sentinel may still appear in
 * `phonetic` or `group` on the rare occasion the drafter was genuinely unsure.
 *
 * Numeric fields (`order`, `breaths`, `sides`) are NEVER marked unverified —
 * where a traditional count is ambiguous a sensible default is used and can be
 * tuned later.
 */

/** High-level section of the Primary Series a pose belongs to. */
export type PoseCategory =
  | 'sun_a'
  | 'sun_b'
  | 'standing'
  | 'seated'
  | 'closing'
  | 'finishing';

/**
 * A single practice card in the Primary Series (Yoga Chikitsa) catalog.
 *
 * Field guide:
 * - `id`            Stable snake_case key, e.g. `utthita_trikonasana`. Unique.
 * - `sanskrit`      Sanskrit (romanised) name of the pose.
 * - `phonetic`      Pronunciation guide, e.g. "oo-TEE-tah tree-koh-NAH-sah-nah".
 * - `english`       Common English name.
 * - `category`      Which Primary Series section this pose sits in.
 * - `group`         Lightweight variety sub-tag (e.g. `forward_fold`, `twist`)
 *                   used by the generator for variety; NOT a strict taxonomy.
 * - `order`         Canonical Primary Series position. Strictly increasing across
 *                   the whole catalog. The generator never reorders poses.
 * - `breaths`       Breaths held PER SIDE. For the salutation cards this is the
 *                   total breath count for the whole flow (may be tuned later).
 * - `sides`         1 = single/symmetric; 2 = both sides (left + right).
 *                   Guided practice runs both sides; time math counts both.
 * - `repeat`        How many times this card is performed back-to-back (e.g. Sun
 *                   Salutations ×3). Timing counts all repeats. Default 1.
 * - `alwaysInclude` true = always present in every generated sequence.
 * - `selectable`    false = fixed structural pose, never randomly dropped.
 *                   (alwaysInclude poses are typically selectable:false.)
 * - `drishti`       Standardized Ashtanga gaze point (Sanskrit term + plain
 *                   English target). "__UNVERIFIED__" if not yet confirmed.
 * - `isBasic`       true = a curated root/basic pose included in "Basics only"
 *                   (Smart Start) mode; false = only appears in the full "All
 *                   poses" mode.
 */
export interface Pose {
  id: string;
  sanskrit: string;
  phonetic: string;
  english: string;
  category: PoseCategory;
  group: string;
  order: number;
  breaths: number;
  sides: 1 | 2;
  repeat: number;
  alwaysInclude: boolean;
  selectable: boolean;
  drishti: string;
  isBasic: boolean;
}
