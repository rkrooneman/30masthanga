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
 * Composition: seated and seen from the FRONT, symmetric, traced from the
 * reference photo (frame A). The straight legs spread very WIDE into a broad flat V
 * along the floor, feet flexed at the far corners. The torso folds all the way
 * forward and DOWN between the legs so the chest and head press low to the floor at
 * the centre, and the arms reach the length of the legs to catch the feet. The
 * signature: legs open wide in a flat V, torso folded flat down the middle.
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

      {/* Legs: spread very wide into a broad flat V from the seat to the flexed
          feet at the far corners. */}
      <line x1="50" y1="80" x2="14" y2="88" />
      <line x1="14" y1="88" x2="12" y2="80" />
      <line x1="50" y1="80" x2="86" y2="88" />
      <line x1="86" y1="88" x2="88" y2="80" />

      {/* Torso: folds flat forward and DOWN between the legs, the rounded back
          humping up behind before the head drops low at the centre. */}
      <path d="M50 80 C40 70 60 70 50 80" />

      {/* Arms: reach the length of the legs out to catch the feet. */}
      <path d="M46 78 C34 80 22 84 16 86" />
      <path d="M54 78 C66 80 78 84 84 86" />

      {/* Head: dropped low at the centre, pressing toward the floor. */}
      <circle cx="50" cy="83" r="6.5" />
    </svg>
  );
}

export default UpavisthaKonasana;
