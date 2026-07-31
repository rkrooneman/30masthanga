/**
 * SuryaNamaskaraA — Sun Salutation A, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: the emblematic upward-salute of the flow (Urdhva Hastasana /
 * upward-hands mountain). A tall standing figure — both feet together on the
 * floor, legs straight and vertical, an upright torso — with both arms raised
 * straight overhead, palms toward each other, reaching to the sky.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function SuryaNamaskaraA({ size = 120, className }: PoseIconProps) {
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
      aria-label="Sun Salutation A pose"
    >
      {/* Faint floor line under the feet. */}
      <line x1="30" y1="92" x2="70" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Legs: straight and vertical, feet together, from hips to the floor. */}
      <line x1="46" y1="56" x2="44" y2="92" />
      <line x1="54" y1="56" x2="56" y2="92" />

      {/* Torso: upright from the hips to the shoulders. */}
      <line x1="50" y1="56" x2="50" y2="30" />

      {/* Arms: raised straight overhead, nearly parallel, palms toward each other. */}
      <line x1="50" y1="30" x2="43" y2="8" />
      <line x1="50" y1="30" x2="57" y2="8" />

      {/* Head: between the raised arms at the top of the torso. */}
      <circle cx="50" cy="23.5" r="6.5" />
    </svg>
  );
}

export default SuryaNamaskaraA;
