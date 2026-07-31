/**
 * BreathingCircle — the focal breathing visual for the guided screen (Slice 5b).
 *
 * A large sage circle that expands on inhale and shrinks on exhale. The scale
 * animation is a pure CSS `transform` transition whose DURATION is bound to the
 * current phase length (inhaleMs on inhale, exhaleMs on exhale) via an inline
 * `transitionDuration`, so the visual always matches the timing engine's pace.
 *
 * The parent owns all timing; this component is purely presentational. It takes
 * the current `phase` ('inhale' | 'exhale'), the two half-breath durations, a
 * `paused` flag, and an `active` flag (false during transitions / completion, so
 * the circle rests at a calm neutral size with no phase word).
 *
 * Reduced motion: when the user prefers reduced motion we do NOT scale the
 * circle. Instead it holds a steady mid-size and only the phase word changes,
 * plus a gentle opacity settle. This is handled in CSS via the
 * `prefers-reduced-motion` block keyed off the `breathing-circle` classes.
 */

import type { GuidedPhase } from '../lib/guidedPlan';

interface BreathingCircleProps {
  /** Which half of the breath is currently playing. */
  phase: GuidedPhase;
  /** Inhale (expand) duration in ms — drives the transition on inhale. */
  inhaleMs: number;
  /** Exhale (shrink) duration in ms — drives the transition on exhale. */
  exhaleMs: number;
  /** True when a breath step is playing; false during transitions/rest. */
  active: boolean;
  /** True when playback is paused (freezes the animation at its current scale). */
  paused: boolean;
  /** Optional centre content shown over the circle (e.g. a transition cue). */
  children?: React.ReactNode;
}

function BreathingCircle({
  phase,
  inhaleMs,
  exhaleMs,
  active,
  paused,
  children,
}: BreathingCircleProps) {
  // Bind the CSS transition duration to the CURRENT phase length. When paused we
  // set the duration to 0 so the circle simply holds its current scale (the
  // scale itself is frozen because `phase`/state no longer advances).
  const phaseMs = phase === 'inhale' ? inhaleMs : exhaleMs;
  const transitionDuration = paused ? '0ms' : `${phaseMs}ms`;

  // The scale target: large on inhale, small on exhale. When inactive (a
  // transition or the rest state) hold a calm neutral mid-scale. Reduced-motion
  // users get a steady size regardless (enforced in CSS), so this is only the
  // "full motion" intent.
  const stateModifier = !active
    ? 'breathing-circle--rest'
    : phase === 'inhale'
      ? 'breathing-circle--inhale'
      : 'breathing-circle--exhale';

  return (
    <div className="breathing-circle" aria-hidden="true">
      <div
        className={`breathing-circle__disc ${stateModifier}`}
        style={{ transitionDuration }}
      />
      <div className="breathing-circle__label">{children}</div>
    </div>
  );
}

export default BreathingCircle;
