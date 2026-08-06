/**
 * Deterministic, dependency-free test for the pure guidance model.
 *
 * Run with:  npx tsx src/lib/guidance.test.ts
 *
 * No test framework, no deps. Exercises the three pure functions in
 * guidance.ts: layersForLevel (the exact level -> layers table),
 * clampGuidanceLevel (rounding + 0..3 clamp), and deriveGuidanceLevel (the
 * one-time migration from the legacy per-toggle prefs). The migration is tested
 * through its pure helper so it needs no localStorage/DOM under tsx.
 * Prints which assertion failed and exits non-zero on any failure; on success
 * prints "ALL GUIDANCE TESTS PASSED" and the assertion count.
 */

import {
  type GuidanceLayers,
  type GuidanceLevel,
  clampGuidanceLevel,
  deriveGuidanceLevel,
  layersForLevel,
} from './guidance';

// --- minimal assertion helper ---
let assertionCount = 0;
const failures: string[] = [];

function check(condition: boolean, message: string): void {
  assertionCount++;
  if (!condition) {
    failures.push(message);
  }
}

function layersEqual(a: GuidanceLayers, b: GuidanceLayers): boolean {
  return a.bell === b.bell && a.breath === b.breath && a.voice === b.voice;
}

// ---------------------------------------------------------------------------
// 1. layersForLevel: the exact cumulative table for all 4 levels.
// ---------------------------------------------------------------------------
{
  const expected: Record<GuidanceLevel, GuidanceLayers> = {
    0: { bell: false, breath: false, voice: false },
    1: { bell: true, breath: false, voice: false },
    2: { bell: true, breath: true, voice: false },
    3: { bell: true, breath: true, voice: true },
  };
  for (const level of [0, 1, 2, 3] as GuidanceLevel[]) {
    check(
      layersEqual(layersForLevel(level), expected[level]),
      `layersForLevel(${level}) must equal the table entry`,
    );
  }
}

// ---------------------------------------------------------------------------
// 2. clampGuidanceLevel: rounding + clamp into 0..3.
//    Rounding uses Math.round (2.5 -> 3, 2.4 -> 2).
// ---------------------------------------------------------------------------
{
  check(clampGuidanceLevel(-1) === 0, 'clamp -1 -> 0 (below range)');
  check(clampGuidanceLevel(0) === 0, 'clamp 0 -> 0');
  check(clampGuidanceLevel(3) === 3, 'clamp 3 -> 3');
  check(clampGuidanceLevel(4) === 3, 'clamp 4 -> 3 (above range)');
  check(clampGuidanceLevel(100) === 3, 'clamp 100 -> 3 (far above range)');
  check(clampGuidanceLevel(-100) === 0, 'clamp -100 -> 0 (far below range)');
  check(clampGuidanceLevel(2.6) === 3, 'round 2.6 -> 3');
  check(clampGuidanceLevel(2.4) === 2, 'round 2.4 -> 2');
  check(clampGuidanceLevel(2.5) === 3, 'round 2.5 -> 3 (Math.round up)');
  check(clampGuidanceLevel(Number.NaN) === 0, 'NaN -> 0 (safe fallback)');
}

// ---------------------------------------------------------------------------
// 3. deriveGuidanceLevel: the one-time migration mapping.
// ---------------------------------------------------------------------------
{
  // master sound OFF wins regardless of the other toggles -> 0 (Silent)
  check(
    deriveGuidanceLevel({
      soundEnabled: false,
      voiceEnabled: true,
      breathCuesEnabled: true,
    }) === 0,
    'sound off -> 0 (Silent), even with voice + breath on',
  );

  // voice ON (and sound on) -> 3 (Voice / full)
  check(
    deriveGuidanceLevel({
      soundEnabled: true,
      voiceEnabled: true,
      breathCuesEnabled: false,
    }) === 3,
    'voice on -> 3 (Voice)',
  );

  // breath cues ON but voice OFF (sound on) -> 2 (Breath)
  check(
    deriveGuidanceLevel({
      soundEnabled: true,
      voiceEnabled: false,
      breathCuesEnabled: true,
    }) === 2,
    'breath on, voice off -> 2 (Breath)',
  );

  // all extras off but sound on -> 1 (Bell)
  check(
    deriveGuidanceLevel({
      soundEnabled: true,
      voiceEnabled: false,
      breathCuesEnabled: false,
    }) === 1,
    'sound on, voice off, breath off -> 1 (Bell)',
  );

  // brand-new user: defaults are soundEnabled true + voiceEnabled true, so the
  // derived level is 3 (full guidance) - matching current default behavior.
  check(
    deriveGuidanceLevel({
      soundEnabled: true,
      voiceEnabled: true,
      breathCuesEnabled: false,
    }) === 3,
    'brand-new defaults (sound true, voice true) -> 3 (full guidance)',
  );
}

// --- report ---
if (failures.length > 0) {
  console.error(`\n=== GUIDANCE TESTS FAILED (${failures.length}) ===`);
  for (const f of failures) console.error(`  \u2717 ${f}`);
  console.error(`\n(${assertionCount} assertions run)`);
  process.exit(1);
}

console.log('ALL GUIDANCE TESTS PASSED');
console.log(`${assertionCount} assertions run.`);
