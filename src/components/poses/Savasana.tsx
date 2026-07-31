/**
 * Savasana — Corpse Pose, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: lying flat on the back along the floor. The body is a long
 * horizontal line resting on the baseline; the head rests at one end, the legs
 * extend along the floor and part into a very shallow V at the feet, and the arms
 * rest down ALONGSIDE the body, close in and nearly parallel to the torso. Calm,
 * flat, fully at rest — everything on the ground.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function Savasana({ size = 120, className }: PoseIconProps) {
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
      aria-label="Corpse Pose"
    >
      {/* Faint floor line the whole body rests on. */}
      <line x1="10" y1="88" x2="92" y2="88" strokeWidth={2} opacity={0.35} />

      {/* Torso: long horizontal line lying flat on the floor, shoulders to hips. */}
      <line x1="26" y1="84" x2="60" y2="84" />

      {/* Legs: extend along the floor, parting into a very shallow V at the feet. */}
      <path d="M60 84 L88 82" />
      <path d="M60 84 L88 86" />

      {/* Arms: from the shoulders, resting alongside the torso and nearly parallel
          to it, hands reaching toward the hips. Drawn just above and just below
          the torso line so they read as two arms lying close to the body. */}
      <path d="M32 84 L52 81.5" />
      <path d="M32 84 L52 86.5" />

      {/* Head: resting on the floor at the top end of the body. */}
      <circle cx="20.5" cy="84" r="6.5" />
    </svg>
  );
}

export default Savasana;
