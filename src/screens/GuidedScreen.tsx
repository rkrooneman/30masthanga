/**
 * GuidedScreen — the interactive guided-practice player (Slice 5b).
 *
 * Walks the FLAT `buildGuidedPlan(...).steps` timeline in order, driving a
 * breathing circle and auto-advancing. It never re-derives side/round/breath
 * logic — the plan (Slice 5a) already did that; this screen only *plays* it.
 *
 * === timer lifecycle (the important part) ===
 * A single `useEffect` keyed on `[stepIndex, paused, complete]` owns the timers
 * for the CURRENT step. It reads the step and schedules it:
 *   - single-phase MOVEMENT breath step (`singlePhase` set — a vinyasa step):
 *     sets phase to that single phase, plays the matching breath tone, and
 *     schedules a timeout at half a breath (`breathSeconds / 2`) to advance. It
 *     does NOT schedule the opposite phase — the NEXT movement's opposite phase
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
 * as on unmount — so no timer can outlive its step, and advancing can never
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
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { GuidedScreenProps } from '../types/navigation';
import type { Pose } from '../types/pose';
import type { GuidedPhase, GuidedStep } from '../lib/guidedPlan';
import { buildGuidedPlan } from '../lib/guidedPlan';
import BreathingCircle from '../components/BreathingCircle';
import NamasteMark from '../components/NamasteMark';
import PoseGraphic from '../components/PoseGraphic';
import { unlockAudio, playCompletionBell } from '../lib/chime';
import {
  speakPose,
  speakNamaste,
  speakSwitchSides,
  speakCue,
  stopVoice,
  unlockVoice,
} from '../lib/voice';
import { playInhale, playExhale, unlockBreathCues } from '../lib/breathCues';
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
 * pose's name — ~1s in, so the name lands before the first breath rather than
 * on it.
 */
const FIRST_POSE_ANNOUNCE_DELAY_MS = 1000;

function GuidedScreen({
  practice,
  breathSeconds,
  onExit,
  onComplete,
  startComplete = false,
}: GuidedScreenProps) {
  // The plan is pure and deterministic for a given practice + pace, so memoise
  // it once. Rebuild only if the practice or pace identity changes.
  const plan = useMemo(
    () => buildGuidedPlan(practice.poses, breathSeconds),
    [practice, breathSeconds],
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

  // Every active timeout id lives here so cleanup can clear them all. Using a
  // ref (not state) means scheduling/clearing never triggers a re-render.
  const timeoutsRef = useRef<number[]>([]);

  // Pending manual-skip announcement timer (see goToPoseOrdinal). Held apart
  // from timeoutsRef because it must survive the stepping effect's own cleanup
  // (it schedules across step changes) yet still be cancelable on each skip and
  // cleared on unmount.
  const skipAnnounceTimerRef = useRef<number | null>(null);

  // One-shot guard so the first pose is announced exactly once during the
  // opening countdown, never re-firing on pause/resume of that countdown.
  const firstPoseAnnouncedRef = useRef(false);

  // The last pose index whose name we announced. Declared here (rather than at
  // the narration effect) because both the manual-skip handler and the opening
  // countdown record into it. See the narration effect for the full contract.
  const lastAnnouncedPoseIndexRef = useRef<number | null>(null);

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
    const starts: number[] = []; // starts[k] = step index of first breath of pose k
    const seen = new Set<number>();
    steps.forEach((step, i) => {
      if (step.kind === 'breath' && !seen.has(step.poseIndex)) {
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

  // Total breaths practised across the whole plan — one per 'breath' step.
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
      // rhythm — an inhale movement expands the circle, the following exhale
      // movement contracts it — so we deliberately do NOT schedule the opposite
      // phase here. The active half's ms is inhaleMs for an inhale movement and
      // exhaleMs for an exhale movement (the other is 0).
      const phaseForMovement = step.singlePhase;
      setPhase(phaseForMovement);
      // Play the matching breath tone at the START of this single phase. Guarded
      // to breath steps only, never during starting/paused/complete (early
      // returns above). Both self-guard on the sound + breath-cues toggles.
      if (phaseForMovement === 'inhale') playInhale();
      else playExhale();
      const movementMs =
        phaseForMovement === 'inhale' ? step.inhaleMs : step.exhaleMs;
      schedule(advance, movementMs);
    } else if (step.kind === 'breath') {
      // Full breath (a Down Dog HOLD breath or any non-flow breath): inhale then
      // exhale, exactly as before.
      // Start expanding immediately.
      setPhase('inhale');
      // Play the soft inhale tone at the START of the inhale. This is guarded to
      // breath steps only (never transitions), and the effect's early returns
      // above ensure it never fires during the opening "get ready" countdown
      // (starting), while paused, or after completion. On resume the breath
      // genuinely restarts from its inhale, so replaying the tone here is
      // intentional. playInhale self-guards on the sound + breath-cues toggles.
      playInhale();
      // Flip to exhale at the inhale/exhale boundary, and play the exhale tone
      // there — inside the scheduled callback, so it fires only when the exhale
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

  // Belt-and-braces: clear any stray timers on unmount (the effect cleanup above
  // already covers this, but this guards against future refactors). Also clears
  // the standalone manual-skip announce timer and hard-stops any in-flight voice
  // so nothing leaks or plays after the screen is gone.
  useEffect(
    () => () => {
      clearTimers();
      if (skipAnnounceTimerRef.current !== null) {
        window.clearTimeout(skipAnnounceTimerRef.current);
        skipAnnounceTimerRef.current = null;
      }
      stopVoice();
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
  // Announce each DISTINCT pose once, on ENTRY — not on side-switches or rounds.
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
  // index, so they never trigger a pose re-announcement — instead, at the START
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
  // becomes current. Only breath steps carry cues — transitions never do.
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
  // gesture — it's just localStorage.
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
          /* ignore — best-effort release */
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
  const handleExit = useCallback(() => {
    clearTimers();
    if (skipAnnounceTimerRef.current !== null) {
      window.clearTimeout(skipAnnounceTimerRef.current);
      skipAnnounceTimerRef.current = null;
    }
    stopVoice();
    onExit();
  }, [clearTimers, onExit]);

  // ===========================================================================
  // Render
  // ===========================================================================

  // Empty practice (should never happen) — bail calmly.
  if (stepCount === 0) {
    return (
      <section className="screen guided-player">
        <div className="guided-player__stage">
          <p className="guided-player__cue">No poses in this practice.</p>
        </div>
        <div className="guided-player__controls">
          <button
            type="button"
            className="guided-player__control"
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
          onClick={onComplete}
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

  // During a salutation breath the current flow step tags a `subPoseLabel`
  // (e.g. "Adho Mukha Svanasana"). When present, show the sub-pose large (as the
  // primary Sanskrit name) and the salutation name small underneath, so the
  // screen tracks the vinyasa. Otherwise fall back to the pose's own names.
  const subPoseLabel =
    currentStep?.kind === 'breath' ? currentStep.subPoseLabel : undefined;
  const primaryName = subPoseLabel ?? shownPose?.sanskrit ?? '\u00a0';
  // Secondary line: the salutation name while in a flow, else the English name.
  const secondaryName = subPoseLabel
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
          className="guided-player__exit"
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
          {shownPose && (
            <PoseGraphic
              poseId={shownPose.id}
              name={shownPose.english}
              size={44}
              className="guided-player__pose-icon"
            />
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
              Hidden during single-phase movements — a movement is one
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
          className="guided-player__control"
          onClick={goPrevPose}
          disabled={atFirstPose}
          aria-label="Previous pose"
        >
          &lsaquo; Previous
        </button>

        <button
          type="button"
          className="guided-player__control guided-player__control--primary"
          onClick={togglePause}
          aria-pressed={paused}
        >
          {paused ? 'Resume' : 'Pause'}
        </button>

        <button
          type="button"
          className="guided-player__control"
          onClick={goNextPose}
          disabled={atLastPose}
          aria-label="Skip pose"
        >
          Skip &rsaquo;
        </button>
      </div>
    </section>
  );
}

export default GuidedScreen;
