/**
 * Deterministic, dependency-free test for the navHistory reducer.
 *
 * Run with:  npx tsx src/lib/navHistory.test.ts
 *
 * No test framework, no deps. Verifies the pure back/forward flow:
 *   - back from each of the three screens, incl. EXIT (null) from home
 *   - the two forward transitions (home->overview, overview->guided) push
 *   - forward from guided has no target (null)
 *   - screenForward / resolveBack agree with the fixed flow on the canonical path
 *   - the explicit-stack mode of resolveBack matches the fixed flow
 *   - pushScreen / popScreen are pure (return new arrays, never mutate input)
 * Prints which assertion failed and exits non-zero on any failure; on success
 * prints "ALL NAV-HISTORY TESTS PASSED" and the assertion count.
 */

import type { Screen } from '../types/navigation';
import {
  ROOT_SCREEN,
  popScreen,
  pushScreen,
  resolveBack,
  screenBack,
  screenForward,
} from './navHistory';

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
// 1. Back from each screen: steps back exactly one level, and home exits.
// ---------------------------------------------------------------------------
{
  check(
    screenBack('guided') === 'overview',
    `back: guided must step back to overview (got ${screenBack('guided')})`,
  );
  check(
    screenBack('overview') === 'home',
    `back: overview must step back to home (got ${screenBack('overview')})`,
  );
  check(
    screenBack('home') === null,
    `back: home must resolve to null (exit the app), got ${screenBack('home')}`,
  );
  // ROOT_SCREEN is the screen that exits on back.
  check(
    ROOT_SCREEN === 'home' && screenBack(ROOT_SCREEN) === null,
    `back: ROOT_SCREEN must be 'home' and exit on back`,
  );
}

// ---------------------------------------------------------------------------
// 2. Forward transitions: the two forward pushes, and no forward past guided.
// ---------------------------------------------------------------------------
{
  const fromHome = screenForward('home');
  check(
    fromHome !== null &&
      fromHome.to === 'overview' &&
      fromHome.pushHistory === true,
    `forward: home must advance to overview and push history`,
  );

  const fromOverview = screenForward('overview');
  check(
    fromOverview !== null &&
      fromOverview.to === 'guided' &&
      fromOverview.pushHistory === true,
    `forward: overview must advance to guided and push history`,
  );

  check(
    screenForward('guided') === null,
    `forward: guided is the end of the flow (no forward target)`,
  );
}

// ---------------------------------------------------------------------------
// 3. Round-trip: forward then back returns to the origin for both pushes.
// ---------------------------------------------------------------------------
{
  for (const origin of ['home', 'overview'] as const) {
    const forward = screenForward(origin);
    check(forward !== null, `round-trip: ${origin} must have a forward target`);
    if (forward !== null) {
      check(
        screenBack(forward.to) === origin,
        `round-trip: forward(${origin})=${forward.to} then back must return ` +
          `to ${origin} (got ${screenBack(forward.to)})`,
      );
    }
  }
}

// ---------------------------------------------------------------------------
// 4. resolveBack with NO stack falls through to the fixed screenBack flow.
// ---------------------------------------------------------------------------
{
  for (const s of ['home', 'overview', 'guided'] as const) {
    check(
      resolveBack(s) === screenBack(s),
      `resolveBack(no stack): must equal screenBack for ${s} ` +
        `(got ${resolveBack(s)} vs ${screenBack(s)})`,
    );
  }
}

// ---------------------------------------------------------------------------
// 5. resolveBack WITH an explicit stack pops to the entry beneath the top, and
//    a single-entry / empty stack exits (null). It agrees with the fixed flow
//    on the canonical home -> overview -> guided path.
// ---------------------------------------------------------------------------
{
  const full: Screen[] = ['home', 'overview', 'guided'];
  check(
    resolveBack('guided', full) === 'overview',
    `resolveBack(stack): back from guided (top) must be overview`,
  );
  check(
    resolveBack('overview', ['home', 'overview']) === 'home',
    `resolveBack(stack): back from overview must be home`,
  );
  check(
    resolveBack('home', ['home']) === null,
    `resolveBack(stack): a single-entry stack exits (null)`,
  );
  check(
    resolveBack('home', []) === null,
    `resolveBack(stack): an empty stack exits (null)`,
  );
  // Agreement with the fixed flow along the canonical path.
  check(
    resolveBack('guided', full) === screenBack('guided') &&
      resolveBack('overview', ['home', 'overview']) === screenBack('overview') &&
      resolveBack('home', ['home']) === screenBack('home'),
    `resolveBack(stack): must agree with the fixed flow on the canonical path`,
  );
}

// ---------------------------------------------------------------------------
// 6. pushScreen is pure: returns a NEW array with the screen on top, input
//    unchanged.
// ---------------------------------------------------------------------------
{
  const base: Screen[] = ['home'];
  const pushed = pushScreen(base, 'overview');
  check(
    pushed.length === 2 && pushed[0] === 'home' && pushed[1] === 'overview',
    `pushScreen: must append the new screen on top (got ${pushed.join(',')})`,
  );
  check(pushed !== base, `pushScreen: must return a NEW array reference`);
  check(
    base.length === 1 && base[0] === 'home',
    `pushScreen: must NOT mutate the input (got ${base.join(',')})`,
  );
}

// ---------------------------------------------------------------------------
// 7. popScreen is pure: returns a NEW shorter array + the popped screen, input
//    unchanged; an empty stack pops null.
// ---------------------------------------------------------------------------
{
  const base: Screen[] = ['home', 'overview', 'guided'];
  const { stack, popped } = popScreen(base);
  check(
    popped === 'guided',
    `popScreen: must return the top screen as popped (got ${popped})`,
  );
  check(
    stack.length === 2 && stack[0] === 'home' && stack[1] === 'overview',
    `popScreen: remaining stack must drop the top (got ${stack.join(',')})`,
  );
  check(stack !== base, `popScreen: must return a NEW array reference`);
  check(
    base.length === 3 && base[2] === 'guided',
    `popScreen: must NOT mutate the input (got ${base.join(',')})`,
  );

  const empty = popScreen([]);
  check(
    empty.popped === null && empty.stack.length === 0,
    `popScreen: an empty stack must pop null and stay empty`,
  );
}

// ---------------------------------------------------------------------------
// 8. push/pop round-trip: pushing then popping restores the original stack and
//    returns the pushed screen.
// ---------------------------------------------------------------------------
{
  const base: Screen[] = ['home', 'overview'];
  const { stack, popped } = popScreen(pushScreen(base, 'guided'));
  check(
    popped === 'guided' &&
      stack.length === base.length &&
      stack.every((s, i) => s === base[i]),
    `round-trip: push then pop must restore the original stack and pop the ` +
      `pushed screen`,
  );
}

// --- report ---
if (failures.length > 0) {
  console.error(`\n=== NAV-HISTORY TESTS FAILED (${failures.length}) ===`);
  for (const f of failures) console.error(`  \u2717 ${f}`);
  console.error(`\n(${assertionCount} assertions run)`);
  process.exit(1);
}

console.log('ALL NAV-HISTORY TESTS PASSED');
console.log(`${assertionCount} assertions run.`);
