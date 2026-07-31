/**
 * NamasteMark — the guided-practice completion visual.
 *
 * A calm, minimalist line-drawing of two hands pressed together in anjali mudra
 * (prayer hands). The fingertips meet at a rounded steeple point at the top,
 * a few thin finger-separation lines fan down over the front hand, the palms
 * run down the vertical centre, and the wrists flare outward at the bottom into
 * a shallow forearm splay with a small downward V notch between them. Drawn as
 * a symmetric pair of thin strokes (mirrored about x = 48) in the sage accent
 * colour so it inherits the app's palette. Shown on the guided screen (Slice 5b)
 * when a practice finishes.
 *
 * Pure inline SVG — no external assets, no dependencies. Mirrors the small,
 * self-contained shape of RingMark.
 */

interface NamasteMarkProps {
  /** Outer width/height of the SVG box, in pixels. Default 96. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function NamasteMark({ size = 96, className }: NamasteMarkProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      stroke="var(--color-accent)"
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Namaste — hands pressed together"
    >
      {/* Left hand: fingertip point at top centre -> outer (pinky-side) edge
          curving down and widening -> wrist flaring outward at the bottom ->
          inner wrist edge sweeping back up to the centre V. */}
      <path d="M48 12 C44 14 40 18 36 26 C31 36 27 50 27 62 C27 70 25 76 22 84 C30 82 38 80 48 78" />
      {/* Right hand: exact mirror of the left across the centre line (x = 48). */}
      <path d="M48 12 C52 14 56 18 60 26 C65 36 69 50 69 62 C69 70 71 76 74 84 C66 82 58 80 48 78" />
      {/* Palms meeting down the vertical centre, from the fingertip to the
          point where the two wrists separate into the V. */}
      <path d="M48 12 L48 78" />
      {/* Finger-separation lines: a soft symmetric fan over the upper hand,
          suggesting individual fingers. Mirrored pairs about x = 48. */}
      <path d="M47 18 C44 25 42 31 41 37" />
      <path d="M49 18 C52 25 54 31 55 37" />
      <path d="M46 21 C44 28 43 34 42 40" />
      <path d="M50 21 C52 28 53 34 54 40" />
    </svg>
  );
}

export default NamasteMark;
