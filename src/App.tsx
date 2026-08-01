/**
 * App — the navigation shell + shared state for ashtanga30.
 *
 * SLICE 3 SCOPE: router-free navigation. There is no router library (a
 * deliberate design decision); instead this component holds a single `screen`
 * value plus the shared practice/breath state, passes handlers down, and renders
 * whichever screen is active. Later slices swap the Overview/Guided placeholders
 * for real screens without touching this wiring.
 */

import { lazy, Suspense, useState } from 'react';
import type { Screen } from './types/navigation';
import type { GeneratedPractice } from './lib/generatePractice';
import { poses } from './data/poses';
import { generatePractice } from './lib/generatePractice';
import { swapPose } from './lib/swapPose';
import { seedFakePractice } from './lib/practiceLog';
import { requestAmbientPlay } from './lib/ambientPref';
import {
  loadBreathSeconds,
  saveBreathSeconds,
  loadBasicsOnly,
  saveBasicsOnly,
} from './lib/preferences';
import HomeScreen from './screens/HomeScreen';
import OverviewScreen from './screens/OverviewScreen';
import MusicPanel from './components/MusicPanel';
// DEV-ONLY (pose-icon contact sheet): reached via the `?pilot` query string.
// Gated behind import.meta.env.DEV so it is tree-shaken out of production.
import PosePilot from './components/poses/PosePilot';

// GuidedScreen is heavy (buildGuidedPlan, BreathingCircle, PoseGraphic + its 58
// pose-icon SVGs, voice/chime, etc.) and is only needed once a practice starts
// (screen === 'guided', or the DEV-only `?complete` hatch). Lazy-loading it lets
// vite/rollup split it into its own chunk so Home/Overview don't pay for it up
// front. It has a default export, which React.lazy requires.
const GuidedScreen = lazy(() => import('./screens/GuidedScreen'));

// DEV-ONLY seed guard: ensures the `?seedweek` hatch seeds the practice log at
// most once per page load (module scope survives re-renders, unlike a ref that
// would need a mounted component). Stripped from production with the DEV branch.
let seedWeekApplied = false;

function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [practice, setPractice] = useState<GeneratedPractice | null>(null);
  // Breath pace is remembered across visits (persisted to localStorage).
  const [breathSeconds, setBreathSeconds] = useState<number>(loadBreathSeconds);
  // "Basics only" (Smart Start) mode, also remembered across visits.
  const [basicsOnly, setBasicsOnly] = useState<boolean>(loadBasicsOnly);

  // DEV-ONLY pilot escape hatch: visiting `/?pilot` renders the pose-icon
  // contact sheet instead of the normal app. Computed after hooks (Rules of
  // Hooks). `import.meta.env.DEV` is statically false in production builds, so
  // this branch and the PosePilot import are stripped from the prod bundle.
  if (import.meta.env.DEV && window.location.search.includes('pilot')) {
    return <PosePilot />;
  }

  // DEV-ONLY seed escape hatch: visiting `/?seedweek` seeds a few days into the
  // practice log (today, yesterday, 3/4/6 days ago) ONCE, then renders the normal
  // app so the filled petals in the Home "last 7 days" row can be previewed
  // without practicing for real. `import.meta.env.DEV` is statically false in
  // production, so this branch and the seedFakePractice import are stripped.
  if (
    import.meta.env.DEV &&
    !seedWeekApplied &&
    window.location.search.includes('seedweek')
  ) {
    seedWeekApplied = true;
    seedFakePractice([0, 1, 3, 4, 6]);
  }

  // DEV-ONLY completion escape hatch: visiting `/?complete` generates a practice
  // and mounts the Guided screen straight into its completion state (Namaste mark
  // + end-of-practice summary), so that screen can be iterated on without playing
  // through a whole practice. The completion bell + Namaste voice play (and
  // replay on refresh). Gated behind import.meta.env.DEV so it is stripped from
  // production builds.
  const devComplete =
    import.meta.env.DEV && window.location.search.includes('complete');
  // Generate the throwaway practice for the `?complete` hatch once (only when the
  // hatch is active). Not stateful — this render path never re-renders normally.
  const devPractice = devComplete
    ? generatePractice(poses, { breathSeconds, basicsOnly })
    : null;

  // Persist the breath pace whenever it changes (from the Home slider).
  const handleBreathSecondsChange = (pace: number) => {
    setBreathSeconds(pace);
    saveBreathSeconds(pace);
  };

  // Generate a real (randomised) practice and advance to the overview.
  const handleGenerate = (pace: number) => {
    // This tap is a genuine user gesture — use it to start ambient sound if the
    // preference is enabled, since the initial autoplay on load was blocked and
    // this may be the user's first interaction. No-op when ambient is disabled.
    requestAmbientPlay();
    const generated = generatePractice(poses, {
      breathSeconds: pace,
      basicsOnly,
    });
    setPractice(generated);
    setBreathSeconds(pace);
    saveBreathSeconds(pace);
    setScreen('overview');
  };

  // Regenerate a fresh practice at the same breath pace (from the Overview map).
  const handleRegenerate = () => {
    setPractice(generatePractice(poses, { breathSeconds, basicsOnly }));
  };

  // Swap one pose in the current practice for a valid same-category alternative.
  // Lives here (the practice owner) so the swapped sequence flows to BOTH the
  // Overview (map + carousel) and the Guided run. A null result (fixed pose or
  // no fitting candidate) leaves the practice untouched — the UI disables the
  // control in those cases, so this is a defensive no-op.
  const handleSwapPose = (poseId: string) => {
    setPractice((prev) => {
      if (!prev) return prev;
      const result = swapPose(prev.poses, prev.breathSeconds, poseId, {
        basicsOnly,
      });
      if (!result) return prev;
      return {
        poses: result.poses,
        totalSeconds: result.totalSeconds,
        breathSeconds: prev.breathSeconds,
      };
    });
  };

  // Toggle "Basics only" mode: remember the choice and immediately rebuild the
  // current practice in the new mode so the Overview reflects it right away.
  // Uses `next` (not the state, which updates asynchronously) for the rebuild.
  const handleToggleBasics = (next: boolean) => {
    setBasicsOnly(next);
    saveBasicsOnly(next);
    setPractice(generatePractice(poses, { breathSeconds, basicsOnly: next }));
  };

  const handleBackHome = () => setScreen('home');
  const handleBackOverview = () => setScreen('overview');
  const handleStartGuided = () => {
    // Also a genuine gesture: ensure ambient is playing (if enabled) by the time
    // the guided run begins, in case the user reached here without an earlier tap
    // that started it.
    requestAmbientPlay();
    setScreen('guided');
  };

  // DEV-ONLY: render the Guided completion screen directly for `/?complete`,
  // inside the normal app shell (so the MusicPanel + container styling apply).
  if (devComplete && devPractice) {
    return (
      <main className="app">
        <MusicPanel />
        <div className="app__container">
          {/*
            GuidedScreen is lazy-loaded (its own chunk). The Suspense fallback is
            a quiet, empty guided-player screen — matching the guided layout so
            there's no jarring flash of text while the chunk resolves (near-instant
            from the same origin on a warm cache). aria-busy announces the wait.
          */}
          <Suspense
            fallback={
              <section
                className="screen guided-player"
                aria-busy="true"
                aria-label="Loading practice"
              />
            }
          >
            <GuidedScreen
              practice={devPractice}
              breathSeconds={breathSeconds}
              onExit={handleBackHome}
              onComplete={handleBackHome}
              startComplete
            />
          </Suspense>
        </div>
      </main>
    );
  }

  return (
    <main className="app">
      {/*
        Rendered at the shell level, OUTSIDE the per-screen conditionals below,
        so the music panel is present on every screen and its <audio> element
        never unmounts on navigation — playback persists across Home → Overview
        → Guided. Collapsed by default; it only toggles a CSS class.
      */}
      <MusicPanel />

      <div className="app__container">
        {screen === 'home' && (
          <HomeScreen
            breathSeconds={breathSeconds}
            onBreathSecondsChange={handleBreathSecondsChange}
            onGenerate={handleGenerate}
          />
        )}

        {screen === 'overview' && practice && (
          <OverviewScreen
            practice={practice}
            breathSeconds={breathSeconds}
            onBack={handleBackHome}
            onStartGuided={handleStartGuided}
            onRegenerate={handleRegenerate}
            onSwapPose={handleSwapPose}
            basicsOnly={basicsOnly}
            onToggleBasics={handleToggleBasics}
          />
        )}

        {screen === 'guided' && practice && (
          // GuidedScreen is lazy-loaded; the Suspense fallback is a quiet, empty
          // guided-player screen matching the guided layout (no text flash) while
          // its chunk resolves. aria-busy announces the brief wait.
          <Suspense
            fallback={
              <section
                className="screen guided-player"
                aria-busy="true"
                aria-label="Loading practice"
              />
            }
          >
            <GuidedScreen
              practice={practice}
              breathSeconds={breathSeconds}
              onExit={handleBackOverview}
              onComplete={handleBackHome}
            />
          </Suspense>
        )}
      </div>
    </main>
  );
}

export default App;
