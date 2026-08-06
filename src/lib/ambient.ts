/**
 * ambient - pure model for the nature-ambience picker.
 *
 * The ambient background sound is chosen from a small, fixed set of harmonized
 * nature loops (forest / rain / ocean) plus an explicit 'off'. This replaces the
 * old boolean ambient-enabled preference: instead of on/off, the user now picks
 * WHICH sound (or none) via a 4-stop slider.
 *
 * The four choices are exposed as a slider in AMBIENT_ORDER order (index 0 =
 * 'off', 3 = 'ocean'), mirroring the PoseCue slider model in guidance.ts.
 *
 * Everything here is pure and dependency-free so it can be unit tested without a
 * DOM or localStorage. Persistence lives in preferences.ts; the runtime pub/sub
 * lives in ambientPref.ts.
 */

/**
 * Which ambient nature sound plays. 'off' means silence; the other three are
 * the bundled loops served from public/ambient/<name>.mp3.
 */
export type AmbientChoice = 'off' | 'forest' | 'rain' | 'ocean';

/**
 * The choices in slider order, lowest to highest. Index 0 = 'off', 1 = 'forest',
 * 2 = 'rain', 3 = 'ocean'. The Home slider uses this ordering.
 */
export const AMBIENT_ORDER: AmbientChoice[] = ['off', 'forest', 'rain', 'ocean'];

/** Human-readable labels for each choice, e.g. for the slider caption. */
export const AMBIENT_LABELS: Record<AmbientChoice, string> = {
  off: 'Off',
  forest: 'Forest',
  rain: 'Rain',
  ocean: 'Ocean',
};

/** Map an ambient choice to its slider index (0..3). */
export function ambientToIndex(c: AmbientChoice): 0 | 1 | 2 | 3 {
  return AMBIENT_ORDER.indexOf(c) as 0 | 1 | 2 | 3;
}

/**
 * Map a slider index to an ambient choice, clamped into 0..3. Non-integers are
 * rounded (Math.round). NaN falls back to index 0 ('off').
 */
export function indexToAmbient(i: number): AmbientChoice {
  if (Number.isNaN(i)) return AMBIENT_ORDER[0];
  const rounded = Math.round(i);
  const clamped = Math.max(0, Math.min(AMBIENT_ORDER.length - 1, rounded));
  return AMBIENT_ORDER[clamped];
}

/**
 * Coerce arbitrary input into a valid AmbientChoice. Accepts EITHER the string
 * pref value ('off' | 'forest' | 'rain' | 'ocean') OR a numeric slider index
 * (0 -> 'off', 1 -> 'forest', 2 -> 'rain', 3 -> 'ocean', out-of-range clamped). A
 * numeric string (e.g. the raw value read from a range input) is treated as its
 * index. Anything else invalid falls back to the safe default of 'off'.
 */
export function clampAmbientChoice(x: unknown): AmbientChoice {
  if (typeof x === 'string') {
    if (x === 'off' || x === 'forest' || x === 'rain' || x === 'ocean') return x;
    // A numeric string (e.g. a raw slider value) maps by index.
    const asNumber = Number(x);
    if (x.trim() !== '' && !Number.isNaN(asNumber)) {
      return indexToAmbient(asNumber);
    }
    return 'off';
  }
  if (typeof x === 'number' && !Number.isNaN(x)) {
    return indexToAmbient(x);
  }
  return 'off';
}

/**
 * The public URL for a choice's audio loop, or null for 'off' (no source). The
 * loops ship in public/ambient/ and are served from the site root, so the URL
 * is /ambient/<choice>.mp3. The filenames are lowercase with no spaces, so no
 * percent-encoding is needed and the literal path is returned as-is.
 */
export function ambientSrc(c: AmbientChoice): string | null {
  if (c === 'off') return null;
  return `/ambient/${c}.mp3`;
}

/**
 * Migrate the legacy boolean ambient-enabled preference to an AmbientChoice.
 *
 * The old preference was a plain on/off with no sound selection, so there is no
 * stored "which sound" to recover. An ambient-ON user is migrated to 'forest'
 * (the gentle default nature bed, first in AMBIENT_ORDER after 'off'); an
 * ambient-OFF (or absent) user maps to 'off'. This keeps returning users who
 * had ambient on hearing a nature sound rather than being silently reset.
 */
export function ambientFromLegacyEnabled(enabled: boolean): AmbientChoice {
  return enabled ? 'forest' : 'off';
}
