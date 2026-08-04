/**
 * chime — the soft completion bell for the end of a practice.
 *
 * Plays a prerecorded bell sound (public/audio/effects/bell.mp3) exactly once,
 * on the Namaste completion screen. Served statically from the site root, so it
 * works offline once cached by the PWA.
 *
 * Mobile notes:
 * - Browsers block audio until a user gesture. Because a practice always begins
 *   with the user tapping "Start practice", `unlockAudio()` is called then to
 *   open the playback window; by the time the completion bell fires, playback is
 *   permitted. `unlockAudio()` also warms up an AudioContext for any other Web
 *   Audio consumers.
 * - iOS Safari specifically only permits later programmatic playback on an
 *   <audio> element that was itself played DURING a user gesture. The completion
 *   bell fires much later (end of practice) from a non-gesture context, so a
 *   freshly-constructed `new Audio(BELL_SRC)` would be blocked. We therefore keep
 *   ONE persistent bell element, prime it inside the Start-practice gesture
 *   (`unlockAudio()`), and REUSE it when the bell plays — mirroring voice.ts /
 *   breathCues.ts.
 * - Everything is wrapped in try/catch and `.play()` rejections are swallowed: if
 *   audio is unavailable or blocked, the app simply stays silent rather than
 *   erroring.
 * - The iOS hardware silent switch may mute audio on some iOS versions; this is a
 *   platform limitation we cannot reliably override, so the bell is a best-effort
 *   enhancement, not a guarantee.
 */

import { requestDuck, releaseDuck } from './audioBus';

/** Public URL of the bundled bell sound. */
const BELL_SRC = '/audio/effects/bell.mp3';

/**
 * Safety cap (ms) for releasing the music duck if the bell's `ended`/`error`
 * events never fire (e.g. the clip stalls). The real release normally happens on
 * playback end; this just guarantees the music is never stranded at low volume.
 */
const BELL_MAX_DURATION_MS = 8000;

type AudioContextClass = typeof AudioContext;

function getAudioContextClass(): AudioContextClass | undefined {
  if (typeof window === 'undefined') return undefined;
  return (
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: AudioContextClass })
      .webkitAudioContext
  );
}

// A single shared context for the life of the page (browsers recommend reuse).
let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (ctx) return ctx;
  const Ctor = getAudioContextClass();
  if (!Ctor) return null;
  try {
    ctx = new Ctor({ latencyHint: 'interactive' });
    return ctx;
  } catch {
    return null;
  }
}

/**
 * The SINGLE persistent bell element, reused so the gesture-unlock done in
 * `unlockAudio()` carries over to the later (non-gesture) completion bell on iOS
 * Safari. Created lazily with its `.src` pre-assigned once, and guarded for SSR /
 * no-DOM (only when `Audio` exists). Null until first accessed, or if `Audio` is
 * unavailable — the bell then simply stays silent.
 */
let bellEl: HTMLAudioElement | null = null;

/**
 * Lazily construct (once) and return the shared bell element with its source
 * pre-assigned, or null when there is no `Audio` constructor (SSR / tests / no
 * DOM). Best-effort: returns null rather than throwing if construction fails.
 */
function getBellEl(): HTMLAudioElement | null {
  if (bellEl) return bellEl;
  if (typeof Audio === 'undefined') return null;
  try {
    bellEl = new Audio(BELL_SRC);
  } catch {
    bellEl = null;
  }
  return bellEl;
}

/**
 * Open the audio playback window from within a user gesture (e.g. the "Start
 * practice" tap) so later programmatic playback is allowed. Warms up an
 * AudioContext (for any Web Audio consumers) AND primes the persistent bell
 * <audio> element (muted play+pause) so the later completion bell is permitted
 * on iOS Safari. Safe to call repeatedly; no-ops gracefully when audio is
 * unavailable.
 */
export function unlockAudio(): void {
  // Prime the bell <audio> element within the gesture (iOS Safari requirement).
  const bell = getBellEl();
  if (bell) {
    try {
      bell.muted = true;
      const warmup = bell.play();
      if (warmup && typeof warmup.then === 'function') {
        warmup
          .then(() => {
            bell.pause();
            try {
              bell.currentTime = 0;
            } catch {
              /* ignore — best-effort reset */
            }
            bell.muted = false;
          })
          .catch(() => {
            // Unmute even if the warm-up was rejected, so the real bell later
            // isn't left silently muted.
            bell.muted = false;
          });
      } else {
        bell.pause();
        bell.muted = false;
      }
    } catch {
      /* ignore — best-effort warm-up */
    }
  }

  const context = getContext();
  if (!context) return;
  try {
    if (context.state === 'suspended') void context.resume();
  } catch {
    /* ignore — audio is a best-effort enhancement */
  }
}

/**
 * Play the completion bell once. Best-effort: silent on failure.
 *
 * While the bell rings, the background music is ducked (via audioBus) so the
 * bell isn't masked by the music, then un-ducked when it finishes. The
 * duck/release is balanced even on error (release fires on `ended`, `error`, a
 * `.play()` rejection, or a safety timeout, and audioBus clamps at 0 so an
 * unmatched release is a harmless no-op).
 */
export function playCompletionBell(): void {
  // Duck the music for the bell; released exactly once when playback ends,
  // errors, or the safety timeout elapses.
  let released = false;
  let timer: number | undefined;
  // Handler refs so `release` can detach them from the SHARED element — without
  // this, listeners would accumulate on the reused element across completions.
  let endedHandler: (() => void) | null = null;
  let errorHandler: (() => void) | null = null;
  const audio = getBellEl();
  const release = () => {
    if (released) return;
    released = true;
    if (timer !== undefined) window.clearTimeout(timer);
    if (audio) {
      if (endedHandler) audio.removeEventListener('ended', endedHandler);
      if (errorHandler) audio.removeEventListener('error', errorHandler);
    }
    releaseDuck();
  };
  requestDuck();

  if (!audio) {
    // No Audio available (SSR / no DOM) — release the duck we just requested and
    // stay silent.
    release();
    return;
  }

  try {
    // Reuse the SAME gesture-unlocked element so the bell is permitted on iOS.
    audio.currentTime = 0;
    audio.muted = false;
    audio.volume = 1;
    endedHandler = () => release();
    errorHandler = () => release();
    audio.addEventListener('ended', endedHandler);
    audio.addEventListener('error', errorHandler);
    // Safety net: release the duck even if the clip never signals completion.
    timer = window.setTimeout(release, BELL_MAX_DURATION_MS);
    void audio.play().catch(() => {
      // Autoplay blocked / interrupted — reflect reality and release the duck.
      release();
    });
  } catch {
    // Playback failed — release the duck we requested so the music can never be
    // stranded at low volume.
    release();
  }
}
