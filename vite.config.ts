import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['lotus.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'ashtanga30',
        short_name: 'ashtanga30',
        description:
          'A calm 30-minute Ashtanga companion that generates and guides your practice, breath by breath.',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#f5f3ee',
        theme_color: '#8a9a7b',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'lotus.svg',
            sizes: 'any',
            type: 'image/svg+xml',
          },
        ],
      },
      workbox: {
        // Precache the app shell plus the SMALL, essential audio: the spoken
        // pose-name / switch-sides / Namaste voice clips (.mp3), the completion
        // bell (.mp3), and the soft inhale/exhale breath-cue tones (.wav) under
        // public/audio/**, so guided-practice audio works fully offline. The
        // nature-ambience tracks (public/ambient/**: forest, rain, ocean, each
        // ~0.9-1.4 MB, all under the 2 MiB default) are ALSO precached via their
        // own glob so all three play offline even if never played while online;
        // a plain fetch(/ambient/<name>.mp3) in MusicPanel is then served from
        // the precache. Because every /ambient/ file is precached, the old
        // CacheFirst runtimeCaching rule for /ambient/ was redundant and has
        // been removed.
        globPatterns: [
          '**/*.{js,css,html,svg,png,ico,woff2}',
          'audio/**/*.mp3',
          'ambient/**/*.mp3',
        ],
      },
    }),
  ],
})
