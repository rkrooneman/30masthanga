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
 * Composition: the LIFTED cousin of Garbha Pindasana, seen from the FRONT and
 * traced from the reference photo. The same full-lotus bundle with both arms
 * threaded through the folded legs, but here the arms are STRAIGHT supports
 * splaying a little outward to the hands pressed flat on the floor, lifting the
 * whole compact lotus bundle UP off the ground. The crossed-legs X sits high above
 * the planted hands — clearly airborne, unlike Garbha Pindasana.
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
      {/* Faint floor line the hands press into, spread out to each side. */}
      <line x1="22" y1="92" x2="78" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Two straight arms: threaded through the lotus and splaying a little
          outward to the hands pressed flat on the floor — the signature lift. */}
      <line x1="42" y1="56" x2="30" y2="88" />
      <line x1="58" y1="56" x2="70" y2="88" />

      {/* Lotus legs: a crossed X-base, the compact bundle raised above the hands. */}
      <line x1="34" y1="60" x2="64" y2="52" />
      <line x1="36" y1="52" x2="66" y2="60" />

      {/* Seat/torso bundle: short link tying the raised lotus together above the
          arms. */}
      <line x1="42" y1="56" x2="58" y2="56" />

      {/* Head: at the top of the lifted bundle. */}
      <circle cx="50" cy="42" r="6.5" />
    </svg>
  );
}

export default Kukkutasana;
