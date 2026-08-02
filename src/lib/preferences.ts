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

const BREATH_SECONDS_KEY = 'ashtanga30.breathSeconds';
const SOUND_ENABLED_KEY = 'ashtanga30.soundEnabled';
const VOICE_ENABLED_KEY = 'ashtanga30.voiceEnabled';
const AMBIENT_ENABLED_KEY = 'ashtanga30.ambientEnabled';
const BREATH_CUES_ENABLED_KEY = 'ashtanga30.breathCuesEnabled';
const BASICS_ONLY_KEY = 'ashtanga30.basicsOnly';
const FULL_SERIES_KEY = 'ashtanga30.fullSeries';

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

