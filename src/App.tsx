/**
 * App — the navigation shell + shared state for ashtanga30.
 *
 * SLICE 3 SCOPE: router-free navigation. There is no router library (a
 * deliberate design decision); instead this component holds a single `screen`
 * value plus the shared practice/breath state, passes handlers down, and renders
 * whichever screen is active. Later slices swap the Overview/Guided placeholders
 * for real screens without touching this wiring.
 */

import { useState } from 'react';
import type { Screen } from './types/navigation';
import type { GeneratedPractice } from './lib/generatePractice';
import { poses } from './data/poses';
import { generatePractice } from './lib/generatePractice';
import { loadBreathSeconds, saveBreathSeconds } from './lib/preferences';
import HomeScreen from './screens/HomeScreen';
import OverviewScreen from './screens/OverviewScreen';
import GuidedScreen from './screens/GuidedScreen';
import MusicPanel from './components/MusicPanel';
// DEV-ONLY (pose-icon contact sheet): reached via the `?pilot` query string.
// Gated behind import.meta.env.DEV so it is tree-shaken out of production.
import PosePilot from './components/poses/PosePilot';

function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [practice, setPractice] = useState<GeneratedPractice | null>(null);
  // Breath pace is remembered across visits (persisted to localStorage).
  const [breathSeconds, setBreathSeconds] = useState<number>(loadBreathSeconds);

  // DEV-ONLY pilot escape hatch: visiting `/?pilot` renders the pose-icon
  // contact sheet instead of the normal app. Computed after hooks (Rules of
  // Hooks). `import.meta.env.DEV` is statically false in production builds, so
  // this branch and the PosePilot import are stripped from the prod bundle.
  if (import.meta.env.DEV && window.location.search.includes('pilot')) {
    return <PosePilot />;
  }

  // Persist the breath pace whenever it changes (from the Home slider).
  const handleBreathSecondsChange = (pace: number) => {
    setBreathSeconds(pace);
    saveBreathSeconds(pace);
  };

  // Generate a real (randomised) practice and advance to the overview.
  const handleGenerate = (pace: number) => {
    const generated = generatePractice(poses, { breathSeconds: pace });
    setPractice(generated);
    setBreathSeconds(pace);
    saveBreathSeconds(pace);
    setScreen('overview');
  };

  // Regenerate a fresh practice at the same breath pace (from the Overview map).
  const handleRegenerate = () => {
    setPractice(generatePractice(poses, { breathSeconds }));
  };

  const handleBackHome = () => setScreen('home');
  const handleBackOverview = () => setScreen('overview');
  const handleStartGuided = () => setScreen('guided');

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
          />
        )}

        {screen === 'guided' && practice && (
          <GuidedScreen
            practice={practice}
            breathSeconds={breathSeconds}
            onExit={handleBackOverview}
            onComplete={handleBackHome}
          />
        )}
      </div>
    </main>
  );
}

export default App;
