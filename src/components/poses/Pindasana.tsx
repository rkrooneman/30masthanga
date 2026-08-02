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
 * compact embryo curl. The head and shoulders rest on the floor at the baseline;
 * the torso lifts up a little then curls back over so the folded lotus bundle drops
 * low over the face, with the arms wrapping it. Distinguished from UrdhvaPadmasana
 * (lotus held UP high) by the lotus knot lowered down close over the head.
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
      <line x1="26" y1="90" x2="74" y2="90" strokeWidth={2} opacity={0.35} />

      {/* Torso: lifts up from the shoulders on the floor then curls back over so the
          seat is up high but the folded legs come down over the face. */}
      <path d="M50 86 C64 60 60 40 46 42" />

      {/* Lotus knot lowered DOWN over the face: the crossed folded shins hang low
          just above the head. */}
      <line x1="36" y1="44" x2="54" y2="40" />
      <line x1="36" y1="44" x2="48" y2="52" />
      <line x1="54" y1="40" x2="48" y2="52" />

      {/* Arms: wrap up and around the lowered lotus bundle. */}
      <path d="M44 84 C34 66 34 52 42 44" />

      {/* Head: rests on the floor at the base, below the lowered lotus. */}
      <circle cx="46" cy="87" r="6.5" />
    </svg>
  );
}

export default Pindasana;
