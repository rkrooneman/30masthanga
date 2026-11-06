/**
 * CatalogScreen - read-only in-app pose catalog.
 *
 * This is separate from PoseMap on purpose: PoseMap is the editable practice
 * planner, with steering toggles, selection checkboxes, and paywall affordances.
 * The catalog is free and read-only, so it renders a calm grouped grid that only
 * opens pose detail cards.
 */

import { useMemo, useState } from 'react';
import { poses as catalog } from '../data/poses';
import type { Pose, PoseCategory } from '../types/pose';
import PoseGraphic from '../components/PoseGraphic';
import { BackArrow } from '../components/icons/NavArrow';
import {
  formatPoseDurationContext,
  sectionLabelForPose,
} from '../lib/poseContext';
import PoseCarousel from './PoseCarousel';

const CATALOG_IN_ORDER = catalog.slice().sort((a, b) => a.order - b.order);

const THUMB_ICON_SIZE = 72;

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

type FilterId =
  | 'all'
  | 'foundation'
  | 'sun_salutations'
  | 'standing'
  | 'seated'
  | 'closing'
  | 'rest';

const FILTERS: ReadonlyArray<{
  id: FilterId;
  label: string;
  categories?: readonly PoseCategory[];
}> = [
  { id: 'all', label: 'All' },
  { id: 'foundation', label: 'Foundation' },
  { id: 'sun_salutations', label: 'Sun Salutations', categories: ['sun_a', 'sun_b'] },
  { id: 'standing', label: 'Standing', categories: ['standing'] },
  { id: 'seated', label: 'Seated', categories: ['seated'] },
  { id: 'closing', label: 'Closing', categories: ['closing'] },
  { id: 'rest', label: 'Rest', categories: ['finishing'] },
];

interface CatalogScreenProps {
  breathSeconds: number;
  onBackHome: () => void;
}

type CatalogView = 'map' | 'detail';

interface IndexedPose {
  pose: Pose;
  index: number;
}

function badgeFor(pose: Pose): string | null {
  if (pose.repeat > 1) return `×${pose.repeat}`;
  if (pose.sides === 2) return '×2';
  return null;
}

function normalizeSearch(value: string): string {
  return value.toLowerCase().replace(/_/g, ' ').trim();
}

function matchesSearch(pose: Pose, query: string): boolean {
  if (!query) return true;

  const searchable = [
    pose.sanskrit,
    pose.english,
    sectionLabelForPose(pose),
    pose.group,
    pose.drishti,
    pose.isBasic ? 'foundation' : '',
  ]
    .map(normalizeSearch)
    .join(' ');

  return searchable.includes(query);
}

function CatalogScreen({ breathSeconds, onBackHome }: CatalogScreenProps) {
  const [view, setView] = useState<CatalogView>('map');
  const [detailIndex, setDetailIndex] = useState(0);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterId>('all');
  const count = CATALOG_IN_ORDER.length;

  const indexed: IndexedPose[] = useMemo(
    () => CATALOG_IN_ORDER.map((pose, index) => ({ pose, index })),
    [],
  );

  const activeFilterConfig = FILTERS.find((filter) => filter.id === activeFilter);
  const normalizedQuery = normalizeSearch(query);

  const filtered = indexed.filter(({ pose }) => {
    if (activeFilter === 'foundation' && !pose.isBasic) return false;
    if (
      activeFilterConfig?.categories &&
      !activeFilterConfig.categories.includes(pose.category)
    ) {
      return false;
    }

    return matchesSearch(pose, normalizedQuery);
  });

  const resultCountLabel =
    filtered.length === count
      ? `${count} poses`
      : `${filtered.length} / ${count} poses`;

  const openPose = (index: number) => {
    const clamped = Math.max(0, Math.min(count - 1, index));
    setDetailIndex(clamped);
    setView('detail');
  };

  if (view === 'detail') {
    return (
      <PoseCarousel
        poses={CATALOG_IN_ORDER}
        breathSeconds={breathSeconds}
        startIndex={detailIndex}
        onBackToMap={() => setView('map')}
        onStartGuided={onBackHome}
        actionLabel="Start practice"
      />
    );
  }

  return (
    <section className="screen overview catalog">
      <header className="overview__header">
        <button
          type="button"
          className="button--icon button--icon-ghost overview__back"
          onClick={onBackHome}
          aria-label="Back to home"
        >
          <BackArrow className="overview__back-icon" />
        </button>
        <p className="overview__summary">{resultCountLabel}</p>
      </header>

      <div className="catalog__intro">
        <h1 className="screen__heading">Pose catalog</h1>
        <p className="screen__summary">
          Search the Primary Series in canonical order. Tap any pose for details.
        </p>
      </div>

      <div className="catalog__controls" aria-label="Catalog search and filters">
        <label className="catalog__search-label" htmlFor="catalog-search">
          Search poses
        </label>
        <input
          id="catalog-search"
          className="catalog__search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search Sanskrit, English, section..."
        />

        <div className="catalog__filters" aria-label="Filter poses">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={
                'catalog__filter-pill' +
                (activeFilter === filter.id ? ' catalog__filter-pill--active' : '')
              }
              onClick={() => setActiveFilter(filter.id)}
              aria-pressed={activeFilter === filter.id}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="pose-map__sections catalog__sections">
        {SECTIONS.map((section) => {
          const items = filtered.filter(({ pose }) =>
            section.categories.includes(pose.category),
          );
          if (items.length === 0) return null;

          return (
            <section key={section.title} className="pose-map__section">
              <h2 className="pose-map__section-header">
                {section.title} &middot; {items.length} poses
              </h2>

              <ul className="catalog__list">
                {items.map(({ pose, index }) => {
                  const badge = badgeFor(pose);
                  return (
                    <li key={pose.id} className="catalog__item">
                      <button
                        type="button"
                        className="catalog__card"
                        onClick={() => openPose(index)}
                        aria-label={`Open pose ${index + 1}: ${pose.sanskrit}`}
                      >
                        <span className="catalog__figure">
                          <PoseGraphic
                            poseId={pose.id}
                            name={pose.sanskrit}
                            category={pose.category}
                            size={THUMB_ICON_SIZE}
                          />
                          {badge && (
                            <span className="catalog__badge">{badge}</span>
                          )}
                        </span>
                        <span className="catalog__card-body">
                          <span className="catalog__pose-name">{pose.sanskrit}</span>
                          <span className="catalog__pose-english">{pose.english}</span>
                          <span className="catalog__meta-row">
                            <span>{sectionLabelForPose(pose)}</span>
                            <span>{formatPoseDurationContext(pose)}</span>
                          </span>
                          {pose.isBasic && (
                            <span className="catalog__foundation-chip">
                              Foundation
                            </span>
                          )}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="catalog__empty" role="status">
          <p>No poses match this search.</p>
          <button
            type="button"
            className="button button--ghost catalog__clear"
            onClick={() => {
              setQuery('');
              setActiveFilter('all');
            }}
          >
            Clear search and filters
          </button>
        </div>
      )}

      <div className="catalog__actions">
        <button
          type="button"
          className="button button--primary"
          onClick={onBackHome}
        >
          Start practice
        </button>
      </div>
    </section>
  );
}

export default CatalogScreen;
