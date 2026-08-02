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

/** Props for the Overview screen (a user-editable selection over the catalog). */
export interface OverviewScreenProps {
  /**
   * The DERIVED practice — every catalog pose currently selected, in canonical
   * order, with a recomputed total. Flows to the guided run and the totals.
   */
  practice: GeneratedPractice;
  /** The breath pace this practice was generated at. */
  breathSeconds: number;
  /**
   * The set of currently-selected pose ids. The Overview renders the WHOLE
   * catalog; poses whose id is in this set are "in" the practice (checked +
   * normal), the rest are dimmed. Fixed-frame poses are always in the set.
   */
  selectedIds: ReadonlySet<string>;
  /**
   * Toggle a pose in/out of the selection. The shell ignores fixed-frame poses
   * (they can never be unchecked) and rebuilds the derived practice.
   */
  onToggleSelected: (poseId: string) => void;
  /** Return to the Home screen. */
  onBack: () => void;
  /** Advance to the Guided screen. */
  onStartGuided: () => void;
  /**
   * Wipe the current selection and generate a fresh <=30-min set (New
   * sequence). Also turns "Full series" off.
   */
  onRegenerate: () => void;
  /**
   * Whether "Basics only" (Smart Start) mode is active. Drives the toggle;
   * mutually exclusive with "Full series".
   */
  basicsOnly: boolean;
  /**
   * Toggle "Basics only" mode. The shell persists the choice and regenerates
   * the current practice in the new mode (turning "Full series" off).
   */
  onToggleBasics: (next: boolean) => void;
  /**
   * Whether "Full series" mode is active (every catalog pose selected). Drives
   * the toggle; mutually exclusive with "Basics only".
   */
  fullSeries: boolean;
  /**
   * Toggle "Full series" mode. ON selects every catalog pose (and turns Basics
   * off); OFF regenerates a fresh <=30-min set. The shell persists the choice.
   */
  onToggleFullSeries: (next: boolean) => void;
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
  /**
   * DEV-ONLY: when true, the screen mounts straight into the completion state
   * (Namaste + summary) without playing through the practice. The completion
   * bell and Namaste voice still fire (so the hatch can preview the completion
   * sounds), and refreshing replays them. Wired to the `?complete` dev escape
   * hatch in App.tsx and stripped from production builds. Never set in normal use.
   */
  startComplete?: boolean;
}
