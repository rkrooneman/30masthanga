/**
 * voice — spoken pose-name narration for the guided practice.
 *
 * 59 short, prerecorded MP3s live in `public/audio/voice/` (one per pose id,
 * plus `namaste.mp3`) and are served from the site root at
 * `/audio/voice/<id>.mp3`. Playback speed (0.9x) is already baked into the files,
 * so we deliberately DO NOT touch `playbackRate` here.
 *
 * Design mirrors chime.ts's philosophy: everything is best-effort and wrapped in
 * try/catch, and `.play()` rejections (autoplay policy, interrupted playback)
 * are swallowed. If audio can't play, the app simply stays silent rather than
 * erroring.
 *
 * === toggles ===
 * A cue only plays when BOTH the master sound toggle (loadSoundEnabled) and the
 * voice toggle (loadVoiceEnabled) are on. Either being off makes speak* a no-op.
 *
 * === ducking ===
 * Around each utterance we requestDuck()/releaseDuck() (see audioBus) so the
 * background music dips while the pose name is spoken and rises again after. The
 * release is guaranteed to fire exactly once per successful play attempt —
 * whichever of `ended`, `error`, or a safety timeout happens first wins — so a
 * clip that stalls can never leave the music ducked forever.
 */

import { loadSoundEnabled, loadVoiceEnabled } from './preferences';
import { requestDuck, releaseDuck } from './audioBus';

/** Base path (literal) under which the voice mp3s are served. */
const VOICE_BASE = '/audio/voice/';

/**
 * Upper bound (ms) on how long a single utterance may hold the music ducked.
 * The clips are a couple of seconds; this is a generous ceiling that only fires
 * if `ended`/`error` never do (a stuck/decoding-failed element), guaranteeing
 * the music always recovers.
 */
const MAX_UTTERANCE_MS = 8000;

/**
 * Build the public URL for a voice clip. Ids are already safe snake_case slugs,
 * but encodeURIComponent is applied defensively (harmless for slugs, correct if
 * an id ever contained a reserved character).
 */
export function voiceSrc(id: string): string {
  return VOICE_BASE + encodeURIComponent(id) + '.mp3';
}

/**
 * Whether narration is permitted right now: both master sound AND voice must be
 * enabled. Read fresh each time (not cached) so a toggle change takes effect on
 * the very next cue.
 */
function narrationEnabled(): boolean {
  return loadSoundEnabled() && loadVoiceEnabled();
}

/**
 * Play one voice clip with ducking. Best-effort; silent on any failure.
 *
 * Ducking bookkeeping: requestDuck() is called before playback, and releaseDuck()
 * fires exactly once — guarded by `released` — on the first of `ended`, `error`,
 * a `.play()` rejection, or the safety timeout.
 */
function playClip(src: string): void {
  if (!narrationEnabled()) return;

  try {
    const audio = new Audio(src);
    // Speed is baked into the files — do NOT set playbackRate.

    let released = false;

    const release = () => {
      if (released) return;
      released = true;
      window.clearTimeout(timeoutId);
      releaseDuck();
    };

    audio.addEventListener('ended', release, { once: true });
    audio.addEventListener('error', release, { once: true });

    // Duck first, then play, so the music is already dipping as the clip starts.
    requestDuck();

    // Safety net: if the element never fires ended/error (stalled decode), make
    // sure the music un-ducks anyway. (clearTimeout on an already-fired id is a
    // harmless no-op, so `release` can call it unconditionally.)
    const timeoutId = window.setTimeout(release, MAX_UTTERANCE_MS);

    const playback = audio.play();
    if (playback && typeof playback.then === 'function') {
      playback.catch(() => {
        // Autoplay blocked / interrupted — release the duck we requested.
        release();
      });
    }
  } catch {
    // new Audio / play threw synchronously. We may or may not have requested a
    // duck; releaseDuck() is clamped at 0, so an unmatched release is a safe
    // no-op. Call it to be safe against a leaked request.
    try {
      releaseDuck();
    } catch {
      /* ignore — best-effort */
    }
  }
}

/**
 * Speak the name of a pose by its id. No-op unless both sound and voice are on.
 */
export function speakPose(poseId: string): void {
  playClip(voiceSrc(poseId));
}

/**
 * Speak the closing "Namaste". No-op unless both sound and voice are on.
 */
export function speakNamaste(): void {
  playClip(voiceSrc('namaste'));
}

/**
 * Optional warm-up for MP3 <audio> playback, to be called from within the
 * "Start practice" user gesture (the same window unlockAudio() uses for Web
 * Audio). It creates and immediately pauses a muted element so the browser has
 * seen an audio play attempt during a gesture; later programmatic play() calls
 * are then more likely to be permitted. Fully best-effort and silent on failure.
 */
export function unlockVoice(): void {
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
