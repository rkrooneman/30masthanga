/**
 * SuptaPadangusthasana — Reclining Big Toe Pose, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: lying on the back along the floor. One leg stays flat on the ground
 * extending away from the hips; the OTHER leg raises straight up toward the head,
 * and the arm reaches up along it with the hand holding the big toe at the raised
 * foot. Clear one-leg-down, one-leg-up supine shape.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function SuptaPadangusthasana({ size = 120, className }: PoseIconProps) {
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
      aria-label="Reclining Big Toe Pose pose"
    >
      {/* Faint floor line the back and lower leg rest on. */}
      <line x1="10" y1="92" x2="90" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Torso: lying flat on the floor, head end to the hips. */}
      <line x1="26" y1="86" x2="56" y2="86" />

      {/* Lower leg: stays flat on the ground, extending away from the hips. */}
      <line x1="56" y1="86" x2="86" y2="86" />

      {/* Raised leg: from the hips straight up toward the head to the lifted
          foot. */}
      <line x1="56" y1="86" x2="52" y2="26" />

      {/* Arm: reaches up along the raised leg, hand holding the big toe. */}
      <path d="M34 84 C40 62 46 44 51 30" />

      {/* Head: on the floor at the top end of the torso. */}
      <circle cx="20.5" cy="86" r="6.5" />
    </svg>
  );
}

export default SuptaPadangusthasana;
