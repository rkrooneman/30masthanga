/**
 * SuptaKurmasana — Sleeping Tortoise Pose, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: the fully BOUND version of the tortoise, traced from the reference
 * photo — far more folded than Kurmasana and hugging the floor. The figure is a
 * compact low bundle: the head and chest press right down to the floor at the
 * front, the two legs cross OVER one another BEHIND the neck (an X of shins whose
 * crossed feet rise at the back), and the arms bind together low BEHIND the back.
 * Tightly knotted and closed, flat to the ground, rather than splayed wide.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function SuptaKurmasana({ size = 120, className }: PoseIconProps) {
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
      aria-label="Sleeping Tortoise Pose pose"
    >
      {/* Faint floor line under the compact bundle. */}
      <line x1="18" y1="92" x2="82" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Head: pressed right down to the floor at the front of the bundle. */}
      <circle cx="30" cy="85.5" r="6.5" />

      {/* Neck/back: low flat rise from the head into the folded bundle. */}
      <path d="M36 85 C48 82 56 82 64 84" />

      {/* Legs cross OVER one another behind the neck — an X of shins whose crossed
          feet rise at the back, the signature bind. */}
      <line x1="44" y1="84" x2="76" y2="66" />
      <line x1="46" y1="66" x2="72" y2="84" />

      {/* Arms bound together low BEHIND the back, knotting the bundle closed. */}
      <path d="M40 86 C30 90 30 82 38 80" />
    </svg>
  );
}

export default SuptaKurmasana;
