import type { Pose } from '../types/pose';
import {
  formatPoseDurationContext,
  posePracticeNote,
  sectionLabelForPose,
} from './poseContext';

let assertionCount = 0;
const failures: string[] = [];

function check(condition: boolean, message: string): void {
  assertionCount++;
  if (!condition) {
    failures.push(message);
  }
}

function pose(overrides: Partial<Pose>): Pose {
  return {
    id: 'test_pose',
    sanskrit: 'Test Pose',
    phonetic: 'test',
    english: 'Test',
    category: 'standing',
    group: 'forward_fold',
    order: 1,
    breaths: 5,
    sides: 1,
    repeat: 1,
    alwaysInclude: false,
    selectable: true,
    drishti: 'Nasagrai (tip of the nose)',
    isBasic: false,
    ...overrides,
  };
}

check(
  sectionLabelForPose(pose({ category: 'sun_a' })) === 'Sun Salutations',
  'sun_a maps to Sun Salutations',
);
check(
  sectionLabelForPose(pose({ category: 'sun_b' })) === 'Sun Salutations',
  'sun_b maps to Sun Salutations',
);
check(
  sectionLabelForPose(pose({ category: 'finishing' })) === 'Rest',
  'finishing maps to Rest',
);
check(
  sectionLabelForPose(pose({ category: 'seated' })) === 'Seated',
  'seated maps to Seated',
);

check(
  formatPoseDurationContext(pose({ breaths: 5, sides: 1, repeat: 1 })) ===
    '5 breaths',
  'single pose duration is plain breaths',
);
check(
  formatPoseDurationContext(pose({ breaths: 5, sides: 2, repeat: 1 })) ===
    '5 breaths per side',
  'two-sided pose duration is per side',
);
check(
  formatPoseDurationContext(pose({ breaths: 5, sides: 1, repeat: 5 })) ===
    '5 rounds, 5 breaths each',
  'repeated pose duration names rounds',
);
check(
  formatPoseDurationContext(
    pose({ breaths: 9.5, repeat: 3, flow: [{ label: 'Flow', breaths: 5 }] }),
  ) === '3 rounds, about 9.5 breaths each',
  'repeated flow duration names rounds and approximate breaths',
);

check(
  posePracticeNote(pose({ id: 'kurmasana', isAdvanced: true })) ===
    'Best learned with teacher guidance.',
  'advanced poses get a teacher guidance note',
);
check(
  posePracticeNote(pose({ id: 'sirsasana', group: 'inversion' })) ===
    'Best learned with teacher guidance.',
  'headstand gets a teacher guidance note',
);
check(
  posePracticeNote(pose({ id: 'setu_bandhasana', group: 'backbend' })) ===
    'Warm up gradually and keep the breath steady.',
  'backbends get a calm warming note',
);
check(
  posePracticeNote(pose({ id: 'savasana', category: 'finishing' })) ===
    'Let the body rest and the breath become natural.',
  'savasana gets a rest note',
);
check(
  posePracticeNote(pose({ id: 'padangusthasana' })) === null,
  'ordinary poses do not get noisy notes',
);

if (failures.length > 0) {
  console.error(`\n=== POSE CONTEXT TESTS FAILED (${failures.length}) ===`);
  for (const failure of failures) console.error(`  x ${failure}`);
  console.error(`\n(${assertionCount} assertions run)`);
  process.exit(1);
}

console.log('ALL POSE CONTEXT TESTS PASSED');
console.log(`${assertionCount} assertions run.`);
