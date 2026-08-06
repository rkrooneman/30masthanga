/**
 * MusicPanel - the background nature ambience for ashtanga30.
 *
 * Rendered ONCE at the app-shell level (see App.tsx) so it is present on every
 * screen (Home, Overview, Guided) and never unmounts on navigation - the Web
 * Audio graph it owns stays alive for the life of the app, so playback (and
 * mute state) persists across screen changes.
 *
 * === gapless engine (Web Audio, not <audio loop>) ===
 * It plays a SELECTABLE nature-ambience loop - off / forest / rain / ocean -
 * via the Web Audio API rather than a native <audio loop> element. The native
 * `loop` attribute is NOT gapless: it re-primes the media element at the loop
 * point and leaves an audible hiccup no matter how the file is authored. An
 * AudioBufferSourceNode with `.loop = true`, by contrast, loops the decoded
 * PCM sample-accurately with no gap. The graph is:
 *
 *     AudioBufferSourceNode(loop=true) -> GainNode -> ctx.destination
 *
 * The GainNode is the single point of volume control - it carries the base bed
 * level, the duck ramp, AND the mute, all at once.
 *
 * For a nature choice we fetch(/ambient/<name>.mp3) -> arrayBuffer() ->
 * ctx.decodeAudioData() and cache the decoded AudioBuffer in an in-memory Map
 * keyed by choice, so re-selecting a previously-played sound is instant (the
 * service worker's CacheFirst rule for /ambient/ already handles the network /
 * offline layer, so a plain fetch is enough). Because a BufferSourceNode is
 * one-shot, each start creates a NEW source, points it at the cached buffer,
 * sets loop=true, connects it through the gain node, and starts it; switching
 * stops and disconnects the old source first. 'off' stops the source and leaves
 * the graph idle. Decoding is async, so a monotonic choice ref guards against
 * races: a source is only started if its choice is still the current one when
 * decode resolves. If the Web Audio API is unavailable (SSR / old browser) the
 * panel degrades gracefully to silence - it never throws.
 *
 * === choice vs. mute (two distinct controls) ===
 * There are two separate concepts, driven by two separate controls:
 *   - CHOICE is the *persistent preference* the user sets with the ambience
 *     slider on Home (off / forest / rain / ocean). A nature choice auto-plays
 *     its loop; 'off' stops. This flows in via the ambientPref pub/sub, which
 *     also persists it (preferences.ts). This panel only listens.
 *   - MUTE/UNMUTE is the *momentary* control on the floating corner button. It
 *     forces the gain node's effective output to 0 for the currently-playing
 *     loop WITHOUT touching the Home preference - a quick "silence this now"
 *     that doesn't change the choice. Mute state persists across track
 *     switches: a muted user stays muted when switching to another nature
 *     sound, and unmuting reveals the current duck/full level.
 * Because there is nothing to mute when the choice is 'off', the corner button
 * is HIDDEN entirely while 'off' (cleanest - no dead/no-op control) and only
 * appears, as a mute toggle, once a nature sound is chosen.
 *
 * === autoplay unlock ===
 * The context here is the ONE shared AudioContext (see src/lib/audioContext.ts),
 * also used by the chime bell - iOS is unreliable with multiple concurrent
 * contexts, so a single shared context means one unlock covers both. A fresh
 * AudioContext usually starts 'suspended' and cannot make sound until a user
 * gesture. When a nature sound is chosen we call ctx.resume() and start;
 * if the context is still suspended (no gesture yet) we install a ONE-TIME
 * global gesture listener (pointerdown/keydown) that resumes the context and
 * starts playback, then removes itself. subscribeAmbientPlayRequest (Generate /
 * Start practice) is the reliable path when a sound is pre-selected on load
 * with no prior interaction: the user's first tap resumes + starts.
 *
 * === ducking ===
 * The panel subscribes to the audioBus (see src/lib/audioBus.ts). When a spoken
 * pose name or the completion bell requests a duck, the gain ramps down to
 * DUCK_VOLUME; when released, it ramps back to FULL_VOLUME, using an asymmetric
 * eased curve (quicker to duck, slower to release) driven by requestAnimationFrame.
 * Only the gain node's target level is touched - never the source's running
 * state. Muting is independent: while muted the effective gain is forced to 0
 * regardless of the ramp target, so mute and the duck ramp coexist without
 * conflict (a muted track stays silent whatever the ramped target is; unmuting
 * reveals the current ramped level).
 *
 * Accessibility: the corner button carries a state-aware aria-label
 * (Mute ambient sound / Unmute ambient sound) and aria-pressed reflects muted;
 * the icon is aria-hidden.
 */

import { useEffect, useRef, useState } from 'react';
import { type AmbientChoice, ambientSrc } from '../lib/ambient';
import { subscribeDuck } from '../lib/audioBus';
import { getSharedAudioContext } from '../lib/audioContext';
import {
  getAmbient,
  subscribeAmbientChoice,
  subscribeAmbientPlayRequest,
} from '../lib/ambientPref';

/** Volume while ducked (ambient dipped so a cue can be heard over it). */
const DUCK_VOLUME = 0.15;
/**
 * Normal (un-ducked) ambient volume. Kept deliberately below 1.0 so the nature
 * ambience sits as a quiet bed UNDER the practice (breath cues, bell, voice)
 * rather than competing with it. Roughly -6 dB.
 */
const FULL_VOLUME = 0.5;
/**
 * Ramp durations are asymmetric and eased for an organic feel: the ambient dips
 * fairly quickly but smoothly when a cue starts (DUCK), then swells back in more
 * slowly once the cue ends (RELEASE), so it "breathes back" rather than snapping.
 * Linear volume ramps sound abrupt (loudness perception is ~logarithmic), so the
 * ramp is shaped with an ease-in-out cubic curve instead.
 */
const DUCK_RAMP_MS = 450;
const RELEASE_RAMP_MS = 900;

/** Ease-in-out cubic: smooth acceleration and deceleration, no hard edges. */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function MusicPanel() {
  // Persistent ambience choice (from Home via ambientPref). Drives which loop
  // plays (or silence for 'off') and whether the corner mute button is shown at
  // all. Seeded synchronously from the current preference so the corner
  // button's visibility is correct from the first render.
  const [choice, setChoice] = useState<AmbientChoice>(getAmbient);
  // Momentary mute state of the currently-playing loop (corner button). Driven
  // entirely from React state now that there is no <audio> element to observe.
  const [muted, setMuted] = useState<boolean>(false);
  // Mirror of `choice` for use inside the (stable, mount-once) gesture callback
  // so it reads the latest value without the choice effect having to re-subscribe.
  const choiceRef = useRef<AmbientChoice>(getAmbient());

  // --- Web Audio graph (owned for the life of the app shell) -----------------
  // Local ref pointing at the ONE shared AudioContext (see audioContext.ts),
  // populated on first use via getSharedAudioContext(). The context itself is
  // shared with chime.ts (iOS is unreliable with multiple contexts); only the
  // gain node and source below are this panel's own, built on that shared
  // context. Kept null until first needed (and null forever when Web Audio is
  // unavailable).
  const ctxRef = useRef<AudioContext | null>(null);
  // The single GainNode - the one volume control for base level, duck AND mute.
  const gainRef = useRef<GainNode | null>(null);
  // The currently-playing source, or null when idle ('off' or not yet started).
  // Sources are one-shot, so this is replaced on every (re)start.
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  // In-memory cache of decoded buffers keyed by nature choice, so re-selecting a
  // previously-played sound starts instantly without re-fetching/decoding.
  const bufferCacheRef = useRef<Map<AmbientChoice, AudioBuffer>>(new Map());

  // Duck/mute state modelled cleanly so they stay independent:
  //   - currentTargetRef is the duck/full target the ramp is moving toward.
  //   - mutedRef is the momentary mute.
  // The gain actually applied = muted ? 0 : currentTarget. Ramps update
  // currentTargetRef and, when NOT muted, the gain node; muting forces gain to
  // 0 without disturbing the target; unmuting restores gain to the target. This
  // keeps a muted user silent across track switches and duck events, and reveals
  // the right level on unmute.
  const currentTargetRef = useRef<number>(FULL_VOLUME);
  const mutedRef = useRef<boolean>(false);
  // Holds the id of an in-flight gain ramp (requestAnimationFrame) so it can be
  // cancelled if a new duck/unduck arrives mid-ramp or on cleanup.
  const rampRef = useRef<number | null>(null);

  // --- lazy context/graph creation -------------------------------------------
  // Obtain the ONE shared AudioContext (created lazily by audioContext.ts) and,
  // on first use, build this panel's own GainNode on it, connect gain ->
  // destination, and seed the gain to the current effective level. Best-effort:
  // returns null when Web Audio is unavailable or construction fails, so callers
  // degrade to silence.
  const getContext = (): AudioContext | null => {
    if (ctxRef.current) return ctxRef.current;
    const context = getSharedAudioContext();
    if (!context) return null;
    try {
      const gain = context.createGain();
      gain.gain.value = mutedRef.current ? 0 : currentTargetRef.current;
      gain.connect(context.destination);
      ctxRef.current = context;
      gainRef.current = gain;
      return context;
    } catch {
      return null;
    }
  };

  // Apply the effective gain (muted ? 0 : currentTarget) to the gain node right
  // now, without ramping. Used by mute/unmute so the change is immediate.
  const applyEffectiveGain = () => {
    const gain = gainRef.current;
    if (!gain) return;
    try {
      gain.gain.value = mutedRef.current ? 0 : currentTargetRef.current;
    } catch {
      /* ignore - best-effort */
    }
  };

  // Stop and disconnect the current source (if any). Best-effort; a source that
  // was never started, or already stopped, is handled gracefully.
  const stopSource = () => {
    const source = sourceRef.current;
    sourceRef.current = null;
    if (!source) return;
    try {
      source.stop();
    } catch {
      /* ignore - may not have started, or already stopped */
    }
    try {
      source.disconnect();
    } catch {
      /* ignore - best-effort */
    }
  };

  // The corner button toggles MUTE/UNMUTE for the current loop. It does NOT
  // change the Home ambience choice and never stops/starts the source - it only
  // forces the effective gain to 0 (mute) or restores it to the current
  // duck/full target (unmute). Persistent across track switches via mutedRef.
  const toggleMute = () => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMuted(next);
    applyEffectiveGain();
  };

  // --- choice-driven playback (auto-play / off / switch) ---------------------
  // Subscribe to the ambience choice. On the immediate sync + every change:
  //   nature sound -> get/decode + cache the buffer, then start a fresh looping
  //                   source through the gain node; resume the context now, and
  //                   arm a one-time gesture retry if it is still suspended.
  //   'off'        -> stop + disconnect the source (silence), leave graph idle.
  // Decoding is async, so each start is guarded against races: it only starts if
  // the decoded choice is still the current one (choiceRef) when decode resolves.
  useEffect(() => {
    // A one-time global gesture listener used to resume a suspended context and
    // start playback. Kept in a closure var so we install/remove exactly one.
    let removeGestureRetry: (() => void) | null = null;

    const clearGestureRetry = () => {
      if (removeGestureRetry) {
        removeGestureRetry();
        removeGestureRetry = null;
      }
    };

    // Start (or restart) a looping source for `target`, but only if `target` is
    // still the current choice by the time its buffer is ready. Fetches +
    // decodes on a cache miss, caches the result, then builds a fresh one-shot
    // BufferSourceNode -> gain -> destination and starts it.
    const startChoice = (target: AmbientChoice) => {
      const src = ambientSrc(target);
      if (!src) return; // 'off' has no source
      const context = getContext();
      if (!context) return; // Web Audio unavailable - stay silent

      const cached = bufferCacheRef.current.get(target);
      if (cached) {
        playBuffer(target, cached);
        return;
      }

      // Cache miss: fetch -> arrayBuffer -> decodeAudioData, then cache + play.
      // Every step is best-effort; on any failure we simply stay silent.
      fetch(src)
        .then((res) => res.arrayBuffer())
        .then((data) => context.decodeAudioData(data))
        .then((buffer) => {
          bufferCacheRef.current.set(target, buffer);
          playBuffer(target, buffer);
        })
        .catch(() => {
          /* fetch/decode failed - stay silent, best-effort */
        });
    };

    // Build and start a fresh looping source for `target` from a decoded buffer.
    // Race guard: bail if the user switched/turned off while a decode was in
    // flight, so a stale source is never started. Also resumes the context and
    // arms a gesture retry when the context is suspended.
    const playBuffer = (target: AmbientChoice, buffer: AudioBuffer) => {
      // Stale-decode guard: only start if this is still the current choice.
      if (choiceRef.current !== target) return;
      const context = ctxRef.current;
      const gain = gainRef.current;
      if (!context || !gain) return;

      // Replace any running source (a switch or a re-start): sources are one-shot.
      stopSource();

      let source: AudioBufferSourceNode;
      try {
        source = context.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.connect(gain);
        source.start();
      } catch {
        return; // best-effort - stay silent on any graph error
      }
      sourceRef.current = source;

      // Resume the context now; if still suspended (no gesture yet), arm a
      // one-time gesture retry that resumes it. The already-started, looping
      // source will produce sound as soon as the context resumes.
      tryResume();
    };

    // Resume the context; if it is still suspended (autoplay not yet unlocked),
    // install a one-time pointerdown/keydown listener that resumes it.
    const tryResume = () => {
      const context = ctxRef.current;
      if (!context) return;
      try {
        if (context.state === 'suspended') {
          void context.resume().catch(() => {
            /* ignore - the gesture retry below covers this */
          });
        }
      } catch {
        /* ignore - best-effort */
      }
      if (context.state === 'suspended') installGestureRetry();
    };

    const installGestureRetry = () => {
      if (removeGestureRetry) return; // already armed
      const onGesture = () => {
        const context = ctxRef.current;
        // Only resume if a nature sound is still chosen.
        if (context && choiceRef.current !== 'off') {
          try {
            void context.resume().catch(() => {
              /* still blocked - leave suspended, best-effort */
            });
          } catch {
            /* ignore - best-effort */
          }
        }
        clearGestureRetry();
      };
      document.addEventListener('pointerdown', onGesture, { once: true });
      document.addEventListener('keydown', onGesture, { once: true });
      removeGestureRetry = () => {
        document.removeEventListener('pointerdown', onGesture);
        document.removeEventListener('keydown', onGesture);
      };
    };

    const unsubscribe = subscribeAmbientChoice((next) => {
      const prev = choiceRef.current;
      choiceRef.current = next;
      setChoice(next);
      if (next === 'off') {
        // 'off': stop the source and leave the graph idle. The gesture retry is
        // no longer relevant with nothing to play.
        clearGestureRetry();
        stopSource();
        return;
      }
      // Re-notifying the SAME nature choice while it is already playing should
      // not restart a happily-looping source (that would introduce a seam).
      if (next === prev && sourceRef.current) {
        // Still make sure the context is running (e.g. re-sync after suspend).
        tryResume();
        return;
      }
      startChoice(next);
    });

    // Explicit play requests fired from real user gestures (Generate / Start
    // practice). This is the reliable path when a sound is already chosen on
    // load with no prior interaction: the initial autoplay is blocked, and the
    // user's first tap must start playback. Resuming/starting synchronously
    // inside that gesture-driven request satisfies the browser's autoplay policy.
    const unsubscribePlayRequest = subscribeAmbientPlayRequest(() => {
      const current = choiceRef.current;
      if (current === 'off') return;
      if (sourceRef.current) {
        tryResume();
      } else {
        startChoice(current);
      }
    });

    return () => {
      unsubscribe();
      unsubscribePlayRequest();
      clearGestureRetry();
    };
  }, []);

  // --- ducking ---------------------------------------------------------------
  // Subscribe to the audio bus and smoothly ramp the ambient gain between full
  // and ducked. Only the gain TARGET is affected - the source's running state
  // and the mute are never touched. While muted, the ramp still updates the
  // target (so unmuting reveals the right level) but does not drive audible gain.
  useEffect(() => {
    // Smoothly move currentTargetRef to `target` using an eased cubic curve over
    // a direction-aware duration (quicker to duck, slower to release), replacing
    // any ramp already in flight so overlapping duck/unduck events don't fight.
    // The gain node is written only while unmuted; while muted it stays at 0 and
    // applyEffectiveGain() (on unmute) picks up the final target.
    const rampTo = (target: number) => {
      if (rampRef.current !== null) {
        cancelAnimationFrame(rampRef.current);
        rampRef.current = null;
      }
      const from = currentTargetRef.current;
      const delta = target - from;
      if (Math.abs(delta) < 0.001) {
        currentTargetRef.current = target;
        applyEffectiveGain();
        return;
      }
      // Ducking down is quicker; swelling back up is gentler and slower.
      const duration = target < from ? DUCK_RAMP_MS : RELEASE_RAMP_MS;
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = easeInOutCubic(t);
        const value = Math.max(0, Math.min(1, from + delta * eased));
        currentTargetRef.current = value;
        // Only drive the audible gain while unmuted; a muted track stays at 0.
        if (!mutedRef.current && gainRef.current) {
          try {
            gainRef.current.gain.value = value;
          } catch {
            /* ignore - best-effort */
          }
        }
        if (t < 1) {
          rampRef.current = requestAnimationFrame(step);
        } else {
          rampRef.current = null;
        }
      };
      rampRef.current = requestAnimationFrame(step);
    };

    const unsubscribe = subscribeDuck((ducked) => {
      rampTo(ducked ? DUCK_VOLUME : FULL_VOLUME);
    });

    return () => {
      unsubscribe();
      if (rampRef.current !== null) {
        cancelAnimationFrame(rampRef.current);
        rampRef.current = null;
      }
      // Restore the full target so a later re-play isn't left dipped.
      currentTargetRef.current = FULL_VOLUME;
    };
  }, []);

  // --- teardown on unmount ---------------------------------------------------
  // Best-effort cleanup of the whole graph: stop the source, disconnect the gain
  // node, and cancel any in-flight ramp. Kept separate (empty-dep, runs once at
  // unmount) so it doesn't fight the choice/duck effects during the app's life.
  useEffect(() => {
    return () => {
      if (rampRef.current !== null) {
        cancelAnimationFrame(rampRef.current);
        rampRef.current = null;
      }
      stopSource();
      const gain = gainRef.current;
      if (gain) {
        try {
          gain.disconnect();
        } catch {
          /* ignore - best-effort */
        }
      }
    };
  }, []);

  return (
    <div className="music-toggle">
      {/*
        The corner button is a MUTE toggle for the currently-playing nature
        loop. It is only meaningful while a nature sound is chosen (there is
        nothing to mute otherwise), so it is hidden entirely when the choice is
        'off'.
      */}
      {choice !== 'off' && (
        <button
          type="button"
          className="button--icon music-toggle__btn"
          onClick={toggleMute}
          aria-label={muted ? 'Unmute ambient sound' : 'Mute ambient sound'}
          aria-pressed={muted}
        >
          {muted ? (
            // Muted speaker: speaker glyph with an "x" where the waves would be.
            <svg
              className="music-toggle__icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M4 9v6h4l5 4V5L8 9H4Z"
                fill="currentColor"
              />
              <path
                d="M16 9.5l4 5M20 9.5l-4 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            // Speaker with sound waves: audible / unmuted state.
            <svg
              className="music-toggle__icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M4 9v6h4l5 4V5L8 9H4Z"
                fill="currentColor"
              />
              <path
                d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}

export default MusicPanel;
