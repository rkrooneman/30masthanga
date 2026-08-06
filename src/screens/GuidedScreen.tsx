/**
 * GuidedScreen - the interactive guided-practice player (Slice 5b).
 *
 * Walks the FLAT `buildGuidedPlan(...).steps` timeline in order, driving a
 * breathing circle and auto-advancing. It never re-derives side/round/breath
 * logic - the plan (Slice 5a) already did that; this screen only *plays* it.
 *
 * === timer lifecycle (the important part) ===
 * A single `useEffect` keyed on `[stepIndex, paused, complete]` owns the timers
 * for the CURRENT step. It reads the step and schedules it:
 *   - single-phase MOVEMENT breath step (`singlePhase` set - a vinyasa step):
 *     sets phase to that single phase, plays the matching breath tone, and
 *     schedules a timeout at half a breath (`breathSeconds / 2`) to advance. It
 *     does NOT schedule the opposite phase - the NEXT movement's opposite phase
 *     continues the breath rhythm (inhale expands, the following exhale
 *     contracts), and `advance` leaves the phase in place so the circle flows
 *     smoothly rather than resetting between movements.
 *   - full breath step (a Down Dog HOLD breath or any non-flow breath): sets
 *     phase='inhale' immediately, schedules a timeout at `inhaleMs` to flip
 *     phase='exhale', and a timeout at `inhaleMs + exhaleMs` to advance.
 *   - transition step: shows a per-second countdown (a chain of 1s timeouts)
 *     and a timeout at `seconds * 1000` to advance.
 * All timeout ids are held in a ref array; the effect's cleanup clears every one
 * of them. Because the effect re-runs whenever `stepIndex`, `paused`, or
 * `complete` changes, cleanup fires on EVERY transition between states as well
 * as on unmount - so no timer can outlive its step, and advancing can never
 * double-fire (the old step's advance timeout is cleared before the new effect
 * schedules its own).
 *
 * === pause / resume ===
 * `paused` short-circuits the effect (it schedules nothing) and cleanup halts
 * the live timers. Resuming re-runs the effect, which RESTARTS the current step
 * from its beginning: a full breath resumes at its inhale (full inhale+exhale
 * scheduled); a single-phase movement resumes at the start of that one phase.
 * This is the deliberate, simple, leak-free semantic: a paused breath resumes at
 * the start of that same breath/phase rather than mid-breath.
 *
 * === prev / next pose ===
 * Navigation jumps to the FIRST breath step of the previous/next POSE (not the
 * previous breath), computed by scanning the plan for poseIndex boundaries.
 * Setting `stepIndex` re-runs the effect, which cleans up the old step's timers
 * first, so jumps are safe whether playing or paused.
 *
 * === wake lock ===
 * A screen Wake Lock is requested while actively playing and released on pause,
 * completion, exit, and unmount, with a `visibilitychange` re-acquire (locks
 * drop when the tab is hidden). Feature-detected and fully wrapped in try/catch
 * so unsupported browsers silently continue (progressive enhancement).
 *
 * === leave-practice confirmation (Task 3) ===
 * A back navigation OUT of an in-progress practice (the Android/system back
 * gesture OR the in-app Exit control -- both funnel through the browser History
 * back path wired in App.tsx) is intercepted here and gated behind a "Leave
 * practice?" dialog. "In progress" means the screen is mounted and NOT complete
 * (the opening countdown counts as in progress too). The completion (Namaste)
 * screen never shows the dialog -- its back goes straight home, as before.
 *
 * How the interception stays consistent with App.tsx's history model (a single
 * popstate handler that only ever setScreen's, never pushes, so it can't loop):
 *
 *   - On mount (real in-progress practice only) we push ONE extra "guard"
 *     history entry ON TOP of the guided entry App already pushed, carrying
 *     `state.screen === 'guided'`. So the live stack is
 *     [home, overview, guided, guided-guard] with us sitting on the guard.
 *   - A back gesture pops the guard and lands on the guided entry. App's single
 *     popstate handler reads `event.state.screen === 'guided'` and setScreen's
 *     'guided' -- a harmless no-op that keeps us visually on guided (no flicker
 *     to overview). OUR popstate listener sees the practice is in progress,
 *     RE-PUSHES the single guard entry (restoring the stack exactly, so guard
 *     entries never accumulate across repeated open/cancel), pauses, and opens
 *     the dialog.
 *   - Cancel "Stay": the guard was already re-pushed, so the stack is back to
 *     [home, overview, guided, guided-guard]; we simply close the dialog and
 *     resume. No history change.
 *   - Confirm "Leave": tear down audio/timers, then `history.go(-2)` -- one call
 *     that pops BOTH the guard AND the guided entry, landing on the overview
 *     entry. App's popstate handler setScreen's 'overview' (it remains the ONLY
 *     navigation-driven setScreen). A subsequent back from overview reaches
 *     home, preserving Task 2. We suppress our own interceptor for this
 *     programmatic navigation via a one-shot `leavingRef`.
 *
 * === back from the completion screen (Task 5) ===
 * When `complete` flips true we deliberately KEEP the single guard entry in
 * place (it is NOT torn down), so on the Namaste screen the live stack is
 * [home, overview, guided, guard] with us sitting on the guard. This makes the
 * system Back gesture on the completion screen behave exactly like the on-screen
 * "Return home" button, and both land on HOME (not overview):
 *
 *   - "Return home" button AND system back gesture funnel through the SAME path.
 *     The button calls `history.back()` (see handleReturnHome); the gesture IS a
 *     back. Either way the guard is popped and we land on the guided entry
 *     (state.screen === 'guided'), so App's single popstate handler setScreen's
 *     'guided' -- a no-op that keeps GuidedScreen MOUNTED and `complete` still
 *     true. Because the screen never unmounts here, the completion bell/Namaste
 *     effect (guarded by bellPlayedRef/namastePlayedRef) does NOT replay, and
 *     there is no flicker to overview (screen stays 'guided' throughout).
 *   - OUR popstate interceptor, seeing `complete` and that the guard was up,
 *     clears the guard flag, arms `leavingRef`, and calls `onComplete()`
 *     (App's `history.go(-2)`). By then the stack is [home, overview, guided],
 *     so go(-2) collapses both remaining forward entries and lands on the base
 *     home entry; App resolves that to ROOT_SCREEN ('home') and GuidedScreen
 *     unmounts (audio stops naturally). One further back from home exits the app.
 *   - The DEV `?complete` hatch mounts with NO guard (never in progress), so the
 *     button there routes straight through `onComplete()` (App's setScreen) and
 *     the interceptor never calls history.go on the empty forward stack.
 *
 * === pause/resume audio around the dialog (Task 4) ===
 * On dialog OPEN the interceptor pauses via the existing pause machinery AND
 * stops any in-flight cue: stopVoice() (which also RELEASES the voice cue's duck,
 * so the ambient music is never left dipped behind the dialog) and
 * stopBreathCues() (quiets any live breath tone -- breath tones hold no duck).
 * Ambient music is deliberately left playing softly, as it is when the user taps
 * Pause. On "Stay" a bare setPaused(false) resumes cleanly: the stepping effect
 * restarts the current breath/phase, with no stale timers (the pause already
 * halted them), no double-scheduling, and no stuck duck (already released). On
 * "Leave" the teardown adds stopBreathCues() alongside the existing clearTimers +
 * stopVoice so a paused+leave has no stuck audio or duck. Task 6 will own the
 * fuller audio-teardown completeness on confirmed leave.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { GuidedScreenProps } from '../types/navigation';
import type { Pose } from '../types/pose';
import type { GuidedPhase, GuidedStep } from '../lib/guidedPlan';
import { buildGuidedPlan } from '../lib/guidedPlan';
import BreathingCircle from '../components/BreathingCircle';
import NamasteMark from '../components/NamasteMark';
import PoseGraphic from '../components/PoseGraphic';
import FlowMark from '../components/FlowMark';
import FlowStrip from '../components/FlowStrip';
import { unlockAudio, playCompletionBell, stopChime } from '../lib/chime';
import {
  speakPose,
  speakNamaste,
  speakSwitchSides,
  speakCue,
  stopVoice,
  unlockVoice,
} from '../lib/voice';
import {
  playInhale,
  playExhale,
  stopBreathCues,
  unlockBreathCues,
} from '../lib/breathCues';
import { loadSoundEnabled } from '../lib/preferences';
import { recordPractice } from '../lib/practiceLog';
import { OPENING_COUNTDOWN_SECONDS, formatDuration } from '../lib/timing';

/** Sentinel value marking a drishti the human still needs to confirm. */
const UNVERIFIED = '__UNVERIFIED__';

/**
 * How long after landing on a manually-skipped pose (prev/next) to announce its
 * name. The announcement is cut immediately (`stopVoice`) on each skip and then
 * scheduled after this delay, so rapid consecutive skips only ever announce the
 * FINAL landed pose once the practitioner pauses skipping.
 */
const SKIP_ANNOUNCE_DELAY_MS = 1000;

/**
 * How long after the opening "get ready" countdown starts to announce the first
 * pose's name - ~1s in, so the name lands before the first breath rather than
 * on it.
 */
const FIRST_POSE_ANNOUNCE_DELAY_MS = 1000;

function GuidedScreen({
  practice,
  breathSeconds,
  vinyasas = false,
  onExit,
  onComplete,
  startComplete = false,
}: GuidedScreenProps) {
  // The plan is pure and deterministic for a given practice + pace + vinyasas
  // flag, so memoise it once. Rebuild only if any of those identities change.
  const plan = useMemo(
    () => buildGuidedPlan(practice.poses, breathSeconds, { vinyasas }),
    [practice, breathSeconds, vinyasas],
  );
  const steps = plan.steps;
  const stepCount = steps.length;

  const [stepIndex, setStepIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  // `startComplete` (DEV-only, from the `?complete` hatch) mounts straight into
  // the completion screen so the Namaste mark + summary can be reviewed without
  // playing a whole practice.
  const [complete, setComplete] = useState(stepCount === 0 || startComplete);
  const [phase, setPhase] = useState<GuidedPhase>('inhale');
  // Remaining whole seconds shown during a transition countdown.
  const [countdown, setCountdown] = useState(0);
  // Opening "get ready" countdown before the first breath. While true, the
  // stepping engine is held and a settle-in countdown plays; the circle rests
  // small so the very first inhale is a satisfying expansion.
  const [starting, setStarting] = useState(stepCount > 0);
  const [openingCount, setOpeningCount] = useState(OPENING_COUNTDOWN_SECONDS);
  // Task 3: whether the "Leave practice?" confirmation dialog is open. Opened by
  // the popstate interceptor when a back gesture tries to leave an in-progress
  // practice; closed by "Stay" (resume) or "Leave" (navigate to overview).
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  // Every active timeout id lives here so cleanup can clear them all. Using a
  // ref (not state) means scheduling/clearing never triggers a re-render.
  const timeoutsRef = useRef<number[]>([]);

  // Pending manual-skip announcement timer (see goToPoseOrdinal). Held apart
  // from timeoutsRef because it must survive the stepping effect's own cleanup
  // (it schedules across step changes) yet still be cancelable on each skip and
  // cleared on unmount.
  const skipAnnounceTimerRef = useRef<number | null>(null);

  // Set when the practitioner skips (prev/next); the stepping engine reads it to
  // SKIP playing a breath tone for the landed step, so rapid skipping doesn't
  // spam the inhale/exhale sound. Cleared by the stepping engine after the first
  // step it suppresses.
  const suppressBreathCueRef = useRef(false);

  // One-shot guard so the first pose is announced exactly once during the
  // opening countdown, never re-firing on pause/resume of that countdown.
  const firstPoseAnnouncedRef = useRef(false);

  // The last pose index whose name we announced. Declared here (rather than at
  // the narration effect) because both the manual-skip handler and the opening
  // countdown record into it. See the narration effect for the full contract.
  const lastAnnouncedPoseIndexRef = useRef<number | null>(null);

  // --- Task 3: leave-practice back-interception refs --------------------------
  // Whether our extra "guard" history entry is currently on the stack (see the
  // module doc). Guarded push/pop keys off this so guard entries never leak or
  // accumulate: we only ever push when it is false and pop when it is true.
  const guardPushedRef = useRef(false);
  // One-shot suppression flag for the popstate interceptor: set true immediately
  // before a PROGRAMMATIC history navigation we initiate (confirmed leave's
  // go(-2), or completion's go-home via onComplete), so our interceptor ignores
  // the resulting popstate and lets App's single handler drive the screen change.
  // The interceptor consumes (clears) it, so it never sticks around.
  const leavingRef = useRef(false);
  // The dialog element, focused when it opens (accessibility). A ref rather than
  // autofocus so we can move focus deterministically on open.
  const leaveDialogRef = useRef<HTMLDivElement | null>(null);

  const clearTimers = useCallback(() => {
    for (const id of timeoutsRef.current) window.clearTimeout(id);
    timeoutsRef.current = [];
  }, []);

  /** Schedule a timeout and remember its id for cleanup. */
  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timeoutsRef.current.push(id);
  }, []);

  const currentStep: GuidedStep | undefined = steps[stepIndex];

  // --- pose-boundary index map (for prev/next pose) ---------------------------
  // The 1-based ordinal of each distinct pose in appearance order, and the step
  // index of the FIRST breath of each pose. Recomputed only when the plan
  // changes.
  const poseStarts = useMemo(() => {
    const starts: number[] = []; // starts[k] = step index of first REAL breath of pose k
    const seen = new Set<number>();
    steps.forEach((step, i) => {
      // A half-vinyasa's movement steps carry the NEXT pose's index but are NOT
      // the pose itself, so they must not count as its start: prev/next-pose
      // navigation should land on the pose's first real breath (past the vinyasa).
      if (step.kind === 'breath' && !step.isVinyasa && !seen.has(step.poseIndex)) {
        seen.add(step.poseIndex);
        starts.push(i);
      }
    });
    return starts;
  }, [steps]);

  // How many distinct poses, and which one we're currently in (by counting the
  // pose starts at or before the current step). Works for transitions too: a
  // transition's toPose is the pose we're heading into.
  const totalPoses = poseStarts.length;

  // Total breaths practised across the whole plan - one per 'breath' step.
  // Shown on the completion summary. Memoised over the steps, which only change
  // when the plan itself is rebuilt.
  const totalBreaths = useMemo(
    () => steps.reduce((n, step) => (step.kind === 'breath' ? n + 1 : n), 0),
    [steps],
  );

  const currentPoseOrdinal = useMemo(() => {
    // Find the last pose-start whose index is <= stepIndex.
    let ordinal = 0;
    for (let k = 0; k < poseStarts.length; k++) {
      if (poseStarts[k] <= stepIndex) ordinal = k + 1;
      else break;
    }
    return Math.max(1, ordinal);
  }, [poseStarts, stepIndex]);

  const atFirstPose = currentPoseOrdinal <= 1;
  const atLastPose = currentPoseOrdinal >= totalPoses;

  const goToPoseOrdinal = useCallback(
    (ordinal: number) => {
      const clamped = Math.max(1, Math.min(totalPoses, ordinal));
      const target = poseStarts[clamped - 1];
      if (target === undefined) return;

      // --- manual-skip announce debounce ---
      // Cut any in-flight announcement immediately so a stale pose name doesn't
      // play over the jump.
      stopVoice();
      // Stop any ringing breath tone(s) AND suppress the tone for the step we
      // land on, so rapid skipping neither stacks nor rapid-fires the inhale/
      // exhale sound. The suppression flag is cleared by the stepping engine.
      stopBreathCues();
      suppressBreathCueRef.current = true;
      // Cancel a previously-scheduled skip announcement; rapid consecutive skips
      // keep cancelling so only the FINAL landed pose is announced.
      if (skipAnnounceTimerRef.current !== null) {
        window.clearTimeout(skipAnnounceTimerRef.current);
        skipAnnounceTimerRef.current = null;
      }

      // Suppress the auto-advance narration effect's IMMEDIATE announce for this
      // jump by pre-recording the landed pose as "already announced". The
      // debounced timer below does the actual (delayed) announcement instead.
      const landedStep = steps[target];
      const landedPoseIndex =
        landedStep && landedStep.kind === 'breath'
          ? landedStep.poseIndex
          : null;
      if (landedPoseIndex !== null) {
        lastAnnouncedPoseIndexRef.current = landedPoseIndex;
        const landedPose = (landedStep as { pose: Pose }).pose;
        skipAnnounceTimerRef.current = window.setTimeout(() => {
          skipAnnounceTimerRef.current = null;
          // speakPose self-guards on the voice + sound toggles.
          speakPose(landedPose.id);
        }, SKIP_ANNOUNCE_DELAY_MS);
      }

      setPhase('inhale');
      setStepIndex(target);
    },
    [poseStarts, totalPoses, steps],
  );

  const goPrevPose = useCallback(
    () => goToPoseOrdinal(currentPoseOrdinal - 1),
    [goToPoseOrdinal, currentPoseOrdinal],
  );
  const goNextPose = useCallback(
    () => goToPoseOrdinal(currentPoseOrdinal + 1),
    [goToPoseOrdinal, currentPoseOrdinal],
  );

  const togglePause = useCallback(() => setPaused((p) => !p), []);

  // --- Task 3: leave-practice back-interception -------------------------------
  // "In progress" == the screen is mounted, has steps, and is NOT complete. Per
  // the human's confirmation the opening countdown counts as in progress, so we
  // deliberately do NOT exclude `starting`. The DEV-only `?complete` hatch
  // (startComplete) and the empty-practice bail (stepCount === 0) are never in
  // progress, so they get no guard entry and no dialog.
  const inProgress = !complete && stepCount > 0 && !startComplete;

  // Push the single guard history entry once, on mount, for a real in-progress
  // practice. See the module doc for the full model. Empty deps: this runs once
  // per mount. The guard is deliberately KEPT UP after completion (Task 5), so
  // it is only ever popped by a real back gesture / the "Return home" button
  // (both via the interceptor's complete branch), by a confirmed Leave, or by
  // unmount -- all keyed off guardPushedRef so we never push or pop it twice.
  useEffect(() => {
    if (inProgress && !guardPushedRef.current) {
      guardPushedRef.current = true;
      window.history.pushState({ screen: 'guided' }, '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The single popstate interceptor for leaving guided. This is intentionally a
  // SEPARATE listener from App's (App's is the only NAVIGATION-driven setScreen;
  // this one never setScreen's -- it only decides whether to BLOCK a leave or,
  // on the completion screen, redirect it HOME). On a back gesture the guard
  // entry is popped and we land on the guided entry, so App's handler setScreen's
  // 'guided' (a no-op that keeps us mounted, so no completion audio replays and
  // there is no flicker to overview). What we do next depends on whether the
  // practice is in progress (show the "Leave practice?" dialog) or complete
  // (Task 5: route home via onComplete, unifying the button and the gesture).
  useEffect(() => {
    const onPopState = () => {
      // Consume a one-shot suppression: our own programmatic navigation
      // (confirmed leave / completion go-home) -- let App's handler drive it.
      if (leavingRef.current) {
        leavingRef.current = false;
        return;
      }

      // Task 5: back FROM the completion (Namaste) screen. The guard is still up
      // on completion (we deliberately do not tear it down), so a back gesture --
      // or the "Return home" button, which routes through the same history.back()
      // (see handleReturnHome) -- has just popped it, leaving [home, overview,
      // guided]. Redirect that single back to HOME so completion never drops the
      // user into the just-finished overview. We arm leavingRef so the popstate
      // from onComplete's history.go(-2) is ignored here (App resolves the base
      // entry to home). Guarded on guardPushedRef so the DEV `?complete` hatch
      // (no guard, no forward history) never calls history.go on an empty stack.
      if (complete) {
        if (!guardPushedRef.current) return;
        guardPushedRef.current = false;
        leavingRef.current = true;
        onComplete();
        return;
      }

      // Not in progress (no guard was ever pushed): nothing to intercept; App's
      // handler has already resolved the screen normally.
      if (!inProgress || !guardPushedRef.current) return;

      // A back gesture just popped the guard. Re-push it to stay put (this keeps
      // the guard count at exactly one -- no accumulation across repeated
      // open/cancel), pause the practice, and open the confirmation dialog.
      window.history.pushState({ screen: 'guided' }, '');
      // Pause via the existing, leak-free pause machinery: the stepping effect
      // is keyed on `paused`, so this halts the current step's timers and (on
      // resume) restarts the current breath/phase from its start.
      setPaused((p) => (p ? p : true));
      // Task 4: silence any IN-FLIGHT cue so nothing talks over the dialog, and
      // (critically) release any duck it holds so the ambient music returns to
      // full volume behind the dialog rather than sitting dipped.
      //   - stopVoice() hard-stops an in-flight utterance AND releases its duck
      //     (voice cues requestDuck/releaseDuck); if a pose name / vinyasa cue
      //     was mid-utterance when the user hit back, this is what prevents the
      //     music being left stuck-ducked while the dialog waits.
      //   - stopBreathCues() stops any live inhale/exhale tone (breath tones are
      //     a duck LISTENER, never a ducker, so this releases no duck -- it just
      //     quiets the tone so the dialog is calm).
      // Ambient MUSIC is intentionally NOT touched: it persists across screens
      // by design (ambientPref / MusicPanel) and should keep playing softly
      // behind the dialog, matching the app's behaviour when the user taps Pause.
      stopVoice();
      stopBreathCues();
      setShowLeaveDialog(true);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
    // Re-subscribe when `inProgress` / `complete` / `onComplete` change so the
    // closure reads the current values. This listener never pushes on its own
    // except the deterministic guard re-push above, so it cannot loop.
  }, [inProgress, complete, onComplete]);

  // Cancel ("Stay"): close the dialog and resume the practice where it was. The
  // guard was already re-pushed by the interceptor, so history is consistent and
  // needs no change here.
  //
  // Task 4 (resume-audio-where-it-was): `setPaused(false)` is all that is needed
  // and it is genuinely clean. The stepping effect is keyed on `paused`, so
  // clearing it re-runs the effect for the CURRENT stepIndex: it clears no stale
  // timers (the interceptor's pause already halted them via the effect cleanup),
  // restarts the current breath/phase from its start, and replays that step's
  // breath tone / lets voice resume normally on the next narration trigger. No
  // double-scheduling can occur (the effect's cleanup runs before it reschedules)
  // and no duck can be left stuck: any in-flight cue's duck was already released
  // by the interceptor's stopVoice(), and breath tones never hold a duck, so on
  // resume the duck ref-count is already at 0 (music at full volume) and simply
  // dips again the next time a real voice cue fires. Nothing extra to re-assert.
  const handleStayInPractice = useCallback(() => {
    setShowLeaveDialog(false);
    setPaused(false);
  }, []);

  // Confirm ("Leave"): tear everything down (mirrors handleExit's teardown --
  // Task 6 owns fuller audio teardown), then navigate to overview with a single
  // history.go(-2) that pops BOTH the guard AND the guided entry. App's single
  // popstate handler does the actual setScreen('overview'); we suppress our own
  // interceptor for this programmatic navigation via leavingRef.
  //
  // Task 4: leaving from a PAUSED state must not leave stuck audio or a stuck
  // duck. Pause state does not fight teardown -- clearTimers() empties the (in
  // this case already-halted) timer ref, and the audio stops below are
  // unconditional and safe to call when nothing is playing:
  //   - stopVoice(): stops any in-flight utterance AND releases its duck. On the
  //     dialog path the interceptor already called this, so here it is a no-op
  //     that keeps the confirmed-leave path correct even if reached another way.
  //   - stopBreathCues(): stops any live inhale/exhale tone that could still be
  //     sounding (breath tones hold no duck, so this releases none). Added in
  //     Task 4 so the paused+leave combination is guaranteed silent.
  // Ambient music is intentionally NOT stopped here (it persists by design);
  // Task 6 owns any fuller audio-teardown completeness on confirmed leave.
  const handleLeavePractice = useCallback(() => {
    setShowLeaveDialog(false);
    clearTimers();
    if (skipAnnounceTimerRef.current !== null) {
      window.clearTimeout(skipAnnounceTimerRef.current);
      skipAnnounceTimerRef.current = null;
    }
    stopVoice();
    stopBreathCues();
    guardPushedRef.current = false;
    leavingRef.current = true;
    window.history.go(-2);
  }, [clearTimers]);

  // Move focus to the dialog when it opens (accessibility) and allow Escape to
  // cancel ("Stay"). Scoped to while the dialog is open.
  useEffect(() => {
    if (!showLeaveDialog) return;
    leaveDialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleStayInPractice();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showLeaveDialog, handleStayInPractice]);

  // --- the stepping engine ----------------------------------------------------
  // Owns timers for the current step. Re-runs (and thus cleans up) on every
  // change of stepIndex / paused / complete, so timers never leak or overlap.
  useEffect(() => {
    if (complete) return;
    if (starting) return; // held during the opening "get ready" countdown
    if (paused) return; // frozen: schedule nothing, cleanup halted prior timers

    const step = steps[stepIndex];
    if (!step) {
      // Ran past the last step → practice complete.
      setComplete(true);
      return;
    }

    const advance = () => {
      if (stepIndex + 1 >= stepCount) setComplete(true);
      else {
        // Do NOT reset phase here: the NEXT step's effect run sets its own
        // initial phase (a full breath restarts at 'inhale'; a single-phase
        // movement sets its own phase). Leaving the current phase in place lets
        // the BreathingCircle flow smoothly from one movement's phase into the
        // next movement's opposite phase without a jarring mid-flow reset.
        setStepIndex((i) => i + 1);
      }
    };

    if (step.kind === 'breath' && step.singlePhase !== undefined) {
      // Single-phase MOVEMENT (a vinyasa step): play ONLY this phase for half a
      // breath, then advance. The NEXT movement's opposite phase continues the
      // rhythm - an inhale movement expands the circle, the following exhale
      // movement contracts it - so we deliberately do NOT schedule the opposite
      // phase here. The active half's ms is inhaleMs for an inhale movement and
      // exhaleMs for an exhale movement (the other is 0).
      const phaseForMovement = step.singlePhase;
      setPhase(phaseForMovement);
      // Play the matching breath tone at the START of this single phase, UNLESS
      // this step was reached by a manual skip (the flag is set by the skip
      // handler and cleared here), so rapid skipping doesn't rapid-fire the tone.
      // Guarded to breath steps only; both self-guard on the sound + cues toggles.
      if (suppressBreathCueRef.current) {
        suppressBreathCueRef.current = false;
      } else if (phaseForMovement === 'inhale') {
        playInhale();
      } else {
        playExhale();
      }
      const movementMs =
        phaseForMovement === 'inhale' ? step.inhaleMs : step.exhaleMs;
      schedule(advance, movementMs);
    } else if (step.kind === 'breath') {
      // Full breath (a Down Dog HOLD breath or any non-flow breath): inhale then
      // exhale, exactly as before.
      // Start expanding immediately.
      setPhase('inhale');
      // Play the soft inhale tone at the START of the inhale, UNLESS this step was
      // reached by a manual skip (suppress once so rapid skipping doesn't rapid-
      // fire the tone). Otherwise guarded to breath steps only (never during
      // starting/paused/complete via the early returns above). On resume the
      // breath restarts from its inhale, so replaying the tone then is intentional.
      if (suppressBreathCueRef.current) {
        suppressBreathCueRef.current = false;
      } else {
        playInhale();
      }
      // Flip to exhale at the inhale/exhale boundary, and play the exhale tone
      // there - inside the scheduled callback, so it fires only when the exhale
      // phase is actually reached (not immediately).
      schedule(() => {
        setPhase('exhale');
        // playExhale self-guards on the sound + breath-cues toggles.
        playExhale();
      }, step.inhaleMs);
      // ...and advance when the whole breath is done.
      schedule(advance, step.inhaleMs + step.exhaleMs);
    } else {
      // Transition: show a calm per-second countdown, then advance.
      const total = step.seconds;
      setCountdown(total);
      for (let s = 1; s < total; s++) {
        schedule(() => setCountdown(total - s), s * 1000);
      }
      schedule(advance, total * 1000);
    }

    return clearTimers;
    // `steps`, `stepCount`, `schedule`, `clearTimers` are stable for the life of
    // a given plan; stepIndex/paused/complete/starting are the real triggers.
  }, [
    stepIndex,
    paused,
    complete,
    starting,
    steps,
    stepCount,
    schedule,
    clearTimers,
  ]);

  // --- opening countdown ------------------------------------------------------
  // Runs once at the start (and re-runs cleanly if paused mid-opening). Counts
  // OPENING_COUNTDOWN_SECONDS → 1, then clears `starting` so the stepping engine
  // begins with the first breath. Uses the same schedule/clearTimers plumbing so
  // it can never leak or double-fire.
  useEffect(() => {
    if (!starting || paused || complete) return;
    setOpeningCount(OPENING_COUNTDOWN_SECONDS);
    for (let s = 1; s < OPENING_COUNTDOWN_SECONDS; s++) {
      schedule(() => setOpeningCount(OPENING_COUNTDOWN_SECONDS - s), s * 1000);
    }
    schedule(() => setStarting(false), OPENING_COUNTDOWN_SECONDS * 1000);

    // Announce the FIRST pose a moment into the get-ready countdown so its name
    // lands before the first breath, not on it. One-shot (ref-guarded) so it
    // fires exactly once and never double-fires across a pause/resume of the
    // opening countdown. Recording its index in the shared announce ref means
    // the auto-advance narration effect won't re-announce it when `starting`
    // flips false.
    if (!firstPoseAnnouncedRef.current) {
      const firstStep = steps[0];
      if (firstStep && firstStep.kind === 'breath') {
        const firstPose = firstStep.pose;
        schedule(() => {
          if (firstPoseAnnouncedRef.current) return;
          firstPoseAnnouncedRef.current = true;
          lastAnnouncedPoseIndexRef.current = firstStep.poseIndex;
          // speakPose self-guards on the voice + sound toggles.
          speakPose(firstPose.id);
        }, FIRST_POSE_ANNOUNCE_DELAY_MS);
      }
    }

    return clearTimers;
  }, [starting, paused, complete, schedule, clearTimers, steps]);

  // Task 6: the mount-once, unmount-time catch-all audio + timer teardown. This
  // is the SAFETY NET that guarantees the AC "leaving Guided stops all practice
  // audio cleanly" no matter HOW the screen unmounts -- a confirmed Leave, the
  // completion "Return home" / back gesture (Task 5), a raw screen swap in App,
  // or any future path. The explicit handlers (handleExit / the leave dialog /
  // handleLeavePractice) stop audio eagerly, but only this cleanup is guaranteed
  // to run on EVERY unmount, so it is where completeness lives.
  //
  // Empty deps means the effect body runs once (nothing) and its cleanup runs
  // exactly once, on unmount. On unmount we:
  //   - clearTimers(): clear every tracked stepping/countdown timeout. (The
  //     stepping effect's own cleanup already covers this while mounted; this
  //     re-covers it on unmount and against future refactors.)
  //   - clear the standalone manual-skip announce timer, which lives apart from
  //     timeoutsRef precisely because it survives step-change cleanups, so it
  //     could otherwise still be pending at unmount.
  //   - stopVoice() + stopBreathCues() + stopChime(): hard-stop every persistent
  //     practice-audio element (the reused voice element, the two breath-tone
  //     elements, and the completion bell) so no cue, tone, or bell keeps
  //     sounding after the screen is gone, and any duck those held is released.
  //
  // All three stop functions are best-effort, silent on failure, and idempotent
  // (each clears its own tracking refs / live set and its duck release is guarded
  // to fire at most once), so double-calling them -- e.g. after handleLeavePractice
  // already stopped voice + breath cues -- is a safe no-op. Because the audio
  // modules REUSE module-level persistent elements (the iOS autoplay fix),
  // stopping here only pauses + rewinds them; the next practice's play() / warm-up
  // reassigns and restarts them cleanly, so this teardown cannot strand the shared
  // elements in a bad state. Ambient music is deliberately NOT touched: GuidedScreen
  // never controls it (it is owned by ambientPref / MusicPanel and persists across
  // screens by design), and none of these stop functions affect it.
  useEffect(
    () => () => {
      clearTimers();
      if (skipAnnounceTimerRef.current !== null) {
        window.clearTimeout(skipAnnounceTimerRef.current);
        skipAnnounceTimerRef.current = null;
      }
      stopVoice();
      stopBreathCues();
      stopChime();
    },
    [clearTimers],
  );

  // --- completion bell --------------------------------------------------------
  // Unlock the AudioContext on mount: this screen only mounts after the user
  // tapped "Start practice", so we're still within the gesture-enabled window
  // that mobile browsers require for audio.
  useEffect(() => {
    unlockAudio();
    // Warm up MP3 <audio> playback within the same gesture window so the first
    // spoken pose name is more likely to be permitted on mobile.
    unlockVoice();
    // Same warm-up for the breath-cue WAVs, so the first inhale tone is more
    // likely to be permitted on mobile.
    unlockBreathCues();
  }, []);

  // --- spoken pose-name narration --------------------------------------------
  // Announce each DISTINCT pose once, on ENTRY - not on side-switches or rounds.
  //
  // The single source of truth for "which pose are we entering" is the current
  // step's target pose index: a breath step targets its own `poseIndex`; a
  // transition targets `toPoseIndex` (the pose it leads INTO). A ref tracks the
  // last pose index we announced; we speak only when the target index changes to
  // a not-just-announced pose. This makes each pose announced exactly once even
  // across pause/resume (which re-runs effects but leaves the index unchanged),
  // and correctly re-announces when prev/next-pose navigation jumps to a
  // different pose.
  //
  // Same-pose transitions (switch sides / next round) keep the same target
  // index, so they never trigger a pose re-announcement - instead, at the START
  // of such a transition we play the dedicated "Switch sides" cue.
  //
  // The first pose is announced DURING the opening "get ready" countdown (see
  // the opening-countdown effect below), so by the time `starting` flips false
  // its index is already recorded (in lastAnnouncedPoseIndexRef, declared with
  // the other refs above) and it is not re-announced.
  useEffect(() => {
    if (complete) return;
    if (starting) return; // first pose is handled by the opening countdown
    const step = steps[stepIndex];
    if (!step) return;

    // A half-vinyasa's movement steps are tagged with the NEXT pose's index, but
    // they are the transition INTO it, not the pose itself. Do not announce the
    // pose name during the vinyasa - wait for its first real breath, so the name
    // lands just as the pose actually begins.
    if (step.kind === 'breath' && step.isVinyasa) return;

    const enteredPoseIndex =
      step.kind === 'breath' ? step.poseIndex : step.toPoseIndex;

    if (enteredPoseIndex === lastAnnouncedPoseIndexRef.current) {
      // Same pose as last announced. Two kinds of same-pose transition exist:
      //   - a genuine SIDE switch (a 2-sided pose going left -> right): the plan
      //     sets cue === 'Switch sides', and we play the switch-sides voice cue.
      //   - a ROUND repeat (e.g. Surya A x3, Navasana x5): the plan sets cue to
      //     'Round N of M'. This is NOT a side switch, so we stay SILENT (no
      //     switch-sides cue, no pose-name re-announce).
      // Gate strictly on the cue so round repeats never say "switch sides".
      if (step.kind === 'transition' && step.cue === 'Switch sides') {
        // Self-guards on the voice + sound toggles.
        speakSwitchSides();
      }
      return;
    }

    // A genuinely new pose: announce it. This covers normal auto-advance
    // transitions (announced at transition start, WITHOUT the manual-skip
    // debounce) and any programmatic index change that lands on a new pose.
    lastAnnouncedPoseIndexRef.current = enteredPoseIndex;
    const pose = step.kind === 'breath' ? step.pose : step.toPose;
    // speakPose self-guards on the voice + sound toggles, so call unconditionally.
    speakPose(pose.id);
  }, [stepIndex, starting, complete, steps]);

  // --- prerecorded vinyasa voice cues ----------------------------------------
  // The salutation flow tags certain BREATH steps with a `voiceCueId`:
  // `last_breath` on the Down Dog HOLD's 5th breath, `step_jump_forward` on the
  // jump-forward (Ardha Uttanasana) inhale MOVEMENT, and `samasthiti` on the
  // closing Samasthiti exhale MOVEMENT. Fire that clip exactly once when its step
  // becomes current. Only breath steps carry cues - transitions never do.
  //
  // A ref of the last step index we cued guards against double-firing across
  // pause/resume (which re-runs effects but leaves `stepIndex` unchanged). This
  // is independent of the pose-name narration above: `speakCue` and `speakPose`
  // both go through the same single-voice channel (playClip → stopVoice), so at
  // most one clip plays at a time and toggles are respected. A cue breath is not
  // a pose entry (its poseIndex was already announced), so the two effects never
  // target the same step with conflicting audio.
  const lastCuedStepIndexRef = useRef<number | null>(null);
  useEffect(() => {
    if (complete) return;
    if (starting) return;
    const step = steps[stepIndex];
    if (!step) return;

    // Only breath steps carry a `voiceCueId`.
    const cueId = step.kind === 'breath' ? step.voiceCueId : undefined;
    if (!cueId) return;

    // Fire once per landing on this step.
    if (lastCuedStepIndexRef.current === stepIndex) return;
    lastCuedStepIndexRef.current = stepIndex;
    // speakCue self-guards on the voice + sound toggles.
    speakCue(cueId);
  }, [stepIndex, starting, complete, steps]);

  // Play a single soft bell the moment the practice completes (Namaste screen),
  // unless the user has muted sound. A ref guard ensures it fires exactly once.
  // AFTER the bell has had a moment to establish, speak the closing "Namaste"
  // (its own toggle-guard applies), sequenced so the two cues don't collide.
  const bellPlayedRef = useRef(false);
  const namastePlayedRef = useRef(false);
  // Records the completed practice to the on-device practice log exactly once,
  // for the calm "last 7 days" row on Home. Guarded by its own ref so it fires
  // only on the first real completion. Deliberately EXCLUDES the DEV-only
  // `?complete` hatch (startComplete): that debug path must never pollute the
  // log. Best-effort (practiceLog swallows storage errors) and needs no user
  // gesture - it's just localStorage.
  const practiceRecordedRef = useRef(false);
  useEffect(() => {
    if (complete && !startComplete && !practiceRecordedRef.current) {
      practiceRecordedRef.current = true;
      recordPractice();
    }
  }, [complete, startComplete]);

  useEffect(() => {
    if (!complete || bellPlayedRef.current) return;

    const playCompletionSounds = () => {
      if (bellPlayedRef.current) return;
      bellPlayedRef.current = true;
      if (loadSoundEnabled()) playCompletionBell();
      if (!namastePlayedRef.current) {
        namastePlayedRef.current = true;
        // Let the bell establish first, then speak Namaste over its tail.
        window.setTimeout(() => speakNamaste(), 1400);
      }
    };

    if (!startComplete) {
      // Normal completion: the user tapped "Start practice" earlier, so audio is
      // already unlocked. Play the completion sounds right away.
      playCompletionSounds();
      return;
    }

    // DEV-only `?complete` hatch: the screen mounts straight into completion with
    // NO prior user gesture, so browser autoplay policy would block audio played
    // on mount. Defer the completion sounds until the first user interaction on
    // the page (which unlocks audio), so the hatch can still preview them.
    const onFirstGesture = () => playCompletionSounds();
    window.addEventListener('pointerdown', onFirstGesture, { once: true });
    window.addEventListener('keydown', onFirstGesture, { once: true });
    return () => {
      window.removeEventListener('pointerdown', onFirstGesture);
      window.removeEventListener('keydown', onFirstGesture);
    };
  }, [complete, startComplete]);

  // --- wake lock (progressive enhancement) ------------------------------------
  // Held only while actively playing (not paused, not complete). Re-acquired on
  // visibility change because the browser drops the lock when the tab hides.
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const shouldHoldLock = !paused && !complete && stepCount > 0;
  // Note: the opening countdown also keeps the screen awake (starting implies
  // not complete and stepCount > 0), so no extra condition is needed here.

  useEffect(() => {
    let cancelled = false;

    const release = async () => {
      const sentinel = wakeLockRef.current;
      wakeLockRef.current = null;
      if (sentinel) {
        try {
          await sentinel.release();
        } catch {
          /* ignore - best-effort release */
        }
      }
    };

    const acquire = async () => {
      if (!('wakeLock' in navigator)) return; // unsupported → silently skip
      if (wakeLockRef.current) return; // already held
      try {
        const sentinel = await navigator.wakeLock.request('screen');
        if (cancelled) {
          // We were torn down while awaiting; release immediately.
          try {
            await sentinel.release();
          } catch {
            /* ignore */
          }
          return;
        }
        wakeLockRef.current = sentinel;
      } catch {
        /* unsupported / denied / not visible → continue without it */
      }
    };

    if (shouldHoldLock) {
      void acquire();
    } else {
      void release();
    }

    // Re-acquire when the tab becomes visible again (locks drop while hidden).
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && shouldHoldLock) {
        void acquire();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
      void release();
    };
  }, [shouldHoldLock]);

  // --- exit: stop everything, then hand back to the shell ---------------------
  // The in-app Exit control funnels through the SAME browser back path as the
  // system gesture, so both routes hit the leave-practice interceptor uniformly.
  // While a practice is in progress, Exit does NOT tear down here -- it just
  // triggers a back (onExit === history.back() in App), which pops the guard and
  // fires the popstate our interceptor catches to show the "Leave practice?"
  // dialog. Teardown then happens only on a confirmed Leave (handleLeavePractice)
  // or on unmount. When NOT in progress (the empty-practice bail below, which
  // renders before any guard is pushed), fall back to the original
  // teardown-then-onExit so that path is unchanged.
  const handleExit = useCallback(() => {
    if (inProgress) {
      onExit();
      return;
    }
    clearTimers();
    if (skipAnnounceTimerRef.current !== null) {
      window.clearTimeout(skipAnnounceTimerRef.current);
      skipAnnounceTimerRef.current = null;
    }
    stopVoice();
    onExit();
  }, [inProgress, clearTimers, onExit]);

  // --- Task 5: completion "Return home" -- unified with the system back gesture.
  // On a real completion the guard entry is still up (we do not tear it down when
  // `complete` flips), so this button funnels through the EXACT same path as a
  // system back gesture: history.back() pops the guard, App's popstate handler
  // keeps us on 'guided' (a no-op -- no unmount, so no completion-audio replay,
  // no flicker to overview), and OUR interceptor's `complete` branch then calls
  // onComplete() (App's history.go(-2)) to land on home. Routing the button
  // through the interceptor is what makes button === gesture.
  //
  // The DEV `?complete` hatch mounts with NO guard (never in progress), so there
  // is no forward history to pop -- calling history.back() there would background
  // the app. In that case go straight through onComplete() (App's setScreen),
  // which is exactly the hatch's inline handler.
  const handleReturnHome = useCallback(() => {
    if (guardPushedRef.current) {
      window.history.back();
    } else {
      onComplete();
    }
  }, [onComplete]);

  // ===========================================================================
  // Render
  // ===========================================================================

  // Empty practice (should never happen) - bail calmly.
  if (stepCount === 0) {
    return (
      <section className="screen guided-player">
        <div className="guided-player__stage">
          <p className="guided-player__cue">No poses in this practice.</p>
        </div>
        <div className="guided-player__controls">
          <button
            type="button"
            className="button button--surface guided-player__control"
            onClick={handleExit}
          >
            Exit
          </button>
        </div>
      </section>
    );
  }

  // Completion screen.
  if (complete) {
    return (
      <section className="screen guided-complete">
        <div className="guided-complete__body">
          <NamasteMark size={112} className="guided-complete__mark" />
          <h1 className="guided-complete__heading">Namaste</h1>
          <p className="guided-complete__message">Your practice is complete.</p>
          <dl className="guided-complete__summary">
            <div className="guided-complete__stat">
              <dd className="guided-complete__stat-value">{totalPoses}</dd>
              <dt className="guided-complete__stat-label">Poses</dt>
            </div>
            <div className="guided-complete__stat">
              <dd className="guided-complete__stat-value">{totalBreaths}</dd>
              <dt className="guided-complete__stat-label">Breaths</dt>
            </div>
            <div className="guided-complete__stat">
              <dd className="guided-complete__stat-value">
                {formatDuration(plan.totalMs / 1000)}
              </dd>
              <dt className="guided-complete__stat-label">Duration</dt>
            </div>
          </dl>
        </div>
        <button
          type="button"
          className="button button--primary"
          onClick={handleReturnHome}
        >
          Return home
        </button>
      </section>
    );
  }

  const isBreath = currentStep?.kind === 'breath';
  const isTransition = currentStep?.kind === 'transition';
  // A single-phase MOVEMENT (a vinyasa step, `singlePhase` set) vs a full breath
  // (a Down Dog HOLD breath or a non-flow breath). The on-screen "Breath N of M"
  // counter is shown only for FULL breaths (holds / non-flow); during a movement
  // we show just the phase word + sub-pose label, since a movement is a single
  // half-breath with no meaningful "N of M".
  const isMovement =
    currentStep?.kind === 'breath' && currentStep.singlePhase !== undefined;
  const isHoldOrFullBreath = isBreath && !isMovement;

  // The pose shown above the circle: for a breath it's the current pose; for a
  // transition it's the pose we're heading into.
  const shownPose =
    currentStep?.kind === 'breath'
      ? currentStep.pose
      : currentStep?.kind === 'transition'
        ? currentStep.toPose
        : undefined;

  const drishtiVerified =
    shownPose !== undefined && shownPose.drishti !== UNVERIFIED;

  // A half-vinyasa movement step (between seated poses). It is tagged with the
  // next pose, but we do not present it as that pose: show a flow glyph + the
  // movement label, with a quiet "Vinyasa" subtitle, and NOT the next pose's
  // name (that is announced/shown only once the pose actually begins).
  const isVinyasaStep =
    currentStep?.kind === 'breath' && currentStep.isVinyasa === true;

  // The live flow-position strip takes over the pose-icon slot ONLY for a real
  // multi-position flow breath: a salutation / UHP step that carries a
  // `flowIndex` (so we know the current position) whose owning `pose.flow` has
  // more than one position. This excludes non-flow poses, half-vinyasa steps
  // (flowIndex undefined), transitions, the opening countdown (no flow step
  // yet), and completion - in all of those cases the single pose icon (or the
  // vinyasa FlowMark) is shown instead. The two locals are the narrowed
  // (defined) values passed to the strip in the pose-icon slot below.
  const flowStripPositions =
    currentStep?.kind === 'breath' &&
    currentStep.flowIndex !== undefined &&
    currentStep.pose.flow !== undefined &&
    currentStep.pose.flow.length > 1
      ? currentStep.pose.flow
      : undefined;
  const flowStripActiveIndex =
    currentStep?.kind === 'breath' ? currentStep.flowIndex : undefined;

  // During a salutation breath the current flow step tags a `subPoseLabel`
  // (e.g. "Adho Mukha Svanasana"). When present, show the sub-pose large (as the
  // primary Sanskrit name) and the salutation name small underneath, so the
  // screen tracks the vinyasa. Otherwise fall back to the pose's own names.
  const subPoseLabel =
    currentStep?.kind === 'breath' ? currentStep.subPoseLabel : undefined;
  const primaryName = subPoseLabel ?? shownPose?.sanskrit ?? '\u00a0';
  // Secondary line: "Vinyasa" during a between-poses vinyasa; the salutation
  // name while in a salutation flow; else the pose's English name.
  const secondaryName = isVinyasaStep
    ? 'Vinyasa'
    : subPoseLabel
      ? shownPose?.sanskrit
      : shownPose?.english;

  // Phase word over the circle (breath only).
  const phaseWord = phase === 'inhale' ? 'Inhale' : 'Exhale';

  // Circle centre content: phase word while breathing, countdown while
  // transitioning, "Paused" overlay handled separately below.
  const circleCenter = isBreath ? (
    <span className="breathing-circle__phase">{phaseWord}</span>
  ) : isTransition ? (
    <span className="breathing-circle__count">{countdown}</span>
  ) : null;

  return (
    <section className="screen guided-player">
      {/* Top: subtle progress + exit. */}
      <header className="guided-player__top">
        <button
          type="button"
          className="button button--ghost guided-player__exit"
          onClick={handleExit}
          aria-label="Exit guided practice"
        >
          Exit
        </button>
        <span className="guided-player__progress" aria-live="polite">
          Pose {currentPoseOrdinal} of {totalPoses}
        </span>
      </header>

      {/* Middle: the focal stage. */}
      <div className="guided-player__stage">
        <div className="guided-player__pose">
          {/* The pose-icon slot is polymorphic: for a real multi-position flow
              step (salutation / UHP) the FlowStrip REPLACES the single pose icon
              here, becoming the icon for the whole flow and highlighting the
              current position; a half-vinyasa still shows the FlowMark; every
              other (normal) pose still shows the single PoseGraphic. The strip
              sits centred in this slot, above the pose name, exactly where the
              single icon used to. */}
          {flowStripPositions !== undefined &&
          flowStripActiveIndex !== undefined ? (
            <FlowStrip
              flow={flowStripPositions}
              activeIndex={flowStripActiveIndex}
            />
          ) : isVinyasaStep ? (
            <FlowMark size={72} className="guided-player__pose-icon" />
          ) : (
            shownPose && (
              <PoseGraphic
                poseId={shownPose.id}
                name={shownPose.english}
                size={72}
                className="guided-player__pose-icon"
              />
            )
          )}
          <h2 className="guided-player__primary-name">{primaryName}</h2>
          {secondaryName && (
            <p className="guided-player__secondary-name">{secondaryName}</p>
          )}
          {isBreath && drishtiVerified && (
            <p className="guided-player__drishti">Gaze: {shownPose?.drishti}</p>
          )}
        </div>

        <BreathingCircle
          phase={phase}
          inhaleMs={isBreath && !starting ? currentStep.inhaleMs : 0}
          exhaleMs={isBreath && !starting ? currentStep.exhaleMs : 0}
          active={isBreath && !paused && !starting}
          paused={paused}
        >
          {paused ? (
            <span className="breathing-circle__paused">Paused</span>
          ) : starting ? (
            <span className="breathing-circle__count">{openingCount}</span>
          ) : (
            circleCenter
          )}
        </BreathingCircle>

        <div className="guided-player__meta">
          {starting && <p className="guided-player__cue">Get ready&hellip;</p>}
          {/* Breath counter: only for full breaths (Down Dog hold / non-flow).
              Hidden during single-phase movements - a movement is one
              half-breath with no meaningful "N of M". */}
          {!starting && isHoldOrFullBreath && (
            <p className="guided-player__breath-count">
              Breath {currentStep.breathNumber} of {currentStep.breathCount}
            </p>
          )}
          {!starting && isBreath && currentStep.segmentLabel && (
            <p className="guided-player__segment">{currentStep.segmentLabel}</p>
          )}
          {!starting && isTransition && (
            <p className="guided-player__cue">{currentStep.cue}</p>
          )}
        </div>
      </div>

      {/* Bottom: calm control bar. */}
      <div className="guided-player__controls">
        <button
          type="button"
          className="button button--surface guided-player__control"
          onClick={goPrevPose}
          disabled={atFirstPose}
          aria-label="Previous pose"
        >
          &lsaquo; Previous
        </button>

        <button
          type="button"
          className="button button--surface guided-player__control guided-player__control--primary"
          onClick={togglePause}
          aria-pressed={paused}
        >
          {paused ? 'Resume' : 'Pause'}
        </button>

        <button
          type="button"
          className="button button--surface guided-player__control"
          onClick={goNextPose}
          disabled={atLastPose}
          aria-label="Skip pose"
        >
          Skip &rsaquo;
        </button>
      </div>

      {/* Task 3: leave-practice confirmation dialog. Reuses the shared modal
          language (.about-backdrop overlay + a calm surface card) and the
          shared .button classes. Backdrop click and Escape both cancel
          ("Stay"); focus moves to the dialog on open (see the effect above). */}
      {showLeaveDialog && (
        <div className="about-backdrop" onClick={handleStayInPractice}>
          <div
            ref={leaveDialogRef}
            className="leave-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="leave-dialog-heading"
            aria-describedby="leave-dialog-message"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="leave-dialog-heading" className="leave-dialog__heading">
              Leave practice?
            </h2>
            <p id="leave-dialog-message" className="leave-dialog__message">
              Your practice is in progress.
            </p>
            <div className="leave-dialog__actions">
              <button
                type="button"
                className="button button--primary"
                onClick={handleLeavePractice}
              >
                Leave
              </button>
              <button
                type="button"
                className="button button--outline"
                onClick={handleStayInPractice}
              >
                Stay
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default GuidedScreen;
