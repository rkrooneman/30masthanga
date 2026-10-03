/**
 * LockGlyph - a tiny inline padlock glyph marking a gently-locked control.
 *
 * Used beside the steer controls (Basics only / Full series / per-pose select)
 * when the one-time unlock has NOT been purchased, to show calmly and once that
 * the control is locked. Drawn in the same style as the app's other inline icons
 * (see NavArrow / MusicPanel): a 24x24 viewBox, stroke/fill from currentColor so
 * colour is inherited from the surrounding (dimmed) control, and aria-hidden
 * since the locked state is announced through the control's own label/title.
 *
 * The shackle is a stroked arch; the body is a small filled rounded rectangle,
 * both symmetric about x=12 so the glyph reads centred at any size.
 */

interface IconProps {
  /** Extra class for CSS-driven sizing/colour on the SVG element. */
  className?: string;
}

export function LockGlyph({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      {/* Shackle: an arch rising from the body's top corners. */}
      <path
        d="M 8 10 V 7.5 a 4 4 0 0 1 8 0 V 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Body: a small rounded rectangle. */}
      <rect
        x="5.5"
        y="10"
        width="13"
        height="9.5"
        rx="2"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}
