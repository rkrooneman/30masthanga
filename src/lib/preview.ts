/**
 * Human preview of the practice generator.
 *
 * Run with:  npx tsx src/lib/preview.ts
 *
 * Generates and pretty-prints 5 sample practices at breathSeconds=5 using fixed
 * seeds (1..5) so the output is reproducible. For each practice it prints a
 * header, a numbered pose list, and a footer with section counts + duration.
 * Finally it confirms the hard ceiling held for all 5.
 */

import { poses } from '../data/poses';
import { generatePractice } from './generatePractice';
import {
  TARGET_SECONDS,
  formatDuration,
  poseHoldSeconds,
} from './timing';

// --- tiny seedable RNG (mulberry32), same as the test script ---
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

const BREATH_SECONDS = 5;
const SEEDS = [1, 2, 3, 4, 5];

type Section = 'standing' | 'seated' | 'closing';
function sectionOf(category: string): Section | null {
  if (category === 'standing') return 'standing';
  if (category === 'seated') return 'seated';
  if (category === 'closing') return 'closing';
  return null;
}

const fixedIds = new Set(
  poses.filter((p) => p.alwaysInclude).map((p) => p.id),
);

let allWithinCeiling = true;

for (const seed of SEEDS) {
  const result = generatePractice(poses, {
    breathSeconds: BREATH_SECONDS,
    rng: mulberry32(seed),
  });

  const seq = result.poses;

  console.log(
    `\nPractice #${seed} \u2014 ${seq.length} poses \u2014 ` +
      `${formatDuration(result.totalSeconds)} (target ${formatDuration(
        TARGET_SECONDS,
      )})`,
  );
  console.log('-'.repeat(72));

  seq.forEach((p, i) => {
    const hold = poseHoldSeconds(p, BREATH_SECONDS);
    const num = String(i + 1).padStart(2, ' ');
    const orderCol = String(p.order).padStart(3, ' ');
    const name = `${p.english} (${p.sanskrit})`;
    const catGroup = `${p.category}/${p.group}`;
    const bxs = `${p.breaths}\u00d7${p.sides}`;
    const rep = p.repeat > 1 ? `\u00d7${p.repeat}` : '';
    console.log(
      `${num}. [${orderCol}] ${name.padEnd(46)} ` +
        `${catGroup.padEnd(22)} ${bxs.padStart(5)} ${rep.padStart(3)}  ` +
        `${formatDuration(hold)}`,
    );
  });

  // section counts (selected middle poses only, excluding the fixed frame)
  const counts: Record<Section, number> = { standing: 0, seated: 0, closing: 0 };
  for (const p of seq) {
    if (fixedIds.has(p.id)) continue;
    const s = sectionOf(p.category);
    if (s) counts[s]++;
  }

  console.log('-'.repeat(72));
  console.log(
    `   selected: standing=${counts.standing} seated=${counts.seated} ` +
      `closing=${counts.closing}  |  total ${formatDuration(
        result.totalSeconds,
      )} (${result.totalSeconds}s)`,
  );

  if (result.totalSeconds > TARGET_SECONDS) allWithinCeiling = false;
}

console.log('\n' + '='.repeat(72));
console.log(
  allWithinCeiling
    ? `Hard ceiling held for all ${SEEDS.length} practices ` +
        `(all <= ${formatDuration(TARGET_SECONDS)} / ${TARGET_SECONDS}s).`
    : 'WARNING: hard ceiling was EXCEEDED for at least one practice!',
);
