/**
 * guidance - pure model for pose-announcement cues and breath cues.
 *
 * The guidance model is split into two INDEPENDENT preferences:
 *
 *   - PoseCue: how a pose change is announced. The three values are
 *     ALTERNATIVES (a range slider), not cumulative layers:
 *       'silent' -> nothing announces the pose change
 *       'bell'   -> a transition bell rings (no spoken name)
 *       'voice'  -> the pose name is spoken (NO bell)
 *   - breathCuesOn: whether the soft inhale/exhale breath tones play. This is
 *     ORTHOGONAL to the pose cue - any pose cue can be paired with breath cues
 *     on or off.
 *
 * Ambient background music is a SEPARATE preference and is not represented here.
 *
 * The old #7 model (a single cumulative guidanceLevel 0..3 with layersForLevel)
 * is retained below ONLY so the not-yet-migrated call sites (voice.ts,
 * breathCues.ts, GuidedScreen, HomeScreen) keep compiling. Those exports are
 * deprecated and will be removed once every call site adopts the PoseCue API.
 *
 * Everything in this module is pure and dependency-free so it can be unit
 * tested without a DOM or localStorage. Persistence lives in preferences.ts.
 */

/**
 * How a pose change is announced. These are alternatives, not layers: 'silent'
 * announces nothing, 'bell' rings a transition bell, 'voice' speaks the pose
 * name (and rings NO bell).
 */
export type PoseCue = 'silent' | 'bell' | 'voice';

/** Whether the pose cue rings the per-transition bell. Only 'bell' does. */
export function poseCueRingsBell(cue: PoseCue): boolean {
  return cue === 'bell';
}

/** Whether the pose cue speaks the pose name. Only 'voice' does. */
export function poseCueSpeaks(cue: PoseCue): boolean {
  return cue === 'voice';
}

/**
 * Whether the pose cue announces the change at all (bell OR voice). Used for
 * the completion bell, which rings whenever the pose cue is not 'silent'.
 */
export function poseCueAnnounces(cue: PoseCue): boolean {
  return cue !== 'silent';
}

/**
 * The pose cues in slider order, lowest to highest. Index 0 = 'silent',
 * 1 = 'bell', 2 = 'voice'. The Home slider uses this ordering.
 */
export const POSE_CUE_ORDER: PoseCue[] = ['silent', 'bell', 'voice'];

/** Map a pose cue to its slider index (0..2). */
export function poseCueToIndex(cue: PoseCue): 0 | 1 | 2 {
  return POSE_CUE_ORDER.indexOf(cue) as 0 | 1 | 2;
}

/**
 * Map a slider index to a pose cue, clamped into 0..2. Non-integers are rounded
 * (Math.round). NaN falls back to index 0 ('silent').
 */
export function indexToPoseCue(i: number): PoseCue {
  if (Number.isNaN(i)) return POSE_CUE_ORDER[0];
  const rounded = Math.round(i);
  const clamped = Math.max(0, Math.min(POSE_CUE_ORDER.length - 1, rounded));
  return POSE_CUE_ORDER[clamped];
}

/**
 * Coerce arbitrary input into a valid PoseCue. Accepts EITHER the string pref
 * value ('silent' | 'bell' | 'voice') OR a numeric slider index (0 -> 'silent',
 * 1 -> 'bell', 2 -> 'voice', out-of-range clamped). A numeric string (e.g. the
 * raw value read from a range input) is treated as its index. Anything else
 * invalid falls back to the safe full-guidance default of 'voice'.
 */
export function clampPoseCue(x: unknown): PoseCue {
  if (typeof x === 'string') {
    if (x === 'silent' || x === 'bell' || x === 'voice') return x;
    // A numeric string (e.g. a raw slider value) maps by index.
    const asNumber = Number(x);
    if (x.trim() !== '' && !Number.isNaN(asNumber)) {
      return indexToPoseCue(asNumber);
    }
    return 'voice';
  }
  if (typeof x === 'number' && !Number.isNaN(x)) {
    return indexToPoseCue(x);
  }
  return 'voice';
}

/**
 * Derive the PoseCue from a (legacy #7) guidance level, so returning users keep
 * an equivalent announcement style. The #7 levels mapped bell at 1 and 2, so
 * both collapse to 'bell'; only level 3 (which spoke the name) becomes 'voice':
 *   0 -> 'silent', 1 -> 'bell', 2 -> 'bell', 3 -> 'voice'.
 */
export function poseCueFromLevel(level: GuidanceLevel): PoseCue {
  switch (level) {
    case 0:
      return 'silent';
    case 1:
      return 'bell';
    case 2:
      return 'bell';
    case 3:
      return 'voice';
  }
}

/**
 * Derive breathCuesOn from a (legacy #7) guidance level. The #7 breath layer
 * was on at levels 2 and 3:
 *   0 -> false, 1 -> false, 2 -> true, 3 -> true.
 */
export function breathOnFromLevel(level: GuidanceLevel): boolean {
  return level >= 2;
}

// ---------------------------------------------------------------------------
// Deprecated #7 level model.
//
// Retained ONLY so not-yet-migrated call sites keep compiling. New code should
// use PoseCue + breathCuesOn instead. These will be deleted once voice.ts,
// breathCues.ts, GuidedScreen and HomeScreen adopt the PoseCue API.
// ---------------------------------------------------------------------------

/** @deprecated Use PoseCue + breathCuesOn instead. */
export type GuidanceLevel = 0 | 1 | 2 | 3;

/** @deprecated Use PoseCue + breathCuesOn instead. */
export interface GuidanceLayers {
  bell: boolean;
  breath: boolean;
  voice: boolean;
}

/**
 * Map a guidance level to the set of audio layers it enables (cumulative).
 *
 * @deprecated Use PoseCue helpers (poseCueRingsBell / poseCueSpeaks) and
 * breathCuesOn instead.
 */
export function layersForLevel(level: GuidanceLevel): GuidanceLayers {
  return {
    bell: level >= 1,
    breath: level >= 2,
    voice: level >= 3,
  };
}

/**
 * Coerce arbitrary numeric input into a valid GuidanceLevel. Non-integers are
 * rounded to the nearest integer first (Math.round, so 2.5 -> 3, 2.4 -> 2),
 * then clamped into the 0..3 range. NaN falls back to 0.
 *
 * @deprecated Use clampPoseCue / indexToPoseCue instead.
 */
export function clampGuidanceLevel(n: number): GuidanceLevel {
  if (Number.isNaN(n)) return 0;
  const rounded = Math.round(n);
  const clamped = Math.max(0, Math.min(3, rounded));
  return clamped as GuidanceLevel;
}

/** The legacy per-toggle preference values used to derive an initial level. */
export interface LegacyGuidancePrefs {
  soundEnabled: boolean;
  voiceEnabled: boolean;
  breathCuesEnabled: boolean;
}

/**
 * Derive a guidance level from the pre-#7 per-toggle preferences. Used as a
 * one-time migration when no explicit guidanceLevel (and no PoseCue) has been
 * stored yet, so returning users keep an equivalent experience instead of being
 * reset. Chain with poseCueFromLevel / breathOnFromLevel to migrate straight to
 * the new model.
 *
 * Migration mapping (checked in order):
 *   - master sound OFF                       -> 0 (Silent)
 *   - voice ON                               -> 3 (Voice / full)
 *   - voice OFF but breath cues ON           -> 2 (Breath)
 *   - sound ON, voice OFF, breath cues OFF   -> 1 (Bell)
 *
 * Because voiceEnabled and soundEnabled both default to true, a brand-new user
 * with no stored prefs at all derives to level 3 (full guidance), which chains
 * to PoseCue 'voice' + breath on.
 */
export function deriveGuidanceLevel(prefs: LegacyGuidancePrefs): GuidanceLevel {
  if (!prefs.soundEnabled) return 0;
  if (prefs.voiceEnabled) return 3;
  if (prefs.breathCuesEnabled) return 2;
  return 1;
}
