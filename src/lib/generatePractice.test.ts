/**
 * Deterministic, dependency-free test for the practice generator.
 *
 * Run with:  npx tsx src/lib/generatePractice.test.ts
 *
 * Uses a tiny seedable mulberry32 RNG (no test framework, no deps). Runs every
 * invariant across many seeds and every supported breathSeconds value. Prints
 * which invariant/seed failed and exits non-zero on any failure; on success
 * prints "ALL GENERATOR TESTS PASSED" and the assertion count.
 */

import type { Pose } from '../types/pose';
import { poses } from '../data/poses';
import { BACKBEND_IDS, COUNTER_POSE_ID } from './counterPose';
import { generatePractice } from './generatePractice';
import {
  MAX_BREATH_SECONDS,
  MIN_BREATH_SECONDS,
  TARGET_SECONDS,
  sequenceDurationSeconds,
} from './timing';

// --- tiny seedable RNG (mulberry32) ---
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- minimal assertion helper ---
let assertionCount = 0;
const failures: string[] = [];

function check(condition: boolean, message: string): void {
  assertionCount++;
  if (!condition) {
    failures.push(message);
  }
}

// --- expected fixed frame ---
const FIXED_IDS = [
  'surya_namaskara_a',
  'surya_namaskara_b',
  'salamba_sarvangasana',
  'savasana',
];

const catalogIds = new Set(poses.map((p) => p.id));

// The 7 advanced poses that the random generator must NEVER select (issue #11).
// They stay in the catalog and remain selectable for Full series + custom.
const ADVANCED_IDS = [
  'marichyasana_d',
  'bhujapidasana',
  'kurmasana',
  'supta_kurmasana',
  'garbha_pindasana',
  'kukkutasana',
  'baddha_padmasana',
];
const advancedIdSet = new Set(ADVANCED_IDS);

// Ids allowed in "Basics only" mode: any curated basic pose (isBasic) plus the
// always-present fixed frame (which is itself marked isBasic, but list the
// frame explicitly for clarity).
const basicIds = new Set(
  poses.filter((p) => p.isBasic).map((p) => p.id),
);

const SEEDS = Array.from({ length: 20 }, (_, i) => i + 1);
const BREATHS = [
  MIN_BREATH_SECONDS, // 6
  7,
  8,
  MAX_BREATH_SECONDS, // 10
];

function runInvariants(seq: Pose[], totalSeconds: number, ctx: string): void {
  // 1. starts with Surya A then Surya B
  check(
    seq.length >= 2 &&
      seq[0].id === 'surya_namaskara_a' &&
      seq[1].id === 'surya_namaskara_b',
    `${ctx}: must start with surya_namaskara_a then surya_namaskara_b ` +
      `(got ${seq[0]?.id}, ${seq[1]?.id})`,
  );

  // 2. ends with savasana
  check(
    seq.length >= 1 && seq[seq.length - 1].id === 'savasana',
    `${ctx}: must end with savasana (got ${seq[seq.length - 1]?.id})`,
  );

  // 3. shoulderstand present and before savasana
  const shoulderIdx = seq.findIndex((p) => p.id === 'salamba_sarvangasana');
  const savasanaIdx = seq.findIndex((p) => p.id === 'savasana');
  check(shoulderIdx !== -1, `${ctx}: salamba_sarvangasana must be present`);
  check(
    shoulderIdx !== -1 && savasanaIdx !== -1 && shoulderIdx < savasanaIdx,
    `${ctx}: salamba_sarvangasana must appear before savasana`,
  );

  // 4. strictly ascending order
  let ascending = true;
  for (let i = 1; i < seq.length; i++) {
    if (seq[i].order <= seq[i - 1].order) {
      ascending = false;
      break;
    }
  }
  check(ascending, `${ctx}: sequence must be strictly ascending by order`);

  // 5. no duplicates
  const ids = seq.map((p) => p.id);
  check(
    new Set(ids).size === ids.length,
    `${ctx}: no pose may appear twice (dupes: ${ids
      .filter((id, i) => ids.indexOf(id) !== i)
      .join(', ')})`,
  );

  // 6. only catalog poses appear
  check(
    seq.every((p) => catalogIds.has(p.id)),
    `${ctx}: only poses from the input catalog may appear`,
  );

  // 7. hard ceiling
  check(
    totalSeconds <= TARGET_SECONDS,
    `${ctx}: totalSeconds (${totalSeconds}) must be <= target (${TARGET_SECONDS})`,
  );

  // 8. all 4 alwaysInclude poses present
  check(
    FIXED_IDS.every((id) => ids.includes(id)),
    `${ctx}: all four alwaysInclude poses must be present ` +
      `(missing: ${FIXED_IDS.filter((id) => !ids.includes(id)).join(', ')})`,
  );

  // 8b. protected finisher: at least one `closing` pose is always present. The
  // fixed-frame Shoulderstand is a closing pose so this always holds, but the
  // check guards the protected-finisher rule in BOTH modes regardless.
  check(
    seq.some((p) => p.category === 'closing'),
    `${ctx}: at least one closing pose must be present (protected finisher)`,
  );

  // 8c. mandatory backbend counter-pose: if the practice contains a deep
  // backbend (Bridge/Wheel), it MUST also contain the closing forward-fold
  // counter `paschimottanasana_closing`. Enforced across the whole seed sweep
  // (this invariant runs in default, basicsOnly, and vinyasas modes).
  const hasAnyBackbend = ids.some((id) =>
    (BACKBEND_IDS as readonly string[]).includes(id),
  );
  if (hasAnyBackbend) {
    check(
      ids.includes(COUNTER_POSE_ID),
      `${ctx}: a backbend is present so the counter (${COUNTER_POSE_ID}) ` +
        `must also be present (ids: ${ids.join(', ')})`,
    );
  }

  // 12. no advanced pose may ever appear in a generated practice (issue #11).
  // The random generator excludes isAdvanced poses from its fill pools in ALL
  // modes, so none of the 7 may ever be selected. Runs across the full
  // seed/pace sweep in default, basicsOnly, and vinyasas modes.
  const advancedPresent = ids.filter((id) => advancedIdSet.has(id));
  check(
    advancedPresent.length === 0,
    `${ctx}: no advanced pose may be generated ` +
      `(found: ${advancedPresent.join(', ')})`,
  );

  // 9. reported totalSeconds matches recomputation
  // (uses the same breathSeconds embedded in ctx via closure below)
}

for (const breathSeconds of BREATHS) {
  for (const seed of SEEDS) {
    const ctx = `seed=${seed} breathSeconds=${breathSeconds}`;
    const result = generatePractice(poses, {
      breathSeconds,
      rng: mulberry32(seed),
    });

    runInvariants(result.poses, result.totalSeconds, ctx);

    // 9. reported totalSeconds is internally consistent
    const recomputed = sequenceDurationSeconds(result.poses, breathSeconds);
    check(
      recomputed === result.totalSeconds,
      `${ctx}: reported totalSeconds (${result.totalSeconds}) must equal ` +
        `sequenceDurationSeconds recomputation (${recomputed})`,
    );

    // 10. breathSeconds echoed back
    check(
      result.breathSeconds === breathSeconds,
      `${ctx}: result.breathSeconds (${result.breathSeconds}) must equal ` +
        `requested (${breathSeconds})`,
    );

    // 11. determinism: same seed => identical output
    const again = generatePractice(poses, {
      breathSeconds,
      rng: mulberry32(seed),
    });
    check(
      again.poses.map((p) => p.id).join(',') ===
        result.poses.map((p) => p.id).join(','),
      `${ctx}: generation must be deterministic for a fixed seed`,
    );
  }
}

// ---------------------------------------------------------------------------
// Basics only (Smart Start) mode.
//   (i)  every pose in a basics-only practice is in the basic set (fixed frame
//        included — the frame is itself marked isBasic).
//   (ii) all the standard invariants still hold, including the protected
//        finisher (>= 1 closing pose).
// ---------------------------------------------------------------------------
for (const breathSeconds of BREATHS) {
  for (const seed of SEEDS) {
    const ctx = `basicsOnly seed=${seed} breathSeconds=${breathSeconds}`;
    const result = generatePractice(poses, {
      breathSeconds,
      basicsOnly: true,
      rng: mulberry32(seed),
    });

    // All standard invariants hold in basics mode too (fixed frame, ordering,
    // ceiling, protected finisher, etc.).
    runInvariants(result.poses, result.totalSeconds, ctx);

    // (i) only basic-set poses appear, with ONE permitted exception: the
    // mandatory backbend counter `paschimottanasana_closing`. It is not itself a
    // basic pose (isBasic === false), but the safety rule force-includes it
    // whenever a backbend is generated (and the basic pool reliably contains the
    // basic backbends Bridge/Wheel), so a basics-only practice may legitimately
    // carry the counter as a safety-mandated addition. Everything ELSE must be
    // basic.
    const nonBasic = result.poses.filter(
      (p) => !basicIds.has(p.id) && p.id !== COUNTER_POSE_ID,
    );
    check(
      nonBasic.length === 0,
      `${ctx}: only basic-set poses (plus the mandatory counter) may appear ` +
        `(offenders: ${nonBasic.map((p) => p.id).join(', ')})`,
    );
    // Every appearing pose is flagged isBasic in the catalog, except the
    // safety-mandated counter which is deliberately not basic.
    check(
      result.poses.every((p) => p.isBasic || p.id === COUNTER_POSE_ID),
      `${ctx}: every pose in a basics-only practice must have isBasic === true ` +
        `(except the mandatory counter ${COUNTER_POSE_ID})`,
    );
  }
}

// ---------------------------------------------------------------------------
// Vinyasas mode.
//   (i)   all standard invariants still hold, and the hard 30-min ceiling is
//         respected using the VINYASA-FLAGGED duration.
//   (ii)  IN AGGREGATE across the whole seed/pace matrix, vinyasas-on selects
//         FEWER seated poses than vinyasas-off — the budget accounts for the
//         seated->seated half-vinyasas, so on average it fits fewer seated
//         poses. (Per-seed it is not strictly monotonic: the greedy variety
//         shuffle + cross-section ceiling rebalancing can occasionally pick one
//         more or fewer at a given seed; the aggregate captures the real intent.)
//   (iii) determinism holds with the flag on.
// ---------------------------------------------------------------------------
const countSeated = (seq: Pose[]): number =>
  seq.filter((p) => p.category === 'seated').length;

let totalSeatedVin = 0;
let totalSeatedNoVin = 0;
for (const breathSeconds of BREATHS) {
  for (const seed of SEEDS) {
    const ctx = `vinyasas seed=${seed} breathSeconds=${breathSeconds}`;
    const withVin = generatePractice(poses, {
      breathSeconds,
      vinyasas: true,
      rng: mulberry32(seed),
    });
    const withoutVin = generatePractice(poses, {
      breathSeconds,
      vinyasas: false,
      rng: mulberry32(seed),
    });

    // (i) all standard invariants hold with vinyasas on.
    runInvariants(withVin.poses, withVin.totalSeconds, ctx);

    // The reported total is internally consistent with the VINYASA-FLAGGED
    // duration (the single source of truth the generator budgets against).
    const recomputed = sequenceDurationSeconds(withVin.poses, breathSeconds, {
      vinyasas: true,
    });
    check(
      recomputed === withVin.totalSeconds,
      `${ctx}: reported totalSeconds (${withVin.totalSeconds}) must equal the ` +
        `vinyasa-flagged sequenceDurationSeconds (${recomputed})`,
    );

    // The ceiling holds under the flagged duration (the hard 30-min ceiling).
    check(
      withVin.totalSeconds <= TARGET_SECONDS,
      `${ctx}: vinyasa-flagged total (${withVin.totalSeconds}) must be <= ` +
        `target (${TARGET_SECONDS})`,
    );

    totalSeatedVin += countSeated(withVin.poses);
    totalSeatedNoVin += countSeated(withoutVin.poses);

    // (iii) determinism with the flag on.
    const again = generatePractice(poses, {
      breathSeconds,
      vinyasas: true,
      rng: mulberry32(seed),
    });
    check(
      again.poses.map((p) => p.id).join(',') ===
        withVin.poses.map((p) => p.id).join(','),
      `${ctx}: vinyasa generation must be deterministic for a fixed seed`,
    );
  }
}

// (ii) Aggregate: vinyasas ON selects FEWER seated poses overall than OFF,
// proving the budget genuinely trims seated poses to make room for the vinyasas.
check(
  totalSeatedVin < totalSeatedNoVin,
  `vinyasas: aggregate seated-pose count with vinyasas on ` +
    `(${totalSeatedVin}) must be fewer than off (${totalSeatedNoVin}) across ` +
    `the whole seed/pace matrix`,
);

// ---------------------------------------------------------------------------
// Backbend counter-pose (Task 2): targeted coverage.
//   (i)  Across the full seed/pace matrix (default + basicsOnly modes), at least
//        ONE generated practice actually contains a backbend, proving the
//        force-include + budgeting path is genuinely exercised (not vacuously
//        satisfied by never generating a backbend).
//   (ii) For every such practice the counter is present AND the hard ceiling
//        still holds WITH the counter force-included. (The per-practice presence
//        + ceiling checks already run inside runInvariants above; this block
//        additionally asserts the path is reached and re-checks the ceiling for
//        the backbend subset explicitly.)
// ---------------------------------------------------------------------------
let backbendPracticeCount = 0;
for (const basicsOnly of [false, true]) {
  for (const breathSeconds of BREATHS) {
    for (const seed of SEEDS) {
      const ctx =
        `counter basicsOnly=${basicsOnly} seed=${seed} ` +
        `breathSeconds=${breathSeconds}`;
      const result = generatePractice(poses, {
        breathSeconds,
        basicsOnly,
        rng: mulberry32(seed),
      });
      const rIds = result.poses.map((p) => p.id);
      const hasBb = rIds.some((id) =>
        (BACKBEND_IDS as readonly string[]).includes(id),
      );
      if (!hasBb) continue;
      backbendPracticeCount++;
      // Counter present whenever a backbend is present.
      check(
        rIds.includes(COUNTER_POSE_ID),
        `${ctx}: backbend present, counter (${COUNTER_POSE_ID}) must be present`,
      );
      // Ceiling still respected with the counter force-included.
      check(
        result.totalSeconds <= TARGET_SECONDS,
        `${ctx}: total (${result.totalSeconds}) must be <= target ` +
          `(${TARGET_SECONDS}) with the counter included`,
      );
    }
  }
}
check(
  backbendPracticeCount > 0,
  'counter: at least one generated practice across the matrix must contain a ' +
    'backbend, so the force-include + budgeting path is actually exercised ' +
    `(saw ${backbendPracticeCount})`,
);

// ---------------------------------------------------------------------------
// Catalog guards (issue #11): the advanced exclusion is generator-only.
//   (i)   all 7 advanced poses still EXIST in the catalog.
//   (ii)  each is still `selectable` (so custom/manual selection can include it)
//         and correctly flagged isAdvanced === true.
//   (iii) Marichyasana C stays isBasic === true and is NOT flagged advanced
//         (guard against an accidental edit to the wrong Marichyasana).
// ---------------------------------------------------------------------------
for (const id of ADVANCED_IDS) {
  const pose = poses.find((p) => p.id === id);
  check(pose !== undefined, `catalog: advanced pose "${id}" must still exist`);
  if (pose) {
    check(
      pose.selectable === true,
      `catalog: advanced pose "${id}" must stay selectable for custom selection`,
    );
    check(
      pose.isAdvanced === true,
      `catalog: advanced pose "${id}" must be flagged isAdvanced === true`,
    );
  }
}

const marichyasanaC = poses.find((p) => p.id === 'marichyasana_c');
check(
  marichyasanaC !== undefined,
  'catalog: marichyasana_c must exist',
);
check(
  marichyasanaC !== undefined && marichyasanaC.isBasic === true,
  'catalog: marichyasana_c must stay isBasic === true (not accidentally changed)',
);
check(
  marichyasanaC !== undefined && marichyasanaC.isAdvanced !== true,
  'catalog: marichyasana_c must NOT be flagged advanced',
);

// --- report ---
if (failures.length > 0) {
  console.error(`\n=== GENERATOR TESTS FAILED (${failures.length}) ===`);
  for (const f of failures) console.error(`  \u2717 ${f}`);
  console.error(`\n(${assertionCount} assertions run)`);
  process.exit(1);
}

console.log('ALL GENERATOR TESTS PASSED');
console.log(
  `${assertionCount} assertions run across ${SEEDS.length} seeds ` +
    `x ${BREATHS.length} breathSeconds values.`,
);
