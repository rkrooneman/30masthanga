/**
 * App — the navigation shell + shared state for ashtanga30.
 *
 * SLICE 3 SCOPE: router-free navigation. There is no router library (a
 * deliberate design decision); instead this component holds a single `screen`
 * value plus the shared practice/breath state, passes handlers down, and renders
 * whichever screen is active. Later slices swap the Overview/Guided placeholders
 * for real screens without touching this wiring.
 */

import { lazy, Suspense, useMemo, useState } from 'react';
import type { Screen } from './types/navigation';
import { poses } from './data/poses';
import { generatePractice } from './lib/generatePractice';
import { buildSelectedPractice } from './lib/selectedPractice';
import { seedFakePractice } from './lib/practiceLog';
import { requestAmbientPlay } from './lib/ambientPref';
import {
  loadBreathSeconds,
  saveBreathSeconds,
  loadBasicsOnly,
  saveBasicsOnly,
  loadFullSeriesEnabled,
  saveFullSeriesEnabled,
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
  // The practice is a user-editable SELECTION over the full catalog: a Set of
  // selected pose ids. The generator seeds it (its chosen poses = initially
  // checked); toggling a card adds/removes an id. `null` means "not generated
  // yet" (Home hasn't handed off a practice). The fixed frame (alwaysInclude)
  // is always present in the set and can never be unchecked. The DERIVED
  // practice (poses in canonical order + recomputed total) is memoised below.
  const [selectedIds, setSelectedIds] = useState<Set<string> | null>(null);
  // Breath pace is remembered across visits (persisted to localStorage).
  const [breathSeconds, setBreathSeconds] = useState<number>(loadBreathSeconds);
  // "Basics only" (Smart Start) mode, also remembered across visits.
  const [basicsOnly, setBasicsOnly] = useState<boolean>(loadBasicsOnly);
  // "Full series" mode (every catalog pose selected), remembered across visits.
  // Mutually exclusive with "Basics only" (enforced by the toggle handlers).
  const [fullSeries, setFullSeries] = useState<boolean>(loadFullSeriesEnabled);

  // The fixed frame — poses that must always be included and are NOT toggleable
  // (Sun Salutations A/B, Shoulderstand, Savasana). Derived once from the
  // catalog; used to seed selections and to guard the toggle handler.
  const fixedFrameIds = useMemo(
    () => new Set(poses.filter((p) => p.alwaysInclude).map((p) => p.id)),
    [],
  );

  // The DERIVED practice the Overview + Guided run consume: all catalog poses
  // whose id is in the selection, in canonical order, with a recomputed total
  // (no 30-min ceiling — a manual selection may exceed it, shown honestly).
  // Null until Home generates the first practice.
  const practice = useMemo(
    () =>
      selectedIds
        ? buildSelectedPractice(poses, selectedIds, breathSeconds)
        : null,
    [selectedIds, breathSeconds],
  );

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

  // Seed the selection from a freshly generated <=30-min practice: the
  // generator's chosen poses become the initially-checked set (the fixed frame
  // is included among them). Also clears "Full series" (persisted): a generated
  // set is capped at 30 min, so Full series can no longer be on.
  const seedFromGenerated = (pace: number, basics: boolean) => {
    const generated = generatePractice(poses, {
      breathSeconds: pace,
      basicsOnly: basics,
    });
    setSelectedIds(new Set(generated.poses.map((p) => p.id)));
    setFullSeries(false);
    saveFullSeriesEnabled(false);
  };

  // Generate a real (randomised) practice and advance to the overview.
  const handleGenerate = (pace: number) => {
    // This tap is a genuine user gesture — use it to start ambient sound if the
    // preference is enabled, since the initial autoplay on load was blocked and
    // this may be the user's first interaction. No-op when ambient is disabled.
    requestAmbientPlay();
    seedFromGenerated(pace, basicsOnly);
    setBreathSeconds(pace);
    saveBreathSeconds(pace);
    setScreen('overview');
  };

  // "New sequence": wipe the current selection and generate a fresh <=30-min set
  // at the same breath pace (re-seeding the selected set), turning Full series
  // off. Manual customisation is discarded — this is a clean regenerate.
  const handleRegenerate = () => {
    seedFromGenerated(breathSeconds, basicsOnly);
  };

  // Toggle a single pose in/out of the selection. Fixed-frame poses are never
  // toggleable (the checkbox is locked in the UI); guarded here defensively so a
  // stray call can never remove Savasana / Shoulderstand / the Salutations.
  const handleToggleSelected = (poseId: string) => {
    if (fixedFrameIds.has(poseId)) return;
    const base = selectedIds ?? new Set<string>();
    const next = new Set(base);
    if (next.has(poseId)) next.delete(poseId);
    else next.add(poseId);
    setSelectedIds(next);
    // Keep the "Full series" toggle honest: it is on exactly when every catalog
    // pose is selected. Unchecking any pose turns it off; checking the final
    // remaining pose turns it on.
    const allSelected = poses.every((p) => next.has(p.id));
    if (allSelected !== fullSeries) {
      setFullSeries(allSelected);
      saveFullSeriesEnabled(allSelected);
    }
  };

  // Toggle "Basics only" mode: remember the choice and re-seed the selection
  // from a fresh generated set in the new mode, so the Overview reflects it
  // right away. Mutually exclusive with Full series — seedFromGenerated turns
  // Full series off. Uses `next` (not the async state) for the rebuild.
  const handleToggleBasics = (next: boolean) => {
    setBasicsOnly(next);
    saveBasicsOnly(next);
    seedFromGenerated(breathSeconds, next);
  };

  // Toggle "Full series" mode.
  //   ON  → select EVERY catalog pose (Basics off, both persisted). The user can
  //         still uncheck individual non-fixed poses on the Overview.
  //   OFF → regenerate a fresh <=30-min set (consistent with New sequence).
  // Persisted either way. Kept mutually exclusive with Basics.
  const handleToggleFullSeries = (next: boolean) => {
    setFullSeries(next);
    saveFullSeriesEnabled(next);
    if (next) {
      setBasicsOnly(false);
      saveBasicsOnly(false);
      setSelectedIds(new Set(poses.map((p) => p.id)));
    } else {
      // Regenerate a fresh <=30-min set. seedFromGenerated also clears Full
      // series (already false here) — harmless and keeps the invariant.
      seedFromGenerated(breathSeconds, basicsOnly);
    }
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

        {screen === 'overview' && practice && selectedIds && (
          <OverviewScreen
            practice={practice}
            breathSeconds={breathSeconds}
            selectedIds={selectedIds}
            onToggleSelected={handleToggleSelected}
            onBack={handleBackHome}
            onStartGuided={handleStartGuided}
            onRegenerate={handleRegenerate}
            basicsOnly={basicsOnly}
            onToggleBasics={handleToggleBasics}
            fullSeries={fullSeries}
            onToggleFullSeries={handleToggleFullSeries}
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
