/**
 * Pose type definitions for the 30-minute Ashtanga companion.
 *
 * === "NEEDS VERIFICATION" convention ===
 * Some fields carry yoga-instruction content that MUST be correct before the app
 * can be trusted (getting bandha/drishti/description wrong would make the app
 * misleading). For every pose in the catalog, the three instruction fields
 * `description`, `bandha`, and `drishti` are deliberately set to the exact
 * sentinel string `"NEEDS VERIFICATION"`. A human will fill these in against
 * authoritative sources (David Swenson's Ashtanga Yoga "The Practice Manual"
 * and tummee.com).
 *
 * The same sentinel may also appear in `phonetic` or `group` on the rare
 * occasion the drafter was genuinely unsure — treat any occurrence of
 * `"NEEDS VERIFICATION"` as "do not trust, verify me".
 *
 * Numeric fields (`order`, `breaths`, `sides`) are NEVER marked NEEDS
 * VERIFICATION — where a traditional count is ambiguous a sensible default is
 * used and can be tuned later.
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
 * - `alwaysInclude` true = always present in every generated sequence.
 * - `selectable`    false = fixed structural pose, never randomly dropped.
 *                   (alwaysInclude poses are typically selectable:false.)
 * - `description`   Cueing / how-to. Currently "NEEDS VERIFICATION".
 * - `bandha`        Engaged energetic lock(s). Currently "NEEDS VERIFICATION".
 * - `drishti`       Gaze point. Currently "NEEDS VERIFICATION".
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
  alwaysInclude: boolean;
  selectable: boolean;
  description: string;
  bandha: string;
  drishti: string;
}
