/**
 * JanuSirsasanaA — Head-to-Knee Pose A, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: seated side profile, forward fold over ONE extended leg. The
 * extended leg lies flat forward (to the right). The bent leg opens out to the
 * side: the shin lies flat back along the floor and the foot draws in to the
 * inner thigh (an open ~90° knee, foot flat and low). The torso folds forward
 * over the extended leg, head to the knee, hands reaching the foot. Variant A is
 * the OPEN, FLAT bent-knee position — foot sole flat against the inner thigh,
 * heel down. (Distinguishes from B: foot under, and C: foot up on the toes.)
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function JanuSirsasanaA({ size = 120, className }: PoseIconProps) {
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
      aria-label="Head-to-Knee A pose"
    >
      {/* Faint floor line the legs rest along. */}
      <line x1="10" y1="92" x2="86" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Extended leg: flat along the floor to the flexed foot. */}
      <line x1="38" y1="88" x2="82" y2="88" />
      <line x1="82" y1="88" x2="82" y2="80" />

      {/* Bent leg: opened out to the side, shin flat back along the floor with the
          foot (sole flat, heel down) drawn in toward the inner thigh. */}
      <path d="M38 88 L16 88 L28 84" />

      {/* Torso: folds forward over the extended leg. */}
      <path d="M38 88 C40 66 48 60 60 62" />

      {/* Arm: reaches on along the shin toward the foot. */}
      <path d="M48 62 C60 62 70 70 78 80" />

      {/* Head: dropped to the knee at the end of the fold. */}
      <circle cx="66.5" cy="63" r="6.5" />
    </svg>
  );
}

export default JanuSirsasanaA;
