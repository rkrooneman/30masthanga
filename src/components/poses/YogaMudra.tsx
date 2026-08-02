/**
 * YogaMudra — Yoga Seal, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: seated in full lotus with the arms bound behind the back, folding
 * FORWARD so the head lowers toward the floor in front. A low crossed-lotus base
 * rests on the floor (left); the torso folds down and forward from the seat so the
 * head drops close to the floor in front (right); the bound arms arc up and over
 * behind the rounded back to the bind at the seat. Distinguished from
 * BaddhaPadmasana (upright torso) by the forward fold with the head dropped in front.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function YogaMudra({ size = 120, className }: PoseIconProps) {
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
      aria-label="Yoga Seal pose"
    >
      {/* Faint floor line the crossed legs and folded body rest on. */}
      <line x1="16" y1="88" x2="84" y2="88" strokeWidth={2} opacity={0.35} />

      {/* Crossed lotus base: a low symmetric triangle of folded legs on the floor
          (left of centre, under the seat). */}
      <line x1="24" y1="84" x2="60" y2="84" />
      <line x1="24" y1="84" x2="42" y2="74" />
      <line x1="60" y1="84" x2="42" y2="74" />

      {/* Torso: folds down and forward from the seat so the back rounds over toward
          the floor in front (right). */}
      <path d="M42 76 C50 58 64 58 74 80" />

      {/* Bound arms: arc up and over behind the rounded back to the bind at the
          seat. */}
      <path d="M44 72 C40 58 32 60 30 80" />

      {/* Head: dropped low in front at the end of the forward fold, near the floor. */}
      <circle cx="76" cy="82" r="6.5" />
    </svg>
  );
}

export default YogaMudra;
