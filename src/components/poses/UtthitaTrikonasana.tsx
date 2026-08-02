/**
 * UtthitaTrikonasana — Extended Triangle, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: a wide-legged triangle, figure facing left. The legs plant wide on
 * the floor from the hips: the front (left) leg is near-vertical with the knee
 * stacked over the ankle, the back (right) leg rakes out long and straight. The
 * torso hinges at the hip out over the front leg down to the shoulder. From that
 * shoulder the bottom arm drops straight down to the floor outside the front foot
 * while the top arm reaches straight up — the two arms make one long vertical
 * line, the signature Triangle shape. The head sits at the shoulder, gaze up.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function UtthitaTrikonasana({ size = 120, className }: PoseIconProps) {
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
      aria-label="Extended Triangle pose"
    >
      {/* Faint floor line under both wide feet. */}
      <line x1="24" y1="92" x2="88" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Front (left) leg: near-vertical, knee stacked over the planted ankle. */}
      <line x1="56" y1="55" x2="31" y2="90" />
      {/* Back (right) leg: long and straight, raked out wide to the back foot. */}
      <line x1="56" y1="55" x2="86" y2="90" />

      {/* Torso: hinges at the hip out over the front leg down to the shoulder. */}
      <line x1="56" y1="55" x2="35" y2="63" />

      {/* Bottom arm: drops straight down to the floor outside the front foot. */}
      <line x1="35" y1="63" x2="29" y2="88" />
      {/* Top arm: reaches straight up, continuing the bottom arm's vertical line. */}
      <line x1="35" y1="63" x2="41" y2="22" />

      {/* Head: at the shoulder along the hinged torso line, gaze up. */}
      <circle cx="30.5" cy="59" r="6.5" />
    </svg>
  );
}

export default UtthitaTrikonasana;
