/**
 * Utkatasana — Fierce Pose / Chair Pose, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: standing with the feet together on the floor and the knees bent
 * as if sitting back into a chair, figure facing right. The shins stay near
 * vertical while the hips drop back and down and the thighs angle down-and-back.
 * The torso leans slightly forward from the hips and both arms reach up overhead
 * in one long line, angled a touch forward past vertical. Distinct from the
 * Warriors (which have a wide split stance): here the feet are together and the
 * silhouette is a compact "seated-in-the-air" shape.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function Utkatasana({ size = 120, className }: PoseIconProps) {
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
      aria-label="Fierce Pose / Chair Pose"
    >
      {/* Faint floor line under the feet. */}
      <line x1="36" y1="92" x2="60" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Legs: feet together on the floor, near-vertical shins up to the bent
          knees, then thighs angling back to the hips dropped down-and-back (the
          "sitting into a chair" shape). Drawn as two nearly-overlapping legs. */}
      <path d="M46 92 L47 66 L58 58" />
      <path d="M52 92 L53 66 L58 58" />

      {/* Torso: from the hips leaning slightly forward and up to the shoulders. */}
      <line x1="58" y1="58" x2="52" y2="32" />

      {/* Arms: both reaching up overhead, angled a touch forward past vertical,
          continuing the torso line. */}
      <path d="M52 32 L47 12" />
      <path d="M52 32 L53 12" />

      {/* Head: at the top of the torso, in front of the raised arms. */}
      <circle cx="55.5" cy="28" r="6.5" />
    </svg>
  );
}

export default Utkatasana;
