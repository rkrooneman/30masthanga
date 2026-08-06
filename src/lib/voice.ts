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
 * === iOS Safari: reuse ONE gesture-unlocked element (the important part) ===
 * On iOS Safari only an <audio> element that was actually played DURING a user
 * gesture is "unlocked" for later programmatic playback. A freshly-constructed
 * `new Audio(src)` played later from a timer / step-advance (NOT a gesture) is
 * silently blocked. So we do NOT create a new element per cue: we keep a SINGLE
 * persistent module-level element (`voiceEl`), prime it inside the Start-practice
 * gesture (see `unlockVoice`), and then REUSE that same element for every cue
 * (set `.src`, call `.play()`). Because that element was played during a gesture,
 * its later programmatic `.play()` calls are permitted — so the 2nd, 3rd, … pose
 * announcements play instead of only the first.
 *
 * === toggles ===
 * Automatic practice narration follows the single guidance level: a cue only
 * plays when the current level enables the `voice` layer (level 3), i.e.
 * `layersForLevel(loadGuidanceLevel()).voice`. The explicit pronunciation-button
 * tap (speakPoseName) is a separate, always-allowed action and does NOT follow
 * the guidance level (see speakPoseName below).
 *
 * === ducking ===
 * Around each utterance we requestDuck()/releaseDuck() (see audioBus) so the
 * background music dips while the pose name is spoken and rises again after. The
 * release is guaranteed to fire exactly once per successful play attempt —
 * whichever of `ended`, `error`, or a safety timeout happens first wins — so a
 * clip that stalls can never leave the music ducked forever.
 */

import { loadGuidanceLevel } from './preferences';
import { layersForLevel } from './guidance';
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
 * The SINGLE persistent voice element, reused for every cue so that the
 * gesture-unlock done in `unlockVoice()` carries over to later programmatic
 * playback on iOS Safari. Created lazily and guarded for SSR / no-DOM (only
 * constructed when `Audio` exists). Null until first accessed, or if `Audio` is
 * unavailable — callers then simply stay silent.
 */
let voiceEl: HTMLAudioElement | null = null;

/**
 * Lazily construct (once) and return the shared voice element, or null when the
 * environment has no `Audio` constructor (SSR / tests / no DOM). Best-effort:
 * returns null rather than throwing if construction fails.
 */
function getVoiceEl(): HTMLAudioElement | null {
  if (voiceEl) return voiceEl;
  if (typeof Audio === 'undefined') return null;
  try {
    voiceEl = new Audio();
  } catch {
    voiceEl = null;
  }
  return voiceEl;
}

/**
 * The one-shot duck release for the currently-playing utterance, plus the
 * named `ended`/`error` handlers currently attached to the shared element.
 * Tracked so `stopVoice()` can hard-stop an in-flight utterance and release the
 * duck it holds, and so a fresh cue can detach the previous cue's listeners
 * before attaching its own (listeners must not accumulate on the reused
 * element). There is only ever one voice clip playing at a time in the guided
 * player, so single refs suffice. All are null when nothing is playing.
 */
let currentRelease: (() => void) | null = null;
let currentEndedHandler: (() => void) | null = null;
let currentErrorHandler: (() => void) | null = null;

/**
 * Build the public URL for a voice clip. Ids are already safe snake_case slugs,
 * but encodeURIComponent is applied defensively (harmless for slugs, correct if
 * an id ever contained a reserved character).
 */
export function voiceSrc(id: string): string {
  return VOICE_BASE + encodeURIComponent(id) + '.mp3';
}

/**
 * Whether automatic practice narration is permitted right now: the current
 * guidance level must enable the `voice` layer (level 3). Read fresh each time
 * (not cached) so a level change takes effect on the very next cue.
 */
function narrationEnabled(): boolean {
  return layersForLevel(loadGuidanceLevel()).voice;
}

/**
 * Play one voice clip with ducking. Best-effort; silent on any failure.
 *
 * The `gate` decides whether playback is allowed: automatic practice cues use
 * `narrationEnabled` (the guidance level's `voice` layer, level 3); an explicit
 * on-demand action like the pronunciation button passes its own gate (an
 * always-true gate, so an explicit tap always speaks). Defaults to
 * `narrationEnabled`.
 *
 * Ducking bookkeeping: requestDuck() is called before playback, and releaseDuck()
 * fires exactly once — guarded by `released` — on the first of `ended`, `error`,
 * a `.play()` rejection, or the safety timeout.
 */
function playClip(src: string, gate: () => boolean = narrationEnabled): void {
  if (!gate()) return;

  // Never let two voice clips overlap: hard-stop and un-duck any in-flight one
  // before starting this one. With a single shared element this also naturally
  // enforces "only one cue at a time".
  stopVoice();

  const audio = getVoiceEl();
  if (!audio) return; // no Audio available (SSR / no DOM) — stay silent

  try {
    // Reuse the SAME gesture-unlocked element: point it at this clip and reset.
    // Speed is baked into the files — do NOT set playbackRate.
    audio.src = src;
    audio.currentTime = 0;
    audio.muted = false;
    audio.volume = 1;

    let released = false;

    const release = () => {
      if (released) return;
      released = true;
      window.clearTimeout(timeoutId);
      // Detach THIS cue's listeners from the shared element so they can never
      // fire for a later cue (listeners would otherwise accumulate on reuse).
      audio.removeEventListener('ended', endedHandler);
      audio.removeEventListener('error', errorHandler);
      // Clear the module refs if they still point at THIS cue (a later cue may
      // have already replaced them).
      if (currentRelease === release) {
        currentRelease = null;
        currentEndedHandler = null;
        currentErrorHandler = null;
      }
      releaseDuck();
    };

    // Named handlers (not inline) so they can be removed on release/stop and
    // never pile up on the reused element.
    const endedHandler = () => release();
    const errorHandler = () => release();
    audio.addEventListener('ended', endedHandler);
    audio.addEventListener('error', errorHandler);

    // Duck first, then play, so the music is already dipping as the clip starts.
    requestDuck();
    // Track this as the current cue so stopVoice() can interrupt it and detach
    // its listeners.
    currentRelease = release;
    currentEndedHandler = endedHandler;
    currentErrorHandler = errorHandler;

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
    // Assigning src / play threw synchronously. We may or may not have requested
    // a duck; releaseDuck() is clamped at 0, so an unmatched release is a safe
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
 * Used for the automatic pose announcement during guided practice.
 */
export function speakPose(poseId: string): void {
  playClip(voiceSrc(poseId));
}

/**
 * Speak a pose's name ON DEMAND (the pronunciation button on the detail card).
 * Unlike speakPose, this is an explicit user action (an intentional tap on the
 * speaker icon to hear a name), so it plays regardless of the guidance level -
 * it is NOT tied to the level's `voice` layer. The gate is always-true so the
 * speaker button stays functional at every guidance level, including Silent.
 */
export function speakPoseName(poseId: string): void {
  playClip(voiceSrc(poseId), () => true);
}

/**
 * Speak the closing "Namaste". No-op unless both sound and voice are on.
 */
export function speakNamaste(): void {
  playClip(voiceSrc('namaste'));
}

/**
 * Speak the "Switch sides" cue, played at the start of a same-pose side/round
 * transition (instead of re-announcing the pose name). No-op unless both sound
 * and voice are on.
 */
export function speakSwitchSides(): void {
  playClip(voiceSrc('switch_sides'));
}

/**
 * Play an arbitrary prerecorded voice cue by its clip id (maps to
 * `/audio/voice/<cueId>.mp3`), with the same toggle-guarding, ducking, and
 * stop-tracking as the other speak* functions. No-op unless both sound and
 * voice are on.
 *
 * Used by the guided player for the salutation vinyasa cues: `'last_breath'`
 * (on the Down Dog hold's final breath) and `'step_jump_forward'` (on the
 * jump-forward (Ardha Uttanasana) exit step's first breath). The clip files must
 * exist under `public/audio/voice/`; a missing clip simply stays silent
 * (best-effort).
 */
export function speakCue(cueId: string): void {
  playClip(voiceSrc(cueId));
}

/**
 * Hard-stop any voice clip currently playing: pause it, detach its handlers,
 * and release the duck it holds so the background music is not left dipped.
 *
 * Safe to call at any time (including when nothing is playing — a no-op then).
 * Used by the guided player when the practitioner skips to another pose, so the
 * previous announcement is cut immediately before the new one is scheduled.
 *
 * The duck release goes through the same guarded `release` closure the clip
 * registered, so the ref-count is decremented EXACTLY once regardless of
 * whether `ended`/`error`/the timeout would also have fired — no stuck-ducked
 * music and no double-release.
 */
export function stopVoice(): void {
  const release = currentRelease;
  const endedHandler = currentEndedHandler;
  const errorHandler = currentErrorHandler;
  // Clear refs first so a re-entrant call (e.g. from within release) is a no-op.
  currentRelease = null;
  currentEndedHandler = null;
  currentErrorHandler = null;
  if (voiceEl) {
    try {
      // Pause the SHARED element to cut the in-flight cue. We deliberately do
      // NOT clear `.src` here: that could break the gesture-unlock / reuse for
      // the next cue. Pausing plus firing the pending release is enough, and the
      // next playClip() assigns a fresh src anyway.
      voiceEl.pause();
      // Detach this cue's handlers so the paused element's own events can't
      // double-release later (release() also detaches, but do it defensively in
      // case release throws or was already consumed).
      if (endedHandler) voiceEl.removeEventListener('ended', endedHandler);
      if (errorHandler) voiceEl.removeEventListener('error', errorHandler);
    } catch {
      /* ignore — best-effort stop */
    }
  }
  // Release the duck this cue requested (guarded: fires at most once).
  if (release) {
    try {
      release();
    } catch {
      /* ignore — best-effort release */
    }
  }
}

/**
 * Warm up MP3 <audio> playback, to be called from within the "Start practice"
 * user gesture (the same window unlockAudio() uses for Web Audio).
 *
 * CRITICAL for iOS Safari: this unlocks the SAME persistent element (`voiceEl`)
 * that later plays every cue — not a throwaway. Within the gesture we mute it,
 * `.play()` then immediately `.pause()`, reset `currentTime`, and unmute, so the
 * browser has seen a play attempt on THIS element during a gesture. Later
 * programmatic `.play()` calls on it are then permitted, so the 2nd+ cues play.
 * Fully best-effort and silent on failure.
 */
export function unlockVoice(): void {
  const audio = getVoiceEl();
  if (!audio) return;
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
          // Unmute even if the warm-up play was rejected, so a real cue later
          // isn't left silently muted.
          audio.muted = false;
        });
    } else {
      // Synchronous / no-promise play(): pause and unmute immediately.
      audio.pause();
      audio.muted = false;
    }
  } catch {
    /* ignore — best-effort warm-up */
  }
}
