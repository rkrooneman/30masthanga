/**
 * Deterministic, dependency-free test for the pure guidance model.
 *
 * Run with:  npx tsx src/lib/guidance.test.ts
 *
 * No test framework, no deps. Exercises the PoseCue model (predicate helpers,
 * clampPoseCue, the slider index round-trip) and the migration helpers
 * (poseCueFromLevel / breathOnFromLevel and the pre-#7 legacy chain), plus the
 * still-present deprecated #7 level helpers (layersForLevel, clampGuidanceLevel,
 * deriveGuidanceLevel) which remain until Tasks 2-4 remove their call sites. The
 * migration is tested through its pure helpers so it needs no localStorage/DOM
 * under tsx. Prints which assertion failed and exits non-zero on any failure; on
 * success prints "ALL GUIDANCE TESTS PASSED" and the assertion count.
 */

import {
  type GuidanceLayers,
  type GuidanceLevel,
  type PoseCue,
  breathOnFromLevel,
  clampGuidanceLevel,
  clampPoseCue,
  deriveGuidanceLevel,
  indexToPoseCue,
  layersForLevel,
  poseCueAnnounces,
  poseCueFromLevel,
  poseCueRingsBell,
  poseCueSpeaks,
  poseCueToIndex,
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
// 1. PoseCue predicate helpers for all three cues.
//    - poseCueRingsBell: only 'bell'
//    - poseCueSpeaks:    only 'voice'
//    - poseCueAnnounces: not 'silent' (bell OR voice)
// ---------------------------------------------------------------------------
{
  check(poseCueRingsBell('bell'), "poseCueRingsBell('bell') -> true");
  check(!poseCueRingsBell('silent'), "poseCueRingsBell('silent') -> false");
  check(!poseCueRingsBell('voice'), "poseCueRingsBell('voice') -> false");

  check(poseCueSpeaks('voice'), "poseCueSpeaks('voice') -> true");
  check(!poseCueSpeaks('silent'), "poseCueSpeaks('silent') -> false");
  check(!poseCueSpeaks('bell'), "poseCueSpeaks('bell') -> false");

  check(!poseCueAnnounces('silent'), "poseCueAnnounces('silent') -> false");
  check(poseCueAnnounces('bell'), "poseCueAnnounces('bell') -> true");
  check(poseCueAnnounces('voice'), "poseCueAnnounces('voice') -> true");
}

// ---------------------------------------------------------------------------
// 2. clampPoseCue: valid strings pass; invalid -> 'voice'; numeric 0/1/2 ->
//    silent/bell/voice; out-of-range numeric clamped; numeric strings map by
//    index too.
// ---------------------------------------------------------------------------
{
  // valid string pref values pass straight through
  check(clampPoseCue('silent') === 'silent', "clampPoseCue('silent') -> silent");
  check(clampPoseCue('bell') === 'bell', "clampPoseCue('bell') -> bell");
  check(clampPoseCue('voice') === 'voice', "clampPoseCue('voice') -> voice");

  // invalid input falls back to the safe default 'voice'
  check(clampPoseCue('nonsense') === 'voice', "invalid string -> voice");
  check(clampPoseCue('') === 'voice', "empty string -> voice");
  check(clampPoseCue(null) === 'voice', 'null -> voice');
  check(clampPoseCue(undefined) === 'voice', 'undefined -> voice');
  check(clampPoseCue({}) === 'voice', 'object -> voice');
  check(clampPoseCue(Number.NaN) === 'voice', 'NaN -> voice');

  // numeric slider index maps cleanly
  check(clampPoseCue(0) === 'silent', 'clampPoseCue(0) -> silent');
  check(clampPoseCue(1) === 'bell', 'clampPoseCue(1) -> bell');
  check(clampPoseCue(2) === 'voice', 'clampPoseCue(2) -> voice');

  // out-of-range numeric is clamped
  check(clampPoseCue(-1) === 'silent', 'clampPoseCue(-1) -> silent (clamped)');
  check(clampPoseCue(5) === 'voice', 'clampPoseCue(5) -> voice (clamped)');

  // numeric strings (raw slider values) map by index too
  check(clampPoseCue('0') === 'silent', "clampPoseCue('0') -> silent");
  check(clampPoseCue('1') === 'bell', "clampPoseCue('1') -> bell");
  check(clampPoseCue('2') === 'voice', "clampPoseCue('2') -> voice");
}

// ---------------------------------------------------------------------------
// 3. poseCueToIndex / indexToPoseCue round-trip.
// ---------------------------------------------------------------------------
{
  const cues: PoseCue[] = ['silent', 'bell', 'voice'];
  const expectedIndex: Record<PoseCue, 0 | 1 | 2> = {
    silent: 0,
    bell: 1,
    voice: 2,
  };
  for (const cue of cues) {
    check(
      poseCueToIndex(cue) === expectedIndex[cue],
      `poseCueToIndex('${cue}') -> ${expectedIndex[cue]}`,
    );
    check(
      indexToPoseCue(poseCueToIndex(cue)) === cue,
      `round-trip index for '${cue}'`,
    );
  }
  // indexToPoseCue clamps + rounds
  check(indexToPoseCue(0) === 'silent', 'indexToPoseCue(0) -> silent');
  check(indexToPoseCue(1) === 'bell', 'indexToPoseCue(1) -> bell');
  check(indexToPoseCue(2) === 'voice', 'indexToPoseCue(2) -> voice');
  check(indexToPoseCue(-1) === 'silent', 'indexToPoseCue(-1) -> silent (clamped)');
  check(indexToPoseCue(9) === 'voice', 'indexToPoseCue(9) -> voice (clamped)');
  check(indexToPoseCue(1.4) === 'bell', 'indexToPoseCue(1.4) -> bell (rounded)');
  check(indexToPoseCue(Number.NaN) === 'silent', 'indexToPoseCue(NaN) -> silent');
}

// ---------------------------------------------------------------------------
// 4. Migration table: poseCueFromLevel + breathOnFromLevel.
//    poseCueFromLevel: 0->silent, 1->bell, 2->bell, 3->voice
//    breathOnFromLevel: 0,1->false; 2,3->true
// ---------------------------------------------------------------------------
{
  const expectedCue: Record<GuidanceLevel, PoseCue> = {
    0: 'silent',
    1: 'bell',
    2: 'bell',
    3: 'voice',
  };
  const expectedBreath: Record<GuidanceLevel, boolean> = {
    0: false,
    1: false,
    2: true,
    3: true,
  };
  for (const level of [0, 1, 2, 3] as GuidanceLevel[]) {
    check(
      poseCueFromLevel(level) === expectedCue[level],
      `poseCueFromLevel(${level}) -> ${expectedCue[level]}`,
    );
    check(
      breathOnFromLevel(level) === expectedBreath[level],
      `breathOnFromLevel(${level}) -> ${expectedBreath[level]}`,
    );
  }
}

// ---------------------------------------------------------------------------
// 5. Pre-#7 legacy chain: deriveGuidanceLevel -> poseCueFromLevel /
//    breathOnFromLevel. A brand-new user (sound true, voice true) derives to
//    level 3, which chains to PoseCue 'voice' + breath on.
// ---------------------------------------------------------------------------
{
  const brandNewLevel = deriveGuidanceLevel({
    soundEnabled: true,
    voiceEnabled: true,
    breathCuesEnabled: false,
  });
  check(
    poseCueFromLevel(brandNewLevel) === 'voice',
    'brand-new legacy chain -> poseCue voice',
  );
  check(
    breathOnFromLevel(brandNewLevel) === true,
    'brand-new legacy chain -> breath on',
  );

  // sound off migrates to silent + breath off
  const silentLevel = deriveGuidanceLevel({
    soundEnabled: false,
    voiceEnabled: true,
    breathCuesEnabled: true,
  });
  check(
    poseCueFromLevel(silentLevel) === 'silent',
    'legacy sound off -> poseCue silent',
  );
  check(
    breathOnFromLevel(silentLevel) === false,
    'legacy sound off -> breath off',
  );

  // legacy breath-only (voice off, breath on) -> level 2 -> bell + breath on
  const breathOnlyLevel = deriveGuidanceLevel({
    soundEnabled: true,
    voiceEnabled: false,
    breathCuesEnabled: true,
  });
  check(
    poseCueFromLevel(breathOnlyLevel) === 'bell',
    'legacy breath-only -> poseCue bell',
  );
  check(
    breathOnFromLevel(breathOnlyLevel) === true,
    'legacy breath-only -> breath on',
  );
}

// ---------------------------------------------------------------------------
// 6. Deprecated #7 level model (still present until Tasks 2-4 remove the call
//    sites). layersForLevel table + clampGuidanceLevel rounding/clamp.
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

  check(clampGuidanceLevel(-1) === 0, 'clamp -1 -> 0 (below range)');
  check(clampGuidanceLevel(4) === 3, 'clamp 4 -> 3 (above range)');
  check(clampGuidanceLevel(2.5) === 3, 'round 2.5 -> 3 (Math.round up)');
  check(clampGuidanceLevel(2.4) === 2, 'round 2.4 -> 2');
  check(clampGuidanceLevel(Number.NaN) === 0, 'NaN -> 0 (safe fallback)');
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
