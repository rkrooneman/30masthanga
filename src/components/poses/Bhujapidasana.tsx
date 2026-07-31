/**
 * Bhujapidasana — Shoulder-Pressing Pose, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: an arm balance. Two arms drop as near-vertical supports from the
 * lifted body down to the hands planted on the floor. The hips are lifted between
 * the hands; the legs thread forward AROUND the upper arms and cross at the ankles
 * out in front, all held off the ground. The head tips forward at the top.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function Bhujapidasana({ size = 120, className }: PoseIconProps) {
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
      aria-label="Shoulder-Pressing Pose pose"
    >
      {/* Faint floor line the hands press into. */}
      <line x1="24" y1="92" x2="76" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Two arms: near-vertical supports from the lifted shoulders down to the
          hands planted on the floor. */}
      <line x1="38" y1="46" x2="34" y2="88" />
      <line x1="60" y1="46" x2="64" y2="88" />

      {/* Shoulders/hips bundle: short bar linking the tops of the arms, the lifted
          seat balanced between the hands. */}
      <line x1="38" y1="46" x2="60" y2="46" />

      {/* Legs thread forward around the upper arms and cross at the ankles out in
          front, lifted off the floor. */}
      <path d="M40 52 C30 58 34 66 50 64" />
      <path d="M58 52 C68 58 64 66 48 64" />

      {/* Head: tips forward at the top of the shoulder bundle. */}
      <circle cx="49" cy="38" r="6.5" />
    </svg>
  );
}

export default Bhujapidasana;
