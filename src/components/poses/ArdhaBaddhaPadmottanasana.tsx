/**
 * ArdhaBaddhaPadmottanasana — Half Bound Lotus Forward Fold, original
 * stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: a one-legged standing forward fold. The standing (left) leg is
 * straight to the floor; the other (right) foot is drawn up into half-lotus,
 * folded across the standing thigh. The torso folds forward and down, one hand
 * pressing the floor beside the standing foot, while the other arm binds around
 * the back to hold the lotus foot.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function ArdhaBaddhaPadmottanasana({ size = 120, className }: PoseIconProps) {
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
      aria-label="Half Bound Lotus Forward Fold pose"
    >
      {/* Faint floor line under the standing foot and the pressing hand. */}
      <line x1="16" y1="92" x2="84" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Standing (left) leg: straight and vertical from the hips to the floor. */}
      <line x1="50" y1="52" x2="48" y2="92" />
      {/* Half-lotus (right) leg: shin folded up across the standing thigh, the
          foot resting high at the hip crease. */}
      <path d="M50 52 L64 60 L44 62" />

      {/* Torso: folds forward and down over the standing leg from the hips. */}
      <path d="M50 52 C48 64 44 72 38 76" />

      {/* Front arm: presses the floor beside the standing foot. */}
      <line x1="41" y1="72" x2="42" y2="90" />
      {/* Binding arm: wraps around the back to hold the lotus foot at the hip. */}
      <path d="M43 70 L58 66 L47 61" />

      {/* Head: dropped low at the end of the folded torso. */}
      <circle cx="36.5" cy="79" r="6.5" />
    </svg>
  );
}

export default ArdhaBaddhaPadmottanasana;
