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
 * the air. The head and shoulders rest on the floor (left); the torso rises
 * vertically like a shoulderstand; at the TOP the legs cross into a lotus knot,
 * and the hands reach up to support the knees. Distinguished from Pindasana (lotus
 * lowered DOWN over the face) by the lotus held high at the top.
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
      {/* Faint floor line the head and shoulders rest on. */}
      <line x1="14" y1="92" x2="78" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Shoulders on the floor: short horizontal from beside the head to the base
          of the vertical body. */}
      <line x1="34" y1="88" x2="52" y2="88" />

      {/* Torso: rises vertically from the shoulders straight up toward the lotus. */}
      <line x1="52" y1="88" x2="52" y2="34" />

      {/* Lotus knot at the top: the crossed folded legs held up in the air. */}
      <line x1="38" y1="30" x2="66" y2="30" />
      <line x1="38" y1="30" x2="52" y2="20" />
      <line x1="66" y1="30" x2="52" y2="20" />

      {/* Supporting hands/arms: reach up from the back to brace the raised knees. */}
      <path d="M40 88 L40 32" />

      {/* Head: rests on the floor to the left of the shoulders. */}
      <circle cx="24.5" cy="86" r="6.5" />

      {/* Neck: joins the head to the shoulders along the floor. */}
      <line x1="31" y1="86.5" x2="34" y2="88" />
    </svg>
  );
}

export default UrdhvaPadmasana;
