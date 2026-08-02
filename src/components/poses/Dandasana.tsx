/**
 * Dandasana — Staff Pose, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: seated side profile facing right — the crisp upright "L" traced
 * from the reference photo. The legs lie flat along the floor extended forward
 * (to the right) from the sitting bones out to the feet, which flex up at the far
 * end. The torso rises nearly vertical from the hips to the shoulders with only a
 * whisper of forward lean, and the near arm drops straight down at the side, the
 * hand resting on the floor by the hip. Tall and square — the reference posture
 * for all seated poses.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function Dandasana({ size = 120, className }: PoseIconProps) {
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
      aria-label="Staff Pose"
    >
      {/* Faint floor line the legs and seat rest along. */}
      <line x1="20" y1="92" x2="88" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Legs: flat along the floor from the sitting bones out to the feet. */}
      <line x1="28" y1="88" x2="84" y2="88" />
      {/* Flexed feet at the far end. */}
      <line x1="84" y1="88" x2="84" y2="77" />

      {/* Torso: nearly vertical from the hips up to the shoulders, a hair forward. */}
      <line x1="28" y1="88" x2="31" y2="43" />

      {/* Arm: drops straight down at the side, hand on the floor by the hip. */}
      <line x1="33" y1="47" x2="34" y2="86" />

      {/* Head: above the shoulders at the top of the upright torso. */}
      <circle cx="31.5" cy="36" r="6.5" />
    </svg>
  );
}

export default Dandasana;
