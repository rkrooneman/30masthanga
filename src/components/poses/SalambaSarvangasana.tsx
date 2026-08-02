/**
 * SalambaSarvangasana — Supported Shoulderstand, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: a vertical inversion balanced on the shoulders. The head and
 * shoulders rest on the floor at the baseline; from the shoulders the torso and
 * straight legs rise straight up the centre to the lifted feet near the top. Two
 * supporting arms angle up from the elbows on the floor to brace the low back —
 * the "salamba" (supported) detail.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function SalambaSarvangasana({ size = 120, className }: PoseIconProps) {
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
      aria-label="Supported Shoulderstand pose"
    >
      {/* Faint floor line the head, shoulders and elbows rest on. */}
      <line x1="30" y1="90" x2="70" y2="90" strokeWidth={2} opacity={0.35} />

      {/* Torso + legs: rise straight up the centre from the shoulders on the floor
          to the lifted feet near the top. */}
      <line x1="50" y1="86" x2="50" y2="12" />

      {/* Small foot flick at the top. */}
      <path d="M50 12 L57 11" />

      {/* Supporting arms: from the elbows on the floor angling up to brace the low
          back on either side of the torso. */}
      <path d="M38 88 L48 56" />
      <path d="M62 88 L52 56" />

      {/* Head: rests on the floor just below the shoulders at the base. */}
      <circle cx="50" cy="87" r="6.5" />
    </svg>
  );
}

export default SalambaSarvangasana;
