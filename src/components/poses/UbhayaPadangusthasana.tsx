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
 * Composition: balancing on the sitting bones (a single point on the floor),
 * traced from the reference photo. Both legs extend straight UP into a narrow V,
 * both hands reach up to catch both big toes at the feet, and the torso leans
 * slightly back with the head lifted, gaze up — a tall balanced V holding the
 * toes, the chest open (contrast the closed Urdhva Mukha fold).
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

      {/* Torso: lifts tall from the sitting bones and leans slightly back to the
          shoulders. */}
      <line x1="50" y1="84" x2="42" y2="42" />

      {/* Legs: both extend straight up into a narrow V toward the two lifted feet. */}
      <line x1="50" y1="84" x2="36" y2="26" />
      <line x1="50" y1="84" x2="64" y2="26" />

      {/* Arms: reach up from the shoulders to catch both big toes at the feet. */}
      <line x1="42" y1="45" x2="36" y2="28" />
      <line x1="42" y1="45" x2="64" y2="28" />

      {/* Head: lifted above the shoulders, gaze up, at the top of the torso. */}
      <circle cx="40.5" cy="35" r="6.5" />
    </svg>
  );
}

export default UbhayaPadangusthasana;
