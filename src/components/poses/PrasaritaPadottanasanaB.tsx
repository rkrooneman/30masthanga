/**
 * PrasaritaPadottanasanaB — Wide-Legged Forward Fold B, original stick-figure icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: the wide straight-legged forward fold in variant B — hands on the
 * hips. The legs splay wide to the floor, the torso folds down between them and
 * the head hangs toward the floor, but the arms bend with both hands set at the
 * waist rather than reaching down.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function PrasaritaPadottanasanaB({ size = 120, className }: PoseIconProps) {
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
      aria-label="Wide-Legged Forward Fold B pose"
    >
      {/* Faint floor line under the wide feet. */}
      <line x1="8" y1="92" x2="92" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Legs: splay very wide from the hip apex out to both feet. */}
      <line x1="50" y1="46" x2="16" y2="92" />
      <line x1="50" y1="46" x2="84" y2="92" />

      {/* Torso: folds straight down between the legs from the hips. */}
      <line x1="50" y1="46" x2="50" y2="72" />

      {/* Arms: bent with the hands set at the waist (hands on hips) — elbows out. */}
      <path d="M50 54 L40 58 L44 47" />
      <path d="M50 54 L60 58 L56 47" />

      {/* Head: hangs low toward the floor at the end of the torso. */}
      <circle cx="50" cy="78.5" r="6.5" />
    </svg>
  );
}

export default PrasaritaPadottanasanaB;
