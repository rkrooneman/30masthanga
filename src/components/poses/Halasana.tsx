/**
 * Halasana — Plough Pose, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: an inversion. The head and shoulders rest on the floor to the
 * right; the hips lift high near the top; from the hips the STRAIGHT legs travel
 * up and over the head, then reach down so the feet touch the floor BEHIND the
 * head (to the left). The arms lie flat along the floor. The signature: straight
 * legs arcing over to feet planted on the far side of the head.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function Halasana({ size = 120, className }: PoseIconProps) {
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
      aria-label="Plough pose"
    >
      {/* Faint floor line the shoulders, arms and feet rest along. */}
      <line x1="12" y1="92" x2="88" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Torso: rises from the shoulders on the floor (right) up to the lifted
          hips near the top. */}
      <line x1="66" y1="88" x2="60" y2="26" />

      {/* Straight legs: travel up over the head and reach down to the feet
          planted on the floor BEHIND the head (to the left). */}
      <line x1="60" y1="26" x2="26" y2="88" />

      {/* Arm: rests flat along the floor by the shoulders. */}
      <line x1="66" y1="88" x2="84" y2="88" />

      {/* Head: rests on the floor at the shoulder end (right). */}
      <circle cx="75.5" cy="86" r="6.5" />
    </svg>
  );
}

export default Halasana;
