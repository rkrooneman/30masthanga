/**
 * Ashtanga Primary Series (Yoga Chikitsa) pose catalog.
 *
 * SLICE 1 SCOPE: data + types only. No UI, no generation logic.
 *
 * === drishti convention ===
 * `drishti` is the single remaining yoga-instruction field (description and
 * bandha were removed in Slice 4). Each value is the standardized Ashtanga
 * Primary Series gaze point (the nine traditional drishtis as codified in the
 * KPJAYI tradition and David Swenson's "The Practice Manual"), given as the
 * Sanskrit drishti term plus the plain-English target, e.g.
 * "Nasagrai (tip of the nose)".
 *
 * All drishti values have been reviewed against the convention above; no pose
 * currently carries the "__UNVERIFIED__" sentinel. That sentinel remains
 * available for future edits: set a pose's drishti to the exact string
 * "__UNVERIFIED__" to mark a gaze a human should confirm against Swenson before
 * it is trusted (the UI treats it as "unverified" and hides it). `phonetic` and
 * `group` may still carry the older "NEEDS VERIFICATION" sentinel where the
 * drafter was genuinely unsure.
 *
 * === order ===
 * `order` is strictly increasing across the whole array in canonical Primary
 * Series sequence, in gaps of 10 so poses can be inserted later without
 * renumbering.
 *
 * === alwaysInclude choices (beyond salutations + savasana) ===
 * The following are marked alwaysInclude:true:
 *   - surya_namaskara_a    (opening, structural)
 *   - surya_namaskara_b    (opening, structural)
 *   - salamba_sarvangasana (Supported Shoulderstand — mandatory safe close)
 *   - savasana             (final rest, safety)
 * Shoulderstand is always included so every shortened practice ends with a
 * proper inversion-based close before Savasana (a deliberate safety/tradition
 * choice made by the practitioner). The rest of the closing/finishing frame
 * (Sirsasana headstand, Padmasana, Utpluthih, etc.) remains
 * alwaysInclude:false, selectable:true so the generator keeps freedom to build
 * a ~30-minute practice. To make more finishing poses mandatory, flip those
 * flags here — no other code depends on it.
 *
 * === breaths ===
 * Most held asanas = 5 breaths (traditional). Salutation cards carry the whole
 * flow's WHOLE-BREATH-EQUIVALENT, under the half-breath movement model: each
 * vinyasa MOVEMENT is a single breath PHASE (one inhale OR one exhale, lasting
 * `breathSeconds / 2`), so it counts as HALF a breath; only the Downward Dog is
 * HELD for whole breaths. A Surya A round is 9 movement half-breaths + a
 * 5-breath Down Dog hold = 9.5 breaths; a Surya B round is 17 movement
 * half-breaths + a 5-breath Down Dog hold = 13.5 breaths. These fractional
 * counts are the real duration in breaths, so `poseHoldSeconds` (breaths *
 * breathSeconds) stays correct with no special-casing. Longer holds
 * (shoulderstand, headstand, savasana) use longer whole counts. Where a count is
 * genuinely ambiguous, 5 is used as a tunable default (numeric fields are never
 * marked NEEDS VERIFICATION).
 *
 * === isBasic (Basics only / Smart Start mode) ===
 * `isBasic: true` marks a curated root/basic pose that is included in the app's
 * "Basics only" (Smart Start) mode — a shorter practice built from the essential
 * root poses per a teaching guide. Poses with `isBasic: false` only appear in
 * the full "All poses" mode. The fixed frame (both salutations, Shoulderstand,
 * Savasana) is marked `isBasic: true` so the always-present frame remains valid
 * in Basics mode.
 *
 * === sides ===
 * 2 = practiced on both left and right (asymmetric poses, twists);
 * 1 = symmetric / single (salutations, symmetric forward folds, savasana).
 *
 * === repeat ===
 * How many times a card is performed back-to-back. Nearly every pose is 1.
 * Following traditional Ashtanga practice the sun salutations are repeated:
 * Surya A ×3 and Surya B ×3 at the start of every practice (repeat: 3 on both).
 * Timing counts all repeats plus the internal transitions between them. Tune
 * the repetition counts here — no other code depends on the specific values.
 */

import type { Pose } from '../types/pose';

export const poses: Pose[] = [
  // ----- Sun Salutations (one card each, whole flow) -----
  {
    id: 'surya_namaskara_a',
    sanskrit: 'Surya Namaskara A',
    phonetic: 'SOOR-yah nah-mas-KAR-ah AH',
    english: 'Sun Salutation A',
    category: 'sun_a',
    group: 'salutation',
    order: 10,
    // 9.5 breaths per round (half-breath movement model) — the FULL authentic
    // Surya A vinyasa. Each vinyasa MOVEMENT is a single breath PHASE (one inhale
    // OR one exhale, `breathSeconds / 2`), so it counts as HALF a breath; only
    // the Downward Dog is HELD for 5 whole breaths. 9 movement phases (=4.5
    // breaths) + the 5-breath Down Dog hold = 9.5 whole-breath-equivalents.
    // `last_breath` fires on the LAST (5th) breath of the Down Dog hold;
    // `step_jump_forward` fires on the jump-forward inhale movement; the
    // `samasthiti` cue fires on the final Samasthiti exhale movement. The flow's
    // half-breaths (movements=1 each, hold=5*2) must equal breaths*2=19 (enforced
    // by validate-poses.ts). See flow below.
    breaths: 9.5,
    sides: 1,
    repeat: 3,
    alwaysInclude: true,
    selectable: false,
    drishti: 'Nasagrai (tip of the nose) — varies through the flow',
    isBasic: true,
    // Surya A vinyasa (half-breath movement model): 9 single-phase MOVEMENTS
    // (alternating inhale/exhale) around a 5-breath Down Dog HOLD. Movement 6 is
    // the EXHALE INTO Down Dog modelled AS the hold's first breath — i.e. the
    // hold IS the Down Dog, entered on that exhale and held for 5 whole breaths.
    // `last_breath` plays on the LAST (5th) breath of the hold; `step_jump_forward`
    // plays on the jump-forward inhale movement (step 7); the `samasthiti` cue
    // plays on the closing Samasthiti exhale movement (step 10) — all data-driven.
    flow: [
      { label: 'Urdhva Hastasana', phase: 'inhale', breaths: 1 }, // 1 inhale — reach up
      { label: 'Uttanasana', phase: 'exhale', breaths: 1 }, // 2 exhale — fold
      { label: 'Ardha Uttanasana', phase: 'inhale', breaths: 1 }, // 3 inhale — halfway lift
      { label: 'Chaturanga Dandasana', phase: 'exhale', breaths: 1 }, // 4 exhale — jump back
      { label: 'Urdhva Mukha Svanasana', phase: 'inhale', breaths: 1 }, // 5 inhale — up dog
      {
        label: 'Adho Mukha Svanasana', // 6 down dog — the 5-breath HOLD (entered on the exhale)
        breaths: 5,
        hold: true,
        cueId: 'last_breath',
        cueOn: 'last',
      },
      {
        label: 'Ardha Uttanasana', // 7 inhale — jump forward, halfway lift
        phase: 'inhale',
        breaths: 1,
        cueId: 'step_jump_forward',
        cueOn: 'first',
      },
      { label: 'Uttanasana', phase: 'exhale', breaths: 1 }, // 8 exhale — fold
      { label: 'Urdhva Hastasana', phase: 'inhale', breaths: 1 }, // 9 inhale — rise up
      {
        label: 'Samasthiti', // 10 exhale — return to standing stillness, closing the round
        phase: 'exhale',
        breaths: 1,
        cueId: 'samasthiti',
        cueOn: 'first',
      },
    ],
  },
  {
    id: 'surya_namaskara_b',
    sanskrit: 'Surya Namaskara B',
    phonetic: 'SOOR-yah nah-mas-KAR-ah BEE',
    english: 'Sun Salutation B',
    category: 'sun_b',
    group: 'salutation',
    order: 20,
    // 13.5 breaths per round (half-breath movement model) — the FULL authentic
    // Surya B vinyasa, fully modeled (both intermediate Down Dogs present as
    // single exhale movements, only the FINAL Down Dog is HELD). Each vinyasa
    // MOVEMENT is a single breath PHASE (one inhale OR one exhale, `breathSeconds
    // / 2`), counting as HALF a breath. 17 movement phases (=8.5 breaths) + the
    // 5-breath FINAL Down Dog hold = 13.5 whole-breath-equivalents. The flow's
    // half-breaths (movements=1 each, hold=5*2) must equal breaths*2=27 (enforced
    // by validate-poses.ts). See flow below.
    breaths: 13.5,
    sides: 1,
    repeat: 3,
    alwaysInclude: true,
    selectable: false,
    drishti: 'Nasagrai (tip of the nose) — varies through the flow',
    isBasic: true,
    // Surya B vinyasa (half-breath movement model): 17 single-phase MOVEMENTS
    // (alternating inhale/exhale) with the FINAL Down Dog as the 5-breath HOLD.
    // This is the strict canonical B: BOTH intermediate Down Dogs are present as
    // single EXHALE movements (one after each Warrior A side, NOT held), the two
    // Warrior A steps are side-labelled (right / left), and the exit (jump forward
    // / fold / chair) is counted as movements, closing with the Samasthiti return.
    // `last_breath` plays on the LAST (5th) breath of the final Down Dog hold;
    // `step_jump_forward` plays on the jump-forward inhale movement (step 15); the
    // `samasthiti` cue plays on the closing Samasthiti exhale movement (step 18) —
    // all data-driven.
    flow: [
      { label: 'Utkatasana', phase: 'inhale', breaths: 1 }, // 1  inhale — chair
      { label: 'Uttanasana', phase: 'exhale', breaths: 1 }, // 2  exhale — fold
      { label: 'Ardha Uttanasana', phase: 'inhale', breaths: 1 }, // 3  inhale — halfway lift
      { label: 'Chaturanga Dandasana', phase: 'exhale', breaths: 1 }, // 4  exhale — jump back
      { label: 'Urdhva Mukha Svanasana', phase: 'inhale', breaths: 1 }, // 5  inhale — up dog
      { label: 'Adho Mukha Svanasana', phase: 'exhale', breaths: 1 }, // 6  exhale — down dog (single)
      { label: 'Virabhadrasana A (right)', phase: 'inhale', breaths: 1 }, // 7  inhale — warrior 1 right
      { label: 'Chaturanga Dandasana', phase: 'exhale', breaths: 1 }, // 8  exhale — jump back
      { label: 'Urdhva Mukha Svanasana', phase: 'inhale', breaths: 1 }, // 9  inhale — up dog
      { label: 'Adho Mukha Svanasana', phase: 'exhale', breaths: 1 }, // 10 exhale — down dog (intermediate)
      { label: 'Virabhadrasana A (left)', phase: 'inhale', breaths: 1 }, // 11 inhale — warrior 1 left
      { label: 'Chaturanga Dandasana', phase: 'exhale', breaths: 1 }, // 12 exhale — jump back
      { label: 'Urdhva Mukha Svanasana', phase: 'inhale', breaths: 1 }, // 13 inhale — up dog
      {
        label: 'Adho Mukha Svanasana', // 14 final downward dog — the 5-breath HOLD (entered on the exhale)
        breaths: 5,
        hold: true,
        cueId: 'last_breath',
        cueOn: 'last',
      },
      {
        label: 'Ardha Uttanasana', // 15 inhale — jump forward, halfway lift
        phase: 'inhale',
        breaths: 1,
        cueId: 'step_jump_forward',
        cueOn: 'first',
      },
      { label: 'Uttanasana', phase: 'exhale', breaths: 1 }, // 16 exhale — fold
      { label: 'Utkatasana', phase: 'inhale', breaths: 1 }, // 17 inhale — chair
      {
        label: 'Samasthiti', // 18 exhale — return to standing stillness, closing the round
        phase: 'exhale',
        breaths: 1,
        cueId: 'samasthiti',
        cueOn: 'first',
      },
    ],
  },

  // ----- Standing sequence -----
  {
    id: 'padangusthasana',
    sanskrit: 'Padangusthasana',
    phonetic: 'pah-dahng-goosh-TAH-sah-nah',
    english: 'Big Toe Pose',
    category: 'standing',
    group: 'forward_fold',
    order: 30,
    breaths: 5,
    sides: 1,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Nasagrai (tip of the nose)',
    isBasic: true,
  },
  {
    id: 'padahastasana',
    sanskrit: 'Padahastasana',
    phonetic: 'pah-dah-hahs-TAH-sah-nah',
    english: 'Hand Under Foot Pose',
    category: 'standing',
    group: 'forward_fold',
    order: 40,
    breaths: 5,
    sides: 1,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Nasagrai (tip of the nose)',
    isBasic: false,
  },
  {
    id: 'utthita_trikonasana',
    sanskrit: 'Utthita Trikonasana',
    phonetic: 'oo-TEE-tah tree-koh-NAH-sah-nah',
    english: 'Extended Triangle Pose',
    category: 'standing',
    group: 'lateral',
    order: 50,
    breaths: 5,
    sides: 2,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Hastagrai (fingertips of the top hand)',
    isBasic: true,
  },
  {
    id: 'parivrtta_trikonasana',
    sanskrit: 'Parivrtta Trikonasana',
    phonetic: 'pah-ree-VREE-tah tree-koh-NAH-sah-nah',
    english: 'Revolved Triangle Pose',
    category: 'standing',
    group: 'twist',
    order: 60,
    breaths: 5,
    sides: 2,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Hastagrai (fingertips of the top hand)',
    isBasic: true,
  },
  {
    id: 'utthita_parsvakonasana',
    sanskrit: 'Utthita Parsvakonasana',
    phonetic: 'oo-TEE-tah parsh-vah-koh-NAH-sah-nah',
    english: 'Extended Side Angle Pose',
    category: 'standing',
    group: 'lateral',
    order: 70,
    breaths: 5,
    sides: 2,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Hastagrai (raised hand)',
    isBasic: true,
  },
  {
    id: 'parivrtta_parsvakonasana',
    sanskrit: 'Parivrtta Parsvakonasana',
    phonetic: 'pah-ree-VREE-tah parsh-vah-koh-NAH-sah-nah',
    english: 'Revolved Side Angle Pose',
    category: 'standing',
    group: 'twist',
    order: 80,
    breaths: 5,
    sides: 2,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Hastagrai (raised hand)',
    isBasic: false,
  },
  {
    id: 'prasarita_padottanasana_a',
    sanskrit: 'Prasarita Padottanasana A',
    phonetic: 'prah-sah-REE-tah pah-doh-tahn-AH-sah-nah AH',
    english: 'Wide-Legged Forward Fold A',
    category: 'standing',
    group: 'forward_fold',
    order: 90,
    breaths: 5,
    sides: 1,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Nasagrai (tip of the nose)',
    isBasic: true,
  },
  {
    id: 'prasarita_padottanasana_b',
    sanskrit: 'Prasarita Padottanasana B',
    phonetic: 'prah-sah-REE-tah pah-doh-tahn-AH-sah-nah BEE',
    english: 'Wide-Legged Forward Fold B',
    category: 'standing',
    group: 'forward_fold',
    order: 100,
    breaths: 5,
    sides: 1,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Nasagrai (tip of the nose)',
    isBasic: false,
  },
  {
    id: 'prasarita_padottanasana_c',
    sanskrit: 'Prasarita Padottanasana C',
    phonetic: 'prah-sah-REE-tah pah-doh-tahn-AH-sah-nah SEE',
    english: 'Wide-Legged Forward Fold C',
    category: 'standing',
    group: 'forward_fold',
    order: 110,
    breaths: 5,
    sides: 1,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Nasagrai (tip of the nose)',
    isBasic: false,
  },
  {
    id: 'prasarita_padottanasana_d',
    sanskrit: 'Prasarita Padottanasana D',
    phonetic: 'prah-sah-REE-tah pah-doh-tahn-AH-sah-nah DEE',
    english: 'Wide-Legged Forward Fold D',
    category: 'standing',
    group: 'forward_fold',
    order: 120,
    breaths: 5,
    sides: 1,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Nasagrai (tip of the nose)',
    isBasic: false,
  },
  {
    id: 'parsvottanasana',
    sanskrit: 'Parsvottanasana',
    phonetic: 'parsh-voh-tahn-AH-sah-nah',
    english: 'Intense Side Stretch Pose',
    category: 'standing',
    group: 'forward_fold',
    order: 130,
    breaths: 5,
    sides: 2,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Nasagrai (tip of the nose)',
    isBasic: false,
  },
  {
    id: 'utthita_hasta_padangusthasana',
    sanskrit: 'Utthita Hasta Padangusthasana',
    phonetic: 'oo-TEE-tah HAH-stah pah-dahng-goosh-TAH-sah-nah',
    english: 'Extended Hand-to-Big-Toe Pose',
    category: 'standing',
    group: 'balance',
    order: 140,
    // Not a single hold: each side is a 4-stage sequence (16 breaths), run on
    // the right leg then, after a "switch sides" transition, the left. The flow
    // stages are all holds (whole breaths); sum(flow.breaths) === breaths (16).
    breaths: 16,
    sides: 2,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Padhayoragrai (toes)',
    isBasic: false,
    flow: [
      { label: 'Utthita Hasta Padangusthasana', breaths: 5, hold: true }, // toe hold, leg forward
      { label: 'Parsva Hasta Padangusthasana', breaths: 5, hold: true }, // leg out to the side, gaze side
      { label: 'Utthita Hasta Padangusthasana', breaths: 1, hold: true }, // back to front, head to knee, then upright
      { label: 'Utthita Hasta Padangusthasana', breaths: 5, hold: true }, // hands on hips, leg lifted, balance
    ],
  },
  {
    id: 'ardha_baddha_padmottanasana',
    sanskrit: 'Ardha Baddha Padmottanasana',
    phonetic: 'ARE-dah BAH-dah pahd-moh-tahn-AH-sah-nah',
    english: 'Half Bound Lotus Forward Fold',
    category: 'standing',
    group: 'balance',
    order: 150,
    breaths: 5,
    sides: 2,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Nasagrai (tip of the nose)',
    isBasic: false,
  },
  {
    id: 'utkatasana',
    sanskrit: 'Utkatasana',
    phonetic: 'oot-kah-TAH-sah-nah',
    english: 'Fierce Pose / Chair Pose',
    category: 'standing',
    group: 'balance',
    order: 160,
    breaths: 5,
    sides: 1,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Angusthamadhyai / Urdhva (up to the thumbs)',
    isBasic: false,
  },
  {
    id: 'virabhadrasana_a',
    sanskrit: 'Virabhadrasana A',
    phonetic: 'veer-ah-bah-DRAH-sah-nah AH',
    english: 'Warrior I',
    category: 'standing',
    group: 'balance',
    order: 170,
    breaths: 5,
    sides: 2,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Angusthamadhyai / Urdhva (up to the thumbs)',
    isBasic: false,
  },
  {
    id: 'virabhadrasana_b',
    sanskrit: 'Virabhadrasana B',
    phonetic: 'veer-ah-bah-DRAH-sah-nah BEE',
    english: 'Warrior II',
    category: 'standing',
    group: 'balance',
    order: 180,
    breaths: 5,
    sides: 2,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Hastagrai (front hand)',
    isBasic: false,
  },

  // ----- Seated sequence -----
  {
    id: 'dandasana',
    sanskrit: 'Dandasana',
    phonetic: 'dahn-DAH-sah-nah',
    english: 'Staff Pose',
    category: 'seated',
    group: 'counter',
    order: 190,
    breaths: 5,
    sides: 1,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Nasagrai (tip of the nose)',
    isBasic: false,
  },
  {
    id: 'paschimottanasana',
    sanskrit: 'Paschimottanasana',
    phonetic: 'pah-shee-moh-tahn-AH-sah-nah',
    english: 'Seated Forward Fold',
    category: 'seated',
    group: 'forward_fold',
    order: 200,
    breaths: 5,
    sides: 1,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Padhayoragrai (toes)',
    isBasic: true,
  },
  {
    id: 'purvottanasana',
    sanskrit: 'Purvottanasana',
    phonetic: 'poor-voh-tahn-AH-sah-nah',
    english: 'Upward Plank / Intense East Stretch',
    category: 'seated',
    group: 'counter',
    order: 210,
    breaths: 5,
    sides: 1,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Broomadhya / Nasagrai (third eye / tip of the nose)',
    isBasic: true,
  },
  {
    id: 'ardha_baddha_padma_paschimottanasana',
    sanskrit: 'Ardha Baddha Padma Paschimottanasana',
    phonetic: 'ARE-dah BAH-dah PAHD-mah pah-shee-moh-tahn-AH-sah-nah',
    english: 'Half Bound Lotus Seated Forward Fold',
    category: 'seated',
    group: 'forward_fold',
    order: 220,
    breaths: 5,
    sides: 2,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Padhayoragrai (toes)',
    isBasic: false,
  },
  {
    id: 'trianga_mukhaikapada_paschimottanasana',
    sanskrit: 'Trianga Mukhaikapada Paschimottanasana',
    phonetic: 'tree-AHNG-ah moo-kai-kah-PAH-dah pah-shee-moh-tahn-AH-sah-nah',
    english: 'Three-Limbs-Facing-One-Leg Forward Fold',
    category: 'seated',
    group: 'forward_fold',
    order: 230,
    breaths: 5,
    sides: 2,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Padhayoragrai (toes)',
    isBasic: false,
  },
  {
    id: 'janu_sirsasana_a',
    sanskrit: 'Janu Sirsasana A',
    phonetic: 'JAH-noo shear-SHAH-sah-nah AH',
    english: 'Head-to-Knee Pose A',
    category: 'seated',
    group: 'forward_fold',
    order: 240,
    breaths: 5,
    sides: 2,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Padhayoragrai (toes)',
    isBasic: true,
  },
  {
    id: 'janu_sirsasana_b',
    sanskrit: 'Janu Sirsasana B',
    phonetic: 'JAH-noo shear-SHAH-sah-nah BEE',
    english: 'Head-to-Knee Pose B',
    category: 'seated',
    group: 'forward_fold',
    order: 250,
    breaths: 5,
    sides: 2,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Padhayoragrai (toes)',
    isBasic: false,
  },
  {
    id: 'janu_sirsasana_c',
    sanskrit: 'Janu Sirsasana C',
    phonetic: 'JAH-noo shear-SHAH-sah-nah SEE',
    english: 'Head-to-Knee Pose C',
    category: 'seated',
    group: 'forward_fold',
    order: 260,
    breaths: 5,
    sides: 2,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Padhayoragrai (toes)',
    isBasic: false,
  },
  {
    id: 'marichyasana_a',
    sanskrit: 'Marichyasana A',
    phonetic: 'mah-ree-chee-AH-sah-nah AH',
    english: 'Pose Dedicated to Marichi A',
    category: 'seated',
    group: 'forward_fold',
    order: 270,
    breaths: 5,
    sides: 2,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Padhayoragrai (toes)',
    isBasic: false,
  },
  {
    id: 'marichyasana_b',
    sanskrit: 'Marichyasana B',
    phonetic: 'mah-ree-chee-AH-sah-nah BEE',
    english: 'Pose Dedicated to Marichi B',
    category: 'seated',
    group: 'forward_fold',
    order: 280,
    breaths: 5,
    sides: 2,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Nasagrai (tip of the nose)',
    isBasic: false,
  },
  {
    id: 'marichyasana_c',
    sanskrit: 'Marichyasana C',
    phonetic: 'mah-ree-chee-AH-sah-nah SEE',
    english: 'Pose Dedicated to Marichi C',
    category: 'seated',
    group: 'twist',
    order: 290,
    breaths: 5,
    sides: 2,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Parsva (far to the side)',
    isBasic: true,
  },
  {
    id: 'marichyasana_d',
    sanskrit: 'Marichyasana D',
    phonetic: 'mah-ree-chee-AH-sah-nah DEE',
    english: 'Pose Dedicated to Marichi D',
    category: 'seated',
    group: 'twist',
    order: 300,
    breaths: 5,
    sides: 2,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Parsva (far to the side)',
    isBasic: false,
  },
  {
    id: 'navasana',
    sanskrit: 'Navasana',
    phonetic: 'nah-VAH-sah-nah',
    english: 'Boat Pose',
    category: 'seated',
    group: 'arm_balance',
    order: 310,
    breaths: 5,
    sides: 1,
    // Traditionally repeated 5 times (5 breaths each), with a lift between rounds.
    repeat: 5,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Padhayoragrai (toes)',
    isBasic: true,
  },
  {
    id: 'bhujapidasana',
    sanskrit: 'Bhujapidasana',
    phonetic: 'boo-jah-pee-DAH-sah-nah',
    english: 'Shoulder-Pressing Pose',
    category: 'seated',
    group: 'arm_balance',
    order: 320,
    breaths: 5,
    sides: 1,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Nasagrai (tip of the nose)',
    isBasic: false,
  },
  {
    id: 'kurmasana',
    sanskrit: 'Kurmasana',
    phonetic: 'koor-MAH-sah-nah',
    english: 'Tortoise Pose',
    category: 'seated',
    group: 'forward_fold',
    order: 330,
    breaths: 5,
    sides: 1,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Broomadhya / Nasagrai (third eye / tip of the nose)',
    isBasic: false,
  },
  {
    id: 'supta_kurmasana',
    sanskrit: 'Supta Kurmasana',
    phonetic: 'SOOP-tah koor-MAH-sah-nah',
    english: 'Sleeping Tortoise Pose',
    category: 'seated',
    group: 'forward_fold',
    order: 340,
    breaths: 5,
    sides: 1,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Broomadhya / Nasagrai (third eye / tip of the nose)',
    isBasic: false,
  },
  {
    id: 'garbha_pindasana',
    sanskrit: 'Garbha Pindasana',
    phonetic: 'GAR-bah pin-DAH-sah-nah',
    english: 'Embryo-in-the-Womb Pose',
    category: 'seated',
    group: 'hip_opener',
    order: 350,
    breaths: 5,
    sides: 1,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Nasagrai (tip of the nose)',
    isBasic: false,
  },
  {
    id: 'kukkutasana',
    sanskrit: 'Kukkutasana',
    phonetic: 'koo-koo-TAH-sah-nah',
    english: 'Rooster Pose',
    category: 'seated',
    group: 'arm_balance',
    order: 360,
    breaths: 5,
    sides: 1,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Nasagrai (tip of the nose)',
    isBasic: false,
  },
  {
    id: 'baddha_konasana',
    sanskrit: 'Baddha Konasana',
    phonetic: 'BAH-dah koh-NAH-sah-nah',
    english: 'Bound Angle Pose',
    category: 'seated',
    group: 'hip_opener',
    order: 370,
    breaths: 5,
    sides: 1,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Nasagrai (tip of the nose)',
    isBasic: true,
  },
  {
    id: 'upavistha_konasana',
    sanskrit: 'Upavistha Konasana',
    phonetic: 'oo-pah-VEESH-tah koh-NAH-sah-nah',
    english: 'Wide-Angle Seated Forward Fold',
    category: 'seated',
    group: 'forward_fold',
    order: 380,
    breaths: 5,
    sides: 1,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Urdhva / Antara Drishti (up to the sky)',
    isBasic: false,
  },
  {
    id: 'supta_konasana',
    sanskrit: 'Supta Konasana',
    phonetic: 'SOOP-tah koh-NAH-sah-nah',
    english: 'Reclining Angle Pose',
    category: 'seated',
    group: 'forward_fold',
    order: 390,
    breaths: 5,
    sides: 1,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Padhayoragrai (toes)',
    isBasic: false,
  },
  {
    id: 'supta_padangusthasana',
    sanskrit: 'Supta Padangusthasana',
    phonetic: 'SOOP-tah pah-dahng-goosh-TAH-sah-nah',
    english: 'Reclining Big Toe Pose',
    category: 'seated',
    group: 'hip_opener',
    order: 400,
    breaths: 5,
    sides: 2,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Padhayoragrai (toes)',
    isBasic: false,
  },
  {
    id: 'ubhaya_padangusthasana',
    sanskrit: 'Ubhaya Padangusthasana',
    phonetic: 'oo-BHAH-yah pah-dahng-goosh-TAH-sah-nah',
    english: 'Both Big Toes Pose',
    category: 'seated',
    group: 'forward_fold',
    order: 410,
    breaths: 5,
    sides: 1,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Urdhva / Antara Drishti (up to the sky)',
    isBasic: false,
  },
  {
    id: 'urdhva_mukha_paschimottanasana',
    sanskrit: 'Urdhva Mukha Paschimottanasana',
    phonetic: 'OORD-vah MOO-kah pah-shee-moh-tahn-AH-sah-nah',
    english: 'Upward-Facing Forward Fold',
    category: 'seated',
    group: 'forward_fold',
    order: 420,
    breaths: 5,
    sides: 1,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Padhayoragrai (toes)',
    isBasic: false,
  },
  {
    id: 'setu_bandhasana',
    sanskrit: 'Setu Bandhasana',
    phonetic: 'SEH-too bahn-DHAH-sah-nah',
    english: 'Bridge Pose (Primary Series variant)',
    category: 'seated',
    group: 'backbend',
    order: 430,
    breaths: 5,
    sides: 1,
    // Traditionally repeated 3 times.
    repeat: 3,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Nasagrai (tip of the nose)',
    isBasic: true,
  },

  // ----- Closing / finishing sequence -----
  {
    id: 'urdhva_dhanurasana',
    sanskrit: 'Urdhva Dhanurasana',
    phonetic: 'OORD-vah dah-noor-AH-sah-nah',
    english: 'Upward Bow / Wheel Pose',
    category: 'closing',
    group: 'backbend',
    order: 440,
    breaths: 5,
    sides: 1,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Nasagrai (tip of the nose / between the hands)',
    isBasic: true,
  },
  {
    id: 'paschimottanasana_closing',
    sanskrit: 'Paschimottanasana',
    phonetic: 'pah-shee-moh-tahn-AH-sah-nah',
    english: 'Seated Forward Fold (closing counter)',
    category: 'closing',
    group: 'forward_fold',
    order: 450,
    breaths: 5,
    sides: 1,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Padhayoragrai (toes)',
    isBasic: false,
  },
  {
    id: 'salamba_sarvangasana',
    sanskrit: 'Salamba Sarvangasana',
    phonetic: 'sah-LAHM-bah sar-vahn-GAH-sah-nah',
    english: 'Supported Shoulderstand',
    category: 'closing',
    group: 'inversion',
    order: 460,
    breaths: 10,
    sides: 1,
    repeat: 1,
    alwaysInclude: true,
    selectable: false,
    drishti: 'Nasagrai (tip of the nose)',
    isBasic: true,
  },
  {
    id: 'halasana',
    sanskrit: 'Halasana',
    phonetic: 'hah-LAH-sah-nah',
    english: 'Plough Pose',
    category: 'closing',
    group: 'inversion',
    order: 470,
    breaths: 5,
    sides: 1,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Nasagrai (tip of the nose)',
    isBasic: false,
  },
  {
    id: 'karnapidasana',
    sanskrit: 'Karnapidasana',
    phonetic: 'kar-nah-pee-DAH-sah-nah',
    english: 'Ear-Pressure Pose',
    category: 'closing',
    group: 'inversion',
    order: 480,
    breaths: 5,
    sides: 1,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Nasagrai (tip of the nose)',
    isBasic: false,
  },
  {
    id: 'urdhva_padmasana',
    sanskrit: 'Urdhva Padmasana',
    phonetic: 'OORD-vah pahd-MAH-sah-nah',
    english: 'Upward Lotus Pose',
    category: 'closing',
    group: 'inversion',
    order: 490,
    breaths: 5,
    sides: 1,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Nasagrai (tip of the nose)',
    isBasic: false,
  },
  {
    id: 'pindasana',
    sanskrit: 'Pindasana',
    phonetic: 'pin-DAH-sah-nah',
    english: 'Embryo Pose',
    category: 'closing',
    group: 'inversion',
    order: 500,
    breaths: 5,
    sides: 1,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Nasagrai (tip of the nose)',
    isBasic: false,
  },
  {
    id: 'matsyasana',
    sanskrit: 'Matsyasana',
    phonetic: 'maht-see-AH-sah-nah',
    english: 'Fish Pose',
    category: 'closing',
    group: 'backbend',
    order: 510,
    breaths: 5,
    sides: 1,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Broomadhya (third eye / between the eyebrows)',
    isBasic: false,
  },
  {
    id: 'uttana_padasana',
    sanskrit: 'Uttana Padasana',
    phonetic: 'oo-TAH-nah pah-DAH-sah-nah',
    english: 'Extended Leg Pose',
    category: 'closing',
    group: 'backbend',
    order: 520,
    breaths: 5,
    sides: 1,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Nasagrai (tip of the nose)',
    isBasic: false,
  },
  {
    id: 'sirsasana',
    sanskrit: 'Sirsasana',
    phonetic: 'shear-SHAH-sah-nah',
    english: 'Headstand',
    category: 'closing',
    group: 'inversion',
    order: 530,
    breaths: 10,
    sides: 1,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Nasagrai (tip of the nose)',
    isBasic: true,
  },
  {
    id: 'baddha_padmasana',
    sanskrit: 'Baddha Padmasana',
    phonetic: 'BAH-dah pahd-MAH-sah-nah',
    english: 'Bound Lotus Pose',
    category: 'closing',
    group: 'lotus',
    order: 540,
    breaths: 5,
    sides: 1,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Nasagrai (tip of the nose)',
    isBasic: false,
  },
  {
    id: 'yoga_mudra',
    sanskrit: 'Yoga Mudra',
    phonetic: 'YOH-gah moo-DRAH',
    english: 'Yoga Seal',
    category: 'closing',
    group: 'lotus',
    order: 550,
    breaths: 5,
    sides: 1,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Broomadhya / Nasagrai (third eye / tip of the nose)',
    isBasic: false,
  },
  {
    id: 'padmasana',
    sanskrit: 'Padmasana',
    phonetic: 'pahd-MAH-sah-nah',
    english: 'Lotus Pose',
    category: 'closing',
    group: 'lotus',
    order: 560,
    breaths: 10,
    sides: 1,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Nasagrai (tip of the nose)',
    isBasic: false,
  },
  {
    id: 'utpluthih',
    sanskrit: 'Utpluthih (Tolasana)',
    phonetic: 'oot-PLOO-tee',
    english: 'Scales / Lifted Lotus Pose',
    category: 'closing',
    group: 'lotus',
    order: 570,
    breaths: 10,
    sides: 1,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Nasagrai (tip of the nose)',
    isBasic: false,
  },

  // ----- Final rest -----
  {
    id: 'savasana',
    sanskrit: 'Savasana',
    phonetic: 'shah-VAH-sah-nah',
    english: 'Corpse Pose (Final Rest)',
    category: 'finishing',
    group: 'rest',
    order: 580,
    breaths: 30,
    sides: 1,
    repeat: 1,
    alwaysInclude: true,
    selectable: false,
    drishti: 'eyes closed (inner gaze)',
    isBasic: true,
  },
];

export default poses;
