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
 * Composition: seated side profile — a forward FOLD with a bind, like A, but the
 * lower leg is in HALF-LOTUS instead of extended. The bottom leg folds in as a
 * lotus (a short bent shin with the foot up at the opposite hip crease — the small
 * triangle near the floor). The other knee is bent up TALL, foot flat near the
 * sitting bone (a vertical shin). The torso folds forward, the same-side arm
 * wrapping round the tall shin to bind behind the back. The distinguishing
 * feature: the folded lotus lower leg (versus A's straight extended leg).
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
      <line x1="16" y1="92" x2="80" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Lower leg in HALF-LOTUS: short bent shin folded in, foot up at the hip
          crease (the small triangle low near the floor). */}
      <path d="M34 88 L54 88 L40 78 Z" />

      {/* Bent leg: knee up tall, vertical shin from a flat foot near the hip. */}
      <path d="M34 88 L26 88 L28 58" />

      {/* Torso: folds forward alongside the tall shin. */}
      <path d="M34 88 C36 66 46 60 58 62" />

      {/* Head: dropped low at the end of the fold. */}
      <circle cx="64.5" cy="63" r="6.5" />

      {/* Binding: arm wraps round the front of the shin and behind the back. */}
      <path d="M40 64 C22 66 16 82 30 82" />
    </svg>
  );
}

export default MarichyasanaB;
