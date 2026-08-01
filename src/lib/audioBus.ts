/**
 * audioBus — a tiny, framework-free pub/sub for "audio ducking".
 *
 * Ducking = temporarily lowering the background music's volume while a more
 * important, short cue plays (a spoken pose name, or the completion bell), then
 * ramping it back up. This module is the neutral middle-man: cue producers
 * (voice.ts, chime.ts) *request* a duck; the music player (MusicPanel) *listens*
 * and lowers/raises its own volume in response. Neither side imports the other.
 *
 * === ref-counting ===
 * Several cues can overlap (e.g. a pose announcement whose clip is still playing
 * when the next request arrives). A simple boolean would let the first cue to
 * finish un-duck the music while a second cue is still speaking. Instead we keep
 * a counter:
 *   - requestDuck() increments; the FIRST request (0 → 1) notifies "ducked".
 *   - releaseDuck() decrements (never below 0); the LAST release (1 → 0)
 *     notifies "unducked".
 * So the music only comes back up once every outstanding cue has finished.
 *
 * === safety ===
 * Everything is idempotent and defensive: releaseDuck() clamps at 0 so an extra
 * release can never drive the count negative and strand the music at low volume.
 * There is no React here and no global state beyond the module-level counter and
 * listener set, so it is trivially testable and safe to import anywhere.
 */

type DuckListener = (ducked: boolean) => void;

/** Number of outstanding duck requests. Music is ducked whenever this is > 0. */
let duckCount = 0;

/** Subscribers notified whenever the ducked/unducked state flips. */
const listeners = new Set<DuckListener>();

/** Current boolean state derived from the counter. */
function isDucked(): boolean {
  return duckCount > 0;
}

/** Notify every subscriber of the current ducked state. */
function notify(ducked: boolean): void {
  for (const listener of listeners) {
    try {
      listener(ducked);
    } catch {
      /* a misbehaving listener must not break the bus for the others */
    }
  }
}

/**
 * Request that the music duck. Increments the ref-count; when the count rises
 * from 0 to 1 (the first outstanding request), subscribers are told to duck.
 * Pair every call with exactly one releaseDuck().
 */
export function requestDuck(): void {
  duckCount += 1;
  if (duckCount === 1) notify(true);
}

/**
 * Release a previously-requested duck. Decrements the ref-count (clamped so it
 * can never go below 0); when the count returns to 0, subscribers are told to
 * un-duck. Extra/duplicate releases are harmless no-ops.
 */
export function releaseDuck(): void {
  if (duckCount === 0) return; // already fully released — ignore stray releases
  duckCount -= 1;
  if (duckCount === 0) notify(false);
}

/**
 * Subscribe to duck/unduck notifications. The listener is invoked immediately
 * with the CURRENT state on subscribe (so a late subscriber, e.g. a music
 * player that mounts mid-cue, syncs up right away). Returns an unsubscribe fn.
 */
export function subscribeDuck(listener: DuckListener): () => void {
  listeners.add(listener);
  // Sync the new listener to the current state at once.
  try {
    listener(isDucked());
  } catch {
    /* ignore — see notify() */
  }
  return () => {
    listeners.delete(listener);
  };
}
