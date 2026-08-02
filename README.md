<img width="1200" height="630" alt="ashtanga30_og" src="https://github.com/user-attachments/assets/907303c3-0db0-4adf-b6c3-c8b78f9d96bd" />

# ashtanga30

A calm, mobile-first **30-minute Ashtanga companion** that generates a varied Primary Series practice and guides you through it, breath by breath, including the Sun Salutations move by move.

**Live app: [ashtanga30.com](https://ashtanga30.com/)**

The full Ashtanga Primary Series takes well over an hour, which makes a daily practice hard to sustain. ashtanga30 builds a fresh ~30-minute sequence each time (always faithful to Ashtanga's structure and order) so you get a complete, varied practice that fits into your day.

## Features

- **A fresh ~30-minute practice each time.** Generates a varied Primary Series sequence in canonical order: always the Sun Salutations (A ×3, B ×3), a proportional mix of standing, seated, and closing poses, and a shoulderstand and Savasana to close. No two sessions are identical.
- **Customize it, or take the whole series.** The Overview shows every pose in the series; check or uncheck any to tailor your practice, with a live running total that grows honestly past 30 minutes when you add more. The fixed frame (Sun Salutations, Shoulderstand, Savasana) stays locked. A "Full series" toggle selects everything at once, and "Basics only" narrows it to the essential root poses.
- **Guided Sun Salutations, move by move.** The salutations are modeled as their real vinyasa, one movement per breath phase (inhale or exhale), with Downward Dog held for five breaths. Spoken cues carry you through hands-free, even in Down Dog: "last breath" ending the hold, "step forward" coming out, and "samasthiti" on the return to standing.
- **Guided practice.** A breathing circle paces every inhale and exhale at your chosen breath speed (a 4-7s slider), with calm transition countdowns between poses and traditional repeats (Navasana ×5, Setu Bandhasana ×3) counted in full. It finishes with a Namaste mark, a short summary (poses, breaths, duration), a soft bell, and a spoken "Namaste". The screen stays awake throughout.
- **Optional sound, your way.** Persisted toggles for spoken pose names and cues, soft inhale/exhale breath tones, and a looping CC0 ambient track. The layers mix gracefully: breath tones blend with the ambient bed, and everything dips politely under a voice cue, then returns.
- **A gentle record of your week.** Home shows the last seven days as small leaves that fill in sage on the days you practice: a quiet, pressure-free nudge rather than a streak counter. Everything stays on-device.
- **Made to keep.** Sanskrit-first pose names with English and drishti, original hand-drawn pose art, and an installable, offline-capable PWA.

## Tech stack

- **React 19 + Vite 6 + TypeScript:** mobile-first, no backend.
- State-based navigation (no router). Practice generation and timing are pure, unit-tested TypeScript.
- Pose artwork is inline SVG (recolorable via `currentColor`).
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

- `src/data/poses.ts`: the Ashtanga Primary Series catalog (58 poses): names, category, canonical order, breaths, sides, repeats, drishti, the `isBasic` flag for Smart Start mode, and an optional vinyasa `flow` (carried by the two Sun Salutations) that breaks the salutation into its move-by-move sub-poses and voice cues.
- `src/lib/generatePractice.ts`: builds a valid, varied, under-30-minute sequence, weights the free budget across sections, protects a finishing pose, and supports Basics-only mode.
- `src/lib/selectedPractice.ts`: builds the practice from the user-selected set of pose ids, in canonical order, with no 30-minute ceiling so a manual selection can exceed the target honestly.
- `src/lib/guidedPlan.ts` / `src/lib/timing.ts`: turn a practice into a breath-by-breath timeline, with the variable transition model; the salutation `flow` is expanded into sub-pose labels and per-breath voice cues.
- `src/lib/voice.ts`: spoken pose-name playback (plus "switch sides", "Namaste", and the salutation cues "last breath" / "step/jump forward" / "samasthiti") for guided practice.
- `src/lib/breathCues.ts`: the soft inhale/exhale breath-tone player that blends with, and ducks alongside, the ambient sound.
- `src/lib/chime.ts`: the completion bell (`public/audio/effects/bell.mp3`).
- `src/lib/audioBus.ts`: the duck bus that lets voice cues and the bell lower the ambient-sound volume while they play.
- `src/lib/music.ts` / `src/components/MusicPanel.tsx`: the ambient-sound `<audio>` element and its track list (tracks served from `public/music/`), with the corner mute/unmute button.
- `src/lib/ambientPref.ts`: the ambient-sound enable preference, a tiny pub/sub shared between the Home toggle and the shell-level `MusicPanel`.
- `src/lib/practiceLog.ts`: the on-device log of days a practice was completed, powering the last-7-days row on Home.
- `src/components/PracticeWeek.tsx` / `src/components/PetalMark.tsx`: the last-7-days leaf row and the single leaf marker (empty outline or filled sage).
- `public/audio/voice/`: prerecorded pose-name clips plus `namaste.mp3`, `switch_sides.mp3`, and the salutation cues `last_breath.mp3`, `step_jump_forward.mp3`, and `samasthiti.mp3`; `public/audio/effects/` holds `bell.mp3` (the completion bell) and the breath-cue tones `inhale.mp3` and `exhale.mp3`.
- `src/screens/`: Home, Overview (map + carousel), and the Guided player.
- `src/components/NamasteMark.tsx`: the completion Namaste mark (original traced SVG vector art).
- `src/components/poses/`: the 58 pose icons and their registry.

## Notes

Drishti values follow standard Ashtanga (KPJAYI / David Swenson) convention and have been reviewed against it. They remain a study reference, not authoritative instruction. Pose icons are original schematic line drawings intended as clear references, not anatomical illustrations.

`public/.well-known/assetlinks.json` is groundwork for a future Trusted Web Activity (TWA) wrapper on the Google Play Store. It is served at `https://ashtanga30.com/.well-known/assetlinks.json` and verifies domain ownership for the Android app. The `sha256_cert_fingerprints` value is a placeholder until the Android app signing key exists: replace it with the app signing key's SHA-256 fingerprint from the Play Console (or Bubblewrap), and confirm `package_name` matches the generated app before publishing.

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
