/**
 * NavArrow - tiny inline nav glyphs (chevrons + a back arrow) drawn as SVG so
 * they sit OPTICALLY CENTRED inside their buttons.
 *
 * The text glyphs these replace (&lsaquo; / &rsaquo; / &larr;) are not centred
 * within their font em-box, so they looked off-centre inside the nav buttons.
 * Each path here is drawn in a 24x24 box and is SYMMETRIC about the box centre
 * (x=12, y=12), so the existing flex centring on the button places the glyph
 * dead-centre.
 *
 * Style matches the app's other inline icons (see MusicPanel): viewBox
 * "0 0 24 24", stroke="currentColor" (so colour + hover are inherited from the
 * button exactly as the text glyph was), fill="none", rounded caps/joins. The
 * SVG is aria-hidden - every consuming button already carries an aria-label.
 */

interface IconProps {
  /** Extra class for CSS-driven sizing/colour on the SVG element. */
  className?: string;
}

/**
 * A single chevron pointing left or right, centred in the 24x24 box.
 *   right: M 9 6 L 15 12 L 9 18  (vertex at x=15, arms symmetric about y=12)
 *   left:  M 15 6 L 9 12 L 15 18 (vertex at x=9,  arms symmetric about y=12)
 * Both are mirror images about x=12 and symmetric about y=12, so each reads as
 * centred once the button flex-centres the SVG.
 */
export function Chevron({
  direction,
  className,
}: IconProps & { direction: 'left' | 'right' }) {
  const d = direction === 'left' ? 'M 15 6 L 9 12 L 15 18' : 'M 9 6 L 15 12 L 9 18';
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * A left-pointing back arrow (shaft + head) centred in the 24x24 box. The shaft
 * runs along y=12 from x=5 to x=19 (centre x = 12); the head is a left chevron
 * whose vertex sits at x=5, y=12 with arms symmetric about y=12. A shafted
 * arrow reads more clearly as "back" than a bare chevron for the home-back.
 */
export function BackArrow({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M 19 12 L 5 12 M 11 6 L 5 12 L 11 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
