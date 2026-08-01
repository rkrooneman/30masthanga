/**
 * MusicPanel — a single sticky play/pause button for ashtanga30's background
 * music.
 *
 * Rendered ONCE at the app-shell level (see App.tsx) so it is present on every
 * screen (Home, Overview, Guided) and never unmounts on navigation — the single
 * <audio> element stays in the DOM for the life of the app, so playback (and the
 * play/pause state) persists across screen changes.
 *
 * There is one long, looping CC0 (public-domain) ambient track (see
 * src/lib/music.ts + CREDITS.md) served from `public/music/`. With a single
 * loop-and-forget track there is nothing to reveal — no playlist, no scrubbing —
 * so the whole UI is one icon-only button: tap to play, tap to pause.
 *
 * Autoplay policy: browsers only permit audio to start from a user gesture. Play
 * always originates from the button tap (a gesture), but audio.play() still
 * returns a promise that can reject, so the call is wrapped in a .catch.
 *
 * Accessibility: the button carries an explicit, state-aware aria-label
 * (Play music / Pause music); the icon is aria-hidden.
 *
 * Ducking: the panel subscribes to the audioBus (see src/lib/audioBus.ts). When
 * a spoken pose name or the completion bell requests a duck, the music volume
 * ramps down to DUCK_VOLUME; when released, it ramps back to FULL_VOLUME. Only
 * the <audio> element's volume is touched — never its play/pause state — so
 * ducking is entirely independent of whether the user is playing music.
 */

import { useEffect, useRef, useState } from 'react';
import { TRACKS } from '../lib/music';
import { subscribeDuck } from '../lib/audioBus';

/** Volume while ducked (music dipped so a cue can be heard over it). */
const DUCK_VOLUME = 0.15;
/** Normal (un-ducked) volume. */
const FULL_VOLUME = 1;
/**
 * Ramp durations are asymmetric and eased for an organic feel: the music dips
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
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  // Holds the id of an in-flight volume ramp (requestAnimationFrame) so it can
  // be cancelled if a new duck/unduck arrives mid-ramp or on cleanup.
  const rampRef = useRef<number | null>(null);

  // A single long ambient track that loops — no playlist / track-change logic.
  const currentTrack = TRACKS[0];

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {
        /* autoplay blocked / interrupted — reflect reality, stay paused */
      });
    } else {
      audio.pause();
    }
  };

  // Keep isPlaying in sync with the ACTUAL audio state (so the icon always
  // reflects reality). The track loops natively via the audio `loop` attribute.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  // --- ducking ---------------------------------------------------------------
  // Subscribe to the audio bus and smoothly ramp the music volume between full
  // and ducked. Only volume is affected — play/pause state is never touched.
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

      <button
        type="button"
        className="music-toggle__btn"
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pause music' : 'Play music'}
        aria-pressed={isPlaying}
      >
        {isPlaying ? (
          <svg
            className="music-toggle__icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M8 5h3v14H8zM13 5h3v14h-3z" fill="currentColor" />
          </svg>
        ) : (
          <svg
            className="music-toggle__icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M8 5.5v13a1 1 0 0 0 1.54.84l10-6.5a1 1 0 0 0 0-1.68l-10-6.5A1 1 0 0 0 8 5.5Z"
              fill="currentColor"
            />
          </svg>
        )}
      </button>
    </div>
  );
}

export default MusicPanel;
