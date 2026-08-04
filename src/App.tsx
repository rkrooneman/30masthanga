/**
 * App — the navigation shell + shared state for ashtanga30.
 *
 * SLICE 3 SCOPE: router-free navigation. There is no router library (a
 * deliberate design decision); instead this component holds a single `screen`
 * value plus the shared practice/breath state, passes handlers down, and renders
 * whichever screen is active. Later slices swap the Overview/Guided placeholders
 * for real screens without touching this wiring.
 *
 * === browser-history wiring (TWA/PWA back-gesture navigation) ===
 * The system/browser Back gesture steps guided -> overview -> home instead of
 * exiting the app, by mirroring each forward navigation into the real browser
 * History API. The model, deliberately kept simple and loop-free, is:
 *
 *   - FORWARD handlers PUSH a history entry. Going home->overview and
 *     overview->guided each call `window.history.pushState({ screen }, '')`.
 *     The initial 'home' screen is the base entry (never pushed).
 *   - ALL "go back" paths funnel through `window.history.back()` -- both the
 *     system/browser gesture AND the in-app back controls (Overview Back,
 *     Guided Exit). In-app buttons do NOT call setScreen directly; they pop
 *     history, which fires popstate, which is the single place that re-syncs
 *     React state. This keeps the history stack and the visible screen aligned,
 *     so one back gesture always steps exactly one screen.
 *   - A single mount-time `popstate` listener is the ONLY place that calls
 *     setScreen in response to navigation. It reads the target screen from
 *     `event.state.screen` (falling back to the navHistory reducer's screenBack
 *     from the current screen), so a back FROM home lands on the base 'home'
 *     entry and, one more back, lets the platform close the app / TWA activity
 *     (we never preventDefault or trap the user on home).
 *
 * Because pushes happen only in forward handlers and setScreen happens only in
 * the popstate handler, there is no double-push and no popstate loop: a
 * popstate-driven setScreen never pushes, and a forward push never triggers the
 * back path.
 *
 * SEAM FOR TASK 3: the confirm-before-leaving-a-running-practice dialog and
 * pause semantics are NOT built here. When they land, the guided back event is
 * the single interception point -- the popstate handler (or the Guided Exit
 * control that drives history.back()) is where a confirmation would gate the
 * overview transition. Task 2 leaves that seam clean without adding the dialog.
 */

import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import type { Screen } from './types/navigation';
import { poses } from './data/poses';
import { generatePractice } from './lib/generatePractice';
import { ROOT_SCREEN } from './lib/navHistory';
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
  loadVinyasasEnabled,
  saveVinyasasEnabled,
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
  // "Vinyasas" mode (a half-vinyasa between consecutive seated poses), remembered
  // across visits, DEFAULT ON. Orthogonal to Basics/Full series — it can combine
  // with either. Threads into both generation (budget) and the guided plan.
  const [vinyasas, setVinyasas] = useState<boolean>(loadVinyasasEnabled);

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
        ? buildSelectedPractice(poses, selectedIds, breathSeconds, { vinyasas })
        : null,
    [selectedIds, breathSeconds, vinyasas],
  );

  // Browser-history <-> screen-state sync (see the module doc for the model).
  // A single mount-time popstate listener is the ONLY navigation-driven caller
  // of setScreen. Every FORWARD navigation pushes a history entry carrying its
  // target in `state.screen`; the ONLY entry without state is the base 'home'
  // entry (never pushed). So on ANY back event the target is simply
  // `event.state.screen`, or ROOT_SCREEN ('home') when we have landed back on
  // that stateless base entry -- this also correctly resolves a multi-step jump
  // (completion's history.go(-2) lands on the base entry -> home). Reading the
  // target from the recorded browser stack this way is exactly the navHistory
  // reducer's stack mode (resolveBack(current, stack)): the browser's entry list
  // IS the recorded Screen[] stack, so we defer to it rather than duplicating the
  // fixed BACK_OF chain here. Empty deps: subscribe once, never re-subscribe on
  // render. This handler never pushes, so it cannot loop.
  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      const target = (event.state as { screen?: Screen } | null)?.screen;
      setScreen(target ?? ROOT_SCREEN);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

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
    ? generatePractice(poses, { breathSeconds, basicsOnly, vinyasas })
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
  const seedFromGenerated = (pace: number, basics: boolean, vin: boolean) => {
    const generated = generatePractice(poses, {
      breathSeconds: pace,
      basicsOnly: basics,
      vinyasas: vin,
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
    seedFromGenerated(pace, basicsOnly, vinyasas);
    setBreathSeconds(pace);
    saveBreathSeconds(pace);
    // FORWARD push (home->overview): add a real history entry so a later back
    // gesture pops us back to home. State stays in sync here directly; the
    // popstate handler only runs on BACK.
    window.history.pushState({ screen: 'overview' }, '');
    setScreen('overview');
  };

  // "New sequence": wipe the current selection and generate a fresh <=30-min set
  // at the same breath pace (re-seeding the selected set), turning Full series
  // off. Manual customisation is discarded — this is a clean regenerate.
  const handleRegenerate = () => {
    seedFromGenerated(breathSeconds, basicsOnly, vinyasas);
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
    seedFromGenerated(breathSeconds, next, vinyasas);
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
      seedFromGenerated(breathSeconds, basicsOnly, vinyasas);
    }
  };

  // Toggle "Vinyasas" mode: remember the choice and re-seed the selection from a
  // fresh generated set with the new flag, so the pose count reflects the new
  // budget immediately (a vinyasa practice budgets in the seated→seated
  // half-vinyasas, so it selects fewer seated poses). Orthogonal to Basics /
  // Full series — it does not touch either. Uses `next` (not the async state).
  // If Full series is currently on, seedFromGenerated turns it off (a generated
  // set is capped at 30 min), consistent with the Basics toggle.
  const handleToggleVinyasas = (next: boolean) => {
    setVinyasas(next);
    saveVinyasasEnabled(next);
    seedFromGenerated(breathSeconds, basicsOnly, next);
  };

  // In-app back controls funnel through history.back() rather than setScreen, so
  // the history stack and the visible screen stay aligned (the single popstate
  // handler does the actual setScreen). This is what makes one back gesture --
  // button OR system gesture -- always step exactly one screen, with no stale
  // forward entry left behind.
  const handleBackHome = () => window.history.back();
  const handleBackOverview = () => window.history.back();
  const handleStartGuided = () => {
    // Also a genuine gesture: ensure ambient is playing (if enabled) by the time
    // the guided run begins, in case the user reached here without an earlier tap
    // that started it.
    requestAmbientPlay();
    // FORWARD push (overview->guided): mirror the navigation into history so the
    // back gesture pops guided->overview. setScreen here (forward); popstate only
    // handles BACK.
    window.history.pushState({ screen: 'guided' }, '');
    setScreen('guided');
  };

  // Completion (guided->home "fresh start"). Unlike a single back step,
  // completion collapses BOTH forward entries (overview and guided) so the user
  // lands on the base 'home' entry with NO dangling forward entry -- one more
  // back gesture then exits the app rather than doing nothing or dropping the
  // user back into the just-finished practice.
  //
  // Task 5 history contract: while the completion (Namaste) screen is showing,
  // GuidedScreen keeps its single "guard" history entry ON TOP of the guided
  // entry (it is NOT torn down on completion). BOTH the completion screen's
  // "Return home" button AND a system back gesture funnel through the SAME path:
  // GuidedScreen does history.back() to pop that guard (App's popstate handler
  // resolves the landed entry's state.screen === 'guided', a no-op that keeps
  // GuidedScreen mounted so no completion audio replays and there is no flicker
  // to overview), then GuidedScreen's interceptor calls THIS handler. By then the
  // live stack is [home(base), overview, guided], so history.go(-2) jumps
  // straight to the base entry; that fires ONE popstate whose state is null (the
  // base entry is the one screen we never pushed state for), and the single
  // handler above resolves that to ROOT_SCREEN ('home'). No push happens, so
  // there is nothing stale ahead. Keeping the go(-2) here (rather than a bare
  // back()) is deliberate: the guard has already been popped by the time this
  // runs, so exactly the overview + guided entries remain above home to collapse.
  const handleComplete = () => window.history.go(-2);

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
              vinyasas={vinyasas}
              // DEV-ONLY hatch: the app mounted straight into completion with NO
              // forward history entries, so the normal history-driven back paths
              // do not apply here. Preserve the prior behaviour (return to the
              // real Home screen) with a direct setScreen, rather than a
              // history.back()/go() that would background the app instead.
              onExit={() => setScreen('home')}
              onComplete={() => setScreen('home')}
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
            vinyasas={vinyasas}
            onToggleVinyasas={handleToggleVinyasas}
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
              vinyasas={vinyasas}
              // Exit (mid-practice) is a single back: guided->overview, so it
              // funnels through history.back(). Complete is a full reset to the
              // base home entry (see handleComplete) so back after finishing
              // exits rather than re-entering the just-finished practice. On the
              // completion screen the "Return home" button and a system back
              // gesture BOTH reach here via the same path (GuidedScreen pops its
              // guard, then calls onComplete), so they land on home identically.
              onExit={handleBackOverview}
              onComplete={handleComplete}
            />
          </Suspense>
        )}
      </div>
    </main>
  );
}

export default App;
