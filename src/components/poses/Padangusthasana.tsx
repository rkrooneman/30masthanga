/**
 * Padangusthasana — Big Toe Pose, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: a standing deep forward fold seen from the side. The legs are
 * straight and vertical from the hips to the feet. The torso folds all the way
 * down over the legs, the head dropping low near the shins, and both arms reach
 * straight down so the hands catch the big toes at the feet.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function Padangusthasana({ size = 120, className }: PoseIconProps) {
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
      aria-label="Big Toe Pose"
    >
      {/* Faint floor line under the feet. */}
      <line x1="30" y1="92" x2="70" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Legs: straight and vertical from the folded hips down to the feet. */}
      <line x1="48" y1="40" x2="46" y2="92" />
      <line x1="52" y1="40" x2="54" y2="92" />

      {/* Torso: folds deep down over the straight legs from the hips. */}
      <path d="M50 40 C50 58 48 70 44 78" />

      {/* Arms: reach straight down so the hands catch the big toes at the feet. */}
      <line x1="45" y1="66" x2="47" y2="90" />
      <line x1="48" y1="67" x2="53" y2="90" />

      {/* Head: dropped low near the shins at the end of the folded torso. */}
      <circle cx="42.5" cy="82" r="6.5" />
    </svg>
  );
}

export default Padangusthasana;
