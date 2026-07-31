/**
 * UpavisthaKonasana — Wide-Angle Seated Forward Fold, original stick-figure
 * pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: seated, a near-front feel. The straight legs spread very WIDE into
 * a broad V along the floor, feet flexed at the far corners. From the hips at the
 * apex the torso folds forward and down between the legs, the head dropping low
 * toward the floor at the centre, and the arms reach out toward the feet.
 * The signature: legs open wide in a flat V, torso folding down the middle.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function UpavisthaKonasana({ size = 120, className }: PoseIconProps) {
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
      aria-label="Wide-Angle Seated Forward Fold pose"
    >
      {/* Faint floor line the wide legs rest along. */}
      <line x1="8" y1="92" x2="92" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Legs: spread very wide into a broad V from the hips to the flexed feet. */}
      <line x1="50" y1="74" x2="16" y2="88" />
      <line x1="16" y1="88" x2="14" y2="80" />
      <line x1="50" y1="74" x2="84" y2="88" />
      <line x1="84" y1="88" x2="86" y2="80" />

      {/* Torso: folds forward and down between the legs toward the floor. */}
      <path d="M50 74 C50 62 50 58 50 54" />

      {/* Arms: reach out from the folded shoulders toward the feet. */}
      <path d="M50 56 C34 58 22 72 18 84" />
      <path d="M50 56 C66 58 78 72 82 84" />

      {/* Head: dropped low at the centre at the bottom of the fold. */}
      <circle cx="50" cy="49.5" r="6.5" />
    </svg>
  );
}

export default UpavisthaKonasana;
