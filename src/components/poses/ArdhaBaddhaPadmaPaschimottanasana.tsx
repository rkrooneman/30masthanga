/**
 * ArdhaBaddhaPadmaPaschimottanasana — Half Bound Lotus Seated Forward Fold,
 * original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: seated side profile facing right, traced from the reference photo.
 * ONE leg extends flat forward (to the right) along the floor to the flexed foot.
 * The OTHER leg is drawn in as a half-lotus — a short bent shin whose foot rests
 * high on the opposite thigh (the small triangle near the hip). The torso folds
 * all the way down flat over the extended leg so the head drops close to the
 * shin, the front hand reaching the foot. The distinguishing feature: the binding
 * arm reaches BEHIND the back to catch the lifted lotus foot (a stroke curving
 * round behind the hip).
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function ArdhaBaddhaPadmaPaschimottanasana({ size = 120, className }: PoseIconProps) {
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
      aria-label="Half Bound Lotus Seated Forward Fold pose"
    >
      {/* Faint floor line the extended leg and seat rest along. */}
      <line x1="16" y1="92" x2="86" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Extended leg: flat along the floor to the flexed foot. */}
      <line x1="30" y1="88" x2="82" y2="88" />
      <line x1="82" y1="88" x2="82" y2="78" />

      {/* Half-lotus leg: short bent shin with the foot up on the opposite thigh. */}
      <path d="M30 88 L42 79 L32 74" />

      {/* Torso: folds all the way down flat over the extended leg. */}
      <path d="M30 88 C32 74 46 73 62 76" />

      {/* Front arm: reaches along the shin and clasps the flexed foot. */}
      <path d="M54 75 C66 75 76 80 82 84" />

      {/* Head: dropped low near the shin at the end of the fold. */}
      <circle cx="66.5" cy="78" r="6.5" />

      {/* Binding arm: curves behind the back to catch the lifted lotus foot. */}
      <path d="M34 76 C20 78 22 88 33 82" />
    </svg>
  );
}

export default ArdhaBaddhaPadmaPaschimottanasana;
