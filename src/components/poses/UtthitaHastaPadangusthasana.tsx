/**
 * UtthitaHastaPadangusthasana — Extended Hand-to-Big-Toe, original stick-figure
 * pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: a tall one-legged balance. The standing (left) leg is straight and
 * vertical to the floor; the torso rises upright above it. The other (right) leg
 * lifts straight out to the front, and the same-side hand reaches forward to hold
 * the big toe of that lifted foot — the free arm steadies at the hip.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function UtthitaHastaPadangusthasana({ size = 120, className }: PoseIconProps) {
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
      aria-label="Extended Hand-to-Big-Toe pose"
    >
      {/* Faint floor line under the single standing foot. */}
      <line x1="18" y1="92" x2="82" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Standing (left) leg: straight and vertical from the hips to the floor. */}
      <line x1="40" y1="52" x2="40" y2="92" />
      {/* Lifted (right) leg: straight out to the front toward the raised foot. */}
      <line x1="40" y1="52" x2="82" y2="58" />

      {/* Torso: upright from the hips to the shoulders. */}
      <line x1="40" y1="52" x2="42" y2="28" />

      {/* Reaching arm: same-side hand forward to hold the big toe of the lifted
          foot. */}
      <line x1="42" y1="32" x2="80" y2="56" />
      {/* Free arm: steadies at the hip. */}
      <path d="M42 32 L34 44 L40 50" />

      {/* Head: above the shoulders at the top of the upright torso. */}
      <circle cx="42.5" cy="21.5" r="6.5" />
    </svg>
  );
}

export default UtthitaHastaPadangusthasana;
