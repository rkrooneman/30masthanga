/**
 * MarichyasanaB — Marichi's Pose B, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: seated side profile facing right, traced from the reference photo —
 * a deep forward FOLD with a bind, like A, but the lower leg is in HALF-LOTUS
 * instead of extended. The bottom leg folds in as a lotus (a short bent shin with
 * the foot up at the opposite hip crease — the small triangle near the floor). The
 * other knee is bent up TALL, foot flat near the sitting bone (a near-vertical
 * shin). The torso folds all the way down flat, the head dropping very low, the
 * same-side arm wrapping round the tall shin to bind behind the back. The
 * distinguishing feature: the folded lotus lower leg (versus A's straight leg).
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function MarichyasanaB({ size = 120, className }: PoseIconProps) {
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
      aria-label="Marichi's Pose B"
    >
      {/* Faint floor line the lotus leg and planted foot rest along. */}
      <line x1="14" y1="92" x2="80" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Lower leg in HALF-LOTUS: short bent shin folded in, foot up at the hip
          crease (the small triangle low near the floor). */}
      <path d="M34 88 L54 88 L40 79 Z" />

      {/* Bent leg: knee up tall, near-vertical shin from a flat foot near the hip. */}
      <path d="M34 88 L27 88 L30 56" />

      {/* Torso: folds all the way down flat alongside the tall shin. */}
      <path d="M34 88 C36 72 50 72 62 76" />

      {/* Front arm: reaches on past the shin, hand low toward the floor. */}
      <path d="M56 75 C66 76 72 81 76 85" />

      {/* Head: dropped very low at the end of the fold. */}
      <circle cx="66.5" cy="78" r="6.5" />

      {/* Binding: arm wraps round the front of the shin and behind the back. */}
      <path d="M32 76 C20 76 16 87 30 85" />
    </svg>
  );
}

export default MarichyasanaB;
