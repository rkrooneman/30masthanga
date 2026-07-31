/**
 * BaddhaKonasana — Bound Angle Pose, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: seated, a near-front feel. The soles of the feet press together at
 * the centre, drawn in close to the pelvis, and the knees drop out wide low to
 * both sides — the legs form a flat butterfly diamond along the floor. The torso
 * rises upright from the hips to the head, and the arms reach down to clasp the
 * feet at the centre. Symmetric: a low wide diamond of legs with feet joined.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function BaddhaKonasana({ size = 120, className }: PoseIconProps) {
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
      aria-label="Bound Angle Pose"
    >
      {/* Faint floor line the knees and feet rest along. */}
      <line x1="12" y1="92" x2="88" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Legs: butterfly diamond — thighs drop out wide to the knees, shins return
          to the joined feet at the centre. Left half. */}
      <path d="M50 74 L20 88 L50 84" />
      {/* Right half — mirror. */}
      <path d="M50 74 L80 88 L50 84" />

      {/* Torso: upright from the hips to the shoulders. */}
      <line x1="50" y1="74" x2="50" y2="40" />

      {/* Arms: reach down from the shoulders to clasp the joined feet at centre. */}
      <path d="M50 44 C40 60 44 82 50 84" />
      <path d="M50 44 C60 60 56 82 50 84" />

      {/* Head: above the shoulders at the top of the upright torso. */}
      <circle cx="50" cy="33.5" r="6.5" />
    </svg>
  );
}

export default BaddhaKonasana;
