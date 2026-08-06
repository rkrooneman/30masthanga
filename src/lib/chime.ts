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

/**
 * Safety cap (ms) for releasing the music duck if the TRANSITION bell's
 * `ended`/`error` events never fire. Shorter than the completion bell's cap
 * because a per-pose transition bell is a brief, soft cue.
 */
const TRANSITION_BELL_MAX_DURATION_MS = 4000;

/**
 * Volume for the per-transition bell. A touch softer than the completion bell
 * (which plays at 1) so it reads as a gentle per-pose cue rather than the fuller
 * end-of-practice chime. Same audio asset, separate element.
 */
const TRANSITION_BELL_VOLUME = 0.7;

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
 * A SEPARATE persistent element for the per-transition bell. Kept distinct from
 * the completion `bellEl` on purpose: the completion bell's stopChime() /
 * currentRelease machinery assumes a single bell, and a transition bell can ring
 * close to other audio, so giving it its own element avoids entangling the two
 * bells' stop/duck bookkeeping. Reuses the SAME BELL_SRC asset (there is only
 * one bell sound in the repo). Null until first accessed, or if `Audio` is
 * unavailable - the transition bell then simply stays silent.
 */
let transitionBellEl: HTMLAudioElement | null = null;

/**
 * Lazily construct (once) and return the shared transition-bell element with its
 * source pre-assigned, or null when there is no `Audio` constructor (SSR / tests
 * / no DOM). Mirrors getBellEl() but for the transition element. Best-effort:
 * returns null rather than throwing if construction fails.
 */
function getTransitionBellEl(): HTMLAudioElement | null {
  if (transitionBellEl) return transitionBellEl;
  if (typeof Audio === 'undefined') return null;
  try {
    transitionBellEl = new Audio(BELL_SRC);
  } catch {
    transitionBellEl = null;
  }
  return transitionBellEl;
}

/**
 * Open the audio playback window from within a user gesture (e.g. the "Start
 * practice" tap) so later programmatic playback is allowed. Warms up an
 * AudioContext (for any Web Audio consumers) AND primes the persistent bell
 * <audio> element (muted play+pause) so the later completion bell is permitted
 * on iOS Safari. Safe to call repeatedly; no-ops gracefully when audio is
 * unavailable.
 */
function primeBellElement(bell: HTMLAudioElement): void {
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
            /* ignore - best-effort reset */
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
    /* ignore - best-effort warm-up */
  }
}

export function unlockAudio(): void {
  // Prime the completion bell <audio> element within the gesture (iOS Safari
  // requirement).
  const bell = getBellEl();
  if (bell) primeBellElement(bell);

  // Prime the transition bell element too, so a per-pose transition bell fired
  // later from a non-gesture timer context is permitted on iOS Safari.
  const transitionBell = getTransitionBellEl();
  if (transitionBell) primeBellElement(transitionBell);

  const context = getContext();
  if (!context) return;
  try {
    if (context.state === 'suspended') void context.resume();
  } catch {
    /* ignore — audio is a best-effort enhancement */
  }
}

/**
 * The one-shot duck release for the currently-ringing bell, plus the named
 * `ended`/`error` handlers currently attached to the shared element. Tracked at
 * module level (mirroring voice.ts) so `stopChime()` can hard-stop an in-flight
 * bell and release the duck it holds, and so a fresh bell can detach the
 * previous one's listeners before attaching its own (listeners must not
 * accumulate on the reused element). Only one bell ever rings at a time. All are
 * null when the bell is not playing.
 */
let currentRelease: (() => void) | null = null;
let currentEndedHandler: (() => void) | null = null;
let currentErrorHandler: (() => void) | null = null;

/**
 * Play the completion bell once. Best-effort: silent on failure.
 *
 * While the bell rings, the background music is ducked (via audioBus) so the
 * bell isn't masked by the music, then un-ducked when it finishes. The
 * duck/release is balanced even on error (release fires on `ended`, `error`, a
 * `.play()` rejection, a safety timeout, or a `stopChime()` interruption, and
 * audioBus clamps at 0 so an unmatched release is a harmless no-op).
 */
export function playCompletionBell(): void {
  // Never let two bells overlap: hard-stop and un-duck any in-flight one before
  // starting this one. With a single shared element this also enforces "only one
  // bell at a time".
  stopChime();

  // Duck the music for the bell; released exactly once when playback ends,
  // errors, the safety timeout elapses, or stopChime() interrupts it.
  let released = false;
  let timer: number | undefined;
  // Handler refs so `release` can detach them from the SHARED element - without
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
    // Clear the module refs if they still point at THIS bell (a later bell may
    // have already replaced them).
    if (currentRelease === release) {
      currentRelease = null;
      currentEndedHandler = null;
      currentErrorHandler = null;
    }
    releaseDuck();
  };
  requestDuck();

  if (!audio) {
    // No Audio available (SSR / no DOM) - release the duck we just requested and
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
    // Track this as the current bell so stopChime() can interrupt it and detach
    // its listeners.
    currentRelease = release;
    currentEndedHandler = endedHandler;
    currentErrorHandler = errorHandler;
    // Safety net: release the duck even if the clip never signals completion.
    timer = window.setTimeout(release, BELL_MAX_DURATION_MS);
    void audio.play().catch(() => {
      // Autoplay blocked / interrupted - reflect reality and release the duck.
      release();
    });
  } catch {
    // Playback failed - release the duck we requested so the music can never be
    // stranded at low volume.
    release();
  }
}

/**
 * Hard-stop the completion bell if it is ringing: pause the SHARED element,
 * rewind it, detach its handlers, and release the duck it holds so the
 * background music is not left dipped.
 *
 * Safe to call at any time (including when the bell is not playing - a no-op
 * then) and idempotent: the duck release goes through the same guarded `release`
 * closure the bell registered, so the ref-count is decremented EXACTLY once
 * regardless of whether `ended`/`error`/the timeout would also have fired - no
 * stuck-ducked music and no double-release. Used by the guided player's
 * unmount teardown so a bell that is mid-ring when the screen goes away (back
 * gesture / "Return home" during or right after completion) is silenced and no
 * orphaned audio keeps sounding.
 *
 * We deliberately do NOT clear `.src` or null the element: it is the persistent,
 * gesture-unlocked bell and must stay reusable for the next practice (pause plus
 * a currentTime reset is exactly what the next playCompletionBell() overrides).
 */
export function stopChime(): void {
  const release = currentRelease;
  const endedHandler = currentEndedHandler;
  const errorHandler = currentErrorHandler;
  // Clear refs first so a re-entrant call (e.g. from within release) is a no-op.
  currentRelease = null;
  currentEndedHandler = null;
  currentErrorHandler = null;
  if (bellEl) {
    try {
      // Pause the SHARED element to cut the in-flight bell, then rewind so the
      // next play starts cleanly. We do NOT clear `.src`: that could break the
      // gesture-unlock / reuse for the next practice.
      bellEl.pause();
      try {
        bellEl.currentTime = 0;
      } catch {
        /* ignore - best-effort reset */
      }
      // Detach this bell's handlers so the paused element's own events can't
      // double-release later (release() also detaches, but do it defensively in
      // case release throws or was already consumed).
      if (endedHandler) bellEl.removeEventListener('ended', endedHandler);
      if (errorHandler) bellEl.removeEventListener('error', errorHandler);
    } catch {
      /* ignore - best-effort stop */
    }
  }
  // Release the duck this bell requested (guarded: fires at most once).
  if (release) {
    try {
      release();
    } catch {
      /* ignore - best-effort release */
    }
  }
}

/**
 * The one-shot duck release for the currently-ringing TRANSITION bell, plus the
 * named `ended`/`error` handlers currently attached to the transition element.
 * Tracked separately from the completion bell's refs so the two bells never
 * touch each other's stop/duck bookkeeping. All are null when the transition
 * bell is not playing.
 */
let currentTransitionRelease: (() => void) | null = null;
let currentTransitionEndedHandler: (() => void) | null = null;
let currentTransitionErrorHandler: (() => void) | null = null;

/**
 * Play the short, soft per-transition bell once - rung when guided practice
 * advances to a new pose. Best-effort: silent on failure.
 *
 * Uses its OWN persistent element (transitionBellEl) and its OWN release/handler
 * refs, so it never touches the completion bell's state. While it rings, the
 * background music is ducked (via audioBus) so the cue isn't masked, then
 * un-ducked when it finishes. The duck/release is balanced even on error
 * (release fires on `ended`, `error`, a `.play()` rejection, a shorter safety
 * timeout, or a stopTransitionBell() interruption, and audioBus clamps at 0 so
 * an unmatched release is a harmless no-op).
 *
 * This function only plays; the caller decides WHEN to ring it (e.g. only at
 * guidance levels >= 1). It does not gate on any preference itself.
 */
export function playTransitionBell(): void {
  // Never let two transition bells overlap (rapid skips): hard-stop and un-duck
  // any in-flight one before starting this one. Scoped to the transition element
  // only - the completion bell's state is untouched.
  stopTransitionBell();

  // Duck the music for the bell; released exactly once when playback ends,
  // errors, the safety timeout elapses, or stopTransitionBell() interrupts it.
  let released = false;
  let timer: number | undefined;
  // Handler refs so `release` can detach them from the reused transition element
  // - without this, listeners would accumulate across transitions.
  let endedHandler: (() => void) | null = null;
  let errorHandler: (() => void) | null = null;
  const audio = getTransitionBellEl();
  const release = () => {
    if (released) return;
    released = true;
    if (timer !== undefined) window.clearTimeout(timer);
    if (audio) {
      if (endedHandler) audio.removeEventListener('ended', endedHandler);
      if (errorHandler) audio.removeEventListener('error', errorHandler);
    }
    // Clear the module refs if they still point at THIS bell (a later bell may
    // have already replaced them).
    if (currentTransitionRelease === release) {
      currentTransitionRelease = null;
      currentTransitionEndedHandler = null;
      currentTransitionErrorHandler = null;
    }
    releaseDuck();
  };
  requestDuck();

  if (!audio) {
    // No Audio available (SSR / no DOM) - release the duck we just requested and
    // stay silent.
    release();
    return;
  }

  try {
    // Reuse the SAME gesture-unlocked transition element so the bell is
    // permitted on iOS.
    audio.currentTime = 0;
    audio.muted = false;
    audio.volume = TRANSITION_BELL_VOLUME;
    endedHandler = () => release();
    errorHandler = () => release();
    audio.addEventListener('ended', endedHandler);
    audio.addEventListener('error', errorHandler);
    // Track this as the current transition bell so stopTransitionBell() can
    // interrupt it and detach its listeners.
    currentTransitionRelease = release;
    currentTransitionEndedHandler = endedHandler;
    currentTransitionErrorHandler = errorHandler;
    // Safety net (shorter than the completion bell): release the duck even if
    // the clip never signals completion.
    timer = window.setTimeout(release, TRANSITION_BELL_MAX_DURATION_MS);
    void audio.play().catch(() => {
      // Autoplay blocked / interrupted - reflect reality and release the duck.
      release();
    });
  } catch {
    // Playback failed - release the duck we requested so the music can never be
    // stranded at low volume.
    release();
  }
}

/**
 * Hard-stop the transition bell if it is ringing: pause its OWN element, rewind
 * it, detach its handlers, and release the duck it holds. Mirrors stopChime()
 * but scoped entirely to the transition element and its own refs, so the
 * completion bell's state is never touched.
 *
 * Safe to call at any time (a no-op when the transition bell is not playing) and
 * idempotent: the duck release goes through the same guarded `release` closure
 * the bell registered, so the ref-count is decremented EXACTLY once. We
 * deliberately do NOT clear `.src` or null the element: it is the persistent,
 * gesture-unlocked transition bell and must stay reusable.
 */
export function stopTransitionBell(): void {
  const release = currentTransitionRelease;
  const endedHandler = currentTransitionEndedHandler;
  const errorHandler = currentTransitionErrorHandler;
  // Clear refs first so a re-entrant call (e.g. from within release) is a no-op.
  currentTransitionRelease = null;
  currentTransitionEndedHandler = null;
  currentTransitionErrorHandler = null;
  if (transitionBellEl) {
    try {
      // Pause the transition element to cut the in-flight bell, then rewind so
      // the next play starts cleanly. We do NOT clear `.src`: that could break
      // the gesture-unlock / reuse.
      transitionBellEl.pause();
      try {
        transitionBellEl.currentTime = 0;
      } catch {
        /* ignore - best-effort reset */
      }
      // Detach this bell's handlers so the paused element's own events can't
      // double-release later (release() also detaches, but do it defensively in
      // case release throws or was already consumed).
      if (endedHandler)
        transitionBellEl.removeEventListener('ended', endedHandler);
      if (errorHandler)
        transitionBellEl.removeEventListener('error', errorHandler);
    } catch {
      /* ignore - best-effort stop */
    }
  }
  // Release the duck this bell requested (guarded: fires at most once).
  if (release) {
    try {
      release();
    } catch {
      /* ignore - best-effort release */
    }
  }
}
