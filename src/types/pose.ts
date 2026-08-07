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
 * the exact sentinel string `"__UNVERIFIED__"` - treat that as "do not trust,
 * verify me". The older `"NEEDS VERIFICATION"` sentinel may still appear in
 * `phonetic` or `group` on the rare occasion the drafter was genuinely unsure.
 *
 * Numeric fields (`order`, `breaths`, `sides`) are NEVER marked unverified -  * where a traditional count is ambiguous a sensible default is used and can be
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
 *                   total WHOLE-BREATH-EQUIVALENT of the whole flow: each single
 *                   half-breath MOVEMENT counts as 0.5, and the Down Dog HOLD
 *                   counts as its whole breaths. It can therefore be fractional
 *                   (Surya A = 9.5, Surya B = 13.5). This equals the flow's true
 *                   duration in breaths, so `poseHoldSeconds` (breaths *
 *                   breathSeconds) stays correct without any special-casing.
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
 * - `flow`          Optional ordered vinyasa breakdown of a multi-breath card
 *                   (currently the two Sun Salutations). When present, the
 *                   guided player walks the `flow` instead of emitting `breaths`
 *                   identical breaths, so it can show the current sub-pose name
 *                   on screen and fire prerecorded voice cues at exact breaths.
 *                   INVARIANT (half-breath model): the flow's total HALF-breaths
 *                   MUST equal the card's `breaths * 2` (enforced by
 *                   validate-poses.ts), where a single-phase MOVEMENT step
 *                   contributes 1 half-breath and a whole-breath HOLD step
 *                   contributes `breaths * 2` half-breaths, so the timing budget
 *                   is unchanged. Cards WITHOUT a `flow` behave exactly as before.
 */

/**
 * One step within a salutation's vinyasa `flow`. A step is EITHER a single
 * half-breath MOVEMENT or a whole-breath HOLD - this distinction is the heart of
 * the Sun Salutation model.
 *
 * === MOVEMENT (single half-breath) - `phase` is SET ===
 * A Sun Salutation moves ONE movement per breath PHASE: inhale = arms up,
 * exhale = fold, inhale = halfway lift, exhale = chaturanga, and so on. So a
 * MOVEMENT step lasts exactly ONE half-breath - a single inhale OR a single
 * exhale - whose duration is `breathSeconds / 2`. Its `phase` ('inhale' |
 * 'exhale') says which half it is; the player plays ONLY that phase and then the
 * NEXT movement's opposite phase continues the rhythm (an inhale movement
 * expands the circle, the following exhale movement contracts it). A movement's
 * `breaths` field is NOT used for whole-breath counting - it is pinned to 1 for
 * schema consistency, but the CANONICAL duration of a movement is half a breath
 * (validate-poses.ts counts a movement as 1 HALF-breath). A movement's cue (if
 * any) fires on its single phase - there is only one - so `cueOn` is irrelevant
 * for movements (both `'first'` and `'last'` resolve to the same one phase).
 *
 * === HOLD (whole breaths) - `phase` is ABSENT ===
 * When `phase` is absent the step is a HOLD of `breaths` WHOLE breaths (the
 * Downward Dog, `breaths: 5, hold: true`) - each hold breath is a full
 * inhale-then-exhale, exactly as a normal held asana. The on-screen "Breath N of
 * M" counts within the hold, so it reads "Breath 1..5 of 5". This is the ONLY
 * kind of step that shows the breath counter; movements hide it and show only
 * the phase word + sub-pose label.
 *
 * At most a handful of entries carry a voice cue; the rest are silent
 * (breath-timed only). Every entry has a `label` shown on screen during that
 * step (Sanskrit sub-pose name, matching the app's Sanskrit-primary styling).
 *
 * Field guide:
 * - `label`   Sub-pose name shown on screen during this step, e.g.
 *             "Adho Mukha Svanasana". Sanskrit for consistency with the app.
 * - `phase`   When SET, marks this step as a single half-breath MOVEMENT and
 *             says which phase it is ('inhale' expands, 'exhale' contracts). When
 *             ABSENT, the step is a whole-breath HOLD.
 * - `breaths` For a HOLD, how many WHOLE breaths it lasts (5 for the Down Dog).
 *             For a MOVEMENT, pinned to 1 but IGNORED for counting - a movement
 *             is always a single half-breath regardless.
 * - `hold`    true for the multi-breath Downward Dog hold (informational; a hold
 *             is identified structurally by the ABSENCE of `phase`).
 * - `cueId`   Voice clip id to play during this step, e.g. `'last_breath'`.
 *             Omitted for silent steps. Maps to `/audio/voice/<cueId>.mp3`.
 * - `cueOn`   For a HOLD, which breath fires `cueId`: `'last'` plays it on the
 *             LAST breath (used for `last_breath` on the Down Dog's 5th breath);
 *             `'first'` plays it on the first breath. For a MOVEMENT there is
 *             only one phase, so the cue always fires on it (kept as `'first'`
 *             by convention).
 */
export interface FlowStep {
  label: string;
  /**
   * When set, this step is a single half-breath MOVEMENT playing only this
   * phase for `breathSeconds / 2`. When absent, the step is a whole-breath HOLD.
   */
  phase?: 'inhale' | 'exhale';
  /**
   * For a HOLD step, an optional half-breath MOVEMENT phase played to move INTO
   * the pose, BEFORE the hold's breaths. e.g. the held Down Dog is entered on an
   * exhale: enterPhase: 'exhale' then `breaths` full breaths. Undefined for holds
   * with no distinct entry movement and for MOVEMENT steps (which already have
   * `phase`). Does not add a separate flow position - it is part of this hold.
   */
  enterPhase?: 'inhale' | 'exhale';
  breaths: number;
  hold?: boolean;
  cueId?: string;
  cueOn?: 'first' | 'last';
}

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
  /**
   * true = an advanced pose (arm balance, deep bind, leg-behind-head, lotus
   * bind) that the random generator never selects; still available in Full
   * series and manual/custom selection. Undefined is treated as false.
   */
  isAdvanced?: boolean;
  /**
   * Optional vinyasa breakdown (see FlowStep). Present on the two Sun
   * Salutations. When set, the flow's total half-breaths (movements count 1,
   * holds count breaths*2) === breaths * 2 (validated in validate-poses.ts).
   */
  flow?: FlowStep[];
}
