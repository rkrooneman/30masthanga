/**
 * PoseCarousel — the Overview DETAIL view (one pose card at a time).
 *
 * This is the original Overview carousel, extracted verbatim in behaviour so the
 * Overview's new MAP landing can drop into it on demand. It shows the full pose
 * catalog one card at a time as a swipeable card, opened at `startIndex` (the
 * thumbnail the practitioner tapped on the map). The current pose index is local
 * state (initialised to the clamped `startIndex`). The practitioner can move
 * between poses four ways:
 *   - swipe left/right on the card (touch),
 *   - the on-screen prev/next ("‹" / "›") buttons (disabled at the ends),
 *   - tapping a dot in the dot-navigation row,
 *   - left/right arrow keys.
 *
 * A "‹ All poses" control at the top returns to the map (distinct from leaving
 * the Overview entirely). The "Start practice" button is persistent near the
 * bottom and advances to the guided run.
 */

import { useEffect, useRef, useState } from 'react';
import type { TouchEvent } from 'react';
import type { Pose } from '../types/pose';
import PoseGraphic from '../components/PoseGraphic';

/** Sentinel value marking a drishti the human still needs to confirm. */
const UNVERIFIED = '__UNVERIFIED__';

/** Minimum horizontal travel (px) for a touch to count as a swipe. */
const SWIPE_THRESHOLD = 40;

interface PoseCarouselProps {
  /** The full ordered catalog to page through. */
  poses: Pose[];
  /** The breath pace this practice was generated at (shown in the position line). */
  breathSeconds: number;
  /** Index to open the carousel at (the tapped thumbnail); clamped to range. */
  startIndex: number;
  /** Return to the MAP subview (distinct from leaving the Overview entirely). */
  onBackToMap: () => void;
  /** Advance to the Guided screen. */
  onStartGuided: () => void;
}

function PoseCarousel({
  poses,
  breathSeconds,
  startIndex,
  onBackToMap,
  onStartGuided,
}: PoseCarouselProps) {
  const count = poses.length;

  const clamp = (n: number) => Math.max(0, Math.min(count - 1, n));

  const [index, setIndex] = useState(() => clamp(startIndex));
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  // Direction of the last navigation, used to pick the slide-in side for the
  // enter animation ('next' = incoming from the right, 'prev' = from the left).
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  // Suppress the slide/fade on the very first paint so the card doesn't fly in
  // when the detail view mounts; every subsequent index change animates.
  const isFirstRender = useRef(true);

  // All four navigation methods (swipe, arrows, dots, keys) funnel through
  // goTo, so deriving direction here covers every path. Direction is derived
  // from target-vs-current inside the functional updater (so it stays correct
  // even from the stale closure in the keydown listener): increasing index =
  // 'next', decreasing = 'prev'. A no-op move (already clamped at an end, or a
  // dot for the current index) leaves direction untouched and won't re-trigger
  // the animation. For dots, `n` is the tapped index, so target-vs-current
  // yields the right slide direction whether jumping forward or backward; for
  // the relative prev/next buttons and keys, `i ± 1` does the same.
  const goTo = (n: number) =>
    setIndex((i) => {
      const target = clamp(n);
      if (target > i) setDirection('next');
      else if (target < i) setDirection('prev');
      return target;
    });
  const goPrev = () => setIndex((i) => clamped(i, i - 1));
  const goNext = () => setIndex((i) => clamped(i, i + 1));

  // Relative-move helper (prev/next buttons + arrow keys): clamps the target,
  // records the slide direction from the live `i`, and returns the new index.
  // Hoisted function declaration so it can be referenced above its definition.
  function clamped(i: number, to: number): number {
    const target = clamp(to);
    if (target > i) setDirection('next');
    else if (target < i) setDirection('prev');
    return target;
  }

  const atStart = index === 0;
  const atEnd = index === count - 1;

  // Arrow-key navigation (desktop / accessibility). goPrev/goNext are stable in
  // behaviour (they only use the functional-updater form of setIndex plus the
  // module-constant `count` via closure), so a ref keeps the listener wired to
  // the latest closures without re-subscribing on every render and without an
  // exhaustive-deps warning.
  const goPrevRef = useRef(goPrev);
  const goNextRef = useRef(goNext);
  goPrevRef.current = goPrev;
  goNextRef.current = goNext;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrevRef.current();
      else if (e.key === 'ArrowRight') goNextRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // After the first paint, mark that subsequent index changes should animate.
  // The initial mount uses a subtle fade-in only (no directional slide), so the
  // card doesn't jarringly fly in when the detail view first appears.
  useEffect(() => {
    isFirstRender.current = false;
  }, []);

  // Defensive: if the paged array's length ever changes underneath the local
  // `index` (it shouldn't — the catalog is stable), keep `index` in range.
  useEffect(() => {
    setIndex((i) => Math.max(0, Math.min(count - 1, i)));
  }, [count]);

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    setTouchStartX(e.changedTouches[0]?.clientX ?? null);
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX;
    const deltaX = endX - touchStartX;
    if (Math.abs(deltaX) >= SWIPE_THRESHOLD) {
      // Swipe left (negative delta) -> next; swipe right -> previous.
      if (deltaX < 0) goNext();
      else goPrev();
    }
    setTouchStartX(null);
  };

  // Defensive: an empty practice should never reach here, but render calmly.
  const pose = poses[index];
  if (!pose) {
    return (
      <section className="screen overview">
        <button
          type="button"
          className="button button--ghost"
          onClick={onBackToMap}
        >
          &lsaquo; All poses
        </button>
        <p className="screen__summary">No poses in this practice.</p>
      </section>
    );
  }

  const verified = pose.drishti !== UNVERIFIED;

  // Enter-animation class for the card. On first paint we use a plain fade-in
  // ('--enter-initial'); after that, a directional slide+fade keyed on the last
  // navigation direction. The card is remounted via key={index} on every
  // navigation, which re-triggers the CSS @keyframes animation cleanly.
  const enterModifier = isFirstRender.current
    ? 'pose-card--enter-initial'
    : `pose-card--enter-${direction}`;

  return (
    <section className="screen overview">
      <header className="overview__header">
        <button
          type="button"
          className="button button--ghost overview__back"
          onClick={onBackToMap}
          aria-label="Back to all poses"
        >
          &lsaquo; All poses
        </button>
        <p className="overview__summary">
          {index + 1} / {count}
        </p>
      </header>

      <div
        key={index}
        className={`pose-card ${enterModifier}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="pose-card__graphic">
          <PoseGraphic
            poseId={pose.id}
            name={pose.english}
            category={pose.category}
            size={160}
          />
        </div>

        <div className="pose-card__names">
          <h2 className="pose-card__primary-name">{pose.sanskrit}</h2>
          <p className="pose-card__secondary-name">{pose.english}</p>
          <p className="pose-card__phonetic">{pose.phonetic}</p>
        </div>

        <p className="pose-card__meta">
          {pose.category}
          {' · '}
          {pose.breaths} breaths
          {pose.sides > 1 && ` · ×${pose.sides} sides`}
          {pose.repeat > 1 && ` · ×${pose.repeat}`}
        </p>

        <div className="pose-card__drishti">
          <span className="pose-card__drishti-label">Drishti</span>
          {verified ? (
            <span className="pose-card__drishti-value">{pose.drishti}</span>
          ) : (
            <span className="pose-card__drishti-value pose-card__drishti-value--muted">
              Gaze: to be confirmed
            </span>
          )}
        </div>
      </div>

      <div className="carousel-nav">
        <button
          type="button"
          className="carousel-nav__arrow"
          onClick={goPrev}
          disabled={atStart}
          aria-label="Previous pose"
        >
          &lsaquo;
        </button>

        <div
          className="carousel-nav__dots"
          role="tablist"
          aria-label="Pose navigation"
        >
          {poses.map((p, i) => (
            <button
              type="button"
              key={p.id}
              className={
                'carousel-nav__dot' +
                (i === index ? ' carousel-nav__dot--active' : '')
              }
              onClick={() => goTo(i)}
              aria-label={`Go to pose ${i + 1}: ${p.sanskrit}`}
              aria-current={i === index ? 'true' : undefined}
            />
          ))}
        </div>

        <button
          type="button"
          className="carousel-nav__arrow"
          onClick={goNext}
          disabled={atEnd}
          aria-label="Next pose"
        >
          &rsaquo;
        </button>
      </div>

      <p className="overview__position" aria-live="polite">
        {index + 1} / {count} &middot; {breathSeconds}s/breath
      </p>

      <button
        type="button"
        className="button button--primary"
        onClick={onStartGuided}
      >
        Start practice
      </button>
    </section>
  );
}

export default PoseCarousel;
