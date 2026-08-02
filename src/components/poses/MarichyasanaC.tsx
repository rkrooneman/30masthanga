/**
 * MarichyasanaC — Marichi's Pose C, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: seated side profile facing right, traced from the reference photo —
 * a TWIST with a bind (not a forward fold). One leg extends flat forward (to the
 * right) to the flexed foot. The other knee is bent up TALL, foot flat on the
 * floor near the sitting bone (a near-vertical shin). The torso stays UPRIGHT and
 * rotates toward the bent knee, the head turning back over the shoulder (to the
 * left): the opposite arm hooks ACROSS the outside of the raised knee while the
 * other arm sweeps behind the back to bind. The distinguishing feature: the
 * upright twisting torso with the arm hooked across the knee (versus A's fold).
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function MarichyasanaC({ size = 120, className }: PoseIconProps) {
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
      aria-label="Marichi's Pose C"
    >
      {/* Faint floor line the extended leg and planted foot rest along. */}
      <line x1="16" y1="92" x2="84" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Extended leg: flat along the floor to the flexed foot. */}
      <line x1="42" y1="88" x2="82" y2="88" />
      <line x1="82" y1="88" x2="82" y2="78" />

      {/* Bent leg: knee up tall, near-vertical shin from a flat foot near the hip. */}
      <path d="M42 88 L34 88 L37 52" />

      {/* Torso: stays UPRIGHT, rotating toward the bent knee. */}
      <line x1="42" y1="88" x2="45" y2="46" />

      {/* Head: turned back over the shoulder at the top of the twisting torso. */}
      <circle cx="41.5" cy="39.5" r="6.5" />

      {/* Twisting arm: hooks ACROSS the outside of the raised knee. */}
      <path d="M45 54 C34 52 28 58 32 64" />

      {/* Binding arm: sweeps behind the back to meet the other hand. */}
      <path d="M45 58 C57 62 55 80 40 80" />
    </svg>
  );
}

export default MarichyasanaC;
