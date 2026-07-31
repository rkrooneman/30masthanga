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
 * Composition: a short front-back stance with both legs straight and the hips
 * squared over the front (right) leg. The torso folds forward low over that front
 * leg, the head dropping toward the front shin. The arms fold behind the back in
 * reverse prayer — the hands meeting between the shoulder blades — the signature
 * Intense Side Stretch detail.
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
      <line x1="14" y1="92" x2="86" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Front (right) leg: straight down from the hips to the front foot. */}
      <line x1="52" y1="52" x2="70" y2="92" />
      {/* Back (left) leg: straight, a short step behind to the back foot. */}
      <line x1="52" y1="52" x2="30" y2="92" />

      {/* Torso: folds forward low over the front leg from the hips. */}
      <line x1="52" y1="52" x2="70" y2="44" />

      {/* Arms: folded behind the back in reverse prayer — hands meeting between
          the shoulder blades. */}
      <path d="M58 50 L48 42 L57 40" />
      <path d="M58 50 L54 40 L57 40" />

      {/* Head: dropped forward toward the front shin at the end of the torso. */}
      <circle cx="76.5" cy="45" r="6.5" />
    </svg>
  );
}

export default Parsvottanasana;
