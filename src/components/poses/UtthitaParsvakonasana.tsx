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
 * Composition: a wide split stance, figure facing right. The front (right) knee
 * bends deeply to roughly a right angle over a vertical shin; the back (left) leg
 * rakes out long and straight to the floor. The torso lays down along the front
 * thigh and the bottom (right) hand drops to the floor beside the front foot,
 * while the top (left) arm sweeps up and over the ear — so the back foot, the
 * straight back leg, the torso and the top arm all fall on ONE long unbroken
 * diagonal from the bottom-left heel up to the top-right reaching hand, the
 * signature Extended Side Angle line.
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
      <line x1="8" y1="92" x2="82" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Front (right) leg: deep bent knee at a right angle — thigh out to the
          right from the hips, vertical shin down to the planted front foot. */}
      <path d="M56 62 L74 74 L74 92" />
      {/* Back (left) leg: long and straight, raked out low to the back foot — the
          start of the one long diagonal. */}
      <line x1="56" y1="62" x2="14" y2="90" />

      {/* Torso: lays down along the front thigh, out toward the front foot, so the
          shoulders reach past the bent knee. */}
      <line x1="56" y1="62" x2="70" y2="70" />

      {/* Bottom (right) arm: drops to the floor beside the front foot. */}
      <line x1="70" y1="70" x2="72" y2="90" />
      {/* Top (left) arm: sweeps up and over the ear, continuing the back-leg
          diagonal all the way to the top-right reaching hand. */}
      <line x1="70" y1="70" x2="90" y2="40" />

      {/* Head: alongside the reaching top arm, just past the shoulders. */}
      <circle cx="64.5" cy="61" r="6.5" />
    </svg>
  );
}

export default UtthitaParsvakonasana;
