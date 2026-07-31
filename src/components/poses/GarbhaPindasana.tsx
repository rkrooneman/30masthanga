/**
 * GarbhaPindasana — Embryo in the Womb Pose, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: a seated balance ON THE TAILBONE (a single low point on the floor)
 * curled into a compact rounded ball. The legs fold into full lotus — a crossed
 * X-base tucked in — and the arms thread THROUGH the gaps in the folded legs to
 * come up and cradle the head. A curled embryo shape, low and rounded, still on
 * the ground (contrast Kukkutasana, which lifts the same bundle up on the arms).
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function GarbhaPindasana({ size = 120, className }: PoseIconProps) {
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
      aria-label="Embryo in the Womb Pose pose"
    >
      {/* Faint floor line under the single balance point (the tailbone). */}
      <line x1="30" y1="92" x2="70" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Curled back: a rounded arc balancing on the tailbone, curling up and
          over toward the head — the embryo curve. */}
      <path d="M46 86 C30 80 30 52 50 48" />

      {/* Lotus legs: a crossed X-base tucked in at the seat, low over the floor. */}
      <line x1="34" y1="80" x2="62" y2="70" />
      <line x1="36" y1="70" x2="64" y2="80" />

      {/* Arms thread THROUGH the folded legs and come up to cradle the head. */}
      <path d="M42 74 C56 72 60 60 56 52" />

      {/* Head: cradled at the top of the curl. */}
      <circle cx="52" cy="45" r="6.5" />
    </svg>
  );
}

export default GarbhaPindasana;
