/**
 * SetuBandhasana — Bridge Pose, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: lying on the back with the hips lifted — a bridge. The shoulders
 * and head rest on the floor at the left; the feet are planted flat on the floor
 * at the right with the knees bent up. Between them the torso lifts up off the
 * ground so the underside arches high from the shoulders to the raised hips and
 * back down the shins to the feet. The arms rest flat along the floor by the
 * shoulders. The signature: a high arched underside anchored at both ends.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function SetuBandhasana({ size = 120, className }: PoseIconProps) {
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
      aria-label="Bridge Pose"
    >
      {/* Faint floor line the shoulders, arms and feet rest along. */}
      <line x1="12" y1="92" x2="88" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Torso: lifts off the floor from the shoulders up to the raised hips. */}
      <path d="M28 88 C36 62 54 58 66 60" />

      {/* Bent legs: thigh down from the raised hips to the knees, vertical shins
          to feet planted flat on the floor. */}
      <path d="M66 60 L72 78 L72 88" />

      {/* Arm: rests flat along the floor by the shoulders. */}
      <line x1="28" y1="88" x2="46" y2="88" />

      {/* Head: resting on the floor at the shoulder end. */}
      <circle cx="20.5" cy="86" r="6.5" />
    </svg>
  );
}

export default SetuBandhasana;
