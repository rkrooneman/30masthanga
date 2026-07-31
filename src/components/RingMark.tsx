/**
 * RingMark — the app's motif: a simple hollow ring.
 *
 * A stroked circle with no fill, in the sage accent colour. It is the logo mark
 * on the Home screen and is intended to be reused as the breathing circle in the
 * guided experience (Slice 5), so it lives as its own small component.
 */

interface RingMarkProps {
  /** Outer width/height of the SVG box, in pixels. Default 64. */
  size?: number;
  /** Ring stroke width, in pixels. Default 2. */
  strokeWidth?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function RingMark({ size = 64, strokeWidth = 2, className }: RingMarkProps) {
  // Inset the circle by half the stroke so the stroke never clips the viewBox.
  const center = size / 2;
  const radius = center - strokeWidth / 2;

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="ashtanga30 ring"
    >
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}

export default RingMark;
