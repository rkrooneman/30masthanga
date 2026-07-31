/**
 * Tiny seedable pseudo-random generator (mulberry32).
 *
 * Returns a function producing floats in [0, 1). The SAME seed always yields
 * the SAME stream, which is exactly what we want for a *stable* practice-length
 * estimate on the Home screen: the estimate is recomputed on every slider drag,
 * and we don't want the number flickering because of fresh randomness. Passing a
 * fixed-seed rng into `generatePractice` makes the estimate deterministic per
 * breath pace.
 *
 * This mirrors the mulberry32 already used by `preview.ts` and the test script
 * so the whole codebase shares one RNG implementation.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default mulberry32;
