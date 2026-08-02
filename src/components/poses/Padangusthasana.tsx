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
 * Composition: a deep standing forward fold seen from the side, feet together.
 * The legs are straight and vertical from the high folded hips down to the feet.
 * The torso folds completely flat against the legs so the head drops all the way
 * down to the ankles, tucked in at the shins. Both arms hang straight down and
 * the hands hook around the big toes at the very base of the feet — the fingers
 * curling over the toes in the toe-grip that names the pose.
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
      <line x1="38" y1="92" x2="62" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Legs: straight and vertical from the high folded hips down to the feet. */}
      <line x1="47" y1="30" x2="46" y2="90" />
      <line x1="53" y1="30" x2="54" y2="90" />

      {/* Torso: folds flat against the legs from the high hips, the spine dropping
          straight down the front of the shins to the head at the ankles. */}
      <path d="M50 30 C51 52 50 68 47 80" />

      {/* Arms: hang straight down and the hands hook around the big toes at the
          base of the feet — the fingers curling over the toes. */}
      <path d="M42 60 L44 86 L49 88" />
      <path d="M45 61 L52 86 L47 88" />

      {/* Head: dropped all the way down to the ankles at the end of the fold. */}
      <circle cx="44.5" cy="82" r="6.5" />
    </svg>
  );
}

export default Padangusthasana;
