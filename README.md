# ashtanga30

A calm, mobile-first **30-minute Ashtanga companion** that generates a varied Primary Series practice and guides you through it, breath by breath.

**Live app: [ashtanga30.vercel.app](https://ashtanga30.vercel.app/)**

The full Ashtanga Primary Series takes well over an hour, which makes a daily practice hard to sustain. ashtanga30 builds a fresh ~30-minute sequence each time — always faithful to Ashtanga's structure and order — so you get a complete, varied practice that fits into your day.

## Features

- **Generates a ~30-minute practice** that always opens with Sun Salutations (A ×3, B ×3) and closes with a shoulderstand and Savasana, keeps the canonical Primary Series order, and never mixes in poses from outside the series.
- **Varied every session** — a different valid subset of standing, seated, and closing poses each time, so no two practices are identical.
- **Adjustable breath pace** — a slider (4–7s per breath) tunes the practice toward the 30-minute target without ever exceeding it.
- **Practice overview** — a scannable, section-grouped map of the whole sequence (with per-section counts and times, and ×2 / ×3 markers), which opens into a swipeable card carousel for studying each pose, including its Sanskrit, phonetic, and English names and its drishti (gaze).
- **Guided practice** — a breathing circle that expands on the inhale and contracts on the exhale at your chosen pace, auto-advancing after each pose's breath count, running both sides and salutation rounds in full, with a get-ready countdown, gentle transition countdowns, and a Namaste completion screen. Keeps the screen awake while you practice.
- **Installable** — a PWA you can add to your phone's home screen.
- **Original artwork** — every pose has its own minimalist line-drawing icon.

## Tech stack

- **React 19 + Vite 6 + TypeScript** — mobile-first, no backend.
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
npx tsx src/lib/guidedPlan.test.ts            # guided-practice plan tests
npx tsx src/components/poses/verify-coverage.ts  # confirm every pose has an icon
```

Visit `/?pilot` in dev to see the pose-icon contact sheet.

## Project structure

- `src/data/poses.ts` — the Ashtanga Primary Series catalog (58 poses): names, category, canonical order, breaths, sides, repeats, and drishti.
- `src/lib/generatePractice.ts` — builds a valid, varied, under-30-minute sequence.
- `src/lib/guidedPlan.ts` / `src/lib/timing.ts` — turn a practice into a breath-by-breath timeline.
- `src/screens/` — Home, Overview (map + carousel), and the Guided player.
- `src/components/poses/` — the 58 pose icons and their registry.

## Notes

Drishti values follow standard Ashtanga (KPJAYI / David Swenson) convention and are worth verifying against a trusted source before relying on them. Pose icons are original schematic line drawings intended as clear references, not anatomical illustrations.

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

Licensed under the [MIT License](LICENSE) — © 2026 Roderik Krooneman.

The bundled background music consists of CC0 (public-domain) tracks; see
[CREDITS.md](CREDITS.md) for provenance. The pose illustrations are original
works created for this project.
