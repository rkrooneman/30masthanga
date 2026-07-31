/**
 * UrdhvaDhanurasana — Upward Bow / Wheel, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: a full backbend arched into a dome. The hands press the floor on
 * the left and the feet press the floor on the right; between them the whole body
 * arches high toward the ceiling so the belly is the apex of a big dome. Arms run
 * up from the hands to the shoulders, the arched torso sweeps over the top, the
 * bent legs run down to the feet, and the head hangs low between the arms.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function UrdhvaDhanurasana({ size = 120, className }: PoseIconProps) {
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
      aria-label="Upward Bow pose"
    >
      {/* Faint floor line the hands and feet press into. */}
      <line x1="12" y1="92" x2="88" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Big arched body: from the shoulders (over the hands) up and over the
          high dome to the raised hips (over the feet). */}
      <path d="M26 76 C34 24 66 24 74 66" />

      {/* Arms: straight down from the shoulders to the hands on the floor. */}
      <line x1="26" y1="76" x2="22" y2="88" />

      {/* Bent legs: thigh down from the raised hips, shin to the feet planted on
          the floor. */}
      <path d="M74 66 L80 80 L78 88" />

      {/* Head: hangs low between the arms near the hands. */}
      <circle cx="33.5" cy="80" r="6.5" />
    </svg>
  );
}

export default UrdhvaDhanurasana;
