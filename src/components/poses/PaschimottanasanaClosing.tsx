/**
 * PaschimottanasanaClosing — Seated Forward Fold (closing counter), original
 * stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: the same asana as Paschimottanasana, reused here as the closing
 * counter-pose. Seated side profile: the legs lie flat along the floor extended
 * forward from the sitting bones to the feet, the torso folds down over the legs
 * with the head dropping near the shins, and the arm reaches along the legs to
 * the feet.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function PaschimottanasanaClosing({ size = 120, className }: PoseIconProps) {
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
      aria-label="Seated Forward Fold pose"
    >
      {/* Faint floor line the legs rest along. */}
      <line x1="14" y1="92" x2="86" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Legs: flat along the floor, from the sitting bones out to the feet. */}
      <line x1="20" y1="88" x2="80" y2="88" />
      {/* Small upturned feet at the far end. */}
      <line x1="80" y1="88" x2="80" y2="78" />

      {/* Torso: folds down over the legs from the hips toward the feet. */}
      <path d="M20 88 C22 66 30 58 46 60" />

      {/* Arm: reaches on along the shins toward the feet. */}
      <path d="M40 62 C56 62 70 70 76 80" />

      {/* Head: dropped low over the legs at the end of the folded torso. */}
      <circle cx="52.5" cy="61" r="6.5" />
    </svg>
  );
}

export default PaschimottanasanaClosing;
