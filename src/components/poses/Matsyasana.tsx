/**
 * Matsyasana — Fish Pose, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: a supine chest-arch. Lying on the back with a backbend in the upper
 * spine so the chest lifts high and the CROWN of the head rests on the floor
 * (left). The legs are folded into lotus resting on the floor (right), a low
 * crossed knot the hands reach toward. The signature: the head tips back onto its
 * crown while the chest arches up off the ground.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function Matsyasana({ size = 120, className }: PoseIconProps) {
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
      aria-label="Fish pose"
    >
      {/* Faint floor line the crown, hips and folded legs rest on. */}
      <line x1="14" y1="88" x2="86" y2="88" strokeWidth={2} opacity={0.35} />

      {/* Arched upper body: the crown rests on the floor (left), the chest lifts
          high in an arch, then the torso slopes down to the hips on the floor. */}
      <path d="M28 82 C32 54 46 56 54 84" />

      {/* Lotus legs: a low crossed knot folded on the floor to the right of the
          hips. */}
      <line x1="54" y1="84" x2="82" y2="84" />
      <line x1="54" y1="84" x2="68" y2="76" />
      <line x1="82" y1="84" x2="68" y2="76" />

      {/* Head: tipped back so the crown rests on the floor at the top of the arch. */}
      <circle cx="24" cy="82" r="6.5" />
    </svg>
  );
}

export default Matsyasana;
