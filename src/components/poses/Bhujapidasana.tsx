/**
 * Bhujapidasana — Shoulder-Pressing Pose, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: an arm balance, traced from the reference photo (frame A, the
 * clearest signature). The two arms drop as supports to the hands planted on the
 * floor, the rounded back lifting up-and-back behind them. The legs drape forward
 * OVER the upper arms and the feet cross at the ankles out in FRONT of the hands,
 * hovering just off the floor. The head tips forward and down over the crossed
 * feet. A low, compact, forward-leaning balance off the ground.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function Bhujapidasana({ size = 120, className }: PoseIconProps) {
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
      aria-label="Shoulder-Pressing Pose pose"
    >
      {/* Faint floor line the hands press into. */}
      <line x1="30" y1="92" x2="66" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Two arms: bent supports from the lifted shoulders down to the hands
          planted close together on the floor. */}
      <line x1="34" y1="52" x2="44" y2="88" />
      <line x1="54" y1="50" x2="48" y2="88" />

      {/* Rounded back: lifts up-and-back behind the arms, over toward the head. */}
      <path d="M34 52 C26 60 30 44 44 40" />

      {/* Legs drape OVER the upper arms and cross at the ankles out in front,
          hovering just off the floor. */}
      <path d="M38 58 C30 70 40 78 56 74" />
      <path d="M52 56 C64 66 58 78 42 74" />

      {/* Head: tips forward and down over the crossed feet. */}
      <circle cx="48" cy="38" r="6.5" />
    </svg>
  );
}

export default Bhujapidasana;
