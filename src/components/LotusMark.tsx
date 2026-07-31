/**
 * LotusMark — the app's signature identity mark: a minimalist line-drawing lotus.
 *
 * A calm, symmetric lotus flower drawn as thin sage strokes and resting inside a
 * soft enclosing circle, so the mark keeps the round silhouette shared with
 * RingMark while reading clearly as a lotus (the yoga motif). It is the logo on
 * the Home screen and the source of the favicon / install icon — identity ONLY.
 * It is deliberately NOT used inside the pose placeholder, so the lotus stays the
 * app's special signature.
 *
 * Composition (viewBox 0 0 64 64, symmetric about the vertical centre x = 32):
 *   - a soft enclosing circle (the round motif carried over from RingMark),
 *   - one upright centre petal,
 *   - two mirrored inner side petals leaning outward,
 *   - two mirrored outer side petals leaning further outward,
 *   - a short base line the petals rise from.
 * Every side petal is an exact mirror of its partner across x = 32 (see the
 * paired path comments), keeping the flower perfectly symmetric.
 *
 * Pure inline SVG — no external assets, no dependencies. Mirrors the small,
 * self-contained shape and stroke style of RingMark / NamasteMark.
 */

interface LotusMarkProps {
  /** Outer width/height of the SVG box, in pixels. Default 64. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function LotusMark({ size = 64, className }: LotusMarkProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      stroke="var(--color-accent)"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="ashtanga30 lotus mark"
    >
      {/* Soft enclosing circle — keeps the round silhouette shared with RingMark. */}
      <circle cx="32" cy="32" r="27" strokeWidth="1" opacity="0.55" />

      {/* Centre petal: upright teardrop rising from the base to a rounded tip. */}
      <path d="M32 44 C27 36 27 26 32 19 C37 26 37 36 32 44 Z" />

      {/* Inner side petals — mirrored pair leaning gently outward from the base.
          Left and right share identical control offsets reflected about x = 32. */}
      <path d="M32 44 C24 39 19 31 19 23 C27 25 32 33 32 44 Z" />
      <path d="M32 44 C40 39 45 31 45 23 C37 25 32 33 32 44 Z" />

      {/* Outer side petals — mirrored pair leaning further outward, shorter and
          lower, so the flower fans open. Again reflected about x = 32. */}
      <path d="M32 44 C22 43 15 39 12 32 C19 30 27 35 32 44 Z" />
      <path d="M32 44 C42 43 49 39 52 32 C45 30 37 35 32 44 Z" />

      {/* Short base line the petals rise from. */}
      <path d="M23 45 C27 47 37 47 41 45" />
    </svg>
  );
}

export default LotusMark;
