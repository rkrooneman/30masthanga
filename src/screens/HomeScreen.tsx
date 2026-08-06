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
import {
  loadPoseCue,
  savePoseCue,
  loadBreathCuesOn,
  saveBreathCuesOn,
} from '../lib/preferences';
import {
  type PoseCue,
  poseCueToIndex,
  indexToPoseCue,
} from '../lib/guidance';
import { getAmbientEnabled, setAmbientEnabled } from '../lib/ambientPref';
import LotusMark from '../components/LotusMark';
import PracticeWeek from '../components/PracticeWeek';

/**
 * Fixed seed for the estimate only. The real "Generate" button uses genuine
 * randomness (Math.random, the generator's default) — this seed is purely so the
 * on-screen estimate is deterministic for a given breath pace and therefore
 * stable across slider drags.
 */
const ESTIMATE_SEED = 1;

/**
 * Human-readable name for each pose cue. Used for the slider's value line and
 * its aria-valuetext, so screen readers announce "Voice" rather than the bare
 * numeric index. Mirrors POSE_CUE_ORDER in guidance.ts.
 */
const POSE_CUE_LABELS: Record<PoseCue, string> = {
  silent: 'Silent',
  bell: 'Bell',
  voice: 'Voice',
};

function HomeScreen({
  breathSeconds,
  onBreathSecondsChange,
  onGenerate,
}: HomeScreenProps) {
  // Local UI state only: whether the "About this app" dialog is open. Kept here
  // (not in the shell) since it's purely presentational and Home-only.
  const [aboutOpen, setAboutOpen] = useState(false);

  // Pose cue (silent | bell | voice). How a pose change is announced: a 3-stop
  // slider whose values are alternatives, not layers. The guided player and
  // audio libs read the cue fresh from storage, so it never needs to thread
  // through App. Seeded from storage (which one-time-migrates the legacy #7
  // level), persisted on change.
  const [poseCue, setPoseCue] = useState<PoseCue>(loadPoseCue);

  const handlePoseCueChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const next = indexToPoseCue(Number(event.target.value));
    setPoseCue(next);
    savePoseCue(next);
  };

  // Breath cues on/off. Whether the soft inhale/exhale tones play; orthogonal to
  // the pose cue. Read fresh from storage by the audio libs. Seeded from storage
  // (which one-time-migrates the legacy #7 level), persisted on change.
  const [breathCuesOn, setBreathCuesOn] = useState<boolean>(loadBreathCuesOn);

  const handleBreathCuesToggle = (next: boolean) => {
    setBreathCuesOn(next);
    saveBreathCuesOn(next);
  };

  // Ambient-sound toggle. The persistent enable/disable preference for the
  // background ambient track. Unlike voice guidance, this must reach MusicPanel
  // (which owns the <audio> at the app shell) live, so it flows through the
  // ambientPref pub/sub — setAmbientEnabled() both persists and notifies the
  // panel. Seeded from the shared getter (which reads storage on module load).
  const [ambientEnabled, setAmbientEnabledState] = useState<boolean>(getAmbientEnabled);

  const handleAmbientToggle = (next: boolean) => {
    setAmbientEnabledState(next);
    setAmbientEnabled(next);
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
        className="button--icon home__info"
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
        {/* Calm "last 7 days" petals — always shown, even with no history. Sits
            directly under the tagline, between the brand and the controls. */}
        <PracticeWeek />
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

        <div className="field home__pose-cues">
          <div className="field__label-row">
            <label className="field__label" htmlFor="pose-cues">
              Pose cues
            </label>
            <span className="field__value">{POSE_CUE_LABELS[poseCue]}</span>
          </div>
          <input
            id="pose-cues"
            className="slider"
            type="range"
            min={0}
            max={2}
            step={1}
            value={poseCueToIndex(poseCue)}
            onChange={handlePoseCueChange}
            aria-valuetext={POSE_CUE_LABELS[poseCue]}
          />
          <div className="home__pose-cues-stops" aria-hidden="true">
            <span>Silent</span>
            <span>Bell</span>
            <span>Voice</span>
          </div>
        </div>

        <div className="basics-toggle home__breath-toggle">
          <label className="basics-toggle__label" htmlFor="breath-cues-switch">
            <span className="basics-toggle__text">Breath cues</span>
            <input
              type="checkbox"
              id="breath-cues-switch"
              className="basics-toggle__input"
              checked={breathCuesOn}
              onChange={(e) => handleBreathCuesToggle(e.target.checked)}
            />
            <span className="basics-toggle__track" aria-hidden="true">
              <span className="basics-toggle__thumb" />
            </span>
          </label>
          <p className="basics-toggle__hint">
            Soft inhale and exhale tones to pace your breath.
          </p>
        </div>

        <div className="basics-toggle home__ambient-toggle">
          <label className="basics-toggle__label" htmlFor="ambient-sound-switch">
            <span className="basics-toggle__text">Ambient sound</span>
            <input
              type="checkbox"
              id="ambient-sound-switch"
              className="basics-toggle__input"
              checked={ambientEnabled}
              onChange={(e) => handleAmbientToggle(e.target.checked)}
            />
            <span className="basics-toggle__track" aria-hidden="true">
              <span className="basics-toggle__thumb" />
            </span>
          </label>
          <p className="basics-toggle__hint">
            Plays a calm ambient track during practice.
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
              className="button--icon button--icon-ghost about__close"
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
                Background ambient sound: CC0 public-domain tracks (see the
                project's CREDITS). Pose illustrations are original works.
                Open-source under the MIT License.
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
