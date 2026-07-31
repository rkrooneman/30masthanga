/**
 * OverviewScreen — TEMPORARY placeholder (Slice 4 replaces this).
 *
 * Its only job right now is to prove the navigation wiring: it receives the
 * generated practice from the shell, lists the poses in canonical order, and
 * offers a back button (home) and a "Start practice" button (guided).
 */

import type { OverviewScreenProps } from '../types/navigation';
import { formatDuration } from '../lib/timing';

function OverviewScreen({
  practice,
  breathSeconds,
  onBack,
  onStartGuided,
}: OverviewScreenProps) {
  const { poses, totalSeconds } = practice;

  return (
    <section className="screen overview">
      <button type="button" className="button button--ghost" onClick={onBack}>
        &larr; Back
      </button>

      <h2 className="screen__heading">Your practice</h2>
      <p className="screen__summary">
        {poses.length} poses &middot; {formatDuration(totalSeconds)} &middot;{' '}
        {breathSeconds}s/breath
      </p>

      <ol className="pose-list">
        {poses.map((pose, index) => (
          <li className="pose-list__item" key={pose.id}>
            <span className="pose-list__index">{index + 1}</span>
            <span className="pose-list__body">
              <span className="pose-list__name">
                {pose.english}
                {pose.repeat > 1 && (
                  <span className="pose-list__repeat"> &times;{pose.repeat}</span>
                )}
              </span>
              <span className="pose-list__sanskrit">{pose.sanskrit}</span>
            </span>
            <span className="pose-list__meta">
              {pose.breaths} breaths{pose.sides > 1 ? ' × 2 sides' : ''}
            </span>
          </li>
        ))}
      </ol>

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
