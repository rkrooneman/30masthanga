/**
 * Virabhadrasana2 — Warrior II, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: a wide standing lunge seen face-on. The legs make a broad triangle
 * — the front (left) leg bends at the knee to roughly a right angle over a
 * vertical shin, the back (right) leg stays long and straight to the floor. The
 * torso rises vertically from the hips (upright, not leaning). The arms extend
 * straight out horizontally to both sides at shoulder height, and the head turns
 * to gaze out over the front (left) hand — the signature Warrior II line.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function Virabhadrasana2({ size = 120, className }: PoseIconProps) {
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
      aria-label="Warrior II pose"
    >
      {/* Faint floor line under both feet. */}
      <line x1="10" y1="92" x2="90" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Front (left) leg: bent knee at a right angle — thigh down-left from the
          hips, vertical shin to the planted front foot. */}
      <path d="M50 58 L26 74 L26 92" />
      {/* Back (right) leg: long and straight, raked out to the back foot. */}
      <path d="M50 58 L84 92" />

      {/* Torso: upright from the hips to the shoulders. */}
      <line x1="50" y1="58" x2="50" y2="36" />

      {/* Arms: extended straight out horizontally to both sides at shoulder
          height — the signature Warrior II span. */}
      <line x1="20" y1="36" x2="80" y2="36" />

      {/* Head: above the shoulders, gaze turned out over the front (left) hand. */}
      <circle cx="46" cy="23" r="6.5" />
    </svg>
  );
}

export default Virabhadrasana2;
