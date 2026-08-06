/**
 * audioContext - the ONE shared Web Audio AudioContext for the whole app.
 *
 * Every Web Audio consumer (the chime bell warm-up in chime.ts, the ambient
 * loop engine in MusicPanel.tsx) creates its nodes on this single context
 * instead of spinning up its own. iOS Safari is unreliable with multiple
 * concurrent AudioContexts (they can end up suspended, silent, or fight over
 * the hardware audio session), so we deliberately share exactly one.
 *
 * The context is created lazily on first use (browsers recommend reusing a
 * single long-lived context, and creating one before a user gesture is wasteful
 * since it starts suspended anyway). It is guarded for SSR / no-Web-Audio: if
 * there is no AudioContext constructor, or construction throws, we return null
 * and every caller degrades to silence rather than erroring.
 *
 * A single shared context also means a single unlock: resuming it from ANY user
 * gesture (the chime warm-up inside "Start practice", or MusicPanel's
 * resume-on-gesture) unlocks audio for BOTH consumers at once.
 */

type AudioContextClass = typeof AudioContext;

/**
 * Resolve the AudioContext constructor with a webkit fallback, guarded for SSR
 * / no-DOM. Returns undefined when Web Audio is unavailable, in which case the
 * shared context stays null and callers degrade to silence.
 */
function getAudioContextClass(): AudioContextClass | undefined {
  if (typeof window === 'undefined') return undefined;
  return (
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: AudioContextClass })
      .webkitAudioContext
  );
}

// The single shared context for the life of the page. Null until first created,
// and null forever when Web Audio is unavailable.
let sharedCtx: AudioContext | null = null;

/**
 * Return the ONE shared AudioContext, creating it lazily on first call. Idempotent:
 * every subsequent call returns the same instance. Returns null under SSR or when
 * there is no AudioContext constructor / construction fails, so callers can degrade
 * to silence.
 */
export function getSharedAudioContext(): AudioContext | null {
  if (sharedCtx) return sharedCtx;
  const Ctor = getAudioContextClass();
  if (!Ctor) return null;
  try {
    sharedCtx = new Ctor({ latencyHint: 'interactive' });
    return sharedCtx;
  } catch {
    return null;
  }
}

/**
 * Best-effort resume of the shared context if it exists and is suspended. Safe to
 * call from any user gesture (the chime warm-up or the ambient resume-on-gesture):
 * because the context is shared, one resume unlocks audio for all consumers. Does
 * NOT create the context - callers that need it created should call
 * getSharedAudioContext() first. Guarded: never throws.
 */
export function resumeSharedAudioContext(): void {
  const ctx = sharedCtx;
  if (!ctx) return;
  try {
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    /* ignore - audio is a best-effort enhancement */
  }
}
