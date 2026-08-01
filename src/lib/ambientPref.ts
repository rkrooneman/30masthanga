/**
 * ambientPref — a tiny, framework-free pub/sub for the "ambient sound enabled"
 * preference.
 *
 * The ambient-sound enable/disable switch lives on the Home screen, but the one
 * persistent <audio> element (and the code that plays/pauses it) lives in
 * MusicPanel at the app shell. Those two components never share a common React
 * parent that owns this state, so this module is the neutral middle-man: the
 * Home toggle *sets* the preference; MusicPanel *subscribes* and starts/stops
 * playback in response. Neither side imports the other.
 *
 * Modeled on audioBus.ts (same shape: module-level state + a listener Set + a
 * subscribe() that syncs the new listener immediately). It also owns
 * persistence: setAmbientEnabled() writes through to preferences.ts so a page
 * reload restores the last choice, and the initial in-memory value is seeded
 * from storage on module load.
 *
 * Safety: notify() guards each listener in try/catch so one misbehaving
 * subscriber can't break the bus for the others.
 */

import { loadAmbientEnabled, saveAmbientEnabled } from './preferences';

type AmbientListener = (enabled: boolean) => void;
type PlayRequestListener = () => void;

/** Current in-memory value, seeded once from storage (default OFF). */
let enabled = loadAmbientEnabled();

/** Subscribers notified whenever the enabled state changes. */
const listeners = new Set<AmbientListener>();

/**
 * Subscribers notified when something wants ambient playback (re)attempted from
 * within a user gesture — see requestAmbientPlay().
 */
const playRequestListeners = new Set<PlayRequestListener>();

/** The current ambient-enabled preference. */
export function getAmbientEnabled(): boolean {
  return enabled;
}

/**
 * Set the ambient-enabled preference. Persists through preferences.ts and, when
 * the value actually changes, notifies every subscriber. A no-op (no persist, no
 * notify) when the value is unchanged.
 */
export function setAmbientEnabled(next: boolean): void {
  if (next === enabled) return;
  enabled = next;
  saveAmbientEnabled(next);
  for (const listener of listeners) {
    try {
      listener(enabled);
    } catch {
      /* a misbehaving listener must not break the bus for the others */
    }
  }
}

/**
 * Subscribe to ambient-enabled changes. The listener is invoked immediately with
 * the CURRENT value on subscribe (so a late subscriber, e.g. MusicPanel, syncs
 * up right away). Returns an unsubscribe fn.
 */
export function subscribeAmbient(listener: AmbientListener): () => void {
  listeners.add(listener);
  try {
    listener(enabled);
  } catch {
    /* ignore — see setAmbientEnabled() */
  }
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Ask any player (MusicPanel) to (re)attempt ambient playback NOW. Call this from
 * within a genuine user gesture (e.g. tapping "Generate my next practice" or
 * "Start practice") so browsers permit audio to start.
 *
 * This exists because the preference can already be "enabled" on load with NO
 * prior interaction: the browser blocks the initial autoplay, and if the user's
 * first (and only) action before navigating is a single tap, that tap must be
 * used to start playback. Firing this from those known gestures is far more
 * reliable than a global one-shot document listener. It is a no-op when ambient
 * is disabled (the player checks), and harmless if already playing.
 */
export function requestAmbientPlay(): void {
  for (const listener of playRequestListeners) {
    try {
      listener();
    } catch {
      /* a misbehaving listener must not break the bus for the others */
    }
  }
}

/**
 * Subscribe to ambient play requests (see requestAmbientPlay). Returns an
 * unsubscribe fn. Unlike subscribeAmbient, the listener is NOT invoked on
 * subscribe (there is no pending request to replay).
 */
export function subscribeAmbientPlayRequest(
  listener: PlayRequestListener,
): () => void {
  playRequestListeners.add(listener);
  return () => {
    playRequestListeners.delete(listener);
  };
}
