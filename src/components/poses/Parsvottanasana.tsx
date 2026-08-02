/**
 * Parsvottanasana — Intense Side Stretch, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: a short front-back stance, figure facing left, with both legs
 * straight and both feet flat. The front (left) leg drops near-vertical to the
 * floor while the back (right) leg rakes out long behind. The torso folds all the
 * way forward and down along the front leg, nearly horizontal, so the head sinks
 * low past the front knee toward the shin. The arms fold behind the back in
 * reverse prayer — the hands meeting high between the shoulder blades — the
 * signature Intense Side Stretch detail.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function Parsvottanasana({ size = 120, className }: PoseIconProps) {
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
      aria-label="Intense Side Stretch pose"
    >
      {/* Faint floor line under the front-and-back feet. */}
      <line x1="14" y1="92" x2="82" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Front (left) leg: near-vertical from the hips down to the front foot. */}
      <line x1="56" y1="52" x2="34" y2="92" />
      {/* Back (right) leg: straight and long, raked out behind to the back foot. */}
      <line x1="56" y1="52" x2="80" y2="92" />

      {/* Torso: folds all the way forward and down along the front leg, nearly
          horizontal, from the hips out over the front knee. */}
      <line x1="56" y1="52" x2="30" y2="60" />

      {/* Arms: folded behind the back in reverse prayer — the hands meeting high
          between the shoulder blades over the mid-back. */}
      <path d="M50 55 L58 46 L52 44" />
      <path d="M50 55 L54 45 L52 44" />

      {/* Head: dropped low past the front knee toward the shin, at the end of the
          folded torso. */}
      <circle cx="24.5" cy="63" r="6.5" />
    </svg>
  );
}

export default Parsvottanasana;
