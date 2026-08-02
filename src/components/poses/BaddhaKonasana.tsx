/**
 * BaddhaKonasana — Bound Angle Pose, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: seated and seen from the FRONT, symmetric, traced from the
 * reference photo (frame A). The soles of the feet press together at the centre,
 * drawn in close to the pelvis, and the knees drop out very WIDE and low to both
 * sides, resting near the floor — the legs form a broad butterfly diamond. The
 * torso folds forward and down over the joined feet so the head drops low toward
 * them, the arms clasping the feet at the centre. The signature: knees spread wide
 * to the floor with the soles joined, folding down the middle.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function BaddhaKonasana({ size = 120, className }: PoseIconProps) {
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
      aria-label="Bound Angle Pose"
    >
      {/* Faint floor line the wide knees and joined feet rest along. */}
      <line x1="10" y1="92" x2="90" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Legs: broad butterfly diamond — thighs drop out very wide to the knees
          low on the floor, shins return to the joined feet at the centre front.
          Left half. */}
      <path d="M50 74 L14 88 L50 86" />
      {/* Right half — mirror. */}
      <path d="M50 74 L86 88 L50 86" />

      {/* Torso: the rounded back humps up behind, then the head drops down at the
          front centre over the joined feet. */}
      <path d="M50 74 C36 66 64 66 50 78" />

      {/* Arms: sweep down and out over the wide thighs to clasp the joined feet. */}
      <path d="M42 72 C34 78 34 84 48 85" />
      <path d="M58 72 C66 78 66 84 52 85" />

      {/* Head: dropped low over the joined feet at the front centre. */}
      <circle cx="50" cy="83" r="6.5" />
    </svg>
  );
}

export default BaddhaKonasana;
