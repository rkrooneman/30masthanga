// Generates the PWA PNG icons from public/lotus.svg using sharp.
// Run with: npm run icons
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { readFileSync } from 'node:fs'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = resolve(__dirname, '..', 'public')
const svgPath = resolve(publicDir, 'lotus.svg')
const svg = readFileSync(svgPath)

// High render density so the rasterized PNGs stay crisp at large sizes.
const density = 512

// Colors lifted directly from lotus.svg.
const DISC = '#dfe4d7'
const CANVAS = '#f5f3ee'

async function renderSvg(size) {
  // The lotus SVG already carries its own background disc, so a plain
  // resize gives us the standard "any" icon on a transparent canvas.
  return sharp(svg, { density }).resize(size, size).png().toBuffer()
}

async function writeAny(name, size) {
  const buf = await renderSvg(size)
  await sharp(buf).toFile(resolve(publicDir, name))
  console.log(`wrote ${name} (${size}x${size})`)
}

async function writeMaskable(name, size) {
  // Scale the mark to ~70% and center it on a full-bleed disc color so it
  // survives Android's maskable safe-zone cropping.
  const inner = Math.round(size * 0.7)
  const mark = await sharp(svg, { density }).resize(inner, inner).png().toBuffer()
  const pad = Math.round((size - inner) / 2)
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: DISC,
    },
  })
    .composite([{ input: mark, top: pad, left: pad }])
    .png()
    .toFile(resolve(publicDir, name))
  console.log(`wrote ${name} (${size}x${size}, maskable)`)
}

async function writeAppleTouch(name, size) {
  // iOS adds its own rounding, so render on a solid opaque background with
  // a little breathing room around the mark. No transparency.
  const inner = Math.round(size * 0.82)
  const mark = await sharp(svg, { density }).resize(inner, inner).png().toBuffer()
  const pad = Math.round((size - inner) / 2)
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: CANVAS,
    },
  })
    .composite([{ input: mark, top: pad, left: pad }])
    .flatten({ background: CANVAS })
    .png()
    .toFile(resolve(publicDir, name))
  console.log(`wrote ${name} (${size}x${size}, apple-touch)`)
}

await writeAny('pwa-192x192.png', 192)
await writeAny('pwa-512x512.png', 512)
await writeMaskable('maskable-512x512.png', 512)
await writeAppleTouch('apple-touch-icon.png', 180)

console.log('done')
