/**
 * Paschimottanasana — Seated Forward Fold, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: seated side profile facing right, traced from the reference photo.
 * The legs lie flat along the floor, extended forward (to the right) from the
 * sitting bones out to the flexed feet. The torso folds all the way down over the
 * legs — the rounded back running low and nearly horizontal, chest resting on the
 * thighs — so the head drops close to the shins. The arms reach the whole length
 * of the legs and hook past the flexed foot, hands clasping around it.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function Paschimottanasana({ size = 120, className }: PoseIconProps) {
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
      {/* Faint floor line the legs and folded seat rest along. */}
      <line x1="12" y1="92" x2="84" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Legs: flat along the floor, from the sitting bones out to the feet. */}
      <line x1="18" y1="88" x2="78" y2="88" />
      {/* Flexed feet at the far end. */}
      <line x1="78" y1="88" x2="78" y2="76" />

      {/* Torso: rounded back folding low and flat over the legs, chest on thighs. */}
      <path d="M18 88 C20 70 34 68 54 71" />

      {/* Arm: runs the length of the legs and hooks past the flexed foot. */}
      <path d="M46 70 C60 70 76 74 82 76" />

      {/* Head: dropped low over the shins between the reaching arms. */}
      <circle cx="60.5" cy="73" r="6.5" />
    </svg>
  );
}

export default Paschimottanasana;
