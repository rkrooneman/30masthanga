/**
 * breathCues — soft inhale/exhale tones played on each guided breath.
 *
 * Two short prerecorded clips live in `public/audio/effects/` and are served from
 * the site root at `/audio/effects/inhale.mp3` and `/audio/effects/exhale.mp3`.
 * `playInhale()` fires at the start of a breath's inhale phase; `playExhale()`
 * fires at the exhale boundary. Playback mirrors voice.ts: a short-lived
 * `new Audio(src)`, everything best-effort and wrapped in try/catch, and
 * `.play()` rejections (autoplay policy, interrupted playback) are swallowed. If
 * a tone can't play, the app simply stays silent rather than erroring.
 *
 * === toggles ===
 * A tone only plays when BOTH the master sound toggle (loadSoundEnabled) and the
 * breath-cues toggle (loadBreathCuesEnabled) are on. Either being off makes
 * play* a no-op. The pref is read fresh each call (not cached) so a toggle
 * change takes effect on the very next breath.
 *
 * === ducking: "blend with music, duck WITH music" (the key design point) ===
 * Breath tones are part of the calm soundscape and are meant to BLEND with the
 * ambient music, so — unlike voice.ts and chime.ts — they DO NOT requestDuck():
 * a breath tone must never lower the music's volume.
 *
 * Instead, breath tones are a duck LISTENER, exactly like MusicPanel: this module
 * subscribes ONCE (at module load) to the audioBus and tracks the current ducked
 * state. When something more important (a spoken pose name, an asana
 * announcement, the completion bell) requests a duck, the bus flips to "ducked"
 * and we lower every live breath tone's volume to DUCK_VOLUME; when it flips back
 * to "unducked" we return them to FULL_VOLUME. A tone that STARTS while ducked
 * begins already at the ducked volume. The net effect: during a spoken pose name
 * the music AND the breath tones dip together, then swell back together.
 *
 * The set of currently-playing tones is tracked so the duck listener can adjust
 * them live; each tone removes itself on `ended`/`error` so the set never leaks.
 */

import { loadSoundEnabled, loadBreathCuesEnabled } from './preferences';
import { subscribeDuck } from './audioBus';

/** Public URLs (literal) for the two breath-tone clips. */
const INHALE_SRC = '/audio/effects/inhale.mp3';
const EXHALE_SRC = '/audio/effects/exhale.mp3';

/**
 * Volume for a breath tone while ducked — dipped so a voice cue / bell sits
 * clearly on top, but kept audible (breath tones are soft and calm, not cut to
 * near-silence like the music). A tone dipping to ~0.25 while a pose name plays
 * reads as "gently in the background" rather than "gone".
 */
const DUCK_VOLUME = 0.25;
/** Normal (un-ducked) volume — full presence in the blend. */
const FULL_VOLUME = 1;

/**
 * The current ducked state, kept in sync with the audioBus by the module-level
 * subscription below. New tones start at the matching volume; the listener
 * re-levels live tones whenever this flips.
 */
let ducked = false;

/**
 * Every breath tone that is currently playing. Tones add themselves on play and
 * remove themselves on `ended`/`error`, so the duck listener can adjust exactly
 * the live ones and the set can never leak stale elements.
 */
const liveTones = new Set<HTMLAudioElement>();

/**
 * Subscribe ONCE, at module load, to duck/unduck notifications. subscribeDuck
 * invokes the listener immediately with the current state, so `ducked` is
 * seeded correctly even if a duck is already in flight when this module loads.
 * On every flip we re-level all live tones directly (a direct set is fine for
 * these short clips; a ramp would be a nice-to-have, not a requirement).
 */
subscribeDuck((isDucked) => {
  ducked = isDucked;
  const target = isDucked ? DUCK_VOLUME : FULL_VOLUME;
  for (const tone of liveTones) {
    try {
      tone.volume = target;
    } catch {
      /* ignore — best-effort re-level */
    }
  }
});

/**
 * Whether breath cues are permitted right now: both master sound AND breath
 * cues must be enabled. Read fresh each time (not cached) so a toggle change
 * takes effect on the very next breath.
 */
function breathCuesEnabled(): boolean {
  return loadBreathCuesEnabled() && loadSoundEnabled();
}

/**
 * Play one breath tone. Best-effort; silent on any failure. Does NOT requestDuck
 * (breath tones blend with the music, they don't duck it). The element starts at
 * the current ducked volume, so a tone that begins mid-duck is already lowered,
 * and is added to `liveTones` so the duck listener can re-level it if the state
 * flips while it's still playing. It removes itself from the set on end/error.
 */
function playClip(src: string): void {
  if (!breathCuesEnabled()) return;

  try {
    const audio = new Audio(src);
    // Speed/pitch are baked into the files — do NOT touch playbackRate.

    // Start at whatever the current duck state dictates, so a tone that STARTS
    // while ducked begins already lowered rather than blaring for a frame.
    audio.volume = ducked ? DUCK_VOLUME : FULL_VOLUME;

    let removed = false;
    const cleanup = () => {
      if (removed) return;
      removed = true;
      liveTones.delete(audio);
    };
    audio.addEventListener('ended', cleanup, { once: true });
    audio.addEventListener('error', cleanup, { once: true });

    // Track as live BEFORE play() so a duck flip during startup still catches it.
    liveTones.add(audio);

    const playback = audio.play();
    if (playback && typeof playback.then === 'function') {
      playback.catch(() => {
        // Autoplay blocked / interrupted — drop it from the live set.
        cleanup();
      });
    }
  } catch {
    /* new Audio / play threw synchronously — best-effort, stay silent */
  }
}

/**
 * Play the soft inhale tone at the start of a guided breath's inhale phase.
 * No-op unless both sound and breath cues are on.
 */
export function playInhale(): void {
  playClip(INHALE_SRC);
}

/**
 * Play the soft exhale tone at the inhale/exhale boundary of a guided breath.
 * No-op unless both sound and breath cues are on.
 */
export function playExhale(): void {
  playClip(EXHALE_SRC);
}

/**
 * Immediately stop every breath tone that is currently playing. Used when the
 * practitioner skips poses (prev/next): without this, each skip starts a fresh
 * tone while the previous ones are still ringing, so rapid skipping stacks the
 * inhale/exhale sounds into a cacophony. Best-effort; safe to call anytime.
 */
export function stopBreathCues(): void {
  for (const tone of liveTones) {
    try {
      tone.pause();
      tone.src = '';
    } catch {
      /* ignore — best-effort stop */
    }
  }
  liveTones.clear();
}

/**
 * Optional warm-up for WAV <audio> playback, to be called from within the
 * "Start practice" user gesture (the same window unlockAudio()/unlockVoice()
 * use). It creates and immediately pauses a muted element so the browser has
 * seen an audio play attempt during a gesture; later programmatic play() calls
 * are then more likely to be permitted on mobile. Fully best-effort and silent
 * on failure.
 */
export function unlockBreathCues(): void {
  try {
    const audio = new Audio();
    audio.muted = true;
    const playback = audio.play();
    if (playback && typeof playback.then === 'function') {
      playback
        .then(() => {
          audio.pause();
        })
        .catch(() => {
          /* ignore — best-effort warm-up */
        });
    }
  } catch {
    /* ignore — best-effort warm-up */
  }
}
