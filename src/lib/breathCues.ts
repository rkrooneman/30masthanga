/**
 * breathCues — soft inhale/exhale tones played on each guided breath.
 *
 * Two short prerecorded clips live in `public/audio/effects/` and are served from
 * the site root at `/audio/effects/inhale.mp3` and `/audio/effects/exhale.mp3`.
 * `playInhale()` fires at the start of a breath's inhale phase; `playExhale()`
 * fires at the exhale boundary. Playback mirrors voice.ts: everything is
 * best-effort and wrapped in try/catch, and `.play()` rejections (autoplay
 * policy, interrupted playback) are swallowed. If a tone can't play, the app
 * simply stays silent rather than erroring.
 *
 * === iOS Safari: reuse gesture-unlocked elements ===
 * Like voice.ts, we do NOT create a `new Audio(src)` per tone — on iOS Safari a
 * freshly-created element played later from a timer (not a gesture) is silently
 * blocked, so only the first tone would ever sound. Instead there are exactly
 * two sounds, so we keep TWO dedicated persistent elements (`inhaleEl`,
 * `exhaleEl`), pre-assign their `.src` once, unlock BOTH inside the Start-
 * practice gesture (see `unlockBreathCues`), and REUSE each for its tone (reset
 * `currentTime`, set volume, `.play()`). Because they were played during a
 * gesture, later programmatic plays are permitted.
 *
 * === toggles ===
 * A tone only plays when the current guidance level enables the `breath` layer
 * (level 2 or 3), i.e. `layersForLevel(loadGuidanceLevel()).breath`. The level
 * is read fresh each call (not cached) so a level change takes effect on the
 * very next breath.
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

import { loadGuidanceLevel } from './preferences';
import { layersForLevel } from './guidance';
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
 * The two persistent, reusable tone elements — one per sound. Created lazily and
 * guarded for SSR / no-DOM (only constructed when `Audio` exists), each with its
 * `.src` pre-assigned once. Reused for every play so the gesture-unlock in
 * `unlockBreathCues()` carries over to later programmatic playback on iOS. Null
 * until first accessed, or if `Audio` is unavailable.
 */
let inhaleEl: HTMLAudioElement | null = null;
let exhaleEl: HTMLAudioElement | null = null;

/**
 * Lazily construct (once) the two tone elements with their sources pre-assigned.
 * Best-effort: leaves them null when there is no `Audio` constructor (SSR /
 * tests / no DOM) or if construction fails, so callers simply stay silent.
 */
function ensureToneEls(): void {
  if (typeof Audio === 'undefined') return;
  try {
    if (!inhaleEl) {
      inhaleEl = new Audio(INHALE_SRC);
    }
    if (!exhaleEl) {
      exhaleEl = new Audio(EXHALE_SRC);
    }
  } catch {
    /* ignore — best-effort; stay silent if construction fails */
  }
}

/**
 * Every breath tone element that is currently playing. Tones add themselves on
 * play and remove themselves on `ended`/`error`, so the duck listener can adjust
 * exactly the live ones and the set can never leak stale elements. Because there
 * are only two shared elements, an element re-added on a rapid replay is a
 * harmless Set no-op.
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
 * Whether breath cues are permitted right now: the current guidance level must
 * enable the `breath` layer (level 2 or 3). Read fresh each time (not cached) so
 * a level change takes effect on the very next breath.
 */
function breathCuesEnabled(): boolean {
  return layersForLevel(loadGuidanceLevel()).breath;
}

/**
 * Play one breath tone by REUSING its persistent element. Best-effort; silent on
 * any failure. Does NOT requestDuck (breath tones blend with the music, they
 * don't duck it). The element starts at the current ducked volume, so a tone
 * that begins mid-duck is already lowered, and is added to `liveTones` so the
 * duck listener can re-level it if the state flips while it's still playing. It
 * removes itself from the set on end/error. Reusing the (gesture-unlocked)
 * element is what makes the 2nd+ tones play on iOS Safari.
 */
function playTone(audio: HTMLAudioElement | null): void {
  if (!breathCuesEnabled()) return;
  if (!audio) return; // no Audio available (SSR / no DOM) — stay silent

  try {
    // Speed/pitch are baked into the files — do NOT touch playbackRate.
    // Rewind so a rapid replay restarts the tone from its head.
    audio.currentTime = 0;

    // Start at whatever the current duck state dictates, so a tone that STARTS
    // while ducked begins already lowered rather than blaring for a frame.
    audio.volume = ducked ? DUCK_VOLUME : FULL_VOLUME;

    let removed = false;
    const cleanup = () => {
      if (removed) return;
      removed = true;
      liveTones.delete(audio);
      // Detach so the shared element's own events can't fire cleanup again for a
      // later replay (listeners must not accumulate across reuses).
      audio.removeEventListener('ended', cleanup);
      audio.removeEventListener('error', cleanup);
    };
    audio.addEventListener('ended', cleanup);
    audio.addEventListener('error', cleanup);

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
    /* play threw synchronously — best-effort, stay silent */
  }
}

/**
 * Play the soft inhale tone at the start of a guided breath's inhale phase.
 * No-op unless both sound and breath cues are on.
 */
export function playInhale(): void {
  ensureToneEls();
  playTone(inhaleEl);
}

/**
 * Play the soft exhale tone at the inhale/exhale boundary of a guided breath.
 * No-op unless both sound and breath cues are on.
 */
export function playExhale(): void {
  ensureToneEls();
  playTone(exhaleEl);
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
      // Rewind so the next play starts cleanly, but do NOT clear `.src`: these
      // are the persistent, gesture-unlocked elements and must stay reusable for
      // the next tone (clearing src could break iOS reuse).
      tone.currentTime = 0;
    } catch {
      /* ignore — best-effort stop */
    }
  }
  liveTones.clear();
}

/**
 * Warm up breath-tone <audio> playback, to be called from within the "Start
 * practice" user gesture (the same window unlockAudio()/unlockVoice() use).
 *
 * CRITICAL for iOS Safari: this unlocks the SAME two persistent elements
 * (`inhaleEl`, `exhaleEl`) that later play every tone — not throwaways. For each,
 * within the gesture we mute it, `.play()` then immediately `.pause()`, reset
 * `currentTime`, and unmute, so later programmatic plays are permitted and the
 * 2nd+ tones actually sound. Fully best-effort and silent on failure.
 */
export function unlockBreathCues(): void {
  ensureToneEls();
  for (const audio of [inhaleEl, exhaleEl]) {
    if (!audio) continue;
    try {
      audio.muted = true;
      const playback = audio.play();
      if (playback && typeof playback.then === 'function') {
        playback
          .then(() => {
            audio.pause();
            try {
              audio.currentTime = 0;
            } catch {
              /* ignore — best-effort reset */
            }
            audio.muted = false;
          })
          .catch(() => {
            // Unmute even if warm-up play was rejected, so a real tone later
            // isn't left silently muted.
            audio.muted = false;
          });
      } else {
        audio.pause();
        audio.muted = false;
      }
    } catch {
      /* ignore — best-effort warm-up */
    }
  }
}
