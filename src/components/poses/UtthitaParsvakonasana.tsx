/**
 * UtthitaParsvakonasana — Extended Side Angle, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: a wide stance with the front (right) knee bent deeply to a
 * vertical shin, the back (left) leg long and straight. The torso leans out over
 * the front thigh; the bottom hand drops to the floor beside the front foot,
 * while the top arm sweeps up and over the head — making one long diagonal line
 * from the back heel all the way to the reaching top hand.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function UtthitaParsvakonasana({ size = 120, className }: PoseIconProps) {
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
      aria-label="Extended Side Angle pose"
    >
      {/* Faint floor line under both feet and the bottom hand. */}
      <line x1="10" y1="92" x2="90" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Front (right) leg: deep bent knee — thigh out to the right, vertical
          shin down to the front foot. */}
      <path d="M52 58 L72 74 L72 92" />
      {/* Back (left) leg: long and straight from the hips down to the back foot. */}
      <line x1="52" y1="58" x2="16" y2="92" />

      {/* Torso: leans out over the front thigh toward the bottom hand. */}
      <line x1="52" y1="58" x2="64" y2="70" />

      {/* Bottom arm: drops to the floor beside the front foot. */}
      <line x1="64" y1="70" x2="66" y2="90" />
      {/* Top arm: sweeps up and over the head, extending the back-leg diagonal. */}
      <line x1="64" y1="70" x2="44" y2="46" />

      {/* Head: alongside the reaching top arm, above the torso. */}
      <circle cx="55" cy="60" r="6.5" />
    </svg>
  );
}

export default UtthitaParsvakonasana;
