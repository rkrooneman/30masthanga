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
 * Composition: an inversion. The head and shoulders lie flat on the floor to the
 * left at the baseline; from the shoulders the torso and straight legs rise
 * vertically to the lifted feet near the top. A supporting arm angles from the
 * floor up to brace the mid/lower back — the "salamba" (supported) detail.
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
      {/* Faint floor line the head and shoulders rest on. */}
      <line x1="14" y1="92" x2="78" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Shoulders on the floor: a short horizontal segment from beside the head
          across to the base of the vertical body. */}
      <line x1="34" y1="88" x2="52" y2="88" />

      {/* Torso + legs: rise vertically from the shoulders straight up to the
          lifted feet near the top. */}
      <line x1="52" y1="88" x2="52" y2="14" />

      {/* Small foot flick at the top. */}
      <path d="M52 14 L60 12" />

      {/* Supporting arm: from the elbow/hand on the floor angling up to brace the
          mid-back. */}
      <path d="M40 90 L52 62" />

      {/* Head: rests on the floor to the left of the shoulders. */}
      <circle cx="24.5" cy="86" r="6.5" />

      {/* Neck: joins the head to the shoulders along the floor. */}
      <line x1="31" y1="86.5" x2="34" y2="88" />
    </svg>
  );
}

export default SalambaSarvangasana;
