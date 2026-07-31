/**
 * PosePlaceholder — a calm geometric stand-in for the asana silhouette.
 *
 * Real pose silhouettes arrive in Slice 6; until then this component draws a
 * soft framed panel with the ring motif and the pose's initial so a card never
 * looks broken or empty. It is intentionally isolated so Slice 6 can swap the
 * inner artwork (or the whole component) without touching OverviewScreen.
 */

import RingMark from './RingMark';

interface PosePlaceholderProps {
  /** English name of the pose; its first letter is shown inside the frame. */
  name: string;
  /** Outer size of the square frame, in pixels. Default 128. */
  size?: number;
}

function PosePlaceholder({ name, size = 128 }: PosePlaceholderProps) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  return (
    <div
      className="pose-placeholder"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Illustration placeholder for ${name}`}
    >
      <RingMark size={size - 32} className="pose-placeholder__ring" />
      <span className="pose-placeholder__initial" aria-hidden="true">
        {initial}
      </span>
    </div>
  );
}

export default PosePlaceholder;
