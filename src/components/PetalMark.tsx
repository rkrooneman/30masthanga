/**
 * PetalMark — a single leaf, in the app's calm vector style.
 *
 * The day-marker for the "last 7 days" row on Home. Two states:
 *   - filled: a gentle sage leaf (sage fill) meaning a practice was completed
 *     that day, with a soft central vein showing through so it reads clearly as
 *     a leaf rather than a blob.
 *   - empty: an outline-only leaf (no fill, thin muted stroke at reduced
 *     opacity) meaning "not yet" — quiet, not a scolding blank.
 *
 * The silhouette is a symmetric leaf (an almond / pointed oval): pointed at BOTH
 * the tip and the stem end, widest in the middle, mirrored about x = 12. A
 * central midrib vein runs tip-to-base — the feature that most reads as "leaf".
 * Rounded joins keep it soft.
 *
 * `aria-hidden` because the accessible label lives on the parent day cell (see
 * PracticeWeek). Pure inline SVG — no external assets, no dependencies.
 */

interface PetalMarkProps {
  /** Whether the day was practiced: true = filled sage leaf, false = outline. */
  filled: boolean;
  /** Outer width/height of the SVG box, in pixels. Default 20. */
  size?: number;
  /** Optional extra class for positioning by the caller. */
  className?: string;
}

/**
 * A symmetric leaf about x = 12: a pointed tip at the top (12, 2.5) sweeping down
 * and out to the widest point mid-leaf, then tapering back to a pointed stem end
 * at the bottom (12, 21.5). Both sides share reflected control points.
 */
const LEAF_PATH =
  'M12 2.5 C16 7 20 11 20 15 C20 18.5 16.5 21.5 12 21.5 ' +
  'C7.5 21.5 4 18.5 4 15 C4 11 8 7 12 2.5 Z';

/** The central midrib vein, tip to stem. */
const VEIN_PATH = 'M12 5 L12 20';

function PetalMark({ filled, size = 20, className }: PetalMarkProps) {
  const accent = 'var(--color-accent)';
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      // The empty leaf reads as a quiet placeholder; the filled one is present.
      opacity={filled ? 1 : 0.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* A gentle clockwise tilt (about the leaf's centre) gives it a natural,
          growing lean rather than a stiff upright drop. */}
      <g transform="rotate(18 12 12)">
        {/* Leaf body: sage fill when practiced, thin muted outline when not. */}
        <path
          d={LEAF_PATH}
          fill={filled ? accent : 'none'}
          stroke={filled ? 'none' : 'var(--color-border)'}
          strokeWidth={filled ? 0 : 1.4}
        />
        {/* Midrib vein: shows through the fill (surface tint) when filled, or a
            faint accent line when empty — the detail that reads as a leaf. */}
        <path
          d={VEIN_PATH}
          fill="none"
          stroke={filled ? 'var(--color-surface)' : 'var(--color-border)'}
          strokeWidth={filled ? 1.1 : 1}
          opacity={filled ? 0.7 : 1}
        />
      </g>
    </svg>
  );
}

export default PetalMark;
