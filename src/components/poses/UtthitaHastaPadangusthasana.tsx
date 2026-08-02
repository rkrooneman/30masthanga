/**
 * UtthitaHastaPadangusthasana — Extended Hand-to-Big-Toe, original stick-figure
 * pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: a tall one-legged balance, figure facing right. The standing
 * (left) leg is straight and vertical to the floor and the torso rises upright
 * above it. The other (right) leg extends straight out to the front, lifted to
 * about hip height, and the same-side hand reaches forward along it to hook the
 * big toe of the lifted foot. The free (left) arm bends with the hand planted on
 * the hip, steadying the balance.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function UtthitaHastaPadangusthasana({ size = 120, className }: PoseIconProps) {
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
      aria-label="Extended Hand-to-Big-Toe pose"
    >
      {/* Faint floor line under the single standing foot. */}
      <line x1="24" y1="92" x2="52" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Standing (left) leg: straight and vertical from the hips to the floor. */}
      <line x1="38" y1="52" x2="38" y2="92" />
      {/* Lifted (right) leg: straight out to the front, level at about hip
          height, to the raised foot. */}
      <line x1="38" y1="52" x2="84" y2="50" />

      {/* Torso: upright from the hips to the shoulders. */}
      <line x1="38" y1="52" x2="40" y2="28" />

      {/* Reaching (right) arm: from the shoulder forward along the lifted leg to
          hook the big toe of the raised foot. */}
      <line x1="40" y1="31" x2="82" y2="49" />
      {/* Free (left) arm: bends with the hand planted on the hip. */}
      <path d="M40 31 L31 42 L37 51" />

      {/* Head: above the shoulders at the top of the upright torso. */}
      <circle cx="40.5" cy="21.5" r="6.5" />
    </svg>
  );
}

export default UtthitaHastaPadangusthasana;
