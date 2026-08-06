/**
 * guidance - pure model for the stepped guidance level.
 *
 * A single guidance level 0..3 replaces the three separate sound toggles. Each
 * level cumulatively adds an audio layer:
 *
 *   0 = Silent -> { bell:false, breath:false, voice:false }
 *   1 = Bell   -> { bell:true,  breath:false, voice:false }
 *   2 = Breath -> { bell:true,  breath:true,  voice:false }
 *   3 = Voice  -> { bell:true,  breath:true,  voice:true  }
 *
 * Ambient background music is a SEPARATE preference and is not represented here.
 *
 * Everything in this module is pure and dependency-free so it can be unit
 * tested without a DOM or localStorage. Persistence lives in preferences.ts.
 */

export type GuidanceLevel = 0 | 1 | 2 | 3;

export interface GuidanceLayers {
  bell: boolean;
  breath: boolean;
  voice: boolean;
}

/**
 * Map a guidance level to the set of audio layers it enables. Implements the
 * cumulative table documented above exactly.
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
 * Derive a guidance level from the pre-existing per-toggle preferences. Used as
 * a one-time migration when no explicit guidanceLevel has been stored yet, so
 * returning users keep an equivalent experience instead of being reset.
 *
 * Migration mapping (checked in order):
 *   - master sound OFF                       -> 0 (Silent)
 *   - voice ON                               -> 3 (Voice / full)
 *   - voice OFF but breath cues ON           -> 2 (Breath)
 *   - sound ON, voice OFF, breath cues OFF   -> 1 (Bell)
 *
 * Because voiceEnabled and soundEnabled both default to true, a brand-new user
 * with no stored prefs at all derives to level 3 (full guidance), matching the
 * current default behavior.
 */
export function deriveGuidanceLevel(prefs: LegacyGuidancePrefs): GuidanceLevel {
  if (!prefs.soundEnabled) return 0;
  if (prefs.voiceEnabled) return 3;
  if (prefs.breathCuesEnabled) return 2;
  return 1;
}
