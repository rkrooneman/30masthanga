/**
 * MarichyasanaD — Marichi's Pose D, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: seated side profile — a TWIST with a bind, like C, but the lower
 * leg is in HALF-LOTUS instead of extended. The bottom leg folds in as a lotus (a
 * short bent shin with the foot up at the opposite hip — the small triangle near
 * the floor). The other knee is bent up TALL, foot flat near the sitting bone. The
 * torso stays UPRIGHT and rotates toward the bent knee, the opposite arm hooking
 * across the raised knee while the other binds behind the back. The distinguishing
 * feature: the twist PLUS the folded lotus lower leg (versus C's extended leg).
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function MarichyasanaD({ size = 120, className }: PoseIconProps) {
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
      aria-label="Marichi's Pose D"
    >
      {/* Faint floor line the lotus leg and planted foot rest along. */}
      <line x1="16" y1="92" x2="80" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Lower leg in HALF-LOTUS: short bent shin folded in, foot up at the hip
          crease (the small triangle low near the floor). */}
      <path d="M42 88 L62 88 L48 78 Z" />

      {/* Bent leg: knee up tall, vertical shin from a flat foot near the hip. */}
      <path d="M42 88 L34 88 L36 54" />

      {/* Torso: stays UPRIGHT, rotating toward the bent knee. */}
      <line x1="42" y1="88" x2="44" y2="46" />

      {/* Head: above the shoulders at the top of the upright twisting torso. */}
      <circle cx="45" cy="39.5" r="6.5" />

      {/* Twisting arm: hooks ACROSS the outside of the raised knee. */}
      <path d="M44 52 C34 52 28 56 30 62" />

      {/* Binding arm: sweeps behind the back to meet the other hand. */}
      <path d="M44 56 C56 62 54 78 40 78" />
    </svg>
  );
}

export default MarichyasanaD;
