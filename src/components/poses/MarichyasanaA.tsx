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
 * Composition: seated side profile facing right, traced from the reference photo —
 * a deep forward FOLD with a bind (not a twist). One leg extends flat forward (to
 * the right) to the flexed foot. The other knee is bent up TALL, the foot planted
 * flat on the floor close to the sitting bone (a near-vertical shin). The torso
 * folds all the way down flat over the extended leg alongside the tall shin, the
 * head dropping low toward the foot. The distinguishing feature: the same-side arm
 * wraps AROUND the front of the bent shin and the other arm reaches back, the two
 * hands binding behind the back (a stroke sweeping round the shin and behind the
 * hip).
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
      <line x1="14" y1="92" x2="84" y2="92" strokeWidth={2} opacity={0.35} />

      {/* Extended leg: flat along the floor to the flexed foot. */}
      <line x1="34" y1="88" x2="80" y2="88" />
      <line x1="80" y1="88" x2="80" y2="78" />

      {/* Bent leg: knee up tall, near-vertical shin from a flat foot near the hip. */}
      <path d="M34 88 L27 88 L30 56" />

      {/* Torso: folds all the way down flat over the extended leg past the shin. */}
      <path d="M34 88 C36 72 50 71 62 74" />

      {/* Front arm: reaches past the shin along the leg toward the flexed foot. */}
      <path d="M56 73 C66 74 74 79 80 84" />

      {/* Head: dropped low over the extended leg toward the foot. */}
      <circle cx="66.5" cy="76" r="6.5" />

      {/* Binding: arm wraps round the front of the shin and behind the back to
          meet the other hand — the signature Marichi A bind. */}
      <path d="M32 74 C20 74 16 86 30 84" />
    </svg>
  );
}

export default MarichyasanaA;
