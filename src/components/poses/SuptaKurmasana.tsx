/**
 * SuptaKurmasana — Sleeping Tortoise Pose, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: the fully BOUND version of the tortoise — far more folded than
 * Kurmasana. The figure is a compact low bundle: the head drops right down to the
 * floor at the front, the two legs cross OVER one another BEHIND the neck (an X of
 * shins above the head), and the arms bind together low BEHIND the back. Tightly
 * knotted and closed rather than splayed wide.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function SuptaKurmasana({ size = 120, className }: PoseIconProps) {
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
      aria-label="Sleeping Tortoise Pose pose"
    >
      {/* Faint floor line under the compact bundle. */}
      <line x1="20" y1="92" x2="80" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Head: dropped right down to the floor at the front of the bundle. */}
      <circle cx="34" cy="82.5" r="6.5" />

      {/* Neck/back: short low rise from the head into the folded bundle. */}
      <path d="M40 80 C48 76 54 76 60 78" />

      {/* Legs cross OVER one another behind the neck — an X of shins above the
          head, the signature bind. */}
      <line x1="42" y1="78" x2="66" y2="58" />
      <line x1="40" y1="60" x2="64" y2="80" />

      {/* Arms bound together low BEHIND the back, knotting the bundle closed. */}
      <path d="M58 80 C68 84 68 76 60 74" />
    </svg>
  );
}

export default SuptaKurmasana;
