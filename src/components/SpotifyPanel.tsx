/**
 * SpotifyPanel — a calm, collapsible music player for ashtanga30.
 *
 * Rendered ONCE at the app-shell level (see App.tsx) so it is present on every
 * screen (Home, Overview, Guided) and — crucially — never unmounts on screen
 * navigation. The Spotify iframe is mounted a single time here and stays in the
 * DOM for the life of the app; collapsing only HIDES it via CSS, so playback
 * continues while collapsed and across screen changes.
 *
 * Layout: a small pill button at the top of the shell (collapsed by default).
 * Tapping expands a slim panel below it containing the compact (80px) embedded
 * player — active track + controls only, no track list — plus an "Open in
 * Spotify" fallback link, then collapses again on the next tap.
 *
 * Playback note: the in-app embed only plays 30-second previews for listeners
 * who are not signed into Spotify Premium. The "Open in Spotify" link hands off
 * to the native app / web player for full playback — this expectation is set
 * gently in the caption below the embed.
 *
 * Accessibility: the pill exposes aria-expanded / aria-controls and a clear
 * label; the collapsed region is marked aria-hidden and made inert to focus so
 * hidden controls aren't reachable while collapsed.
 *
 * Reduced motion: the expand/collapse max-height transition is dropped under
 * `prefers-reduced-motion: reduce` (handled in index.css).
 */

import { useState } from 'react';
import { ACTIVE_PLAYLIST } from '../lib/music';
import { loadMusicExpanded, saveMusicExpanded } from '../lib/preferences';

const PANEL_BODY_ID = 'spotify-panel-body';

function SpotifyPanel() {
  // Default collapsed; re-open only if the listener explicitly left it open.
  const [expanded, setExpanded] = useState<boolean>(loadMusicExpanded);

  const toggle = () => {
    setExpanded((prev) => {
      const next = !prev;
      saveMusicExpanded(next);
      return next;
    });
  };

  return (
    <section
      className={`spotify-panel${expanded ? ' spotify-panel--expanded' : ''}`}
      aria-label="Music player"
    >
      <button
        type="button"
        className="spotify-panel__pill"
        onClick={toggle}
        aria-expanded={expanded}
        aria-controls={PANEL_BODY_ID}
        aria-label={expanded ? 'Hide music player' : 'Show music player'}
      >
        <span className="spotify-panel__note" aria-hidden="true">
          ♫
        </span>
        <span className="spotify-panel__label">Music</span>
      </button>

      {/*
        The body is ALWAYS rendered so the iframe mounts once and never
        unmounts. Collapsing hides it via CSS (max-height + visibility), which
        keeps the iframe alive so audio continues while collapsed and across
        screen navigation. `inert` + aria-hidden keep hidden controls out of the
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
            Compact 80px layout: Spotify serves a slim single-row player at this
            height — cover art, the active track/artist, and the play/pause +
            progress controls only, with NO track list. (We can't restyle inside
            the cross-origin iframe, but the height selects this minimal layout.)
          */}
          <iframe
            className="spotify-panel__embed"
            title={`Spotify ${ACTIVE_PLAYLIST.name} playlist`}
            src={ACTIVE_PLAYLIST.embedUrl}
            width="100%"
            height="80"
            style={{ border: 0, borderRadius: 12 }}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
          <a
            className="spotify-panel__open"
            href={ACTIVE_PLAYLIST.openUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in Spotify for full playback
          </a>
        </div>
      </div>
    </section>
  );
}

export default SpotifyPanel;
