<img width="1200" height="630" alt="ashtanga30_og" src="https://github.com/user-attachments/assets/907303c3-0db0-4adf-b6c3-c8b78f9d96bd" />

# ashtanga30

A calm, mobile-first **30-minute Ashtanga companion** that generates a varied Primary Series practice and guides you through it, breath by breath, including the Sun Salutations move by move.

**Live app: [ashtanga30.com](https://ashtanga30.com/)**

The full Ashtanga Primary Series takes well over an hour, which makes a daily practice hard to sustain. ashtanga30 builds a fresh ~30-minute sequence each time (always faithful to Ashtanga's structure and order) so you get a complete, varied practice that fits into your day.

## Features

- **A fresh ~30-minute practice each time.** Generates a varied Primary Series sequence in canonical order: always the Sun Salutations (A ×3, B ×3), a proportional mix of standing, seated, and closing poses, and a shoulderstand and Savasana to close. No two sessions are identical.
- **Customize it, or take the whole series.** The Overview shows every pose in the series; check or uncheck any to tailor your practice, with a live running total that grows honestly past 30 minutes when you add more. The fixed frame (Sun Salutations, Shoulderstand, Savasana) stays locked. A "Full series" toggle selects everything at once, and "Basics only" narrows it to the essential root poses.
- **Vinyasas between seated poses.** A "Vinyasas" toggle on the Overview (on by default) weaves a breath-paced half-vinyasa (chaturanga, up dog, down dog, jump through) between consecutive seated poses. It is independent of "Basics only" and "Full series", and its time is budgeted into the 30-minute target, so generation picks slightly fewer seated poses to fit; turn it off, or add poses manually, for more asanas.
- **Guided Sun Salutations, move by move.** The salutations are modeled as their real vinyasa, one movement per breath phase (inhale or exhale), with Downward Dog entered on an exhale (the traditional breath) and held for five breaths. In place of the single pose icon, a live flow strip shows the salutation's positions as a fixed-center filmstrip: the current position sits centered and highlighted while the others slide past. Spoken cues carry you through hands-free, even in Down Dog: "last breath" ending the hold, "step forward" coming out, and "samasthiti" on the return to standing.
- **Guided practice.** A breathing circle paces every inhale and exhale at your chosen breath speed (a 4-7s slider), with calm transition countdowns between poses and traditional repeats (Navasana ×5, Setu Bandhasana ×3) counted in full. Multi-stage poses run each stage in turn (Utthita Hasta Padangusthasana moves through toe hold, leg to the side, head-to-knee, and hands-on-hips balance on each leg, with the same live flow strip marking the current position), and when Vinyasas are on a flow glyph and the current movement name lead you through each half-vinyasa. It finishes with a Namaste mark, a short summary (poses, breaths, duration), a soft bell, and a spoken "Namaste". The screen stays awake throughout.
- **Optional sound, your way.** A Pose cues slider on Home sets how each pose change is announced: Silent (nothing), Bell (a soft bell on every change), or Voice (the pose name is spoken, in place of the bell). A separate Breath cues toggle adds soft inhale/exhale tones, and an independent Ambient sound toggle plays a looping CC0 track. At the end, Voice closes with a bell and a spoken "Namaste", Bell closes with the bell alone, and Silent with neither. All three settings persist on-device, and the layers mix gracefully: breath tones blend with the ambient bed, and a voice or bell cue dips the ambient politely, then it returns.
- **A gentle record of your week.** Home shows the last seven days as small leaves that fill in sage on the days you practice: a quiet, pressure-free nudge rather than a streak counter. Everything stays on-device.
- **Back where you expect.** The system Back gesture (and the browser Back button) steps back one screen, Guided to Overview to Home, rather than exiting. Backing out of a practice in progress asks for confirmation first.
- **Made to keep.** Sanskrit-first pose names with English, drishti, and a tap-to-hear pronunciation button, original hand-drawn pose art, and an installable, offline-capable PWA.

## Tech stack

- **React 19 + Vite 6 + TypeScript:** mobile-first, no backend.
- State-based navigation (no router), now integrated with browser history so the Back gesture and browser Back step back one screen. Practice generation and timing are pure, unit-tested TypeScript.
- Pose artwork is inline SVG (recolorable via `currentColor`); the pose icons are code-split and lazy-loaded so the Home screen loads light.
- PWA via `vite-plugin-pwa`; pose data and preferences stay on-device. Served with a `robots.txt` and `sitemap.xml` for search engines.

## Development

```sh
npm install    # install dependencies
npm run dev    # start the local dev server
npm run build  # type-check and build for production
npm run lint   # lint
npm run icons  # regenerate the PWA PNG icons from the lotus SVG
```

Handy checks:

```sh
npx tsx src/data/validate-poses.ts            # validate the pose catalog
npx tsx src/lib/generatePractice.test.ts      # generation engine tests
npx tsx src/lib/guidedPlan.test.ts            # guided-practice plan tests
npx tsx src/components/poses/verify-coverage.ts  # confirm every pose has an icon
```

Visit `/?pilot` in dev to see the pose-icon contact sheet, `/?complete` to render the guided completion screen directly (Namaste mark + summary, including its bell and Namaste sounds) without playing through a whole practice, or `/?seedweek` to seed a few days into the last-7-days practice log so the filled leaves can be previewed. All three hatches are DEV-only and stripped from production builds.

## Project structure

- `src/data/poses.ts`: the Ashtanga Primary Series catalog (58 poses): names, category, canonical order, breaths, sides, repeats, drishti, the `isBasic` flag for Smart Start mode, and an optional multi-stage `flow` (the two Sun Salutations break into their move-by-move sub-poses and voice cues; Utthita Hasta Padangusthasana breaks into its four stages per leg).
- `src/lib/generatePractice.ts`: builds a valid, varied, under-30-minute sequence, weights the free budget across sections, protects a finishing pose, and supports Basics-only mode.
- `src/lib/selectedPractice.ts`: builds the practice from the user-selected set of pose ids, in canonical order, with no 30-minute ceiling so a manual selection can exceed the target honestly.
- `src/lib/guidedPlan.ts` / `src/lib/timing.ts`: turn a practice into a breath-by-breath timeline, with the variable transition model; the salutation `flow` is expanded into sub-pose labels and per-breath voice cues, and when the Vinyasas toggle is on a half-vinyasa is inserted between consecutive seated poses (and budgeted into generation via `vinyasaSeconds`).
- `src/lib/voice.ts`: spoken pose-name playback (plus "switch sides", "Namaste", and the salutation cues "last breath" / "step/jump forward" / "samasthiti") for guided practice.
- `src/lib/guidance.ts`: the pure pose-cues model (Silent / Bell / Voice) and the independent breath-cues flag, including migration from the older sound preferences.
- `src/lib/breathCues.ts`: the soft inhale/exhale breath-tone player that blends with, and ducks alongside, the ambient sound.
- `src/lib/chime.ts`: the completion bell and the per-pose transition bell (both from `public/audio/effects/bell.mp3`), the latter used by the Bell and Voice pose-cue modes.
- `src/lib/audioBus.ts`: the duck bus that lets voice cues and the bell lower the ambient-sound volume while they play.
- `src/lib/music.ts` / `src/components/MusicPanel.tsx`: the ambient-sound `<audio>` element and its track list (tracks served from `public/music/`), with the corner mute/unmute button.
- `src/lib/ambientPref.ts`: the ambient-sound enable preference, a tiny pub/sub shared between the Home toggle and the shell-level `MusicPanel`.
- `src/lib/navHistory.ts`: the pure reducer backing browser-history and Back-gesture navigation between the three screens.
- `src/lib/practiceLog.ts`: the on-device log of days a practice was completed, powering the last-7-days row on Home.
- `src/components/PracticeWeek.tsx` / `src/components/PetalMark.tsx`: the last-7-days leaf row and the single leaf marker (empty outline or filled sage).
- `public/audio/voice/`: prerecorded pose-name clips plus `namaste.mp3`, `switch_sides.mp3`, and the salutation cues `last_breath.mp3`, `step_jump_forward.mp3`, and `samasthiti.mp3`; `public/audio/effects/` holds `bell.mp3` (the completion bell) and the breath-cue tones `inhale.mp3` and `exhale.mp3`.
- `src/screens/`: Home, Overview (map + carousel), and the Guided player.
- `src/components/NamasteMark.tsx`: the completion Namaste mark (original traced SVG vector art).
- `src/components/FlowMark.tsx`: the abstract flow glyph shown in place of a pose icon during a half-vinyasa.
- `src/components/FlowStrip.tsx`: the live salutation/UHP flow strip shown in place of a pose icon, with the current position centered and highlighted.
- `src/components/icons/NavArrow.tsx`: the small centered chevron/back-arrow SVGs used by the navigation controls.
- `src/components/poses/`: the 68 pose icons and their registry.
- `src/components/poses/flowIcons.ts`: maps each salutation/UHP flow-position label to its icon.

## Notes

Drishti values follow standard Ashtanga (KPJAYI / David Swenson) convention and have been reviewed against it. They remain a study reference, not authoritative instruction. Pose icons are original schematic line drawings intended as clear references, not anatomical illustrations.

ashtanga30 ships as a Trusted Web Activity (TWA) in Google Play closed testing, so the installed Android app is the same site running full-screen. `public/.well-known/assetlinks.json`, served at `https://ashtanga30.com/.well-known/assetlinks.json`, holds the real SHA-256 signing-key fingerprints (the Play App Signing keys, the upload key, and the closed-testing key) that verify domain ownership. With the file in place the app is domain-verified and launches full-screen with no browser chrome.

## Disclaimer

ashtanga30 is provided for general informational and educational purposes only.
It is not medical advice and is not a substitute for guidance from a qualified
yoga instructor or healthcare professional. Yoga involves physical activity that
carries inherent risks. Consult your physician before beginning any exercise
programme, especially if you are pregnant, injured, or have a medical condition.
Always practise within your own limits and stop if you feel pain or discomfort.
The pose descriptions, drishti (gaze) references, and generated sequences are
schematic aids, not authoritative instruction. To the fullest extent permitted
by law, the author accepts no liability for any injury, loss, or damage arising
from use of this application. By using ashtanga30 you accept these terms.

## License

Licensed under the [MIT License](LICENSE). © 2026 Roderik Krooneman.

The bundled ambient sound consists of CC0 (public-domain) tracks; see
[CREDITS.md](CREDITS.md) for provenance. The pose illustrations are original
works created for this project.
