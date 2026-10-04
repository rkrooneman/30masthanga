/**
 * UnlockSheet - the single, calm sheet that offers the one-time "steer" unlock.
 *
 * Shown ONCE, only when a free user taps a locked steer control (Basics only /
 * Full series / a per-pose checkbox). The guiding principle is that the paywall
 * gates CONTROL, not the practice: every free user already gets a complete,
 * faithful 30-minute practice, so this sheet frames the unlock as "steer it
 * yourself", never as unlocking the practice.
 *
 * It reuses the app's existing modal language - the shared .about-backdrop dim
 * overlay (backdrop click + Escape to close) and a calm surface card - and the
 * shared .button / .button--primary / .button--outline classes, so no new design
 * system is introduced. Two actions: "Unlock" (purchaseUnlock) and "Restore
 * purchase" (restoreEntitlement). On success the sheet closes and the parent
 * flips to the unlocked UI; on cancel/failure it closes quietly (a single gentle
 * inline note at most, never repeated nagging).
 *
 * All billing lives in billing.ts and is fully guarded there, so in a plain
 * browser (no Digital Goods API) the actions simply resolve false and this sheet
 * closes without error. (In practice a free user in a plain browser never sees a
 * locked control open this sheet when billing is unavailable - the parent can
 * choose not to offer it - but the sheet is safe either way.)
 *
 * === graceful "needs Chrome" variant ===
 * Play Billing in a TWA runs through the Digital Goods API, which is ONLY
 * injected by a Chrome-backed TWA provider. A user whose TWA is backed by a
 * non-supporting browser (e.g. Brave / Firefox) cannot purchase at all, and the
 * Unlock button would silently fail. So the parent resolves `isBillingAvailable()`
 * once and passes it down as `billingAvailable`:
 *   - true / null (undetermined): render the normal purchase sheet unchanged.
 *   - false: render a calm, honest variant that keeps the "Steer your practice"
 *     framing and the three benefits, but REPLACES the price + Unlock / Restore
 *     actions with a short explanation that the upgrade is purchased through
 *     Google Play (which needs Chrome on this device) plus a brief how-to, and a
 *     single "Got it" close. No Unlock button (it cannot work), no Restore
 *     (restore needs the same service). This doubles as a gentle, non-naggy nudge
 *     toward Chrome; it only ever appears when the user actively taps a locked
 *     control, never at launch.
 */

import { useEffect, useState } from 'react';
import { purchaseUnlock, restoreEntitlement } from '../lib/billing';

interface UnlockSheetProps {
  /** Whether the sheet is open. */
  open: boolean;
  /** Close the sheet (backdrop click, Escape, or after an action resolves). */
  onClose: () => void;
  /** Called when a purchase or restore succeeds, so the parent can unlock the UI. */
  onUnlocked: () => void;
  /**
   * Whether Play Billing can actually run on this device, resolved once on mount
   * in the shell. When false the purchase cannot complete (the TWA is backed by a
   * browser that does not inject the Digital Goods API, e.g. Brave / Firefox, or
   * it is a plain browser), so the sheet shows the calm "needs Chrome" variant
   * with no Unlock button. `null` (undetermined) and true both render the normal
   * purchase sheet.
   */
  billingAvailable: boolean | null;
}

function UnlockSheet({
  open,
  onClose,
  onUnlocked,
  billingAvailable,
}: UnlockSheetProps) {
  // Which action is in flight (if any), to disable the buttons while Play's UI
  // is up. 'idle' when nothing is running.
  const [busy, setBusy] = useState<'idle' | 'purchase' | 'restore'>('idle');
  // A single, gentle inline note shown after a cancelled/failed action - never a
  // modal error, never repeated. Cleared whenever the sheet (re)opens.
  const [note, setNote] = useState<string | null>(null);

  // Close on Escape while open (mirrors the About dialog). Clear any stale note
  // each time the sheet opens so it never carries over between openings.
  useEffect(() => {
    if (!open) return;
    setNote(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  // Shared result handling for both actions: on success close + unlock; on
  // failure/cancel leave the sheet open with one calm note.
  const run = async (
    action: 'purchase' | 'restore',
    fn: () => Promise<boolean>,
    failNote: string,
  ) => {
    if (busy !== 'idle') return;
    setBusy(action);
    setNote(null);
    let ok = false;
    try {
      ok = await fn();
    } catch {
      ok = false;
    }
    setBusy('idle');
    if (ok) {
      onUnlocked();
      onClose();
    } else {
      setNote(failNote);
    }
  };

  const handleUnlock = () =>
    run('purchase', purchaseUnlock, 'Not completed. You can try again anytime.');

  const handleRestore = () =>
    run(
      'restore',
      restoreEntitlement,
      'No previous purchase found on this account.',
    );

  // Billing cannot run here (a TWA backed by a non-supporting browser, or a plain
  // browser): the purchase can never complete, so swap in the calm "needs Chrome"
  // explanation instead of a dead Unlock button. `null` (undetermined) and true
  // both keep the normal purchase sheet. Resolves within a tick of mount, so this
  // only ever reflects a settled value by the time a user taps a locked control.
  const billingUnavailable = billingAvailable === false;

  return (
    <div className="about-backdrop" onClick={onClose}>
      <div
        className="unlock-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="unlock-sheet-heading"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="button--icon button--icon-ghost unlock-sheet__close"
          aria-label="Close"
          onClick={onClose}
        >
          &times;
        </button>

        <div className="unlock-sheet__body">
          <h2 id="unlock-sheet-heading" className="unlock-sheet__heading">
            Steer your practice
          </h2>

          <p className="unlock-sheet__text">
            You&rsquo;re getting a complete, faithful 30-minute practice every
            time, the app chooses the poses for you.
          </p>

          <p className="unlock-sheet__text unlock-sheet__lead">
            Unlock to steer it yourself:
          </p>
          <ul className="unlock-sheet__list">
            <li>
              Choose <strong>Basics only</strong> for the essential root poses
            </li>
            <li>
              Take the <strong>Full series</strong>
            </li>
            <li>
              <strong>Pick and customise</strong> any pose in the sequence
            </li>
          </ul>

          {billingUnavailable ? (
            <>
              {/*
                Billing cannot run in this TWA (its browser does not inject the
                Digital Goods API), so there is no working Unlock. Explain the
                how-to calmly instead - a gentle nudge toward Chrome, never a nag
                or an error. No Unlock / Restore buttons (both need the service);
                a single "Got it" closes the sheet.
              */}
              <p className="unlock-sheet__text unlock-sheet__lead">
                The one-time upgrade is purchased through Google Play, which needs
                Chrome to complete the purchase on this device.
              </p>
              <p className="unlock-sheet__text">To upgrade:</p>
              <ul className="unlock-sheet__list">
                <li>
                  Set Chrome as your default browser (Settings &gt; Apps &gt;
                  Default apps &gt; Browser app), or install Chrome
                </li>
                <li>Then reopen ashtanga30</li>
              </ul>
              <p className="unlock-sheet__footnote">
                Your free practice stays complete either way.
              </p>

              <div className="unlock-sheet__actions">
                <button
                  type="button"
                  className="button button--primary"
                  onClick={onClose}
                >
                  Got it
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="unlock-sheet__price">
                EUR 5.99, one-time. Yours to keep.
              </p>

              <div className="unlock-sheet__actions">
                <button
                  type="button"
                  className="button button--primary"
                  onClick={handleUnlock}
                  disabled={busy !== 'idle'}
                >
                  Unlock
                </button>
                <button
                  type="button"
                  className="button button--outline"
                  onClick={handleRestore}
                  disabled={busy !== 'idle'}
                >
                  Restore purchase
                </button>
              </div>

              {note && <p className="unlock-sheet__note">{note}</p>}

              <p className="unlock-sheet__footnote">
                Your unlock restores on the same Google account.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default UnlockSheet;
