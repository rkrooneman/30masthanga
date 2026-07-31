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
 * Composition: a compact plough. Like Halasana the head and shoulders rest on the
 * floor (right) and the hips lift, but here the KNEES BEND down beside the ears —
 * the thighs come over the head and the shins fold back so the knees rest on the
 * floor right beside the head, hugging it. Distinguished from Halasana (straight
 * legs to distant feet) by the sharply bent knees tucked down beside the head.
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
      {/* Faint floor line the shoulders, arms and knees rest along. */}
      <line x1="12" y1="92" x2="88" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Torso: rises from the shoulders on the floor (right) up to the lifted
          hips near the top. */}
      <line x1="66" y1="88" x2="58" y2="34" />

      {/* Bent legs: thigh over the head from the hips down to the knee beside the
          head, then the shin folds back so the foot tucks up by the hip. */}
      <path d="M58 34 L60 84 L70 60" />

      {/* Arm: rests flat along the floor by the shoulders. */}
      <line x1="66" y1="88" x2="84" y2="88" />

      {/* Head: rests on the floor, hugged between the knees at the shoulder end. */}
      <circle cx="70.5" cy="86" r="6.5" />
    </svg>
  );
}

export default Karnapidasana;
