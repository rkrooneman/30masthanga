/**
 * Kukkutasana — Rooster Pose, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: the LIFTED cousin of Garbha Pindasana. The same full-lotus bundle
 * with arms threaded through the folded legs, but here the arms are STRAIGHT
 * vertical supports pressing the hands into the floor, lifting the whole compact
 * lotus bundle UP off the ground. Two straight arms rise from the floor to the
 * raised crossed-legs bundle above — clearly airborne, unlike Garbha Pindasana.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function Kukkutasana({ size = 120, className }: PoseIconProps) {
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
      aria-label="Rooster Pose pose"
    >
      {/* Faint floor line the hands press into. */}
      <line x1="26" y1="92" x2="74" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Two straight arms: vertical supports threaded through the lotus, from the
          hands on the floor up to the lifted bundle — the signature lift. */}
      <line x1="42" y1="56" x2="38" y2="88" />
      <line x1="58" y1="56" x2="62" y2="88" />

      {/* Lotus legs: a crossed X-base, the compact bundle raised above the hands. */}
      <line x1="34" y1="58" x2="62" y2="50" />
      <line x1="38" y1="50" x2="66" y2="58" />

      {/* Seat/torso bundle: short link tying the raised lotus together above the
          arms. */}
      <line x1="42" y1="56" x2="58" y2="56" />

      {/* Head: at the top of the lifted bundle. */}
      <circle cx="50" cy="42" r="6.5" />
    </svg>
  );
}

export default Kukkutasana;
