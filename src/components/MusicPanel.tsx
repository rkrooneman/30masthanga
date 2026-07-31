/**
 * MusicPanel — a calm, collapsible, self-hosted audio player for ashtanga30.
 *
 * Rendered ONCE at the app-shell level (see App.tsx) so it is present on every
 * screen (Home, Overview, Guided) and — crucially — never unmounts on screen
 * navigation. The single <audio> element is mounted a single time here and stays
 * in the DOM for the life of the app; collapsing only HIDES the controls via
 * CSS, so playback continues while collapsed and across screen changes.
 *
 * Playback is fully self-contained: three bundled CC0 (public-domain) tracks by
 * Ondrosik (see src/lib/music.ts + CREDITS.md) served from `public/music/`. The
 * minimalist controls are previous / play-pause / next, with the active track
 * title + artist and a thin, display-only progress bar.
 *
 * Layout: a small pill button at the top of the shell (collapsed by default).
 * Tapping expands a slim drawer below it holding the controls, then collapses
 * again on the next tap. The drawer shell + fold/slide/seamless-top animation is
 * shared with the CSS via the original `spotify-panel*` class names (kept as-is
 * so the carefully-tuned motion is preserved); the new inner controls use fresh
 * `music-*` classes.
 *
 * Autoplay policy: browsers only permit audio to start from a user gesture. Play
 * always originates from a control tap (a gesture), but audio.play() still
 * returns a promise that can reject, so every play() call is wrapped in a
 * .catch to swallow that rejection gracefully.
 *
 * Accessibility: the pill exposes aria-expanded / aria-controls and a clear
 * label; the collapsed region is marked aria-hidden and made inert to focus so
 * hidden controls aren't reachable while collapsed. Each transport button has an
 * explicit aria-label.
 *
 * Reduced motion: the expand/collapse transition is dropped under
 * `prefers-reduced-motion: reduce` (handled in index.css).
 */

import { useEffect, useRef, useState } from 'react';
import { TRACKS } from '../lib/music';
import { loadMusicExpanded, saveMusicExpanded } from '../lib/preferences';

const PANEL_BODY_ID = 'music-panel-body';

/** Advance an index within the playlist, wrapping around at either end. */
function wrapIndex(index: number, length: number): number {
  return ((index % length) + length) % length;
}

function MusicPanel() {
  // Default collapsed; re-open only if the listener explicitly left it open.
  const [expanded, setExpanded] = useState<boolean>(loadMusicExpanded);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0); // 0..1 of the track

  const audioRef = useRef<HTMLAudioElement>(null);
  // Tracks whether audio should keep playing across a track change (prev/next
  // or auto-advance on end), so the new track resumes if the old one was live.
  const wasPlayingRef = useRef<boolean>(false);

  const currentTrack = TRACKS[currentIndex];

  const toggleExpanded = () => {
    setExpanded((prev) => {
      const next = !prev;
      saveMusicExpanded(next);
      return next;
    });
  };

  /** Attempt playback, swallowing the autoplay-policy rejection promise. */
  const playAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.play().catch(() => {
      /* autoplay blocked / interrupted — reflect reality, stay paused */
    });
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      playAudio();
    } else {
      audio.pause();
    }
  };

  /** Move by a delta (±1), wrapping, and resume if we were mid-playback. */
  const changeTrack = (delta: number) => {
    const audio = audioRef.current;
    wasPlayingRef.current = audio ? !audio.paused : false;
    setCurrentIndex((prev) => wrapIndex(prev + delta, TRACKS.length));
  };

  const handlePrev = () => changeTrack(-1);
  const handleNext = () => changeTrack(1);

  // When the track changes, point the audio element at the new src. If we were
  // playing before the change (or an auto-advance on `ended`), keep playing.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = currentTrack.src;
    audio.load();
    setProgress(0);
    if (wasPlayingRef.current) {
      wasPlayingRef.current = false;
      playAudio();
    }
    // Only re-run when the source changes; playAudio is stable in practice and
    // its identity change would only re-issue a play() we already handle.
  }, [currentTrack.src]);

  // Keep isPlaying in sync with the ACTUAL audio state, advance on end, and
  // drive the display-only progress bar. Listeners are attached once.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      // Loop the playlist: keep playing into the next track.
      wasPlayingRef.current = true;
      setCurrentIndex((prev) => wrapIndex(prev + 1, TRACKS.length));
    };
    const handleTimeUpdate = () => {
      const { currentTime, duration } = audio;
      setProgress(duration > 0 ? currentTime / duration : 0);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, []);

  return (
    <section
      className={`spotify-panel${expanded ? ' spotify-panel--expanded' : ''}`}
      aria-label="Music player"
    >
      {/*
        One sliding unit holds BOTH the player and the pill footer, so they read
        as a single connected surface (the shared background/border/shadow lives
        on the drawer in CSS). The body/player has flex order -1 so it sits ABOVE
        the pill; the pill is the always-visible handle at the bottom.
      */}
      <div className="spotify-panel__drawer">
        {/*
          The body is ALWAYS rendered so the <audio> element mounts once and
          never unmounts. Collapsing hides it via CSS (height), which keeps audio
          alive so playback continues while collapsed and across screen
          navigation. `inert` + aria-hidden keep hidden controls out of the
          focus/AT order when collapsed.
        */}
        <div
          id={PANEL_BODY_ID}
          className="spotify-panel__body"
          aria-hidden={!expanded}
          inert={!expanded ? true : undefined}
        >
          <div className="spotify-panel__inner">
            {/*
              The single, persistent audio element. Never rendered conditionally
              so it survives collapse and navigation. `src` is set imperatively
              in the track-change effect (already percent-encoded in TRACKS).
            */}
            <audio ref={audioRef} preload="metadata" />

            <div className="music-player">
              <div className="music-player__transport">
                <button
                  type="button"
                  className="music-btn"
                  onClick={handlePrev}
                  aria-label="Previous track"
                >
                  <svg
                    className="music-btn__icon"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path
                      d="M6 5v14M20 6.5v11a1 1 0 0 1-1.54.84l-8.2-5.5a1 1 0 0 1 0-1.68l8.2-5.5A1 1 0 0 1 20 6.5Z"
                      fill="currentColor"
                    />
                  </svg>
                </button>

                <button
                  type="button"
                  className="music-btn music-btn--primary"
                  onClick={togglePlay}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <svg
                      className="music-btn__icon"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path
                        d="M8 5h3v14H8zM13 5h3v14h-3z"
                        fill="currentColor"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="music-btn__icon"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path d="M8 5.5v13a1 1 0 0 0 1.54.84l10-6.5a1 1 0 0 0 0-1.68l-10-6.5A1 1 0 0 0 8 5.5Z" fill="currentColor" />
                    </svg>
                  )}
                </button>

                <button
                  type="button"
                  className="music-btn"
                  onClick={handleNext}
                  aria-label="Next track"
                >
                  <svg
                    className="music-btn__icon"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path
                      d="M18 5v14M4 6.5v11a1 1 0 0 0 1.54.84l8.2-5.5a1 1 0 0 0 0-1.68l-8.2-5.5A1 1 0 0 0 4 6.5Z"
                      fill="currentColor"
                    />
                  </svg>
                </button>

                <div className="music-player__meta">
                  <span className="music-player__title">
                    {currentTrack.title}
                  </span>
                  <span className="music-player__artist">
                    {currentTrack.artist}
                  </span>
                </div>
              </div>

              {/* Thin, display-only progress bar. */}
              <div
                className="music-progress"
                role="progressbar"
                aria-label="Track progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress * 100)}
              >
                <div
                  className="music-progress__fill"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* The pill: the always-visible handle at the bottom of the drawer. */}
        <button
          type="button"
          className="spotify-panel__pill"
          onClick={toggleExpanded}
          aria-expanded={expanded}
          aria-controls={PANEL_BODY_ID}
          aria-label={expanded ? 'Hide music player' : 'Show music player'}
        >
          <span className="spotify-panel__note" aria-hidden="true">
            {isPlaying ? '▶' : '♫'}
          </span>
          <span className="spotify-panel__label">Music</span>
        </button>
      </div>
    </section>
  );
}

export default MusicPanel;
