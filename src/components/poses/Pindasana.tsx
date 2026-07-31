/**
 * Pindasana — Embryo in Shoulderstand, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: from a shoulderstand the lotus legs lower DOWN toward the face — a
 * compact embryo curl. The head and shoulders rest on the floor (left); the torso
 * rises only a little, then curls back over so the folded lotus bundle hovers low
 * over the face. Distinguished from UrdhvaPadmasana (lotus held UP high) by the
 * lotus knot lowered down close over the head.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function Pindasana({ size = 120, className }: PoseIconProps) {
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
      aria-label="Embryo pose"
    >
      {/* Faint floor line the head and shoulders rest on. */}
      <line x1="14" y1="92" x2="78" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Shoulders on the floor: short horizontal from beside the head to the base
          of the lifted body. */}
      <line x1="34" y1="88" x2="52" y2="88" />

      {/* Torso: lifts from the shoulders then curls back over toward the head, so
          the seat is up high but the folded legs come down over the face. */}
      <path d="M52 88 C56 52 50 42 40 44" />

      {/* Lotus knot lowered DOWN over the face: the crossed folded legs hang low
          just above the head. */}
      <line x1="30" y1="46" x2="46" y2="40" />
      <line x1="30" y1="46" x2="42" y2="52" />
      <line x1="46" y1="40" x2="42" y2="52" />

      {/* Head: rests on the floor to the left of the shoulders. */}
      <circle cx="24.5" cy="86" r="6.5" />

      {/* Neck: joins the head to the shoulders along the floor. */}
      <line x1="31" y1="86.5" x2="34" y2="88" />
    </svg>
  );
}

export default Pindasana;
