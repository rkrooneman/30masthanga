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
 * Composition: a seated balance on the tailbone, seen from the FRONT and roughly
 * symmetric, traced from the reference photo. The legs fold into full lotus — a
 * low, wide crossed X-base of shins — and BOTH arms thread THROUGH the gaps in the
 * folded legs to come up and cradle the face, the hands cupping the cheeks. The
 * head sits at the top of a compact, rounded embryo bundle, still on the ground
 * (contrast Kukkutasana, which lifts the same bundle up on the arms).
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
      {/* Faint floor line under the compact seated bundle. */}
      <line x1="26" y1="92" x2="74" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Lotus legs: a low, wide crossed X-base of shins across the seat. */}
      <line x1="28" y1="84" x2="66" y2="72" />
      <line x1="34" y1="72" x2="72" y2="84" />

      {/* Both arms thread THROUGH the folded legs and rise to cradle the face,
          the hands cupping the cheeks on each side of the head. */}
      <path d="M40 78 C36 62 42 54 47 52" />
      <path d="M60 78 C64 62 58 54 53 52" />

      {/* Head: cradled at the top of the compact embryo bundle. */}
      <circle cx="50" cy="47" r="6.5" />
    </svg>
  );
}

export default GarbhaPindasana;
