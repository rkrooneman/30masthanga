/**
 * TriangaMukhaikapadaPaschimottanasana — Three-Limbs Face-One-Foot Forward Fold,
 * original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: seated side profile. ONE leg extends flat forward (to the right)
 * along the floor. The OTHER leg is folded straight BACK alongside the hip —
 * the thigh stays on the floor and the bent shin runs back to a foot beside the
 * sitting bone (the sharp V pointing left). The torso folds forward over the
 * extended leg, the head dropping near the shin and the arm reaching to the foot.
 * The distinguishing feature: the tightly folded-back knee/shin behind the hip.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function TriangaMukhaikapadaPaschimottanasana({ size = 120, className }: PoseIconProps) {
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
      aria-label="Three-Limbs Forward Fold pose"
    >
      {/* Faint floor line the legs rest along. */}
      <line x1="12" y1="92" x2="86" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Extended leg: flat along the floor to the flexed foot. */}
      <line x1="40" y1="88" x2="82" y2="88" />
      <line x1="82" y1="88" x2="82" y2="80" />

      {/* Folded-back leg: thigh forward on the floor, shin folded sharply back
          to a foot beside the hip (the V pointing left). */}
      <path d="M40 88 L18 88" />

      {/* Torso: folds forward over the extended leg. */}
      <path d="M40 88 C42 66 50 60 62 62" />

      {/* Arm: reaches on along the shin toward the foot. */}
      <path d="M50 62 C62 62 72 70 78 80" />

      {/* Head: dropped near the shin at the end of the fold. */}
      <circle cx="68.5" cy="63" r="6.5" />
    </svg>
  );
}

export default TriangaMukhaikapadaPaschimottanasana;
