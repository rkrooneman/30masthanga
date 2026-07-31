/**
 * SuptaKonasana — Reclining Angle Pose, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: lying on the back with the head and shoulders on the floor. The
 * legs lift overhead and spread WIDE into an inverted V; both hands reach up along
 * the legs to hold the big toes at the two spread feet. A wide open V rising from
 * the grounded shoulders.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function SuptaKonasana({ size = 120, className }: PoseIconProps) {
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
      aria-label="Reclining Angle Pose pose"
    >
      {/* Faint floor line the head and shoulders rest on. */}
      <line x1="16" y1="92" x2="84" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Shoulders/hips: a short grounded segment near the floor at the base of
          the lifted V. */}
      <line x1="34" y1="88" x2="50" y2="82" />

      {/* Legs: lift overhead and spread WIDE into an inverted V toward the two
          feet at the top. */}
      <line x1="50" y1="82" x2="20" y2="24" />
      <line x1="50" y1="82" x2="80" y2="24" />

      {/* Arms: reach up along the legs to hold the big toes at each spread foot. */}
      <path d="M46 78 C34 62 28 44 22 28" />
      <path d="M54 78 C66 62 72 44 78 28" />

      {/* Head: on the floor beside the shoulders. */}
      <circle cx="24.5" cy="86" r="6.5" />
    </svg>
  );
}

export default SuptaKonasana;
