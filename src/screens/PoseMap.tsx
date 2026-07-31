/**
 * PoseMap — the Overview MAP landing (a scannable grid of the whole practice).
 *
 * Replaces the carousel as the FIRST thing the practitioner sees. The generated
 * practice is laid out as a grid of pose thumbnails, grouped into the familiar
 * Primary Series sections (Sun Salutations / Standing / Seated / Closing /
 * Rest). Tapping a thumbnail opens the DETAIL carousel (PoseCarousel) at that
 * pose's index. A persistent "Start practice" button advances to the guided run.
 *
 * Grouping: poses arrive in canonical `order`, and each catalog category sits in
 * a contiguous canonical block, so mapping each pose's `category` to a display
 * section and grouping CONSECUTIVE poses by that mapped section preserves order
 * both within and across sections. Only sections with ≥1 pose are rendered.
 *
 * Section time: computed as the sum of `poseHoldSeconds` for the section's poses
 * plus one `TRANSITION_SECONDS` gap between each consecutive pair within the
 * section — i.e. `sum(hold) + (count - 1) * TRANSITION_SECONDS`. This mirrors
 * the app's own `sequenceDurationSeconds` model applied to the section in
 * isolation (it deliberately ignores the single cross-section transition, so the
 * per-section figures are a calm approximation, not a strict partition of the
 * grand total).
 */

import type { GeneratedPractice } from '../lib/generatePractice';
import type { Pose, PoseCategory } from '../types/pose';
import { formatDuration, poseHoldSeconds, TRANSITION_SECONDS } from '../lib/timing';
import PoseGraphic from '../components/PoseGraphic';

/** Icon size (px) for each thumbnail. */
const THUMB_ICON_SIZE = 72;

/** The display sections, in canonical order, and which categories feed each. */
const SECTIONS: ReadonlyArray<{
  title: string;
  categories: readonly PoseCategory[];
}> = [
  { title: 'Sun Salutations', categories: ['sun_a', 'sun_b'] },
  { title: 'Standing', categories: ['standing'] },
  { title: 'Seated', categories: ['seated'] },
  { title: 'Closing', categories: ['closing'] },
  { title: 'Rest', categories: ['finishing'] },
];

interface PoseMapProps {
  /** The generated practice to lay out. */
  practice: GeneratedPractice;
  /** The breath pace this practice was generated at (drives section times). */
  breathSeconds: number;
  /** Open the DETAIL carousel at the given absolute practice index. */
  onOpenPose: (index: number) => void;
  /** Return to the Home screen. */
  onBack: () => void;
  /** Advance to the Guided screen. */
  onStartGuided: () => void;
  /** Generate a fresh practice at the same breath pace. */
  onRegenerate: () => void;
}

/** A pose paired with its absolute index in the full practice sequence. */
interface IndexedPose {
  pose: Pose;
  index: number;
}

/**
 * Per-section time (whole seconds): sum of hold times plus one transition gap
 * between each consecutive pair within the section. Empty section = 0s.
 */
function sectionSeconds(items: IndexedPose[], breathSeconds: number): number {
  if (items.length === 0) return 0;
  let total = 0;
  for (const { pose } of items) {
    total += poseHoldSeconds(pose, breathSeconds);
  }
  total += (items.length - 1) * TRANSITION_SECONDS;
  return total;
}

/** The corner badge for a thumbnail, or null when none applies. */
function badgeFor(pose: Pose): string | null {
  // Prefer the repeat badge when a pose has both (rare/none currently).
  if (pose.repeat > 1) return `×${pose.repeat}`;
  if (pose.sides === 2) return '×2';
  return null;
}

function PoseMap({
  practice,
  breathSeconds,
  onOpenPose,
  onBack,
  onStartGuided,
  onRegenerate,
}: PoseMapProps) {
  const { poses, totalSeconds } = practice;
  const count = poses.length;

  // Pair each pose with its absolute index up-front so grouping/filtering never
  // loses the index the carousel needs to open at.
  const indexed: IndexedPose[] = poses.map((pose, index) => ({ pose, index }));

  return (
    <section className="screen overview pose-map">
      <header className="overview__header">
        <button
          type="button"
          className="button button--ghost overview__back"
          onClick={onBack}
          aria-label="Back to home"
        >
          &larr;
        </button>
        <p className="overview__summary">
          {count} poses &middot; {formatDuration(totalSeconds)}
        </p>
      </header>

      <div className="pose-map__sections">
        {SECTIONS.map((section) => {
          const items = indexed.filter(({ pose }) =>
            section.categories.includes(pose.category),
          );
          if (items.length === 0) return null;

          const seconds = sectionSeconds(items, breathSeconds);
          const poseLabel = items.length === 1 ? 'pose' : 'poses';

          return (
            <section key={section.title} className="pose-map__section">
              <h2 className="pose-map__section-header">
                {section.title} &middot; {items.length} {poseLabel} &middot;{' '}
                {formatDuration(seconds)}
              </h2>

              <ul className="pose-map__grid">
                {items.map(({ pose, index }) => {
                  const badge = badgeFor(pose);
                  return (
                    <li key={pose.id} className="pose-map__cell">
                      <button
                        type="button"
                        className="pose-map__thumb"
                        onClick={() => onOpenPose(index)}
                        aria-label={`Open pose ${index + 1}: ${pose.english}`}
                      >
                        <span className="pose-map__figure">
                          <PoseGraphic
                            poseId={pose.id}
                            name={pose.english}
                            category={pose.category}
                            size={THUMB_ICON_SIZE}
                          />
                          {badge && (
                            <span className="pose-map__badge">{badge}</span>
                          )}
                        </span>
                        <span className="pose-map__name">{pose.english}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      <div className="pose-map__actions">
        <button
          type="button"
          className="button button--ghost pose-map__regenerate"
          onClick={onRegenerate}
          aria-label="Generate a different practice"
        >
          &#8635; New sequence
        </button>
        <button
          type="button"
          className="button button--primary pose-map__start"
          onClick={onStartGuided}
        >
          Start practice
        </button>
      </div>
    </section>
  );
}

export default PoseMap;
