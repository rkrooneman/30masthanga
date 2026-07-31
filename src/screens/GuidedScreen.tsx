/**
 * GuidedScreen — TEMPORARY placeholder (Slice 5 replaces this).
 *
 * Confirms the overview -> guided step is wired. Shows a coming-soon message and
 * the first pose's name, plus a back button. Per the shell wiring, onBack from
 * here returns to Home.
 */

import type { GuidedScreenProps } from '../types/navigation';

function GuidedScreen({ practice, onBack }: GuidedScreenProps) {
  const firstPose = practice.poses[0];

  return (
    <section className="screen guided">
      <div className="guided__body">
        <p className="guided__message">
          Guided practice &mdash; coming in the next step
        </p>
        {firstPose && (
          <p className="guided__first-pose">
            First up: <strong>{firstPose.english}</strong>
          </p>
        )}
      </div>

      <button type="button" className="button button--ghost" onClick={onBack}>
        &larr; Back
      </button>
    </section>
  );
}

export default GuidedScreen;
