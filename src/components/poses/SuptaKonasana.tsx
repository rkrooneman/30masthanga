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
 * Composition: balancing on the upper back and shoulders with the head on the
 * floor, traced from the reference photo. The hips lift and the straight legs rise
 * overhead, spreading WIDE into an inverted V that tips toward the floor beyond the
 * head; both hands reach up the legs to catch the big toes at the two spread feet.
 * A wide open V rising and tipping back from the grounded shoulders.
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
      {/* Faint floor line the head, shoulders and upper back rest on. */}
      <line x1="16" y1="92" x2="72" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Upper back/shoulders: a low grounded segment along the floor rising to the
          lifted hips at the base of the V. */}
      <line x1="30" y1="88" x2="52" y2="78" />

      {/* Legs: lift overhead and spread WIDE into an inverted V, the feet tipping
          back toward the floor beyond the head. */}
      <line x1="52" y1="78" x2="22" y2="26" />
      <line x1="52" y1="78" x2="84" y2="30" />

      {/* Arms: reach up along the legs to hold the big toes at each spread foot. */}
      <path d="M48 74 C36 60 30 44 24 30" />
      <path d="M56 74 C68 60 76 46 82 34" />

      {/* Head: on the floor beside the grounded shoulders. */}
      <circle cx="24.5" cy="86" r="6.5" />
    </svg>
  );
}

export default SuptaKonasana;
