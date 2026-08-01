<img width="1200" height="630" alt="ashtanga30_og" src="https://github.com/user-attachments/assets/907303c3-0db0-4adf-b6c3-c8b78f9d96bd" />

# ashtanga30

A calm, mobile-first **30-minute Ashtanga companion** that generates a varied Primary Series practice and guides you through it, breath by breath.

**Live app: [ashtanga30.com](https://ashtanga30.com/)**

The full Ashtanga Primary Series takes well over an hour, which makes a daily practice hard to sustain. ashtanga30 builds a fresh ~30-minute sequence each time (always faithful to Ashtanga's structure and order) so you get a complete, varied practice that fits into your day.

## Features

- **Generates a ~30-minute practice** that always opens with Sun Salutations (A ×3, B ×3) and closes with a shoulderstand and Savasana, keeps the canonical Primary Series order, and never mixes in poses from outside the series. The free time budget is spread across the standing (0.30), seated (0.40), and closing (0.30) sections, and one finishing pose (such as Headstand) is protected so a shortened practice always reaches a real close alongside the always-present shoulderstand.
- **Varied every session:** a different valid subset of standing, seated, and closing poses each time, so no two practices are identical.
- **Basics (Smart Start) mode:** a "Basics only" toggle on the Overview restricts the generated practice to a curated set of essential root/basic poses, a shorter, gentler Smart Start practice. The choice is remembered on-device across sessions.
- **Adjustable breath pace:** a slider (4-7s per breath) tunes the practice toward the 30-minute target without ever exceeding it.
- **Pose swap:** in the Overview carousel, swap any pose for a same-category alternative that keeps the practice within the 30-minute budget; fixed frame poses stay locked. In Basics mode, swaps stay within basic poses.
- **Practice overview:** a scannable, section-grouped map of the whole sequence (with per-section counts and times, ×2 / ×3 markers, and a grand-total duration line at the bottom), which opens into a swipeable card carousel for studying each pose, including its Sanskrit, phonetic, and English names and its drishti (gaze).
- **Guided practice:** a breathing circle that expands on the inhale and contracts on the exhale at your chosen pace, auto-advancing after each pose's breath count, running both sides and salutation rounds in full, with a get-ready countdown and variable transition countdowns (1s for a side or round switch, 3s for a new pose in the same section, 8s when moving to a new section). On completion it shows a redrawn Namaste mark plus an end-of-practice summary (poses, breaths, total duration), plays a soft completion bell, then speaks a closing "Namaste". Keeps the screen awake while you practice.
- **Voice guidance:** during guided practice the app speaks each pose's phonetic name (prerecorded clips), plays a "switch sides" cue on same-pose side transitions, and speaks the closing "Namaste". A persisted "Voice guidance" toggle on the Home screen (default on) turns it off; the choice is remembered on-device.
- **Background music:** a single icon-only play/pause button plays one long, looping CC0 (public-domain) ambient track. It lives at the app shell, so playback continues across screens, and briefly ducks (dips in volume) while voice cues and the completion bell play, then returns.
- **Installable:** a PWA you can add to your phone's home screen.
- **Original artwork:** every pose has its own minimalist line-drawing icon, and the completion Namaste mark is original vector art too.

## Tech stack

- **React 19 + Vite 6 + TypeScript:** mobile-first, no backend.
- State-based navigation (no router). Practice generation and timing are pure, unit-tested TypeScript.
- Pose artwork is inline SVG (recolorable via `currentColor`).
- PWA via `vite-plugin-pwa`; pose data and preferences stay on-device.

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
npx tsx src/lib/swapPose.test.ts              # pose-swap engine tests
npx tsx src/lib/guidedPlan.test.ts            # guided-practice plan tests
npx tsx src/components/poses/verify-coverage.ts  # confirm every pose has an icon
```

Visit `/?pilot` in dev to see the pose-icon contact sheet, or `/?complete` to render the guided completion screen directly (Namaste mark + summary, including its bell and Namaste sounds) without playing through a whole practice. Both hatches are DEV-only and stripped from production builds.

## Project structure

- `src/data/poses.ts`: the Ashtanga Primary Series catalog (58 poses): names, category, canonical order, breaths, sides, repeats, drishti, and the `isBasic` flag for Smart Start mode.
- `src/lib/generatePractice.ts`: builds a valid, varied, under-30-minute sequence, weights the free budget across sections, protects a finishing pose, and supports Basics-only mode.
- `src/lib/swapPose.ts`: the budget-safe, same-category pose-swap engine used by the Overview carousel.
- `src/lib/guidedPlan.ts` / `src/lib/timing.ts`: turn a practice into a breath-by-breath timeline, with the variable transition model.
- `src/lib/voice.ts`: spoken pose-name (and "switch sides" / "Namaste") playback for guided practice.
- `src/lib/chime.ts`: the completion bell (`public/audio/effects/bell.mp3`).
- `src/lib/audioBus.ts`: the duck bus that lets voice cues and the bell lower the music volume while they play.
- `src/lib/music.ts` / `src/components/MusicPanel.tsx`: the background-music play/pause button and its track list (tracks served from `public/music/`).
- `public/audio/voice/`: prerecorded pose-name clips plus `namaste.mp3` and `switch_sides.mp3`; `public/audio/effects/bell.mp3` is the completion bell.
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

The bundled background music consists of CC0 (public-domain) tracks; see
[CREDITS.md](CREDITS.md) for provenance. The pose illustrations are original
works created for this project.
