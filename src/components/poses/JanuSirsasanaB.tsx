/**
 * JanuSirsasanaB — Head-to-Knee Pose B, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: seated side profile, forward fold over ONE extended leg — as in
 * variant A, but the bent leg is tucked UNDER the body. The practitioner sits
 * up ON the heel: the hips are lifted a touch off the floor and the bent foot
 * points forward directly beneath the sitting bone (a short vertical shin dropping
 * to a foot under the pelvis), rather than lying flat out to the side. The torso
 * folds forward over the extended leg, head to the knee, hands to the foot. The
 * distinguishing feature: the bent foot tucked UNDER, hips raised on the heel.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function JanuSirsasanaB({ size = 120, className }: PoseIconProps) {
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
      aria-label="Head-to-Knee B pose"
    >
      {/* Faint floor line the extended leg and tucked foot rest along. */}
      <line x1="14" y1="92" x2="86" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Hips raised a touch off the floor, sitting up on the tucked heel. */}
      {/* Extended leg: from the lifted hip down to the floor and out to the foot. */}
      <path d="M40 82 L48 88 L82 88" />
      <line x1="82" y1="88" x2="82" y2="80" />

      {/* Bent leg tucked UNDER: short shin dropping from the hip straight down to a
          foot pointing forward directly beneath the sitting bone. */}
      <path d="M40 82 L38 88 L48 88" />

      {/* Torso: folds forward from the raised hip over the extended leg. */}
      <path d="M40 82 C42 62 50 56 62 58" />

      {/* Arm: reaches on along the shin toward the foot. */}
      <path d="M50 58 C62 58 72 66 78 78" />

      {/* Head: dropped to the knee at the end of the fold. */}
      <circle cx="68.5" cy="59" r="6.5" />
    </svg>
  );
}

export default JanuSirsasanaB;
