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
 * Composition: balancing on the sitting bones (a single low point on the floor),
 * traced from the reference photo. Both legs extend straight UP, near vertical, and
 * the torso is drawn IN tight against them — the rounded back rising close and
 * parallel to the legs, the face tucked to the shins, both hands holding the feet
 * at the top. A compact, CLOSED balanced fold (contrast the open Ubhaya V).
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

      {/* Legs: extend straight up from the seat, near vertical, to the feet. */}
      <line x1="50" y1="84" x2="53" y2="26" />

      {/* Torso: drawn in tight against the legs — the rounded back rising close and
          parallel, the face tucked to the shins. */}
      <path d="M50 84 C42 62 44 42 50 32" />

      {/* Arms: reach up alongside to hold the feet at the top. */}
      <path d="M46 48 C47 40 49 34 52 30" />

      {/* Head: tucked in to the shins near the top of the closed fold. */}
      <circle cx="50" cy="34" r="6.5" />
    </svg>
  );
}

export default UrdhvaMukhaPaschimottanasana;
