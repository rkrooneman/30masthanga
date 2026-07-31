/**
 * music — playlist configuration for the collapsible Spotify panel.
 *
 * The single source of truth for which playlist the app offers. Kept as plain
 * config constants (no React, no logic) so the playlist is trivial to change
 * later, and so a second playlist can be added without touching the component:
 * add another entry to PLAYLISTS and point the panel at it.
 *
 * The embed URL feeds Spotify's iframe player (in-app, 30s previews unless the
 * listener is signed into Premium); the open URL is the "Open in Spotify" deep
 * link that hands off to the native app / web player for full playback.
 */

/** Shape of a single playlist entry. */
export interface Playlist {
  /** Human-readable name (used for accessible titles). */
  readonly name: string;
  /** Spotify playlist ID (the trailing segment of a playlist URL). */
  readonly id: string;
  /** Spotify iframe embed URL — used as the <iframe src>. */
  readonly embedUrl: string;
  /** Public playlist URL — the "Open in Spotify" fallback link. */
  readonly openUrl: string;
}

/** Build a Playlist entry from a name + Spotify playlist ID. */
function playlist(name: string, id: string): Playlist {
  return {
    name,
    id,
    embedUrl: `https://open.spotify.com/embed/playlist/${id}`,
    openUrl: `https://open.spotify.com/playlist/${id}`,
  };
}

/** The single yoga playlist currently offered in the app. */
export const YOGA_PLAYLIST_ID = '37i9dQZF1DXdVyc8LtLi96';
export const YOGA_PLAYLIST_EMBED_URL = `https://open.spotify.com/embed/playlist/${YOGA_PLAYLIST_ID}`;
export const YOGA_PLAYLIST_OPEN_URL = `https://open.spotify.com/playlist/${YOGA_PLAYLIST_ID}`;

/**
 * All playlists the panel can offer. A single entry for now; add more here to
 * extend later (the panel reads the first entry as its active playlist).
 */
export const PLAYLISTS: readonly Playlist[] = [
  playlist('Yoga', YOGA_PLAYLIST_ID),
];

/** The playlist the panel plays. Change this (or PLAYLISTS[0]) to swap it. */
export const ACTIVE_PLAYLIST: Playlist = PLAYLISTS[0];
