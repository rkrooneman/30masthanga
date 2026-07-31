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
 * Composition: seated side profile, forward fold over ONE extended leg — as in
 * variants A/B, but the bent foot is placed on the BALL of the foot with the heel
 * lifted up toward the navel. The bent shin angles up from the floor and the foot
 * stands on its toes: a short raised, pointed foot (heel up) near the groin — the
 * most acute of the three foot positions. The torso folds forward over the
 * extended leg, head to the knee, hands to the foot. The distinguishing feature:
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
      {/* Faint floor line the extended leg rests along. */}
      <line x1="10" y1="92" x2="86" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Extended leg: flat along the floor to the flexed foot. */}
      <line x1="38" y1="88" x2="82" y2="88" />
      <line x1="82" y1="88" x2="82" y2="80" />

      {/* Bent leg: shin angling up from the floor to a foot standing on its ball,
          heel LIFTED up toward the navel — the pointed, acute foot position. */}
      <path d="M38 88 L20 88 L27 78 L23 72" />

      {/* Torso: folds forward over the extended leg. */}
      <path d="M38 88 C40 66 48 60 60 62" />

      {/* Arm: reaches on along the shin toward the foot. */}
      <path d="M48 62 C60 62 70 70 78 80" />

      {/* Head: dropped to the knee at the end of the fold. */}
      <circle cx="66.5" cy="63" r="6.5" />
    </svg>
  );
}

export default JanuSirsasanaC;
