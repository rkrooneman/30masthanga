/**
 * MarichyasanaA — Marichi's Pose A, original stick-figure pose icon.
 *
 * Part of the ashtanga30 pose-icon system (see PosePilot.tsx for the shared
 * conventions). Our own original minimal stick figure — round head, single-stroke
 * limbs, no filled body — drawn from the pose's factual body geometry.
 *
 * Shared system: viewBox 0 0 100 100, stroke currentColor (caller sets colour),
 * strokeWidth 4, round caps/joins, head radius 6.5, implied floor at y = 92.
 *
 * Composition: seated side profile — a forward FOLD with a bind (not a twist).
 * One leg extends flat forward (to the right). The other knee is bent up TALL,
 * the foot planted flat on the floor close to the sitting bone (a vertical shin).
 * The torso folds forward over the extended leg alongside the tall shin, head
 * dropping low. The distinguishing feature: the same-side arm wraps AROUND the
 * front of the bent shin and the other arm reaches back, the two hands binding
 * behind the back (a stroke sweeping round the shin and behind the hip).
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function MarichyasanaA({ size = 120, className }: PoseIconProps) {
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
      aria-label="Marichi's Pose A"
    >
      {/* Faint floor line the extended leg and planted foot rest along. */}
      <line x1="16" y1="92" x2="86" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Extended leg: flat along the floor to the flexed foot. */}
      <line x1="34" y1="88" x2="82" y2="88" />
      <line x1="82" y1="88" x2="82" y2="80" />

      {/* Bent leg: knee up tall, vertical shin from a flat foot near the hip. */}
      <path d="M34 88 L26 88 L28 58" />

      {/* Torso: folds forward over the extended leg alongside the tall shin. */}
      <path d="M34 88 C36 66 46 60 58 62" />

      {/* Head: dropped low over the extended leg. */}
      <circle cx="64.5" cy="63" r="6.5" />

      {/* Binding: arm wraps round the front of the shin and behind the back to
          meet the other hand — the signature Marichi A bind. */}
      <path d="M40 64 C22 66 16 82 30 82" />
    </svg>
  );
}

export default MarichyasanaA;
