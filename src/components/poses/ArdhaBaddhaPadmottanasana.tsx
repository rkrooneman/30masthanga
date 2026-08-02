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
 * Composition: a deep one-legged standing forward fold. The standing (left) leg
 * is straight and vertical to the floor; the other (right) foot is drawn up into
 * half-lotus, the shin folded high across the standing thigh at the hip. The
 * torso folds all the way forward and down along the standing leg so the head
 * drops low toward the standing foot. The front (left) hand presses the floor
 * beside that foot, while the other (right) arm binds around the back to hold the
 * lotus foot at the hip — the signature half-bound-lotus wrap.
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
      <line x1="34" y1="92" x2="66" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Standing (left) leg: straight and vertical from the high hips to the
          floor. */}
      <line x1="52" y1="34" x2="50" y2="92" />
      {/* Half-lotus (right) leg: shin folded up across the standing thigh, the
          foot resting high at the hip crease. */}
      <path d="M52 36 L66 44 L46 46" />

      {/* Torso: folds all the way forward and down along the standing leg from
          the high hips, the head sinking toward the standing foot. */}
      <path d="M52 34 C53 54 51 72 47 82" />

      {/* Front (left) arm: reaches down to press the floor beside the standing
          foot. */}
      <line x1="49" y1="62" x2="52" y2="90" />
      {/* Binding (right) arm: wraps around the back up to hold the lotus foot at
          the hip. */}
      <path d="M50 60 L60 52 L50 45" />

      {/* Head: dropped low toward the standing foot at the end of the fold. */}
      <circle cx="44.5" cy="84" r="6.5" />
    </svg>
  );
}

export default ArdhaBaddhaPadmottanasana;
