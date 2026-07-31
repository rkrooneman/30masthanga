/**
 * SuryaNamaskaraB — Sun Salutation B, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: the emblematic Utkatasana (chair) of the flow. A standing figure
 * sitting back — knees bent and driven forward, hips dropped low behind the
 * heels, the torso leaning slightly forward off the vertical — with both arms
 * raised straight overhead. The bent knees plus lifted arms mark it apart from
 * Sun Salutation A's tall upright salute.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function SuryaNamaskaraB({ size = 120, className }: PoseIconProps) {
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
      aria-label="Sun Salutation B pose"
    >
      {/* Faint floor line under the feet. */}
      <line x1="30" y1="92" x2="70" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Legs: knees bent and pushed forward, shins dropping back to the feet —
          the "sitting into a chair" bend. */}
      <path d="M48 60 L58 76 L46 92" />
      <path d="M52 60 L62 76 L54 92" />

      {/* Torso: leans slightly forward off the vertical from the hips. */}
      <line x1="50" y1="60" x2="44" y2="34" />

      {/* Arms: raised straight overhead in line with the leaning torso. */}
      <line x1="44" y1="34" x2="38" y2="12" />
      <line x1="44" y1="34" x2="50" y2="11" />

      {/* Head: between the raised arms at the top of the torso. */}
      <circle cx="42.5" cy="28" r="6.5" />
    </svg>
  );
}

export default SuryaNamaskaraB;
