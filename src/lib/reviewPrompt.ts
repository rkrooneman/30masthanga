/**
 * reviewPrompt - tiny, safe on-device module for the one-time Google Play
 * In-App Review prompt.
 *
 * After a user completes their 5th practice, the app calls the Play In-App
 * Review API (android-browser-helper injects `window.requestReview` inside a
 * TWA). Outside a TWA the function is undefined; the feature-detect handles
 * that silently. The prompt fires at most once, ever: the flag is written
 * BEFORE the API call so even a throw never allows a retry.
 *
 * Mirrors entitlement.ts exactly: a named storage-key constant, every
 * localStorage access wrapped in try/catch, and a graceful default (not
 * requested) on any failure.
 */

const REVIEW_REQUESTED_KEY = 'ashtanga30.reviewRequested';

/**
 * The shape of `window` inside a Trusted Web Activity where android-browser-
 * helper has injected the In-App Review bridge.
 */
interface ReviewWindow {
  requestReview?: () => Promise<void>;
}

/**
 * Whether the in-app review prompt has already been triggered on this device.
 * Only an explicit stored "1" returns true; defaults to false on any storage
 * failure or if nothing has been stored.
 */
export function hasReviewBeenRequested(): boolean {
  try {
    return window.localStorage.getItem(REVIEW_REQUESTED_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * Persist the "review prompt triggered" flag. Silently no-ops if storage is
 * unavailable, matching the preferences.ts and entitlement.ts convention.
 */
export function markReviewRequested(): void {
  try {
    window.localStorage.setItem(REVIEW_REQUESTED_KEY, '1');
  } catch {
    /* storage unavailable - ignore, flag simply won't persist */
  }
}

/**
 * Trigger the Google Play In-App Review prompt after the user's 5th completed
 * practice. Never shows again regardless of outcome. Never throws.
 *
 * Behaviour:
 *   1. If the prompt has already been triggered, returns immediately.
 *   2. If `completedPracticeCount` < 5, returns immediately.
 *   3. Marks the flag (before calling the API so a throw never allows a retry).
 *   4. Feature-detects `window.requestReview`; calls it if present, swallows
 *      any error. Silently no-ops in plain browser where the function is absent.
 *   5. Always resolves void, never throws.
 */
export async function requestReviewIfEligible(
  completedPracticeCount: number,
): Promise<void> {
  if (hasReviewBeenRequested()) return;
  if (completedPracticeCount < 5) return;

  // Write the flag BEFORE calling the API so a throw never allows a retry.
  markReviewRequested();

  try {
    const win = window as unknown as ReviewWindow;
    if (typeof win.requestReview === 'function') {
      await win.requestReview();
    }
  } catch {
    /* silently swallow - we have no control over what Google shows */
  }
}
