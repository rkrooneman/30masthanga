/**
 * UbhayaPadangusthasana — Both Big Toes Pose, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: balancing UPRIGHT on the sitting bones (a single point on the
 * floor). Both legs extend straight up into a V, both hands reach up to hold both
 * big toes, and the torso lifts tall toward the feet — a balanced upright V, like
 * a bound Boat holding the toes.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function UbhayaPadangusthasana({ size = 120, className }: PoseIconProps) {
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
      aria-label="Both Big Toes Pose pose"
    >
      {/* Faint floor line under the single balance point (the sitting bones). */}
      <line x1="30" y1="92" x2="70" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Torso: lifts tall and upright from the sitting bones toward the shoulders. */}
      <line x1="50" y1="84" x2="44" y2="40" />

      {/* Legs: both extend straight up into a V toward the two lifted feet. */}
      <line x1="50" y1="84" x2="34" y2="26" />
      <line x1="50" y1="84" x2="66" y2="26" />

      {/* Arms: reach up from the shoulders to hold both big toes at the feet. */}
      <line x1="44" y1="44" x2="35" y2="30" />
      <line x1="44" y1="44" x2="65" y2="30" />

      {/* Head: above the shoulders at the top of the lifted torso. */}
      <circle cx="43" cy="33.5" r="6.5" />
    </svg>
  );
}

export default UbhayaPadangusthasana;
