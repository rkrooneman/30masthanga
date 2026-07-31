/**
 * HomeScreen — the app's first screen.
 *
 * Lets the practitioner pick a breath pace and generate a ~30-minute practice.
 * Shows a *stable* live estimate of the resulting length + pose count so the
 * number doesn't flicker while dragging the slider (see the estimate note below).
 */

import { useMemo } from 'react';
import type { HomeScreenProps } from '../types/navigation';
import { poses } from '../data/poses';
import { generatePractice } from '../lib/generatePractice';
import { formatDuration, MIN_BREATH_SECONDS, MAX_BREATH_SECONDS } from '../lib/timing';
import { mulberry32 } from '../lib/mulberry32';
import LotusMark from '../components/LotusMark';

/**
 * Fixed seed for the estimate only. The real "Generate" button uses genuine
 * randomness (Math.random, the generator's default) — this seed is purely so the
 * on-screen estimate is deterministic for a given breath pace and therefore
 * stable across slider drags.
 */
const ESTIMATE_SEED = 1;

function HomeScreen({
  breathSeconds,
  onBreathSecondsChange,
  onGenerate,
}: HomeScreenProps) {
  // Stable estimate: recomputed only when the breath pace changes, and always
  // with the SAME seeded rng, so a given pace always shows the same numbers.
  const estimate = useMemo(() => {
    const practice = generatePractice(poses, {
      breathSeconds,
      rng: mulberry32(ESTIMATE_SEED),
    });
    return {
      duration: formatDuration(practice.totalSeconds),
      count: practice.poses.length,
    };
  }, [breathSeconds]);

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onBreathSecondsChange(Number(event.target.value));
  };

  return (
    <section className="home">
      <div className="home__brand">
        <LotusMark size={72} className="home__mark" />
        <h1 className="home__wordmark">ashtanga30</h1>
        <p className="home__tagline">a 30-minute Ashtanga companion</p>
      </div>

      <div className="home__controls">
        <div className="field">
          <div className="field__label-row">
            <label className="field__label" htmlFor="breath-pace">
              Breath pace
            </label>
            <span className="field__value">{breathSeconds}s per breath</span>
          </div>
          <input
            id="breath-pace"
            className="slider"
            type="range"
            min={MIN_BREATH_SECONDS}
            max={MAX_BREATH_SECONDS}
            step={1}
            value={breathSeconds}
            onChange={handleSliderChange}
          />
        </div>

        <p className="home__estimate">
          <span className="home__estimate-label">Estimated practice</span>
          <span className="home__estimate-value">
            &asymp; {estimate.duration} &middot; {estimate.count} poses
          </span>
        </p>
      </div>

      <button
        type="button"
        className="button button--primary"
        onClick={() => onGenerate(breathSeconds)}
      >
        Generate my next practice
      </button>
    </section>
  );
}

export default HomeScreen;
