/**
 * UrdhvaMukhaPaschimottanasana — Upward-Facing Forward Fold, original stick-figure
 * pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: balancing on the sitting bones (a single low point on the floor).
 * Both legs extend straight UP and are drawn IN toward the torso; the torso folds
 * up to meet them face-to-legs, both hands holding the feet — a compact balanced
 * fold, legs up and chest hugging them closed together at the top.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function UrdhvaMukhaPaschimottanasana({ size = 120, className }: PoseIconProps) {
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
      aria-label="Upward-Facing Forward Fold pose"
    >
      {/* Faint floor line under the single balance point (the sitting bones). */}
      <line x1="32" y1="92" x2="68" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Legs: extend straight up from the seat, drawn in close together toward
          the feet at the top. */}
      <line x1="48" y1="84" x2="52" y2="26" />

      {/* Torso: folds up to meet the legs, chest hugging them — a close parallel
          line just beside the legs. */}
      <path d="M48 84 C40 60 42 40 49 30" />

      {/* Arms: reach up to hold the feet at the top where torso and legs meet. */}
      <path d="M45 46 C46 38 48 34 51 30" />

      {/* Head: lifted up toward the feet at the top of the folded bundle. */}
      <circle cx="52.5" cy="35" r="6.5" />
    </svg>
  );
}

export default UrdhvaMukhaPaschimottanasana;
