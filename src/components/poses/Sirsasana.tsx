/**
 * Sirsasana — Headstand, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: an inversion balanced at the bottom. The crown of the head rests on
 * the floor and the forearms brace it (a short base near the baseline); from there
 * the torso and straight legs rise vertically all the way UP to the feet near the
 * top. The mirror of the shoulderstand idea — here the balance point is the head
 * and forearms on the floor at the bottom.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function Sirsasana({ size = 120, className }: PoseIconProps) {
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
      aria-label="Headstand pose"
    >
      {/* Faint floor line the crown and forearms press into. */}
      <line x1="20" y1="92" x2="80" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Forearms: brace the head, angling in from the floor to the crown. */}
      <line x1="38" y1="88" x2="50" y2="80" />
      <line x1="62" y1="88" x2="50" y2="80" />

      {/* Torso + legs: rise straight up the centre from the crown to the lifted
          feet near the top. */}
      <line x1="50" y1="80" x2="50" y2="14" />

      {/* Small foot flick at the top. */}
      <path d="M50 14 L58 13" />

      {/* Head: crown resting on the floor at the base of the vertical body. */}
      <circle cx="50" cy="84" r="6.5" />
    </svg>
  );
}

export default Sirsasana;
