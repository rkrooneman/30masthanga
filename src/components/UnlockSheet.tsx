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
}

function UnlockSheet({ open, onClose, onUnlocked }: UnlockSheetProps) {
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

          <p className="unlock-sheet__price">EUR 5.99, one-time. Yours to keep.</p>

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
        </div>
      </div>
    </div>
  );
}

export default UnlockSheet;
