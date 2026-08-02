/**
 * JanuSirsasanaC — Head-to-Knee Pose C, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: seated side profile facing right, traced from the reference photo —
 * a deep forward fold over ONE extended leg, as in variants A/B but the bent foot
 * stands on the BALL of the foot with the heel lifted high toward the navel. The
 * bent knee lifts into a peak near the hip and the foot points up on its toes (the
 * raised, pointed spur back-left) — the most acute of the three foot positions.
 * The torso folds all the way down flat over the extended leg so the head drops to
 * the shin and the hands clasp past the flexed foot. The distinguishing feature:
 * the pointed, heel-lifted bent foot standing on its ball/toes.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function JanuSirsasanaC({ size = 120, className }: PoseIconProps) {
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
      aria-label="Head-to-Knee C pose"
    >
      {/* Faint floor line the extended leg and seat rest along. */}
      <line x1="10" y1="92" x2="84" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Extended leg: flat along the floor to the flexed foot. */}
      <line x1="38" y1="88" x2="80" y2="88" />
      <line x1="80" y1="88" x2="80" y2="78" />

      {/* Bent leg: knee lifted into a peak near the hip, the foot standing on its
          ball with the heel LIFTED up toward the navel — the pointed, acute foot. */}
      <path d="M38 88 L24 88 L27 76 L24 70" />

      {/* Torso: folds all the way down flat over the extended leg. */}
      <path d="M38 88 C40 74 52 73 60 76" />

      {/* Arm: reaches the length of the leg and clasps the flexed foot. */}
      <path d="M54 75 C64 75 74 80 80 84" />

      {/* Head: dropped low to the shin at the end of the fold. */}
      <circle cx="64.5" cy="78" r="6.5" />
    </svg>
  );
}

export default JanuSirsasanaC;
