/**
 * BaddhaPadmasana — Bound Lotus, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: seated UPRIGHT in full lotus with the arms bound behind the back.
 * A low crossed-lotus base rests on the floor, the torso rises tall and vertical
 * to the head, and each arm wraps AROUND BEHIND the back to bind the opposite big
 * toe (arms drawn as a curve looping behind the torso). Distinguished from
 * YogaMudra (same bind but folding forward) by the tall upright torso.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function BaddhaPadmasana({ size = 120, className }: PoseIconProps) {
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
      aria-label="Bound Lotus pose"
    >
      {/* Faint floor line the crossed legs rest on. */}
      <line x1="20" y1="92" x2="80" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Crossed lotus base: a low symmetric triangle of folded legs on the floor. */}
      <line x1="28" y1="86" x2="72" y2="86" />
      <line x1="28" y1="86" x2="50" y2="74" />
      <line x1="72" y1="86" x2="50" y2="74" />

      {/* Torso: rises tall and vertical up the centre from the seat. */}
      <line x1="50" y1="76" x2="50" y2="40" />

      {/* Bound arms: from the shoulders each arm wraps around BEHIND the back,
          looping behind the torso to bind the opposite big toe at the base. */}
      <path d="M50 44 C34 48 32 74 44 82" />
      <path d="M50 44 C66 48 68 74 56 82" />

      {/* Head: upright at the top of the vertical torso. */}
      <circle cx="50" cy="33" r="6.5" />
    </svg>
  );
}

export default BaddhaPadmasana;
