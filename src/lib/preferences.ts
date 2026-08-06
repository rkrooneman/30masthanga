/**
 * preferences — tiny, safe on-device persistence for ashtanga30.
 *
 * Currently stores just the breath-pace slider value so it is remembered across
 * visits. All access is wrapped in try/catch: localStorage can throw (private
 * mode, disabled storage, quota), and this app must degrade gracefully to its
 * defaults rather than crash.
 */

import {
  DEFAULT_BREATH_SECONDS,
  MIN_BREATH_SECONDS,
  MAX_BREATH_SECONDS,
} from './timing';
import {
  type GuidanceLevel,
  type PoseCue,
  breathOnFromLevel,
  clampGuidanceLevel,
  clampPoseCue,
  deriveGuidanceLevel,
  poseCueFromLevel,
} from './guidance';
import {
  type AmbientChoice,
  ambientFromLegacyEnabled,
  clampAmbientChoice,
} from './ambient';

const BREATH_SECONDS_KEY = 'ashtanga30.breathSeconds';
const SOUND_ENABLED_KEY = 'ashtanga30.soundEnabled';
const VOICE_ENABLED_KEY = 'ashtanga30.voiceEnabled';
const AMBIENT_ENABLED_KEY = 'ashtanga30.ambientEnabled';
const AMBIENT_KEY = 'ashtanga30.ambient';
const BREATH_CUES_ENABLED_KEY = 'ashtanga30.breathCuesEnabled';
const GUIDANCE_LEVEL_KEY = 'ashtanga30.guidanceLevel';
const POSE_CUE_KEY = 'ashtanga30.poseCue';
const BREATH_CUES_ON_KEY = 'ashtanga30.breathCuesOn';
const BASICS_ONLY_KEY = 'ashtanga30.basicsOnly';
const FULL_SERIES_KEY = 'ashtanga30.fullSeries';
const VINYASAS_KEY = 'ashtanga30.vinyasas';

/**
 * Load the saved breath pace, clamped to the valid slider range. Returns the
 * default when nothing is stored or the stored value is unusable.
 */
export function loadBreathSeconds(): number {
  try {
    const raw = window.localStorage.getItem(BREATH_SECONDS_KEY);
    if (raw === null) return DEFAULT_BREATH_SECONDS;
    const value = Number.parseInt(raw, 10);
    if (Number.isNaN(value)) return DEFAULT_BREATH_SECONDS;
    return Math.max(MIN_BREATH_SECONDS, Math.min(MAX_BREATH_SECONDS, value));
  } catch {
    return DEFAULT_BREATH_SECONDS;
  }
}

/** Persist the breath pace. Silently no-ops if storage is unavailable. */
export function saveBreathSeconds(value: number): void {
  try {
    window.localStorage.setItem(BREATH_SECONDS_KEY, String(value));
  } catch {
    /* storage unavailable — ignore, preference simply won't persist */
  }
}

/**
 * Whether sound cues (currently just the completion bell) are enabled. Defaults
 * to true; only an explicit stored "0" disables it. Safe on storage failure.
 */
export function loadSoundEnabled(): boolean {
  try {
    return window.localStorage.getItem(SOUND_ENABLED_KEY) !== '0';
  } catch {
    return true;
  }
}

/** Persist the sound-enabled preference. Silently no-ops on storage failure. */
export function saveSoundEnabled(enabled: boolean): void {
  try {
    window.localStorage.setItem(SOUND_ENABLED_KEY, enabled ? '1' : '0');
  } catch {
    /* storage unavailable — ignore */
  }
}

/**
 * Whether spoken pose-name narration (voice guidance) is enabled. Defaults to
 * true; only an explicit stored "0" disables it. Safe on storage failure. Note
 * that voice cues additionally require sound to be enabled (see voice.ts).
 */
export function loadVoiceEnabled(): boolean {
  try {
    return window.localStorage.getItem(VOICE_ENABLED_KEY) !== '0';
  } catch {
    return true;
  }
}

/** Persist the voice-enabled preference. Silently no-ops on storage failure. */
export function saveVoiceEnabled(enabled: boolean): void {
  try {
    window.localStorage.setItem(VOICE_ENABLED_KEY, enabled ? '1' : '0');
  } catch {
    /* storage unavailable — ignore */
  }
}

/**
 * Whether the calm background ambient sound is enabled. Unlike voice/sound this
 * defaults to OFF (false): ambient playback is opt-in, so only an explicit
 * stored "1" enables it. Safe on storage failure (returns false).
 */
export function loadAmbientEnabled(): boolean {
  try {
    return window.localStorage.getItem(AMBIENT_ENABLED_KEY) === '1';
  } catch {
    return false;
  }
}

/** Persist the ambient-enabled preference. Silently no-ops on storage failure. */
export function saveAmbientEnabled(enabled: boolean): void {
  try {
    window.localStorage.setItem(AMBIENT_ENABLED_KEY, enabled ? '1' : '0');
  } catch {
    /* storage unavailable — ignore */
  }
}

/**
 * Load the chosen ambient nature sound ('off' | 'forest' | 'rain' | 'ocean').
 *
 * When the new ambient key has been stored it is read back (clamped defensively
 * via clampAmbientChoice). When it has NOT - the first run after the picker
 * landed - the choice is MIGRATED from the legacy boolean ambient-enabled
 * preference: an ambient-ON user becomes 'forest', an ambient-OFF (or absent)
 * user becomes 'off' (see ambientFromLegacyEnabled). The migrated value is NOT
 * written back here; the new key is only persisted when the user moves the
 * slider (saveAmbient). The legacy key is left readable so this migration stays
 * stable. Safe on storage failure (loadAmbientEnabled returns false -> 'off').
 */
export function loadAmbient(): AmbientChoice {
  try {
    const raw = window.localStorage.getItem(AMBIENT_KEY);
    if (raw !== null) {
      return clampAmbientChoice(raw);
    }
  } catch {
    /* storage unavailable - fall through to migration */
  }
  return ambientFromLegacyEnabled(loadAmbientEnabled());
}

/** Persist the chosen ambient sound as its string value. Silently no-ops on storage failure. */
export function saveAmbient(choice: AmbientChoice): void {
  try {
    window.localStorage.setItem(AMBIENT_KEY, choice);
  } catch {
    /* storage unavailable - ignore */
  }
}

/**
 * Whether the soft breath cues (inhale/exhale tones played on each guided
 * breath) are enabled. Like ambient, this defaults to OFF (false): breath cues
 * are an opt-in extra, so only an explicit stored "1" enables them. Safe on
 * storage failure (returns false). Note that breath cues additionally require
 * sound to be enabled (see breathCues.ts).
 */
export function loadBreathCuesEnabled(): boolean {
  try {
    return window.localStorage.getItem(BREATH_CUES_ENABLED_KEY) === '1';
  } catch {
    return false;
  }
}

/** Persist the breath-cues-enabled preference. Silently no-ops on storage failure. */
export function saveBreathCuesEnabled(enabled: boolean): void {
  try {
    window.localStorage.setItem(BREATH_CUES_ENABLED_KEY, enabled ? '1' : '0');
  } catch {
    /* storage unavailable — ignore */
  }
}

/**
 * Load the stepped guidance level (0..3). See guidance.ts for the level ->
 * layers table.
 *
 * When an explicit level has been stored it is read back (clamped defensively
 * via clampGuidanceLevel). When NO level has been stored yet - the first run
 * after this feature landed - the level is DERIVED from the pre-existing
 * per-toggle preferences (soundEnabled / voiceEnabled / breathCuesEnabled) via
 * deriveGuidanceLevel, so returning users are not reset. The derived value is
 * NOT written back here; guidanceLevel is only persisted when the user moves
 * the slider (saveGuidanceLevel). The legacy keys are intentionally left in
 * place and readable so this migration stays stable.
 *
 * Safe on storage failure (falls back to the derived value, which for the
 * defaults of a brand-new user is 3 = full guidance).
 */
export function loadGuidanceLevel(): GuidanceLevel {
  try {
    const raw = window.localStorage.getItem(GUIDANCE_LEVEL_KEY);
    if (raw !== null) {
      return clampGuidanceLevel(Number.parseInt(raw, 10));
    }
  } catch {
    /* storage unavailable - fall through to derivation from legacy prefs */
  }
  return deriveGuidanceLevel({
    soundEnabled: loadSoundEnabled(),
    voiceEnabled: loadVoiceEnabled(),
    breathCuesEnabled: loadBreathCuesEnabled(),
  });
}

/**
 * Persist the guidance level. The value is clamped to 0..3 before storage and
 * written as its string digit. Silently no-ops if storage is unavailable.
 */
export function saveGuidanceLevel(level: GuidanceLevel): void {
  try {
    window.localStorage.setItem(
      GUIDANCE_LEVEL_KEY,
      String(clampGuidanceLevel(level)),
    );
  } catch {
    /* storage unavailable - ignore */
  }
}

/**
 * Migrate the (legacy #7) guidance level - reading the stored guidanceLevel key
 * if present, otherwise deriving from the pre-#7 per-toggle prefs. Shared by the
 * PoseCue and breath-cue loaders below so both migrate consistently. For a
 * brand-new user (no stored prefs at all) this resolves to level 3.
 */
function migratedGuidanceLevel(): GuidanceLevel {
  try {
    const raw = window.localStorage.getItem(GUIDANCE_LEVEL_KEY);
    if (raw !== null) {
      return clampGuidanceLevel(Number.parseInt(raw, 10));
    }
  } catch {
    /* storage unavailable - fall through to derivation from legacy prefs */
  }
  return deriveGuidanceLevel({
    soundEnabled: loadSoundEnabled(),
    voiceEnabled: loadVoiceEnabled(),
    breathCuesEnabled: loadBreathCuesEnabled(),
  });
}

/**
 * Load how a pose change is announced ('silent' | 'bell' | 'voice').
 *
 * When the new poseCue key has been stored it is read back (clamped defensively
 * via clampPoseCue). When it has NOT - the first run after this split landed -
 * the cue is MIGRATED: from the stored #7 guidanceLevel if present
 * (poseCueFromLevel), otherwise from the pre-#7 per-toggle prefs via
 * deriveGuidanceLevel -> poseCueFromLevel. The migrated value is NOT written
 * back here; poseCue is only persisted when the user moves the slider
 * (savePoseCue). Legacy keys are left readable so this migration stays stable.
 *
 * Safe on storage failure. For a brand-new user (no stored prefs at all) this
 * resolves to 'voice' (full guidance).
 */
export function loadPoseCue(): PoseCue {
  try {
    const raw = window.localStorage.getItem(POSE_CUE_KEY);
    if (raw !== null) {
      return clampPoseCue(raw);
    }
  } catch {
    /* storage unavailable - fall through to migration */
  }
  return poseCueFromLevel(migratedGuidanceLevel());
}

/** Persist the pose cue as its string value. Silently no-ops on storage failure. */
export function savePoseCue(cue: PoseCue): void {
  try {
    window.localStorage.setItem(POSE_CUE_KEY, cue);
  } catch {
    /* storage unavailable - ignore */
  }
}

/**
 * Load whether the soft breath cues (inhale/exhale tones) are on.
 *
 * When the new breathCuesOn key has been stored it is read back (only an
 * explicit "1" is true). When it has NOT - the first run after this split
 * landed - the value is MIGRATED: from the stored #7 guidanceLevel if present
 * (breathOnFromLevel), otherwise from the pre-#7 per-toggle prefs via
 * deriveGuidanceLevel -> breathOnFromLevel. The migrated value is NOT written
 * back here; it is only persisted when the user toggles it (saveBreathCuesOn).
 *
 * Safe on storage failure. For a brand-new user (no stored prefs at all) this
 * resolves to true.
 */
export function loadBreathCuesOn(): boolean {
  try {
    const raw = window.localStorage.getItem(BREATH_CUES_ON_KEY);
    if (raw !== null) {
      return raw === '1';
    }
  } catch {
    /* storage unavailable - fall through to migration */
  }
  return breathOnFromLevel(migratedGuidanceLevel());
}

/** Persist the breath-cues-on preference. Silently no-ops on storage failure. */
export function saveBreathCuesOn(on: boolean): void {
  try {
    window.localStorage.setItem(BREATH_CUES_ON_KEY, on ? '1' : '0');
  } catch {
    /* storage unavailable - ignore */
  }
}

/**
 * Whether "Basics only" (Smart Start) mode is enabled. Defaults to false (the
 * full "All poses" mode); only an explicit stored "1" enables it. Safe on
 * storage failure.
 */
export function loadBasicsOnly(): boolean {
  try {
    return window.localStorage.getItem(BASICS_ONLY_KEY) === '1';
  } catch {
    return false;
  }
}

/** Persist the basics-only preference. Silently no-ops on storage failure. */
export function saveBasicsOnly(enabled: boolean): void {
  try {
    window.localStorage.setItem(BASICS_ONLY_KEY, enabled ? '1' : '0');
  } catch {
    /* storage unavailable — ignore */
  }
}

/**
 * Whether "Full series" mode is enabled. Full series selects EVERY catalog pose
 * on the Overview (the practitioner can still uncheck individual non-fixed poses
 * to customise). Defaults to false (OFF); only an explicit stored "1" enables
 * it. Mutually exclusive with "Basics only" in the UI, but the two are stored
 * independently — the exclusion is enforced by the shell's toggle handlers, not
 * here. Safe on storage failure.
 */
export function loadFullSeriesEnabled(): boolean {
  try {
    return window.localStorage.getItem(FULL_SERIES_KEY) === '1';
  } catch {
    return false;
  }
}

/** Persist the full-series preference. Silently no-ops on storage failure. */
export function saveFullSeriesEnabled(enabled: boolean): void {
  try {
    window.localStorage.setItem(FULL_SERIES_KEY, enabled ? '1' : '0');
  } catch {
    /* storage unavailable — ignore */
  }
}

/**
 * Whether "Vinyasas" mode is enabled — inserting a half-vinyasa between
 * consecutive seated poses (and budgeting for it in generation). Like
 * voice/sound this defaults to ON (true): only an explicit stored "0" disables
 * it. Safe on storage failure (returns true).
 */
export function loadVinyasasEnabled(): boolean {
  try {
    return window.localStorage.getItem(VINYASAS_KEY) !== '0';
  } catch {
    return true;
  }
}

/** Persist the vinyasas-enabled preference. Silently no-ops on storage failure. */
export function saveVinyasasEnabled(enabled: boolean): void {
  try {
    window.localStorage.setItem(VINYASAS_KEY, enabled ? '1' : '0');
  } catch {
    /* storage unavailable — ignore */
  }
}

