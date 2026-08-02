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
 * Composition: a full backbend arched into a high dome. The hands press the floor
 * on the left and the feet press the floor on the right. The arms run almost
 * vertically up from the hands to the shoulders; from there the arched torso sweeps
 * up and over so the hips are the apex of the dome (set right of centre); the bent
 * legs then run down from the hips to the planted feet. The head hangs low between
 * the arms just inside the hands.
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
      <line x1="14" y1="90" x2="82" y2="90" strokeWidth={2} opacity={0.35} />

      {/* Arms: almost vertical from the hands on the floor (left) up to the
          shoulders. */}
      <line x1="22" y1="86" x2="28" y2="52" />

      {/* Big arched body: from the shoulders up and over the high dome to the
          raised hips, the apex set right of centre. */}
      <path d="M28 52 C40 18 66 22 72 58" />

      {/* Bent legs: thigh down and forward from the raised hips to the knee, then
          the shin drops to the feet planted on the floor (right). */}
      <path d="M72 58 L78 78 L76 86" />

      {/* Head: hangs low between the arms just inside the hands. */}
      <circle cx="34" cy="66" r="6.5" />
    </svg>
  );
}

export default UrdhvaDhanurasana;
