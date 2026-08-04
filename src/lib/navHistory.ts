/**
 * navHistory - a pure screen-navigation / history reducer.
 *
 * TASK 1 SCOPE: pure logic only. No React, no DOM, no `window`/`history`. Later
 * tasks wire this into `App.tsx` (and into the real browser History API); this
 * module knows nothing about any of that. It answers one question only: given
 * where you are (and, optionally, how you got there), which screen does a
 * back/forward navigation resolve to?
 *
 * === the screen model ===
 * The app is a router-free three-screen shell (see `../types/navigation`):
 *
 *   home  ->  overview  ->  guided        (forward flow)
 *   guided  ->  overview  ->  home        (back flow)
 *
 * Forward navigations PUSH a history entry (home->overview, overview->guided).
 * Back pops one step:
 *   - back from `guided`   -> `overview`
 *   - back from `overview` -> `home`
 *   - back from `home`     -> EXIT the app (there is no further back)
 *
 * "Exit" is modelled as the sentinel `null` returned by {@link screenBack} (see
 * its doc), so a caller can branch on `=== null` to mean "let the platform close
 * the app / TWA finish the activity". This keeps the return type a plain
 * `Screen | null` with no extra vocabulary to learn.
 *
 * === the history stack ===
 * The two stack helpers ({@link pushScreen} / {@link popScreen}) model an
 * explicit `Screen[]` (top-of-stack = current screen) for callers that want to
 * mirror the browser history entry list. They are pure: they never mutate their
 * input and always return a NEW array. {@link resolveBack} resolves a back step
 * against such a stack (falling back to the fixed {@link screenBack} flow when a
 * stack is not supplied), so a caller can drive navigation off either the flat
 * flow or a real recorded stack and get identical results for the canonical
 * home -> overview -> guided path.
 *
 * === deliberately OUT of scope ===
 * The "confirm before leaving a running practice" prompt (a `guided` back that
 * should ask before it resolves) is NOT modelled here - that is an integration
 * concern for a later task and belongs at the App/History layer. This reducer
 * only decides WHICH screen back/forward lands on; a caller is free to intercept
 * the resolved `overview` result and gate it behind a confirmation.
 */

import type { Screen } from '../types/navigation';

/** The app's default / root screen. Back from here exits the app. */
export const ROOT_SCREEN: Screen = 'home';

/**
 * The fixed forward chain: each screen maps to the screen a forward navigation
 * advances to. The last screen in the chain (`guided`) has no forward target.
 */
const FORWARD_OF: Readonly<Record<Screen, Screen | null>> = {
  home: 'overview',
  overview: 'guided',
  guided: null,
};

/**
 * The fixed back chain: each screen maps to the screen a back navigation returns
 * to, or `null` for the root (`home`), where back means "exit the app".
 */
const BACK_OF: Readonly<Record<Screen, Screen | null>> = {
  home: null,
  overview: 'home',
  guided: 'overview',
};

/**
 * A single forward transition descriptor: the screen you land on (`to`) and
 * whether this navigation should PUSH a history entry. Both modelled forward
 * navigations (home->overview, overview->guided) push.
 */
export interface ForwardTransition {
  /** The screen the app advances to. */
  to: Screen;
  /** Whether this navigation pushes a new history entry (always true here). */
  pushHistory: true;
}

/**
 * Resolve a BACK navigation from `current` using the fixed back flow.
 *
 * @returns the screen to go back to, or `null` to signal "exit the app"
 *   (back from `home`). Callers treat `null` as "there is no further back -
 *   let the platform finish the activity / close the TWA".
 *
 *   back('guided')   === 'overview'
 *   back('overview') === 'home'
 *   back('home')     === null   (exit)
 */
export function screenBack(current: Screen): Screen | null {
  return BACK_OF[current];
}

/**
 * Resolve a FORWARD navigation from `current`, or `null` when there is no
 * screen ahead (`guided` is the end of the flow).
 *
 * @returns a {@link ForwardTransition} describing the screen landed on and that
 *   the navigation pushes a history entry, or `null` when `current` has no
 *   forward target.
 *
 *   forward('home')     === { to: 'overview', pushHistory: true }
 *   forward('overview') === { to: 'guided',   pushHistory: true }
 *   forward('guided')   === null
 */
export function screenForward(current: Screen): ForwardTransition | null {
  const to = FORWARD_OF[current];
  return to === null ? null : { to, pushHistory: true };
}

/**
 * Push `screen` onto a history stack, returning a NEW array (never mutates the
 * input). The top of the stack (last element) is the current screen.
 */
export function pushScreen(
  stack: readonly Screen[],
  screen: Screen,
): Screen[] {
  return [...stack, screen];
}

/**
 * Pop the top screen off a history stack, returning the new (shorter) stack and
 * the popped screen. Never mutates the input.
 *
 * @returns `{ stack, popped }` where `popped` is the removed top screen, or
 *   `null` when the input was empty (nothing to pop).
 */
export function popScreen(stack: readonly Screen[]): {
  stack: Screen[];
  popped: Screen | null;
} {
  if (stack.length === 0) {
    return { stack: [], popped: null };
  }
  const next = stack.slice(0, -1);
  return { stack: next, popped: stack[stack.length - 1] };
}

/**
 * Resolve a BACK navigation against an optional explicit history stack.
 *
 * When a `stack` is supplied, back resolves to the entry BENEATH the top (the
 * previous recorded screen), mirroring a browser history pop; if the stack has a
 * single entry (or is empty), back resolves to `null` (exit). When no `stack` is
 * given, back falls through to the fixed {@link screenBack} flow.
 *
 * For the canonical home -> overview -> guided path both modes agree, so callers
 * can adopt a real recorded stack later without changing back semantics.
 *
 * @returns the screen to go back to, or `null` to signal "exit the app".
 */
export function resolveBack(
  current: Screen,
  stack?: readonly Screen[],
): Screen | null {
  if (stack === undefined) {
    return screenBack(current);
  }
  // With an explicit stack, back returns the entry beneath the current top.
  // A stack of 0 or 1 entries has nothing beneath it -> exit.
  if (stack.length <= 1) {
    return null;
  }
  return stack[stack.length - 2];
}
