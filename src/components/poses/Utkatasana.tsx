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
 * as if sitting back into a chair — the hips drop back and down while the shins
 * stay near vertical. The torso leans slightly forward from the hips, and both
 * arms reach straight up overhead in line with the torso. Distinct from the
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
      <line x1="20" y1="92" x2="80" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Legs: feet together on the floor, near-vertical shins up to the bent
          knees, then thighs angling back to the hips dropped down-and-back (the
          "sitting into a chair" shape). Drawn as two nearly-overlapping legs. */}
      <path d="M44 92 L44 68 L52 56" />
      <path d="M56 92 L56 68 L52 56" />

      {/* Torso: from the hips leaning slightly forward and up to the shoulders. */}
      <line x1="52" y1="56" x2="48" y2="34" />

      {/* Arms: both reaching straight up overhead, continuing the torso line. */}
      <path d="M48 34 L44 16" />
      <path d="M48 34 L52 16" />

      {/* Head: at the top of the torso, between the raised arms. */}
      <circle cx="47.5" cy="27" r="6.5" />
    </svg>
  );
}

export default Utkatasana;
