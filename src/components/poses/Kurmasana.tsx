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
 * Composition: seated, very low and wide, seen from the front and symmetric. The
 * legs splay out low to each side from the seat, feet flexed up at the far ends.
 * The torso presses forward and DOWN flat, dropping the head low at the front
 * centre between the legs. The arms thread OUT sideways UNDERNEATH the knees,
 * running flat beyond the feet on each side — a flat, wide, ground-hugging shape.
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
      <line x1="8" y1="90" x2="92" y2="90" strokeWidth={2} opacity={0.35} />

      {/* Legs: splay out low and wide to each side from the seat, feet flexed up. */}
      <path d="M50 74 L18 66 L13 60" />
      <path d="M50 74 L82 66 L87 60" />

      {/* Torso: presses forward and down flat, dropping to the head at the front. */}
      <line x1="50" y1="74" x2="50" y2="82" />

      {/* Arms: thread OUT sideways underneath the knees, flat beyond the feet on
          each side, low to the floor. */}
      <line x1="42" y1="80" x2="9" y2="85" />
      <line x1="58" y1="80" x2="91" y2="85" />

      {/* Head: dropped low at the front centre, between the legs. */}
      <circle cx="50" cy="86.5" r="6.5" />
    </svg>
  );
}

export default Kurmasana;
