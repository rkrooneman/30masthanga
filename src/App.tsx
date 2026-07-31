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
import { DEFAULT_BREATH_SECONDS } from './lib/timing';
import HomeScreen from './screens/HomeScreen';
import OverviewScreen from './screens/OverviewScreen';
import GuidedScreen from './screens/GuidedScreen';

function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [practice, setPractice] = useState<GeneratedPractice | null>(null);
  const [breathSeconds, setBreathSeconds] = useState<number>(
    DEFAULT_BREATH_SECONDS,
  );

  // Generate a real (randomised) practice and advance to the overview.
  const handleGenerate = (pace: number) => {
    const generated = generatePractice(poses, { breathSeconds: pace });
    setPractice(generated);
    setBreathSeconds(pace);
    setScreen('overview');
  };

  const handleBackHome = () => setScreen('home');
  const handleBackOverview = () => setScreen('overview');
  const handleStartGuided = () => setScreen('guided');

  return (
    <main className="app">
      <div className="app__container">
        {screen === 'home' && (
          <HomeScreen
            breathSeconds={breathSeconds}
            onBreathSecondsChange={setBreathSeconds}
            onGenerate={handleGenerate}
          />
        )}

        {screen === 'overview' && practice && (
          <OverviewScreen
            practice={practice}
            breathSeconds={breathSeconds}
            onBack={handleBackHome}
            onStartGuided={handleStartGuided}
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
