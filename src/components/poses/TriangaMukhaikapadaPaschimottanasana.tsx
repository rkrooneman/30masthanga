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
 * Composition: seated side profile facing right, traced from the reference photo.
 * ONE leg extends flat forward (to the right) along the floor to the flexed foot.
 * The OTHER leg is folded back alongside the hip — the thigh rests forward on the
 * floor and the shin folds sharply back to a foot beside the sitting bone (the
 * short spur pointing left). The torso folds all the way down flat over the
 * extended leg so the head drops close to the shin, the arms reaching the length
 * of the leg to clasp the foot. The distinguishing feature: the tightly
 * folded-back knee/shin behind the hip.
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
      {/* Faint floor line the legs and seat rest along. */}
      <line x1="12" y1="92" x2="84" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Extended leg: flat along the floor to the flexed foot. */}
      <line x1="38" y1="88" x2="80" y2="88" />
      <line x1="80" y1="88" x2="80" y2="78" />

      {/* Folded-back leg: thigh forward on the floor, shin folded sharply back
          to a foot standing beside the hip (the short spur pointing up-left). */}
      <path d="M38 88 L20 88 L22 80" />

      {/* Torso: folds all the way down flat over the extended leg. */}
      <path d="M38 88 C40 74 54 73 62 76" />

      {/* Arm: reaches the length of the leg and clasps the flexed foot. */}
      <path d="M56 75 C66 75 76 80 80 84" />

      {/* Head: dropped low near the shin at the end of the fold. */}
      <circle cx="66.5" cy="78" r="6.5" />
    </svg>
  );
}

export default TriangaMukhaikapadaPaschimottanasana;
