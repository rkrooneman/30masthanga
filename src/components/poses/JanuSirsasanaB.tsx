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
 * Composition: seated side profile facing right, traced from the reference photo —
 * a deep forward fold over ONE extended leg, as in variant A but sitting UP on the
 * bent-leg heel. The hips are lifted off the floor and the bent foot tucks in
 * under the perineum (the short shin dropping from the raised hip to the foot
 * beneath the sitting bone), the bent knee lifting into a peak in front. The torso
 * folds all the way down flat over the extended leg so the head drops to the shin
 * and the hands clasp past the flexed foot. The distinguishing feature: the hips
 * raised, sitting on the tucked-under heel.
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
      <line x1="14" y1="92" x2="84" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Extended leg: from the lifted hip down to the floor and out to the foot. */}
      <path d="M38 82 L46 88 L80 88" />
      <line x1="80" y1="88" x2="80" y2="78" />

      {/* Bent leg tucked UNDER: shin dropping from the raised hip to the foot
          beneath the sitting bone, the knee lifting into a peak in front. */}
      <path d="M38 82 L34 88 L46 88" />

      {/* Torso: folds all the way down flat from the raised hip over the leg. */}
      <path d="M38 82 C40 70 52 71 60 74" />

      {/* Arm: reaches the length of the leg and clasps the flexed foot. */}
      <path d="M54 73 C64 73 74 78 80 84" />

      {/* Head: dropped low to the shin at the end of the fold. */}
      <circle cx="64.5" cy="76" r="6.5" />
    </svg>
  );
}

export default JanuSirsasanaB;
