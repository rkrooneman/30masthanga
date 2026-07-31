/**
 * PrasaritaPadottanasanaA — Wide-Legged Forward Fold A, original stick-figure icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: a very wide straight-legged stance with a deep forward fold. The
 * legs splay wide from a high hip apex to the floor. The torso folds straight
 * down between the legs, the crown of the head reaching toward the floor, and
 * both hands press the floor on the midline between the feet (variant A).
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function PrasaritaPadottanasanaA({ size = 120, className }: PoseIconProps) {
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
      aria-label="Wide-Legged Forward Fold A pose"
    >
      {/* Faint floor line under the wide feet and the hands. */}
      <line x1="8" y1="92" x2="92" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Legs: splay very wide from the hip apex out to both feet. */}
      <line x1="50" y1="46" x2="16" y2="92" />
      <line x1="50" y1="46" x2="84" y2="92" />

      {/* Torso: folds straight down between the legs from the hips. */}
      <line x1="50" y1="46" x2="50" y2="72" />

      {/* Arms: press straight down to the floor on the midline between the feet. */}
      <line x1="50" y1="66" x2="42" y2="90" />
      <line x1="50" y1="66" x2="58" y2="90" />

      {/* Head: crown reaching low toward the floor at the end of the torso. */}
      <circle cx="50" cy="78.5" r="6.5" />
    </svg>
  );
}

export default PrasaritaPadottanasanaA;
