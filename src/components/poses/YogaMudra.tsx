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
 * rests on the floor, the torso folds down and forward from the seat, the head
 * drops low in front, and the bound arms trail up behind the folded back.
 * Distinguished from BaddhaPadmasana (upright torso) by the forward fold with the
 * head dropped down in front.
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
      {/* Faint floor line the crossed legs rest on. */}
      <line x1="18" y1="92" x2="82" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Crossed lotus base: a low symmetric triangle of folded legs on the floor. */}
      <line x1="30" y1="86" x2="74" y2="86" />
      <line x1="30" y1="86" x2="52" y2="74" />
      <line x1="74" y1="86" x2="52" y2="74" />

      {/* Torso: folds down and forward from the seat toward the floor in front. */}
      <path d="M52 76 C48 60 38 56 26 62" />

      {/* Bound arms: trail up and back behind the folded torso to the bind at the
          seat. */}
      <path d="M40 62 C56 56 66 68 68 82" />

      {/* Head: dropped low in front at the end of the forward-folded torso. */}
      <circle cx="24.5" cy="68" r="6.5" />
    </svg>
  );
}

export default YogaMudra;
