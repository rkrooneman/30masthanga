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
