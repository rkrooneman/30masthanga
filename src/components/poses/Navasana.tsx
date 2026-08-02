/**
 * Navasana — Boat Pose, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: balancing on the sitting bones (a single low point on the floor),
 * the body opens into a wide "V", figure facing right. The torso rises up-and-back
 * (up-left) to the head; the straight legs lift up-and-forward (up-right) so the
 * toes reach roughly head height. The arms extend forward level with the floor,
 * running past the knees toward the shins — the signature Boat line.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function Navasana({ size = 120, className }: PoseIconProps) {
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
      aria-label="Boat Pose"
    >
      {/* Faint floor line under the single balance point (the sitting bones). */}
      <line x1="30" y1="92" x2="58" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Torso: from the sitting bones up-and-back to the shoulders. */}
      <line x1="40" y1="84" x2="25" y2="44" />
      {/* Legs: from the sitting bones lifted up-and-forward; toes near head height. */}
      <line x1="40" y1="84" x2="86" y2="31" />

      {/* Arms: extend forward level with the floor, past the knees to the shins. */}
      <line x1="27" y1="47" x2="65" y2="45" />

      {/* Head: above the shoulders at the top of the torso. */}
      <circle cx="21.5" cy="34" r="6.5" />
    </svg>
  );
}

export default Navasana;
