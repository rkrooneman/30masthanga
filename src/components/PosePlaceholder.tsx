/**
 * PosePlaceholder — a calm, intentional stand-in for the asana artwork.
 *
 * Real pose silhouettes are still to come; until then this component draws a
 * deliberate "artwork coming" placeholder rather than a broken or empty box: a
 * soft surface panel with a subtle border, a faint neutral ring motif, the
 * pose's initial in a muted tone, and a small category caption. It intentionally
 * does NOT use the LotusMark — the lotus is the app's identity mark and is kept
 * special — so this uses the neutral RingMark instead, in a quiet muted grey.
 *
 * The component is isolated so a future slice can swap the inner artwork (or the
 * whole component) without touching OverviewScreen.
 */

import RingMark from './RingMark';

interface PosePlaceholderProps {
  /** English name of the pose; its first letter is shown inside the frame. */
  name: string;
  /** Optional pose category, shown as a small muted caption. */
  category?: string;
  /** Outer size of the square frame, in pixels. Default 128. */
  size?: number;
}

function PosePlaceholder({ name, category, size = 128 }: PosePlaceholderProps) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  return (
    <div
      className="pose-placeholder"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Illustration placeholder for ${name}`}
    >
      <RingMark
        size={Math.round(size * 0.62)}
        strokeWidth={1.5}
        className="pose-placeholder__ring"
      />
      <span className="pose-placeholder__initial" aria-hidden="true">
        {initial}
      </span>
      {category && (
        <span className="pose-placeholder__caption" aria-hidden="true">
          {category}
        </span>
      )}
    </div>
  );
}

export default PosePlaceholder;
