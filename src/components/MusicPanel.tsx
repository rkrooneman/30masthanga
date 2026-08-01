/**
 * MusicPanel — the background ambient sound for ashtanga30.
 *
 * Rendered ONCE at the app-shell level (see App.tsx) so it is present on every
 * screen (Home, Overview, Guided) and never unmounts on navigation — the single
 * <audio> element stays in the DOM for the life of the app, so playback (and
 * mute state) persists across screen changes.
 *
 * There is one long, looping CC0 (public-domain) ambient track (see
 * src/lib/music.ts + CREDITS.md) served from `public/music/`.
 *
 * === enable vs. mute (two distinct controls) ===
 * There are two separate concepts, driven by two separate controls:
 *   - ENABLE/DISABLE is the *persistent preference* the user sets with the
 *     "Ambient sound" switch on Home. When enabled, the track auto-plays; when
 *     disabled, it pauses. This flows in via the ambientPref pub/sub, which also
 *     persists it (preferences.ts). This panel only listens.
 *   - MUTE/UNMUTE is the *momentary* control on the floating corner button. It
 *     toggles audio.muted for the currently-playing track WITHOUT touching the
 *     Home preference — a quick "silence this now" that doesn't disable ambient.
 * Because there is nothing to mute when ambient is disabled, the corner button
 * is HIDDEN entirely while disabled (cleanest — no dead/no-op control) and only
 * appears, as a mute toggle, once ambient is enabled.
 *
 * === autoplay-safe start ===
 * Browsers block audio until a user gesture. When ambient is enabled we attempt
 * play() immediately (best-effort; it may reject), AND install a one-time global
 * gesture listener (pointerdown/keydown) that retries play() if it was blocked.
 * Once a successful (or attempted) play happens, the listener removes itself.
 * Turning the preference OFF pauses the audio.
 *
 * === ducking (unchanged) ===
 * The panel subscribes to the audioBus (see src/lib/audioBus.ts). When a spoken
 * pose name or the completion bell requests a duck, the ambient volume ramps
 * down to DUCK_VOLUME; when released, it ramps back to FULL_VOLUME. Only the
 * <audio> element's `volume` is touched — never its play/pause state. Muting is
 * independent: audio.muted overrides output regardless of volume, so mute and
 * the duck volume ramp coexist without conflict (a muted track stays silent
 * whatever the ramped volume is; unmuting reveals the current ramped volume).
 *
 * Accessibility: the corner button carries a state-aware aria-label
 * (Mute ambient sound / Unmute ambient sound) and aria-pressed reflects muted;
 * the icon is aria-hidden.
 */

import { useEffect, useRef, useState } from 'react';
import { TRACKS } from '../lib/music';
import { subscribeDuck } from '../lib/audioBus';
import {
  subscribeAmbient,
  subscribeAmbientPlayRequest,
} from '../lib/ambientPref';

/** Volume while ducked (ambient dipped so a cue can be heard over it). */
const DUCK_VOLUME = 0.15;
/** Normal (un-ducked) volume. */
const FULL_VOLUME = 1;
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
  // Persistent enable/disable preference (from Home via ambientPref). Drives
  // auto-play/pause and whether the corner mute button is shown at all.
  const [enabled, setEnabled] = useState<boolean>(false);
  // Momentary mute state of the currently-playing track (corner button).
  const [muted, setMuted] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  // Mirror of `enabled` for use inside the (stable, mount-once) gesture callback
  // so it reads the latest value without the enable effect having to re-subscribe.
  const enabledRef = useRef<boolean>(false);
  // Holds the id of an in-flight volume ramp (requestAnimationFrame) so it can
  // be cancelled if a new duck/unduck arrives mid-ramp or on cleanup.
  const rampRef = useRef<number | null>(null);

  // A single long ambient track that loops — no playlist / track-change logic.
  const currentTrack = TRACKS[0];

  // The corner button toggles MUTE/UNMUTE for the current track. It does NOT
  // change the Home enable preference and never touches play/pause.
  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const next = !audio.muted;
    audio.muted = next;
    setMuted(next);
  };

  // --- enable-driven playback (auto-play / pause) ----------------------------
  // Subscribe to the ambient preference. On the immediate sync + every change:
  //   enabled  -> best-effort play() now, plus a one-time gesture retry if the
  //              browser blocked autoplay.
  //   disabled -> pause.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // A one-time global gesture listener used to retry a blocked play(). Kept in
    // a ref-like closure var so we can install/remove exactly one at a time.
    let removeGestureRetry: (() => void) | null = null;

    const clearGestureRetry = () => {
      if (removeGestureRetry) {
        removeGestureRetry();
        removeGestureRetry = null;
      }
    };

    const tryPlay = () => {
      // Best-effort: play() may reject if no user gesture has happened yet.
      audio.play().catch(() => {
        /* autoplay blocked — the gesture listener below will retry */
      });
    };

    const installGestureRetry = () => {
      if (removeGestureRetry) return; // already armed
      const onGesture = () => {
        // Only retry if still enabled and not already playing.
        if (enabledRef.current && audio.paused) {
          audio.play().catch(() => {
            /* still blocked/interrupted — leave paused, best-effort */
          });
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

    const unsubscribe = subscribeAmbient((next) => {
      enabledRef.current = next;
      setEnabled(next);
      if (next) {
        tryPlay();
        // Arm a one-time gesture retry in case the immediate play() was blocked.
        installGestureRetry();
      } else {
        clearGestureRetry();
        audio.pause();
      }
    });

    // Explicit play requests fired from real user gestures (Generate / Start
    // practice). This is the reliable path when the preference is already enabled
    // on load with no prior interaction: the initial autoplay is blocked, and the
    // user's first tap must start playback. Calling play() synchronously inside
    // that gesture-driven request satisfies the browser's autoplay policy.
    const unsubscribePlayRequest = subscribeAmbientPlayRequest(() => {
      if (enabledRef.current && audio.paused) tryPlay();
    });

    return () => {
      unsubscribe();
      unsubscribePlayRequest();
      clearGestureRetry();
    };
  }, []);

  // Keep the muted UI in sync with the ACTUAL audio state (so the icon always
  // reflects reality even if muted changes by some other path). The track loops
  // natively via the audio `loop` attribute.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleVolumeChange = () => setMuted(audio.muted);

    audio.addEventListener('volumechange', handleVolumeChange);

    return () => {
      audio.removeEventListener('volumechange', handleVolumeChange);
    };
  }, []);

  // --- ducking (unchanged) ---------------------------------------------------
  // Subscribe to the audio bus and smoothly ramp the ambient volume between full
  // and ducked. Only volume is affected — play/pause and mute are never touched.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Smoothly move audio.volume to `target` using an eased cubic curve over a
    // direction-aware duration (quicker to duck, slower to release), replacing
    // any ramp already in flight so overlapping duck/unduck events don't fight.
    const rampTo = (target: number) => {
      if (rampRef.current !== null) {
        cancelAnimationFrame(rampRef.current);
        rampRef.current = null;
      }
      const from = audio.volume;
      const delta = target - from;
      if (Math.abs(delta) < 0.001) {
        audio.volume = target;
        return;
      }
      // Ducking down is quicker; swelling back up is gentler and slower.
      const duration = target < from ? DUCK_RAMP_MS : RELEASE_RAMP_MS;
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = easeInOutCubic(t);
        audio.volume = Math.max(0, Math.min(1, from + delta * eased));
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
      // Restore full volume so a later re-mount / re-play isn't left dipped.
      audio.volume = FULL_VOLUME;
    };
  }, []);

  return (
    <div className="music-toggle">
      {/*
        The single, persistent audio element. Never rendered conditionally so it
        survives navigation. Loops the one long ambient track; src is already
        percent-encoded in TRACKS.
      */}
      <audio ref={audioRef} src={currentTrack.src} loop preload="metadata" />

      {/*
        The corner button is a MUTE toggle for the currently-playing ambient
        sound. It is only meaningful while ambient is enabled (there is nothing
        to mute otherwise), so it is hidden entirely when disabled.
      */}
      {enabled && (
        <button
          type="button"
          className="music-toggle__btn"
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
