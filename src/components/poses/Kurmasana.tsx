/**
 * Kurmasana — Tortoise Pose, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: seated, very low and wide. The legs splay out low to each side.
 * The torso presses forward and DOWN flat to the floor between the legs, head
 * dropped low at the front. The arms thread OUT sideways UNDERNEATH the knees,
 * extending beyond the legs on each side — a flat, wide, ground-hugging shape.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function Kurmasana({ size = 120, className }: PoseIconProps) {
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
      aria-label="Tortoise Pose pose"
    >
      {/* Faint wide floor line — everything is low and flat. */}
      <line x1="8" y1="92" x2="92" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Legs: splay out low and wide to each side from the seat at centre. */}
      <line x1="50" y1="80" x2="16" y2="72" />
      <line x1="50" y1="80" x2="84" y2="72" />

      {/* Torso: presses forward and down flat toward the floor at the front. */}
      <line x1="50" y1="80" x2="50" y2="84" />
      <path d="M50 82 C46 86 42 86 34 85" />

      {/* Arms: thread OUT sideways underneath the knees, reaching beyond the legs
          on each side, low to the floor. */}
      <line x1="44" y1="83" x2="12" y2="85" />
      <line x1="56" y1="83" x2="88" y2="85" />

      {/* Head: dropped low at the front, between/beyond the legs. */}
      <circle cx="27" cy="84.5" r="6.5" />
    </svg>
  );
}

export default Kurmasana;
