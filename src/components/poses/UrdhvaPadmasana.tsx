/**
 * UrdhvaPadmasana — Upward Lotus, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: from a shoulderstand the legs fold into lotus while balanced UP in
 * the air. The head and shoulders rest on the floor at the baseline; the torso
 * rises straight up the centre like a shoulderstand; at the TOP the crossed shins
 * form a lotus knot, and the hands reach up from the floor to cradle the knees.
 * Distinguished from Pindasana (lotus lowered DOWN over the face) by the lotus held
 * high at the top.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function UrdhvaPadmasana({ size = 120, className }: PoseIconProps) {
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
      aria-label="Upward Lotus pose"
    >
      {/* Faint floor line the head, shoulders and elbows rest on. */}
      <line x1="28" y1="90" x2="72" y2="90" strokeWidth={2} opacity={0.35} />

      {/* Torso: rises straight up the centre from the shoulders on the floor toward
          the lotus at the top. */}
      <line x1="50" y1="86" x2="50" y2="36" />

      {/* Lotus knot at the top: the crossed folded shins held up in the air. */}
      <line x1="36" y1="32" x2="64" y2="32" />
      <line x1="36" y1="32" x2="50" y2="22" />
      <line x1="64" y1="32" x2="50" y2="22" />

      {/* Supporting arms: reach up from the elbows on the floor to cradle the
          raised knees on either side. */}
      <path d="M40 88 L38 34" />
      <path d="M60 88 L62 34" />

      {/* Head: rests on the floor just below the shoulders at the base. */}
      <circle cx="50" cy="87" r="6.5" />
    </svg>
  );
}

export default UrdhvaPadmasana;
