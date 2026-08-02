/**
 * Purvottanasana — Upward Plank Pose, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: a reverse plank traced from the reference photo — the front of the
 * body faces up. The straight arms press vertically down to the hands planted on
 * the floor behind the shoulders (left), and the soles press flat on the floor
 * ahead (right); between them the body lifts clear of the floor into one long,
 * nearly level line from feet through the raised hips to the shoulders, tilting up
 * only slightly toward the shoulder. The head drops back off the top of the line.
 * The signature: a high, upward-facing lifted plank (opposite of a forward fold).
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function Purvottanasana({ size = 120, className }: PoseIconProps) {
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
      aria-label="Upward Plank Pose"
    >
      {/* Faint floor line under the planted hands and the pressing feet. */}
      <line x1="16" y1="92" x2="90" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Body: one long, nearly level lifted line — shoulders (left) to feet
          (right), the raised hips only a touch higher than the ends. */}
      <line x1="30" y1="52" x2="86" y2="60" />
      {/* Soles pressing flat on the floor at the far end. */}
      <line x1="86" y1="60" x2="88" y2="88" />

      {/* Supporting arm: straight and vertical from the shoulder to the hand. */}
      <line x1="30" y1="52" x2="26" y2="88" />

      {/* Head: dropped back off the shoulder end of the line. */}
      <circle cx="22" cy="57" r="6.5" />
    </svg>
  );
}

export default Purvottanasana;
