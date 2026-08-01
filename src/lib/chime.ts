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
 * Open the audio playback window from within a user gesture (e.g. the "Start
 * practice" tap) so later programmatic playback is allowed. Warms up an
 * AudioContext (for any Web Audio consumers) and is safe to call repeatedly;
 * no-ops gracefully when audio is unavailable.
 */
export function unlockAudio(): void {
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
  const release = () => {
    if (released) return;
    released = true;
    if (timer !== undefined) window.clearTimeout(timer);
    releaseDuck();
  };
  requestDuck();

  try {
    const audio = new Audio(BELL_SRC);
    audio.addEventListener('ended', release);
    audio.addEventListener('error', release);
    // Safety net: release the duck even if the clip never signals completion.
    timer = window.setTimeout(release, BELL_MAX_DURATION_MS);
    void audio.play().catch(() => {
      // Autoplay blocked / interrupted — reflect reality and release the duck.
      release();
    });
  } catch {
    // Construction/playback failed — release the duck we requested so the music
    // can never be stranded at low volume.
    release();
  }
}
