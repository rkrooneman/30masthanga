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
 */

import { useEffect, useRef, useState } from 'react';
import { TRACKS } from '../lib/music';

function MusicPanel() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement>(null);

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
