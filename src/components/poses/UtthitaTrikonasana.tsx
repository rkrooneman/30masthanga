/**
 * UtthitaTrikonasana — Extended Triangle, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: a wide-legged triangle. Both legs are straight, planted wide on
 * the floor from a high hip apex. The torso tilts sideways over the front (right)
 * leg; the bottom arm drops straight down to that shin/ankle while the top arm
 * reaches straight up — the two arms make one long vertical line, the signature
 * Triangle shape.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function UtthitaTrikonasana({ size = 120, className }: PoseIconProps) {
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
      aria-label="Extended Triangle pose"
    >
      {/* Faint floor line under both wide feet. */}
      <line x1="12" y1="92" x2="88" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Legs: straight and wide, from the hip apex out to both feet. */}
      <line x1="50" y1="52" x2="18" y2="92" />
      <line x1="50" y1="52" x2="82" y2="92" />

      {/* Torso: tilts sideways over the front (right) leg from the hips. */}
      <line x1="50" y1="52" x2="66" y2="40" />

      {/* Bottom arm: drops straight down from the shoulder to the front shin. */}
      <line x1="66" y1="40" x2="72" y2="72" />
      {/* Top arm: reaches straight up, continuing the bottom arm's line. */}
      <line x1="66" y1="40" x2="60" y2="14" />

      {/* Head: beyond the shoulder along the tilted torso line. */}
      <circle cx="73" cy="34" r="6.5" />
    </svg>
  );
}

export default UtthitaTrikonasana;
