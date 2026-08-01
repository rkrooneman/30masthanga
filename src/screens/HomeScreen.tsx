/**
 * HomeScreen — the app's first screen.
 *
 * Lets the practitioner pick a breath pace and generate a ~30-minute practice.
 * Shows a *stable* live estimate of the resulting length + pose count so the
 * number doesn't flicker while dragging the slider (see the estimate note below).
 */

import { useEffect, useMemo, useState } from 'react';
import type { HomeScreenProps } from '../types/navigation';
import { poses } from '../data/poses';
import { generatePractice } from '../lib/generatePractice';
import { formatDuration, MIN_BREATH_SECONDS, MAX_BREATH_SECONDS } from '../lib/timing';
import { mulberry32 } from '../lib/mulberry32';
import { loadVoiceEnabled, saveVoiceEnabled } from '../lib/preferences';
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
  // Local UI state only: whether the "About this app" dialog is open. Kept here
  // (not in the shell) since it's purely presentational and Home-only.
  const [aboutOpen, setAboutOpen] = useState(false);

  // Voice-guidance toggle. Purely a Home-side presentational control (like the
  // About dialog): the guided player reads the preference fresh from storage, so
  // this never needs to thread through App. Seeded from storage, persisted on
  // change.
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(loadVoiceEnabled);

  const handleVoiceToggle = (next: boolean) => {
    setVoiceEnabled(next);
    saveVoiceEnabled(next);
  };

  // Close the About dialog on Escape while it's open.
  useEffect(() => {
    if (!aboutOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAboutOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [aboutOpen]);

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
      <button
        type="button"
        className="home__info"
        aria-label="About this app"
        onClick={() => setAboutOpen(true)}
      >
        <svg
          className="home__info-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <line x1="12" y1="11" x2="12" y2="16" />
          <circle cx="12" cy="8" r="0.6" fill="currentColor" stroke="none" />
        </svg>
      </button>

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

        <div className="basics-toggle home__voice-toggle">
          <label className="basics-toggle__label" htmlFor="voice-guidance-switch">
            <span className="basics-toggle__text">Voice guidance</span>
            <input
              type="checkbox"
              id="voice-guidance-switch"
              className="basics-toggle__input"
              checked={voiceEnabled}
              onChange={(e) => handleVoiceToggle(e.target.checked)}
            />
            <span className="basics-toggle__track" aria-hidden="true">
              <span className="basics-toggle__thumb" />
            </span>
          </label>
          <p className="basics-toggle__hint">
            Announces each pose name as you flow.
          </p>
        </div>
      </div>

      <button
        type="button"
        className="button button--primary"
        onClick={() => onGenerate(breathSeconds)}
      >
        Generate my next practice
      </button>

      <footer className="home__footer">
        <p className="home__copyright">&copy; 2026 Roderik Krooneman</p>
      </footer>

      {aboutOpen && (
        <div
          className="about-backdrop"
          onClick={() => setAboutOpen(false)}
        >
          <div
            className="about"
            role="dialog"
            aria-modal="true"
            aria-labelledby="about-heading"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="about__close"
              aria-label="Close"
              onClick={() => setAboutOpen(false)}
            >
              &times;
            </button>

            <div className="about__body">
              <h2 id="about-heading" className="about__heading">
                About ashtanga30
              </h2>

              <p className="about__text">
                ashtanga30 generates a varied ~30-minute Ashtanga Primary Series
                practice that always opens with the sun salutations and closes
                with a shoulderstand and rest, keeping the traditional order,
                a shorter practice you can sustain daily.
              </p>

              <p className="about__text about__text--muted">
                ashtanga30 is for general informational purposes only and is not
                medical advice or a substitute for a qualified instructor. Yoga
                involves physical activity with inherent risks, so consult
                your physician before starting, practise within your limits, and
                stop if you feel pain. The author accepts no liability for injury
                or loss arising from use of this app.
              </p>

              <p className="about__text about__text--muted">
                Background music: CC0 public-domain tracks (see the project's
                CREDITS). Pose illustrations are original works. Open-source
                under the MIT License.
              </p>

              <p className="about__text about__text--muted">
                <a
                  className="about__link"
                  href="https://github.com/rkrooneman/30masthanga"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View the project on GitHub
                </a>
              </p>

              <p className="about__copyright">&copy; 2026 Roderik Krooneman</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default HomeScreen;
