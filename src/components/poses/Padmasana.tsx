/**
 * Padmasana — Lotus Pose, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: the classic calm meditation seat, seen from the front. A low, wide,
 * symmetric crossed-legs base rests on the floor (each foot drawn up onto the
 * opposite thigh — a shallow lotus triangle). The torso rises tall and vertical up
 * the centre to the head, and the arms drop from the shoulders with the hands
 * resting on the knees at the outer corners. Clean, upright, still.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function Padmasana({ size = 120, className }: PoseIconProps) {
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
      aria-label="Lotus Pose pose"
    >
      {/* Faint floor line the crossed legs rest on. */}
      <line x1="18" y1="88" x2="82" y2="88" strokeWidth={2} opacity={0.35} />

      {/* Crossed lotus base: a low wide symmetric triangle of folded legs on the
          floor, each foot drawn up onto the opposite thigh. */}
      <line x1="24" y1="84" x2="76" y2="84" />
      <line x1="24" y1="84" x2="50" y2="72" />
      <line x1="76" y1="84" x2="50" y2="72" />

      {/* Torso: rises tall and vertical up the centre from the seat. */}
      <line x1="50" y1="74" x2="50" y2="38" />

      {/* Arms: drop from the shoulders with the hands resting on the knees at the
          outer corners of the lotus base. */}
      <line x1="50" y1="44" x2="28" y2="82" />
      <line x1="50" y1="44" x2="72" y2="82" />

      {/* Head: upright at the top of the vertical torso. */}
      <circle cx="50" cy="31" r="6.5" />
    </svg>
  );
}

export default Padmasana;
