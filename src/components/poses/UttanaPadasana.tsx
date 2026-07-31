/**
 * UttanaPadasana — Extended Leg Pose, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: the same crown-down chest-arch as Matsyasana, but with BOTH legs
 * lifted straight off the floor at a diagonal AND both arms reaching parallel to
 * them at the same angle. The crown rests on the floor (left), the chest arches
 * up, and legs + arms shoot up-forward together on one diagonal. Distinguished
 * from Matsyasana (legs flat on floor) by the lifted, parallel legs and arms.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function UttanaPadasana({ size = 120, className }: PoseIconProps) {
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
      aria-label="Extended Leg pose"
    >
      {/* Faint floor line the crown and hips rest on. */}
      <line x1="12" y1="92" x2="88" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Arched upper body: crown on the floor (left), chest lifts in an arch to
          the hips resting on the floor. */}
      <path d="M28 86 C30 60 42 60 48 88" />

      {/* Legs: both lifted straight off the floor at a forward-up diagonal from the
          hips. */}
      <line x1="48" y1="88" x2="86" y2="52" />

      {/* Arms: reach parallel to the legs at the same diagonal from the chest. */}
      <line x1="36" y1="66" x2="72" y2="42" />

      {/* Head: tipped back so the crown rests on the floor at the top of the arch. */}
      <circle cx="24.5" cy="80" r="6.5" />
    </svg>
  );
}

export default UttanaPadasana;
