/**
 * ParivrttaParsvakonasana — Revolved Side Angle, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: the twisted side-angle lunge. The front (right) knee is bent to a
 * vertical shin, the back leg long and straight. The torso revolves across the
 * front thigh so the OPPOSITE (left) arm crosses over the leg with the bottom
 * hand to the floor outside the front foot, while the top (right) arm extends up
 * and over the head. The crossing arm shows the revolve.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function ParivrttaParsvakonasana({ size = 120, className }: PoseIconProps) {
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
      aria-label="Revolved Side Angle pose"
    >
      {/* Faint floor line under both feet and the bottom hand. */}
      <line x1="10" y1="92" x2="90" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Front (right) leg: deep bent knee — thigh out to the right, vertical
          shin down to the front foot. */}
      <path d="M50 58 L70 74 L70 92" />
      {/* Back (left) leg: long and straight from the hips down to the back foot. */}
      <line x1="50" y1="58" x2="16" y2="92" />

      {/* Torso: revolves forward across the front thigh from the hips. */}
      <line x1="50" y1="58" x2="66" y2="64" />

      {/* Bottom arm: the OPPOSITE arm crosses over the front thigh, hand to the
          floor outside the front foot — the revolve. */}
      <line x1="66" y1="64" x2="76" y2="90" />
      {/* Top arm: extends up and over the head above the twist. */}
      <line x1="66" y1="64" x2="50" y2="40" />

      {/* Head: turned up toward the top arm, above the shoulder. */}
      <circle cx="60" cy="53" r="6.5" />
    </svg>
  );
}

export default ParivrttaParsvakonasana;
