/**
 * Navigation + shared-state types for the app shell.
 *
 * SLICE 3 SCOPE: the lightweight, router-free navigation model. We deliberately
 * do NOT use a router library — `App.tsx` holds a single `screen` value in
 * `useState` and swaps which screen component is rendered. These types describe
 * that state machine and the prop contracts each screen expects.
 */

import type { GeneratedPractice } from '../lib/generatePractice';

/** The three screens the app can show. Default screen is 'home'. */
export type Screen = 'home' | 'overview' | 'guided';

/** Props for the Home screen (breath-pace picker + generate). */
export interface HomeScreenProps {
  /** Current seconds-per-breath, owned by the shell. */
  breathSeconds: number;
  /** Update the shared breath pace (drives the live estimate). */
  onBreathSecondsChange: (seconds: number) => void;
  /** Generate a real (randomised) practice at the given pace and advance. */
  onGenerate: (breathSeconds: number) => void;
}

/** Props for the Overview screen (Slice 4 replaces the placeholder body). */
export interface OverviewScreenProps {
  /** The generated practice to preview. */
  practice: GeneratedPractice;
  /** The breath pace this practice was generated at. */
  breathSeconds: number;
  /** Return to the Home screen. */
  onBack: () => void;
  /** Advance to the Guided screen. */
  onStartGuided: () => void;
  /** Generate a fresh practice at the same breath pace. */
  onRegenerate: () => void;
  /**
   * Swap the given pose out of the practice for a valid same-category
   * alternative (see swapPose). No-op if the pose is fixed or has no candidate.
   */
  onSwapPose: (poseId: string) => void;
}

/** Props for the Guided screen (Slice 5b — the interactive player). */
export interface GuidedScreenProps {
  /** The generated practice to run. */
  practice: GeneratedPractice;
  /** The breath pace this practice was generated at. */
  breathSeconds: number;
  /**
   * Exit the guided run mid-practice — returns to the Overview so the
   * practitioner can review the sequence again (wired to the Exit control).
   */
  onExit: () => void;
  /**
   * Finish the guided run — returns to Home (wired to the completion screen's
   * "Return home" button, semantically a fresh start).
   */
  onComplete: () => void;
}
