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
 * up and over the head, then slope down so the toes touch the floor well BEHIND the
 * head (far left). The arm lies flat along the floor out past the head. The
 * signature: straight legs sloping over to toes planted on the far side of the head.
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
      {/* Faint floor line the shoulders, arm and toes rest along. */}
      <line x1="12" y1="88" x2="88" y2="88" strokeWidth={2} opacity={0.35} />

      {/* Torso: rises steeply from the shoulders on the floor (right) up to the
          lifted hips near the top. */}
      <line x1="64" y1="84" x2="62" y2="26" />

      {/* Straight legs: travel up over the head then slope down to the toes
          planted on the floor well BEHIND the head (far left). */}
      <line x1="62" y1="26" x2="16" y2="82" />

      {/* Arm: rests flat along the floor out past the head to the right. */}
      <line x1="64" y1="84" x2="86" y2="84" />

      {/* Head: rests on the floor at the shoulder end (right). */}
      <circle cx="72" cy="82" r="6.5" />
    </svg>
  );
}

export default Halasana;
