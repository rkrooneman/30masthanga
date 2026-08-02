/**
 * VirabhadrasanaA — Warrior I, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: a wide standing lunge, figure facing right, hips squared over the
 * front leg. The front (right) leg bends at the knee to roughly a right angle
 * over a vertical shin; the back (left) leg stays long and straight, raked back
 * to the floor. The torso rises upright from the hips and BOTH arms sweep
 * straight up overhead, reaching high and nearly parallel — the raised arms
 * distinguishing Warrior I from Warrior II's horizontal reach.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function VirabhadrasanaA({ size = 120, className }: PoseIconProps) {
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
      aria-label="Warrior I pose"
    >
      {/* Faint floor line under both feet. */}
      <line x1="12" y1="92" x2="88" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Front (right) leg: bent knee at a right angle — thigh down-right from the
          hips, vertical shin to the planted front foot. */}
      <path d="M50 56 L74 74 L74 92" />
      {/* Back (left) leg: long and straight, raked back to the back foot. */}
      <line x1="50" y1="56" x2="14" y2="92" />

      {/* Torso: upright from the hips to the shoulders. */}
      <line x1="50" y1="56" x2="50" y2="32" />

      {/* Arms: both sweep straight up overhead, nearly parallel, reaching high. */}
      <line x1="50" y1="32" x2="46" y2="9" />
      <line x1="50" y1="32" x2="54" y2="9" />

      {/* Head: between the raised arms at the top of the torso. */}
      <circle cx="50" cy="25.5" r="6.5" />
    </svg>
  );
}

export default VirabhadrasanaA;
