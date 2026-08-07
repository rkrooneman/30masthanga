/**
 * PoseMap — the Overview MAP landing (a scannable, EDITABLE grid of the whole
 * catalog).
 *
 * The practice is a user-editable SELECTION over the full catalog. This map
 * lays out EVERY pose grouped into the familiar Primary Series sections (Sun
 * Salutations / Standing / Seated / Closing / Rest). Each pose card carries a
 * CHECKBOX toggling it in/out of the practice:
 *   - SELECTED poses render normally;
 *   - UNSELECTED poses render DIMMED (`pose-map__cell--inactive`) — clearly an
 *     inactive state;
 *   - FIXED-FRAME poses (`alwaysInclude`: Sun Salutations, Shoulderstand,
 *     Savasana) render with the checkbox checked AND disabled (locked) so the
 *     practitioner can never build an unsafe practice.
 * Tapping a card's body still opens the DETAIL carousel (PoseCarousel) at that
 * pose's catalog index; the checkbox is a SEPARATE, sibling tap target (not
 * nested in the open button, which would be invalid HTML). A persistent "Start
 * practice" button advances to the guided run.
 *
 * Grouping: the catalog is in canonical `order`, and each category sits in a
 * contiguous canonical block, so mapping each pose's `category` to a display
 * section and grouping poses by that mapped section preserves order both within
 * and across sections. Only sections with ≥1 pose are rendered.
 *
 * Per-section counts/times reflect the CURRENTLY SELECTED poses in that section
 * (shown as "selected-of-total" poses), and update live as checkboxes change.
 * Section time is the sum of `poseHoldSeconds` for the section's SELECTED poses
 * plus one in-section transition gap between each consecutive selected pair —
 * i.e. `sum(hold) + (selectedCount - 1) * TRANSITION_SIMILAR_SECONDS`. This
 * mirrors the app's `sequenceDurationSeconds` model applied to the section in
 * isolation (a calm approximation, not a strict partition of the grand total).
 *
 * The grand total at the bottom (`.pose-map__total`) comes straight from the
 * derived practice, so it is honest even past 30:00 (no cap, no warning).
 */

import type { GeneratedPractice } from '../lib/generatePractice';
import { poses as catalog } from '../data/poses';
import type { Pose, PoseCategory } from '../types/pose';
import {
  formatDuration,
  poseHoldSeconds,
  TRANSITION_SIMILAR_SECONDS,
} from '../lib/timing';
import PoseGraphic from '../components/PoseGraphic';
import { BackArrow } from '../components/icons/NavArrow';

/** The full catalog in canonical order — the grid renders every pose. */
const CATALOG_IN_ORDER = catalog.slice().sort((a, b) => a.order - b.order);

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
  /** The DERIVED practice (selected poses in order + total) for the grand total. */
  practice: GeneratedPractice;
  /** The breath pace this practice was generated at (drives section times). */
  breathSeconds: number;
  /** The set of currently-selected pose ids (drives checked/dimmed state). */
  selectedIds: ReadonlySet<string>;
  /** Toggle a pose in/out of the selection (parent guards the fixed frame). */
  onToggleSelected: (poseId: string) => void;
  /** Open the DETAIL carousel at the given absolute catalog index. */
  onOpenPose: (index: number) => void;
  /** Return to the Home screen. */
  onBack: () => void;
  /** Advance to the Guided screen. */
  onStartGuided: () => void;
  /** Wipe the selection and generate a fresh <=30-min set (New sequence). */
  onRegenerate: () => void;
  /**
   * When true, the sections grid replays a quiet cross-fade on mount — used to
   * acknowledge a freshly regenerated practice. False on the initial landing so
   * the first paint is still. The parent remounts PoseMap (via a changing key)
   * on each regenerate, so the fade replays cleanly every time, including twice
   * in a row.
   */
  animateRefresh?: boolean;
  /** Whether "Basics only" (Smart Start) mode is active (drives the switch). */
  basicsOnly: boolean;
  /** Toggle "Basics only" mode (parent persists + regenerates). */
  onToggleBasics: (next: boolean) => void;
  /** Whether "Full series" mode is active (drives the switch). */
  fullSeries: boolean;
  /** Toggle "Full series" mode (parent persists + selects all / regenerates). */
  onToggleFullSeries: (next: boolean) => void;
  /** Whether "Vinyasas" mode is active (drives the switch). */
  vinyasas: boolean;
  /** Toggle "Vinyasas" mode (parent persists + regenerates for the new budget). */
  onToggleVinyasas: (next: boolean) => void;
}

/** A pose paired with its absolute index in the full catalog. */
interface IndexedPose {
  pose: Pose;
  index: number;
}

/**
 * Per-section time (whole seconds) for the SELECTED poses in a section: sum of
 * their hold times plus one in-section transition gap between each consecutive
 * selected pair. No selected poses = 0s.
 */
function sectionSeconds(
  items: IndexedPose[],
  selectedIds: ReadonlySet<string>,
  breathSeconds: number,
): number {
  const selected = items.filter(({ pose }) => selectedIds.has(pose.id));
  if (selected.length === 0) return 0;
  let total = 0;
  for (const { pose } of selected) {
    total += poseHoldSeconds(pose, breathSeconds);
  }
  total += (selected.length - 1) * TRANSITION_SIMILAR_SECONDS;
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
  selectedIds,
  onToggleSelected,
  onOpenPose,
  onBack,
  onStartGuided,
  onRegenerate,
  animateRefresh = false,
  basicsOnly,
  onToggleBasics,
  fullSeries,
  onToggleFullSeries,
  vinyasas,
  onToggleVinyasas,
}: PoseMapProps) {
  // The grand total comes from the DERIVED practice (selected poses only), so it
  // is honest even past 30:00 — no cap, no warning.
  const { totalSeconds } = practice;
  const selectedCount = practice.poses.length;

  // Pair each catalog pose with its absolute index up-front so grouping never
  // loses the index the carousel needs to open at.
  const indexed: IndexedPose[] = CATALOG_IN_ORDER.map((pose, index) => ({
    pose,
    index,
  }));

  return (
    <section className="screen overview pose-map">
      <header className="overview__header">
        <button
          type="button"
          className="button--icon button--icon-ghost overview__back"
          onClick={onBack}
          aria-label="Back to home"
        >
          <BackArrow className="overview__back-icon" />
        </button>
        <p className="overview__summary">
          {selectedCount} poses &middot; {formatDuration(totalSeconds)}
        </p>
      </header>

      <div className="basics-toggle">
        <label className="basics-toggle__label" htmlFor="basics-only-switch">
          <span className="basics-toggle__text">Basics only</span>
          <input
            type="checkbox"
            id="basics-only-switch"
            className="basics-toggle__input"
            checked={basicsOnly}
            onChange={(e) => onToggleBasics(e.target.checked)}
          />
          <span className="basics-toggle__track" aria-hidden="true">
            <span className="basics-toggle__thumb" />
          </span>
        </label>
        <p className="basics-toggle__hint">
          A shorter practice of the essential root poses.
        </p>
      </div>

      <div className="basics-toggle pose-map__full-series-toggle">
        <label className="basics-toggle__label" htmlFor="full-series-switch">
          <span className="basics-toggle__text">Full series</span>
          <input
            type="checkbox"
            id="full-series-switch"
            className="basics-toggle__input"
            checked={fullSeries}
            onChange={(e) => onToggleFullSeries(e.target.checked)}
          />
          <span className="basics-toggle__track" aria-hidden="true">
            <span className="basics-toggle__thumb" />
          </span>
        </label>
        <p className="basics-toggle__hint">
          Select every pose. Uncheck any you want to skip.
        </p>
      </div>

      {/*
        Vinyasas is ORTHOGONAL to Basics / Full series (it can combine with
        either): it inserts a half-vinyasa between consecutive seated poses and
        is budgeted into the 30-minute generation, so turning it on selects
        slightly fewer seated poses. Reuses the shared `.basics-toggle*` styling.
      */}
      <div className="basics-toggle pose-map__vinyasas-toggle">
        <label className="basics-toggle__label" htmlFor="vinyasas-switch">
          <span className="basics-toggle__text">Vinyasas</span>
          <input
            type="checkbox"
            id="vinyasas-switch"
            className="basics-toggle__input"
            checked={vinyasas}
            onChange={(e) => onToggleVinyasas(e.target.checked)}
          />
          <span className="basics-toggle__track" aria-hidden="true">
            <span className="basics-toggle__thumb" />
          </span>
        </label>
        <p className="basics-toggle__hint">
          Adds a half-vinyasa between seated poses.
        </p>
      </div>

      {/* Divides the settings toggles from the practice content below. */}
      <hr className="overview__divider" />

      <div
        className={
          animateRefresh
            ? 'pose-map__sections pose-map__sections--refreshed'
            : 'pose-map__sections'
        }
      >
        {SECTIONS.map((section) => {
          const items = indexed.filter(({ pose }) =>
            section.categories.includes(pose.category),
          );
          if (items.length === 0) return null;

          const seconds = sectionSeconds(items, selectedIds, breathSeconds);
          const sectionSelected = items.filter(({ pose }) =>
            selectedIds.has(pose.id),
          ).length;

          return (
            <section key={section.title} className="pose-map__section">
              <h2 className="pose-map__section-header">
                {section.title} &middot; {sectionSelected}/{items.length} poses
                &middot; {formatDuration(seconds)}
              </h2>

              <ul className="pose-map__grid">
                {items.map(({ pose, index }) => {
                  const badge = badgeFor(pose);
                  const isSelected = selectedIds.has(pose.id);
                  // Fixed-frame poses are always included and can never be
                  // unchecked: checked + disabled (locked).
                  const isFixed = pose.alwaysInclude;
                  const checkboxId = `pose-select-${pose.id}`;
                  return (
                    <li
                      key={pose.id}
                      className={
                        isSelected
                          ? 'pose-map__cell'
                          : 'pose-map__cell pose-map__cell--inactive'
                      }
                    >
                      <button
                        type="button"
                        className="pose-map__thumb"
                        onClick={() => onOpenPose(index)}
                        aria-label={`Open pose ${index + 1}: ${pose.sanskrit}`}
                      >
                        <span className="pose-map__figure">
                          <PoseGraphic
                            poseId={pose.id}
                            name={pose.sanskrit}
                            category={pose.category}
                            size={THUMB_ICON_SIZE}
                          />
                          {badge && (
                            <span className="pose-map__badge">{badge}</span>
                          )}
                        </span>
                        <span className="pose-map__name">{pose.sanskrit}</span>
                      </button>
                      {/*
                        The checkbox is a SIBLING of the open button (not nested
                        inside it — a button may not contain a labelled
                        checkbox), so opening the card and toggling selection are
                        distinct tap targets. Fixed-frame poses are locked.
                      */}
                      <label
                        className="pose-map__select"
                        htmlFor={checkboxId}
                        title={
                          isFixed
                            ? 'Always included — cannot be removed'
                            : undefined
                        }
                      >
                        <input
                          type="checkbox"
                          id={checkboxId}
                          className="pose-map__select-input"
                          checked={isSelected}
                          disabled={isFixed}
                          onChange={() => onToggleSelected(pose.id)}
                          aria-label={
                            isFixed
                              ? `${pose.sanskrit} (always included)`
                              : `Include ${pose.sanskrit}`
                          }
                        />
                        <span
                          className="pose-map__select-box"
                          aria-hidden="true"
                        />
                      </label>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}

        <p className="pose-map__total">
          Total &middot; {selectedCount} poses &middot;{' '}
          {formatDuration(totalSeconds)}
        </p>
      </div>

      <div className="pose-map__actions">
        <button
          type="button"
          className="button button--outline pose-map__regenerate"
          onClick={onRegenerate}
          disabled={basicsOnly}
          aria-label={
            basicsOnly
              ? 'New sequence is unavailable in Basics only, which always uses the same essential poses'
              : 'Generate a different practice'
          }
          title={
            basicsOnly
              ? 'Basics only always uses the same essential poses'
              : undefined
          }
        >
          <span aria-hidden="true">&#8635;</span> New sequence
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
