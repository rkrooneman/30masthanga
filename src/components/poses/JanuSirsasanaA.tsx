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
 * Composition: seated side profile facing right, traced from the reference photo —
 * a deep forward fold over ONE extended leg. The extended leg lies flat forward
 * (to the right) to the flexed foot. The bent leg opens out with the knee lifted
 * into a low peak near the hip and the foot drawn in to the inner thigh (the small
 * raised triangle back-left). The torso folds all the way down flat over the
 * extended leg so the head drops to the shin and the hands clasp past the flexed
 * foot. Variant A is the OPEN bent-knee position — sole flat against the inner
 * thigh, heel down. (Distinguishes from B: foot under, and C: foot up on toes.)
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
      {/* Faint floor line the legs and seat rest along. */}
      <line x1="10" y1="92" x2="84" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Extended leg: flat along the floor to the flexed foot. */}
      <line x1="38" y1="88" x2="80" y2="88" />
      <line x1="80" y1="88" x2="80" y2="78" />

      {/* Bent leg: knee lifted into a low peak near the hip, the foot drawn back
          in to the inner thigh (sole flat, heel down). */}
      <path d="M38 88 L26 78 L20 88" />

      {/* Torso: folds all the way down flat over the extended leg. */}
      <path d="M38 88 C40 74 52 73 60 76" />

      {/* Arm: reaches the length of the leg and clasps the flexed foot. */}
      <path d="M54 75 C64 75 74 80 80 84" />

      {/* Head: dropped low to the shin at the end of the fold. */}
      <circle cx="64.5" cy="78" r="6.5" />
    </svg>
  );
}

export default JanuSirsasanaA;
