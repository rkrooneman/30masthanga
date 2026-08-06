/**
 * ambientPref - a tiny, framework-free pub/sub for the ambient-sound choice
 * preference (off / forest / rain / ocean).
 *
 * The ambient picker lives on the Home screen, but the one persistent <audio>
 * element (and the code that plays/pauses it) lives in MusicPanel at the app
 * shell. Those two components never share a common React parent that owns this
 * state, so this module is the neutral middle-man: the Home slider *sets* the
 * choice; MusicPanel *subscribes* and starts/stops/switches the loop in
 * response. Neither side imports the other.
 *
 * Modeled on audioBus.ts (same shape: module-level state + a listener Set + a
 * subscribe() that syncs the new listener immediately). It also owns
 * persistence: setAmbient() writes through to preferences.ts so a page reload
 * restores the last choice, and the initial in-memory value is seeded from
 * storage on module load (loadAmbient(), which migrates the legacy boolean).
 *
 * Safety: each listener notify is guarded in try/catch so one misbehaving
 * subscriber can't break the bus for the others.
 *
 * Migration note: this module exposes the new choice API (getAmbient /
 * setAmbient / subscribeAmbientChoice). The boolean-shaped exports
 * (getAmbientEnabled / setAmbientEnabled / subscribeAmbient) are deprecated
 * compat shims kept ONLY so the not-yet-migrated call sites (MusicPanel in
 * Task 3, HomeScreen in Task 4) keep compiling and behaving. They will be
 * removed once those call sites adopt the choice API.
 */

import type { AmbientChoice } from './ambient';
import { loadAmbient, saveAmbient } from './preferences';

type AmbientListener = (choice: AmbientChoice) => void;
type AmbientEnabledListener = (enabled: boolean) => void;
type PlayRequestListener = () => void;

/** Current in-memory choice, seeded once from storage (default 'off'). */
let choice: AmbientChoice = loadAmbient();

/** Subscribers notified whenever the choice changes. */
const listeners = new Set<AmbientListener>();

/**
 * Subscribers notified when something wants ambient playback (re)attempted from
 * within a user gesture - see requestAmbientPlay().
 */
const playRequestListeners = new Set<PlayRequestListener>();

/** The current ambient-sound choice. */
export function getAmbient(): AmbientChoice {
  return choice;
}

/**
 * Set the ambient-sound choice. Persists through preferences.ts and, when the
 * value actually changes, notifies every subscriber. A no-op (no persist, no
 * notify) when the value is unchanged.
 */
export function setAmbient(next: AmbientChoice): void {
  if (next === choice) return;
  choice = next;
  saveAmbient(next);
  for (const listener of listeners) {
    try {
      listener(choice);
    } catch {
      /* a misbehaving listener must not break the bus for the others */
    }
  }
}

/**
 * Subscribe to ambient-choice changes. The listener is invoked immediately with
 * the CURRENT choice on subscribe (so a late subscriber, e.g. MusicPanel, syncs
 * up right away). Returns an unsubscribe fn.
 */
export function subscribeAmbientChoice(listener: AmbientListener): () => void {
  listeners.add(listener);
  try {
    listener(choice);
  } catch {
    /* ignore - see setAmbient() */
  }
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Ask any player (MusicPanel) to (re)attempt ambient playback NOW. Call this
 * from within a genuine user gesture (e.g. tapping "Generate my next practice"
 * or "Start practice") so browsers permit audio to start.
 *
 * This exists because the preference can already be a sound (not 'off') on load
 * with NO prior interaction: the browser blocks the initial autoplay, and if
 * the user's first (and only) action before navigating is a single tap, that
 * tap must be used to start playback. Firing this from those known gestures is
 * far more reliable than a global one-shot document listener. It is a no-op
 * when ambient is 'off' (the player checks), and harmless if already playing.
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
 * unsubscribe fn. Unlike subscribeAmbientChoice, the listener is NOT invoked on
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

// ---------------------------------------------------------------------------
// Deprecated boolean-compat shims.
//
// Retained ONLY so the not-yet-migrated call sites keep compiling and behaving:
// MusicPanel (Task 3) still calls subscribeAmbient() with a boolean listener,
// and HomeScreen (Task 4) still calls getAmbientEnabled/setAmbientEnabled. New
// code should use the choice API above. These will be removed in Tasks 3-5 once
// every call site adopts getAmbient / setAmbient / subscribeAmbientChoice.
// ---------------------------------------------------------------------------

/** @deprecated Use getAmbient() instead. True when a sound is selected (not 'off'). */
export function getAmbientEnabled(): boolean {
  return getAmbient() !== 'off';
}

/**
 * @deprecated Use setAmbient() instead. Enabling maps to 'forest' (the default
 * nature bed); disabling maps to 'off'.
 */
export function setAmbientEnabled(next: boolean): void {
  setAmbient(next ? 'forest' : 'off');
}

/**
 * @deprecated Use subscribeAmbientChoice() instead. Boolean-shaped subscription
 * for MusicPanel: the listener receives whether a sound is selected (choice is
 * not 'off'), invoked immediately on subscribe and on every change.
 */
export function subscribeAmbient(listener: AmbientEnabledListener): () => void {
  return subscribeAmbientChoice((next) => {
    listener(next !== 'off');
  });
}
