/**
 * Purvottanasana — Upward Plank Pose, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: a reverse plank — the front of the body faces up. The hands press
 * the floor behind the hips (down-left corner) and the feet reach the floor ahead
 * (right); between them the body lifts into one straight up-facing incline from
 * feet through hips to shoulders. The head drops gently back off the top of the
 * line, and the arm runs vertically down from the shoulders to the planted hand.
 * The signature: an upward-facing incline (opposite of a forward fold).
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function Purvottanasana({ size = 120, className }: PoseIconProps) {
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
      aria-label="Upward Plank Pose"
    >
      {/* Faint floor line under the planted hands and feet. */}
      <line x1="18" y1="92" x2="88" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Body: one straight up-facing incline from the shoulders down to the feet. */}
      <line x1="30" y1="52" x2="84" y2="88" />

      {/* Supporting arm: vertical from the shoulders down to the planted hand. */}
      <line x1="30" y1="52" x2="26" y2="88" />

      {/* Head: dropped gently back off the top of the incline. */}
      <circle cx="23.5" cy="47" r="6.5" />
    </svg>
  );
}

export default Purvottanasana;
