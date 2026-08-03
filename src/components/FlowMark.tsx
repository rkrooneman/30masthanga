/**
 * FlowMark — a small abstract "flow / vinyasa" glyph.
 *
 * Shown in place of a pose icon during a half-vinyasa between seated poses (see
 * the "Vinyasas" toggle), while the label names the current movement
 * (Chaturanga, Urdhva Mukha Svanasana, etc.). Rather than a figure, it is three
 * gently-curved motion lines suggesting continuous breath-linked movement, in
 * the app's calm minimalist style. Stroke uses currentColor so it inherits the
 * sage tint like the pose icons.
 *
 * Pure inline SVG, no dependencies.
 */

interface FlowMarkProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function FlowMark({ size = 120, className }: FlowMarkProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Vinyasa flow"
    >
      {/* Three stacked flowing lines, each a gentle S-curve, suggesting calm
          breath-linked movement. Offset vertically and slightly staggered. */}
      <path d="M22 38 C38 28, 52 48, 78 38" opacity="0.55" />
      <path d="M22 52 C38 42, 52 62, 78 52" />
      <path d="M22 66 C38 56, 52 76, 78 66" opacity="0.55" />
    </svg>
  );
}

export default FlowMark;
