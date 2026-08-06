/**
 * Deterministic, dependency-free test for the pure ambient model.
 *
 * Run with:  npx tsx src/lib/ambient.test.ts
 *
 * No test framework, no deps. Exercises the AmbientChoice model (AMBIENT_ORDER,
 * the slider index round-trip, clampAmbientChoice), the source-URL builder
 * (ambientSrc), and the legacy-boolean migration helper
 * (ambientFromLegacyEnabled). Everything is pure so it needs no localStorage/DOM
 * under tsx. Prints which assertion failed and exits non-zero on any failure; on
 * success prints "ALL AMBIENT TESTS PASSED" and the assertion count.
 */

import {
  type AmbientChoice,
  AMBIENT_ORDER,
  ambientFromLegacyEnabled,
  ambientSrc,
  ambientToIndex,
  clampAmbientChoice,
  indexToAmbient,
} from './ambient';

// --- minimal assertion helper ---
let assertionCount = 0;
const failures: string[] = [];

function check(condition: boolean, message: string): void {
  assertionCount++;
  if (!condition) {
    failures.push(message);
  }
}

// ---------------------------------------------------------------------------
// 1. AMBIENT_ORDER: the four choices, in slider order.
// ---------------------------------------------------------------------------
{
  check(AMBIENT_ORDER.length === 4, 'AMBIENT_ORDER has 4 entries');
  check(AMBIENT_ORDER[0] === 'off', 'AMBIENT_ORDER[0] -> off');
  check(AMBIENT_ORDER[1] === 'forest', 'AMBIENT_ORDER[1] -> forest');
  check(AMBIENT_ORDER[2] === 'rain', 'AMBIENT_ORDER[2] -> rain');
  check(AMBIENT_ORDER[3] === 'ocean', 'AMBIENT_ORDER[3] -> ocean');
}

// ---------------------------------------------------------------------------
// 2. ambientToIndex / indexToAmbient round-trip + clamp/round/NaN.
// ---------------------------------------------------------------------------
{
  const choices: AmbientChoice[] = ['off', 'forest', 'rain', 'ocean'];
  const expectedIndex: Record<AmbientChoice, 0 | 1 | 2 | 3> = {
    off: 0,
    forest: 1,
    rain: 2,
    ocean: 3,
  };
  for (const c of choices) {
    check(
      ambientToIndex(c) === expectedIndex[c],
      `ambientToIndex('${c}') -> ${expectedIndex[c]}`,
    );
    check(
      indexToAmbient(ambientToIndex(c)) === c,
      `round-trip index for '${c}'`,
    );
  }
  // indexToAmbient clamps + rounds
  check(indexToAmbient(0) === 'off', 'indexToAmbient(0) -> off');
  check(indexToAmbient(1) === 'forest', 'indexToAmbient(1) -> forest');
  check(indexToAmbient(2) === 'rain', 'indexToAmbient(2) -> rain');
  check(indexToAmbient(3) === 'ocean', 'indexToAmbient(3) -> ocean');
  check(indexToAmbient(-1) === 'off', 'indexToAmbient(-1) -> off (clamped)');
  check(indexToAmbient(9) === 'ocean', 'indexToAmbient(9) -> ocean (clamped)');
  check(indexToAmbient(1.4) === 'forest', 'indexToAmbient(1.4) -> forest (rounded)');
  check(indexToAmbient(2.5) === 'ocean', 'indexToAmbient(2.5) -> ocean (rounded up)');
  check(indexToAmbient(Number.NaN) === 'off', 'indexToAmbient(NaN) -> off');
}

// ---------------------------------------------------------------------------
// 3. clampAmbientChoice: valid strings pass; numeric/numeric-string map by
//    index; invalid -> off.
// ---------------------------------------------------------------------------
{
  // valid string pref values pass straight through
  check(clampAmbientChoice('off') === 'off', "clampAmbientChoice('off') -> off");
  check(
    clampAmbientChoice('forest') === 'forest',
    "clampAmbientChoice('forest') -> forest",
  );
  check(
    clampAmbientChoice('rain') === 'rain',
    "clampAmbientChoice('rain') -> rain",
  );
  check(
    clampAmbientChoice('ocean') === 'ocean',
    "clampAmbientChoice('ocean') -> ocean",
  );

  // numeric slider index maps cleanly
  check(clampAmbientChoice(0) === 'off', 'clampAmbientChoice(0) -> off');
  check(clampAmbientChoice(1) === 'forest', 'clampAmbientChoice(1) -> forest');
  check(clampAmbientChoice(2) === 'rain', 'clampAmbientChoice(2) -> rain');
  check(clampAmbientChoice(3) === 'ocean', 'clampAmbientChoice(3) -> ocean');

  // out-of-range numeric is clamped
  check(clampAmbientChoice(-1) === 'off', 'clampAmbientChoice(-1) -> off (clamped)');
  check(
    clampAmbientChoice(5) === 'ocean',
    'clampAmbientChoice(5) -> ocean (clamped)',
  );

  // numeric strings (raw slider values) map by index too
  check(clampAmbientChoice('0') === 'off', "clampAmbientChoice('0') -> off");
  check(clampAmbientChoice('1') === 'forest', "clampAmbientChoice('1') -> forest");
  check(clampAmbientChoice('2') === 'rain', "clampAmbientChoice('2') -> rain");
  check(clampAmbientChoice('3') === 'ocean', "clampAmbientChoice('3') -> ocean");

  // invalid input falls back to the safe default 'off'
  check(clampAmbientChoice('nonsense') === 'off', 'invalid string -> off');
  check(clampAmbientChoice('') === 'off', 'empty string -> off');
  check(clampAmbientChoice(null) === 'off', 'null -> off');
  check(clampAmbientChoice(undefined) === 'off', 'undefined -> off');
  check(clampAmbientChoice({}) === 'off', 'object -> off');
  check(clampAmbientChoice(Number.NaN) === 'off', 'NaN -> off');
}

// ---------------------------------------------------------------------------
// 4. ambientSrc: 'off' -> null; others -> /ambient/<name>.mp3 (literal path).
// ---------------------------------------------------------------------------
{
  check(ambientSrc('off') === null, "ambientSrc('off') -> null");
  check(
    ambientSrc('forest') === '/ambient/forest.mp3',
    "ambientSrc('forest') -> /ambient/forest.mp3",
  );
  check(
    ambientSrc('rain') === '/ambient/rain.mp3',
    "ambientSrc('rain') -> /ambient/rain.mp3",
  );
  check(
    ambientSrc('ocean') === '/ambient/ocean.mp3',
    "ambientSrc('ocean') -> /ambient/ocean.mp3",
  );
}

// ---------------------------------------------------------------------------
// 5. ambientFromLegacyEnabled: legacy ambient-ON -> 'forest', OFF -> 'off'.
// ---------------------------------------------------------------------------
{
  check(
    ambientFromLegacyEnabled(true) === 'forest',
    'ambientFromLegacyEnabled(true) -> forest (default nature bed)',
  );
  check(
    ambientFromLegacyEnabled(false) === 'off',
    'ambientFromLegacyEnabled(false) -> off',
  );
}

// --- report ---
if (failures.length > 0) {
  console.error(`\n=== AMBIENT TESTS FAILED (${failures.length}) ===`);
  for (const f of failures) console.error(`  \u2717 ${f}`);
  console.error(`\n(${assertionCount} assertions run)`);
  process.exit(1);
}

console.log('ALL AMBIENT TESTS PASSED');
console.log(`${assertionCount} assertions run.`);
