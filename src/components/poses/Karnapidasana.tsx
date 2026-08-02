/**
 * Karnapidasana — Ear-Pressure Pose, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: a compact, folded plough. Like Halasana the head and shoulders rest
 * on the floor (right) and the hips lift, but here the whole shape folds tight: the
 * thighs come over the head and the KNEES BEND down to the floor beside the ears,
 * while the shins fold back so the feet tuck up toward the hips — a small curled
 * ball. Distinguished from Halasana (straight legs to distant toes) by the sharply
 * bent knees pressed down beside the head.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function Karnapidasana({ size = 120, className }: PoseIconProps) {
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
      aria-label="Ear-Pressure pose"
    >
      {/* Faint floor line the shoulders, arm and knees rest along. */}
      <line x1="18" y1="88" x2="86" y2="88" strokeWidth={2} opacity={0.35} />

      {/* Torso: rises from the shoulders on the floor (right) up to the lifted
          hips near the top. */}
      <line x1="66" y1="84" x2="58" y2="34" />

      {/* Bent legs: thigh over the head from the hips down to the knees pressed on
          the floor beside the head, then the shin folds back so the foot tucks up
          toward the hips. */}
      <path d="M58 34 L44 82 L58 62" />

      {/* Arm: rests flat along the floor out past the shoulders to the right. */}
      <line x1="66" y1="84" x2="84" y2="84" />

      {/* Head: rests on the floor, hugged between the knees at the shoulder end. */}
      <circle cx="60" cy="82" r="6.5" />
    </svg>
  );
}

export default Karnapidasana;
