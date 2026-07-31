/**
 * music — local track list for the collapsible music panel.
 *
 * The single source of truth for the bundled, self-hosted audio the app offers.
 * Kept as plain config constants (no React, no logic) so the playlist is trivial
 * to change later: add another entry to TRACKS.
 *
 * The tracks are shipped in `public/music/` and served statically from the site
 * root, so their URLs are `/music/<filename>`. The filenames contain spaces (and
 * the "Ondrosik - " prefix), so each src is built with encodeURIComponent on the
 * filename segment — the browser needs those characters percent-encoded for the
 * <audio src> to resolve. The leading `/music/` path stays literal.
 *
 * Licensing: all tracks are CC0 1.0 Universal (public domain) — the Ondrosik
 * pieces from the "Burnout" album on the Free Music Archive, and the HoliznaCC0
 * track from the artist's public-domain catalogue. No attribution is required.
 * See CREDITS.md at the repo root for provenance.
 */

/** Shape of a single bundled track. */
export interface Track {
  /** Human-readable display name, e.g. "City lights at night". */
  readonly title: string;
  /** Artist name (all "Ondrosik" here). */
  readonly artist: string;
  /** Public URL for the <audio src>, with the filename percent-encoded. */
  readonly src: string;
}

/** Base path (literal) under which the bundled mp3s are served. */
const MUSIC_BASE = '/music/';

/** Build a Track, safely encoding the filename (spaces / special chars). */
function track(title: string, artist: string, filename: string): Track {
  return {
    title,
    artist,
    src: MUSIC_BASE + encodeURIComponent(filename),
  };
}

/**
 * The bundled tracks, in playback order. "Too Brief A Time To Be Anything" — a
 * long (~30 min) ambient bed — leads as the calm default so a whole practice can
 * run without a track change; the two shorter Ondrosik pieces follow.
 *
 * All tracks are CC0 (public domain); see CREDITS.md for provenance.
 */
export const TRACKS: readonly Track[] = [
  track(
    'Too Brief A Time To Be Anything',
    'HoliznaCC0',
    'HoliznaCC0 - Too Brief A Time To Be Anything.mp3',
  ),
  track('Morning meditation', 'Ondrosik', 'Ondrosik - Morning meditation.mp3'),
  track(
    'City lights at night',
    'Ondrosik',
    'Ondrosik - City lights at night.mp3',
  ),
];
