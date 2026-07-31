/**
 * AdhoMukhaSvanasana — Downward-Facing Dog, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Every figure is our own original, minimal stick figure — round
 * head, single-stroke limbs, no filled body — drawn from the pose's factual body
 * geometry, NOT traced from any existing chart.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: an inverted "V". Hands press the floor front-left, feet press the
 * floor back-right, the hips lift high to the apex. Arms run up from the hands to
 * the hips (the apex), legs run down from the hips to the feet, and the head
 * hangs low between the arms near the hands.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function AdhoMukhaSvanasana({ size = 120, className }: PoseIconProps) {
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
      aria-label="Downward-Facing Dog pose"
    >
      {/* Faint floor line the hands and feet press into. */}
      <line x1="14" y1="92" x2="86" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Arms: from the hands on the floor (front) up to the lifted hips (apex). */}
      <path d="M22 88 L50 30" />
      {/* Legs: from the lifted hips (apex) down to the feet on the floor (back). */}
      <path d="M50 30 L78 88" />

      {/* Head: hangs low between the arms, near the hands. */}
      <circle cx="30.5" cy="72" r="6.5" />
    </svg>
  );
}

export default AdhoMukhaSvanasana;
