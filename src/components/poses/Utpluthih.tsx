/**
 * Utpluthih — Scales / Lifted Lotus, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: seated in full lotus, both hands press the floor beside the hips
 * and the whole lotus bundle LIFTS UP off the ground on straight arms. The hands
 * rest on the floor, the arms run straight up to the shoulders, the torso rises to
 * the head, and the compact crossed-lotus base hovers in the air between the
 * hands. The signature: straight locked arms lifting a compact lotus off the floor.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function Utpluthih({ size = 120, className }: PoseIconProps) {
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
      aria-label="Scales pose"
    >
      {/* Faint floor line the hands press into. */}
      <line x1="22" y1="88" x2="78" y2="88" strokeWidth={2} opacity={0.35} />

      {/* Straight arms: from the hands on the floor straight up to the shoulders,
          lifting the whole seat off the ground. */}
      <line x1="32" y1="84" x2="40" y2="44" />
      <line x1="68" y1="84" x2="60" y2="44" />

      {/* Compact lotus base: crossed folded legs lifted in the air between the
          hands, clear of the floor. */}
      <line x1="40" y1="72" x2="60" y2="72" />
      <line x1="40" y1="72" x2="50" y2="80" />
      <line x1="60" y1="72" x2="50" y2="80" />

      {/* Torso: rises from the lifted seat up the centre to the head. */}
      <line x1="50" y1="70" x2="50" y2="40" />

      {/* Head: upright at the top of the vertical torso. */}
      <circle cx="50" cy="33" r="6.5" />
    </svg>
  );
}

export default Utpluthih;
