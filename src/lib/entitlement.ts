/**
 * entitlement - tiny, safe on-device record of whether the one-time "steer"
 * unlock has been purchased.
 *
 * The app is a free download with ONE paid, one-time unlock: it lets a user
 * STEER the auto-generated practice (the Basics-only / Full-series toggles and
 * the per-pose selection checkboxes). The practice itself is always free. This
 * module is the single source of truth for the unlocked flag and nothing more:
 * it is deliberately decoupled from any Play / billing code (see billing.ts) so
 * it stays pure and unit-testable under jsdom/tsx with no Play APIs present.
 *
 * Mirrors preferences.ts exactly: a named storage-key constant, every
 * localStorage access wrapped in try/catch, and a graceful default (locked) on
 * any failure. localStorage can throw (private mode, disabled storage, quota),
 * and this app must degrade to the free tier rather than crash.
 */

const UNLOCKED_KEY = 'ashtanga30.unlocked';

/**
 * Whether the steer unlock has been purchased on this device / Google account.
 * Defaults to false (locked); only an explicit stored "1" unlocks. Safe on
 * storage failure (returns false). This is the single read the UI gates on.
 */
export function loadEntitlement(): boolean {
  try {
    return window.localStorage.getItem(UNLOCKED_KEY) === '1';
  } catch {
    return false;
  }
}

/** Persist the unlocked flag. Silently no-ops if storage is unavailable. */
export function saveEntitlement(unlocked: boolean): void {
  try {
    window.localStorage.setItem(UNLOCKED_KEY, unlocked ? '1' : '0');
  } catch {
    /* storage unavailable - ignore, entitlement simply won't persist */
  }
}

/**
 * The clear single-source-of-truth read of the current entitlement. An alias of
 * loadEntitlement so callers can express intent ("is the user unlocked?") at the
 * call site; both read the same stored flag with the same locked default.
 */
export function isUnlocked(): boolean {
  return loadEntitlement();
}
