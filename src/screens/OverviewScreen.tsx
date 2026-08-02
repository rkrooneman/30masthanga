/**
 * OverviewScreen — the Practice Overview container.
 *
 * The Overview now has TWO internal views, held in local `view` state:
 *   - 'map'    (default): a scannable grid of pose thumbnails grouped by section
 *              (PoseMap). This is the landing view.
 *   - 'detail': the original one-card swipe carousel (PoseCarousel), reached by
 *              tapping a thumbnail, opened at that pose's index.
 *
 * The Overview is now a user-editable SELECTION over the full catalog: the MAP
 * (PoseMap) renders EVERY pose grouped by section — selected poses normal,
 * unselected dimmed, each with a checkbox — and the DETAIL carousel pages the
 * FULL catalog too, so tapping any card (selected or not) opens its detail.
 *
 * `detailIndex` records which catalog pose the map handed off, so the carousel
 * opens on the tapped card. It is clamped to the catalog range on the way in
 * (here) and again inside PoseCarousel (defensive), and is only ever set from a
 * real cell index, so it can never point outside the catalog.
 *
 * Navigation:
 *   - map "←"            → onBack (leaves the Overview entirely, back to Home)
 *   - map thumbnail      → view='detail', detailIndex = tapped index
 *   - detail "‹ All poses" → view='map' (stays in the Overview)
 *   - "Start practice" (either view) → onStartGuided
 *
 * Generation/timing logic and the pose icons are untouched; this is purely a
 * navigation/layout refactor. Props are unchanged from before.
 */

import { useState } from 'react';
import type { OverviewScreenProps } from '../types/navigation';
import { poses as catalog } from '../data/poses';
import PoseMap from './PoseMap';
import PoseCarousel from './PoseCarousel';

/**
 * The full catalog in canonical order — what the MAP now renders (every pose,
 * selected or dimmed) and what the DETAIL carousel pages through, so tapping ANY
 * card (selected or not) opens its detail. Sorted once at module scope.
 */
const CATALOG_IN_ORDER = catalog.slice().sort((a, b) => a.order - b.order);

/** Which of the Overview's two internal views is showing. */
type OverviewView = 'map' | 'detail';

function OverviewScreen({
  practice,
  breathSeconds,
  selectedIds,
  onToggleSelected,
  onBack,
  onStartGuided,
  onRegenerate,
  basicsOnly,
  onToggleBasics,
  fullSeries,
  onToggleFullSeries,
}: OverviewScreenProps) {
  // The detail carousel now pages the FULL catalog (every pose, selected or
  // not), so tapping ANY map card — including a dimmed, unselected one — opens
  // its detail card. Selection is toggled via the checkbox, not by opening.
  const count = CATALOG_IN_ORDER.length;

  const [view, setView] = useState<OverviewView>('map');
  const [detailIndex, setDetailIndex] = useState(0);
  // Bumped on each regenerate. Used as PoseMap's key so the map remounts and its
  // sections grid replays the cross-fade; also gates the fade so the initial
  // landing (count 0) stays still.
  const [regenCount, setRegenCount] = useState(0);

  // Open the carousel at the tapped pose (an index into the full catalog).
  // Clamp here as well as in the carousel so a stray index can never escape the
  // catalog bounds.
  const openPose = (index: number) => {
    const clamped = Math.max(0, Math.min(count - 1, index));
    setDetailIndex(clamped);
    setView('detail');
  };

  const backToMap = () => setView('map');

  // Regenerate a fresh practice and return to the map so the new sequence is
  // shown from the top.
  const regenerate = () => {
    onRegenerate();
    setDetailIndex(0);
    setView('map');
    setRegenCount((n) => n + 1);
  };

  if (view === 'detail') {
    return (
      <PoseCarousel
        poses={CATALOG_IN_ORDER}
        breathSeconds={breathSeconds}
        startIndex={detailIndex}
        onBackToMap={backToMap}
        onStartGuided={onStartGuided}
      />
    );
  }

  return (
    <PoseMap
      key={regenCount}
      practice={practice}
      breathSeconds={breathSeconds}
      selectedIds={selectedIds}
      onToggleSelected={onToggleSelected}
      onOpenPose={openPose}
      onBack={onBack}
      onStartGuided={onStartGuided}
      onRegenerate={regenerate}
      animateRefresh={regenCount > 0}
      basicsOnly={basicsOnly}
      onToggleBasics={onToggleBasics}
      fullSeries={fullSeries}
      onToggleFullSeries={onToggleFullSeries}
    />
  );
}

export default OverviewScreen;
