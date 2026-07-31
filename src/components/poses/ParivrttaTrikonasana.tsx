/**
 * ParivrttaTrikonasana — Revolved Triangle, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: the twisted triangle. Both legs stay straight and wide on the
 * floor. The torso hinges forward over the front (right) leg and revolves, so the
 * OPPOSITE (left) hand crosses the body and reaches down to the front foot while
 * the other (right) arm points straight up. The crossed bottom arm marks the
 * revolve apart from Extended Triangle.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function ParivrttaTrikonasana({ size = 120, className }: PoseIconProps) {
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
      aria-label="Revolved Triangle pose"
    >
      {/* Faint floor line under both wide feet. */}
      <line x1="12" y1="92" x2="88" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Legs: straight and wide, from the hip apex out to both feet. */}
      <line x1="50" y1="54" x2="20" y2="92" />
      <line x1="50" y1="54" x2="80" y2="92" />

      {/* Torso: hinges forward over the front (right) leg from the hips. */}
      <line x1="50" y1="54" x2="66" y2="40" />

      {/* Bottom arm: the OPPOSITE hand crosses the body down to the front foot —
          the revolve. */}
      <line x1="66" y1="40" x2="78" y2="86" />
      {/* Top arm: the other arm points straight up, twisted open. */}
      <line x1="66" y1="40" x2="58" y2="14" />

      {/* Head: turned up under the raised arm, beyond the shoulder. */}
      <circle cx="70" cy="33" r="6.5" />
    </svg>
  );
}

export default ParivrttaTrikonasana;
