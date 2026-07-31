/**
 * OverviewScreen — the Practice Overview carousel (Slice 4).
 *
 * Shows the generated practice one pose at a time as a swipeable card. The
 * current pose index is local state (starts at 0, clamped to [0, n-1]). The
 * practitioner can move between poses four ways:
 *   - swipe left/right on the card (touch),
 *   - the on-screen prev/next ("‹" / "›") buttons (disabled at the ends),
 *   - tapping a dot in the dot-navigation row,
 *   - left/right arrow keys.
 *
 * The "Start practice" button is persistent near the bottom and advances to the
 * guided run. Props are unchanged from the placeholder this replaces.
 */

import { useEffect, useRef, useState } from 'react';
import type { TouchEvent } from 'react';
import type { OverviewScreenProps } from '../types/navigation';
import { formatDuration } from '../lib/timing';
import PosePlaceholder from '../components/PosePlaceholder';

/** Sentinel value marking a drishti the human still needs to confirm. */
const UNVERIFIED = '__UNVERIFIED__';

/** Minimum horizontal travel (px) for a touch to count as a swipe. */
const SWIPE_THRESHOLD = 40;

function OverviewScreen({
  practice,
  breathSeconds,
  onBack,
  onStartGuided,
}: OverviewScreenProps) {
  const { poses, totalSeconds } = practice;
  const count = poses.length;

  const [index, setIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  // Direction of the last navigation, used to pick the slide-in side for the
  // enter animation ('next' = incoming from the right, 'prev' = from the left).
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  // Suppress the slide/fade on the very first paint so the card doesn't fly in
  // when the screen mounts; every subsequent index change animates.
  const isFirstRender = useRef(true);

  const clamp = (n: number) => Math.max(0, Math.min(count - 1, n));

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

  // Arrow-key navigation (desktop / accessibility).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [count]);

  // After the first paint, mark that subsequent index changes should animate.
  // The initial mount uses a subtle fade-in only (no directional slide), so the
  // card doesn't jarringly fly in when the screen first appears.
  useEffect(() => {
    isFirstRender.current = false;
  }, []);

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
        <button type="button" className="button button--ghost" onClick={onBack}>
          &larr; Back
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
          onClick={onBack}
          aria-label="Back to home"
        >
          &larr;
        </button>
        <p className="overview__summary">
          {count} poses &middot; {formatDuration(totalSeconds)}
        </p>
      </header>

      <div
        key={index}
        className={`pose-card ${enterModifier}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="pose-card__graphic">
          <PosePlaceholder name={pose.english} category={pose.category} />
        </div>

        <div className="pose-card__names">
          <h2 className="pose-card__english">{pose.english}</h2>
          <p className="pose-card__sanskrit">{pose.sanskrit}</p>
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
              Gaze — to be confirmed
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
              aria-label={`Go to pose ${i + 1}: ${p.english}`}
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

export default OverviewScreen;
