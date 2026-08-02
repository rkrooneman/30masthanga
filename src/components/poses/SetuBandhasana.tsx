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
 * Composition: the primary-series bridge, traced from the reference photo — a
 * backbend arching onto the CROWN of the head. The head presses into the floor at
 * the left and the neck arches; from there the chest and hips lift high off the
 * ground into a smooth arch that runs down the near-straight legs to the feet
 * planted on the floor at the right. The arm crosses over the lifted chest (hands
 * to the shoulders, not on the floor). The signature: crown-down neck arch with a
 * high open chest anchored between head and feet.
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
      {/* Faint floor line the crown of the head and the feet press into. */}
      <line x1="12" y1="92" x2="88" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Neck/torso: from the crown on the floor the neck arches up and the chest
          and hips lift high into a smooth arch. */}
      <path d="M28 84 C34 54 52 52 66 58" />

      {/* Legs: near-straight from the lifted hips down to the feet planted on the
          floor at the right, with a small flexed foot. */}
      <path d="M66 58 L84 84" />
      <line x1="84" y1="84" x2="78" y2="80" />

      {/* Arm: crosses over the lifted chest, hand up toward the shoulder. */}
      <path d="M40 66 C48 66 52 62 52 56" />

      {/* Head: pressing into the floor on its crown at the left end. */}
      <circle cx="24.5" cy="84" r="6.5" />
    </svg>
  );
}

export default SetuBandhasana;
