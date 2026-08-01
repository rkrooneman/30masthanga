/**
 * chime — a soft, synthesized completion bell for the end of a practice.
 *
 * Uses the Web Audio API to synthesize a warm, gently-decaying bell tone (no
 * audio asset files, no network, works offline in the PWA). It is intended to
 * play exactly once, on the Namaste completion screen.
 *
 * Mobile notes:
 * - Browsers block audio until a user gesture. Because a practice always begins
 *   with the user tapping "Start practice", the AudioContext can be created/
 *   resumed then; by the time the completion bell fires the context is unlocked.
 *   `unlockAudio()` is exposed for that gesture; `playCompletionBell()` also
 *   best-effort resumes a suspended context.
 * - Everything is wrapped in try/catch: if Web Audio is unavailable or blocked,
 *   the app simply stays silent rather than erroring.
 * - The iOS hardware silent switch may mute Web Audio on some iOS versions; this
 *   is a platform limitation we cannot reliably override, so the bell is a
 *   best-effort enhancement, not a guarantee.
 */

import { requestDuck, releaseDuck } from './audioBus';

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
 * Create/resume the AudioContext from within a user gesture (e.g. the "Start
 * practice" tap) so later programmatic playback is allowed. Safe to call
 * repeatedly; no-ops gracefully when Web Audio is unavailable.
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

/** Bell envelope length (s) — the oscillators stop at now + 3.3 (see below). */
const BELL_DURATION_SECONDS = 3.3;

/**
 * Play a single soft bell. Two detuned sine partials through a gentle
 * exponential decay give a warm, calm timbre. Best-effort: silent on failure.
 *
 * While the bell rings, the background music is ducked (via audioBus) so the
 * bell isn't masked by the music, then un-ducked once the envelope finishes.
 * The duck/release is balanced even on error: releaseDuck is scheduled, and
 * audioBus clamps at 0 so an unmatched release is a harmless no-op.
 */
export function playCompletionBell(): void {
  const context = getContext();
  if (!context) return;

  // Duck the music for the bell. Released after the envelope finishes (or via
  // the catch below if synthesis throws before scheduling).
  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    releaseDuck();
  };
  requestDuck();

  try {
    if (context.state === 'suspended') void context.resume();

    const now = context.currentTime;
    // Un-duck once the bell's envelope has finished ringing.
    window.setTimeout(release, BELL_DURATION_SECONDS * 1000);
    // Master gain shapes the overall envelope: quick soft attack, long decay.
    const master = context.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.22, now + 0.04); // gentle attack
    master.gain.exponentialRampToValueAtTime(0.0001, now + 3.2); // long tail
    master.connect(context.destination);

    // Two partials an octave-ish apart for a warm bell (fundamental + shimmer).
    const partials = [
      { freq: 528, gain: 1.0 }, // fundamental (a soft, calm pitch)
      { freq: 1056, gain: 0.35 }, // upper partial for shimmer
    ];

    for (const { freq, gain } of partials) {
      const osc = context.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const partialGain = context.createGain();
      partialGain.gain.setValueAtTime(gain, now);

      osc.connect(partialGain);
      partialGain.connect(master);

      osc.start(now);
      osc.stop(now + BELL_DURATION_SECONDS);
    }
  } catch {
    // Synthesis failed before/while scheduling — release the duck we requested
    // so the music can never be stranded at low volume.
    release();
  }
}
