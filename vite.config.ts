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
        // ~0.5-1.4 MB) live under a DIFFERENT top-level dir and are NOT matched
        // by the audio/** glob, so they are deliberately EXCLUDED from precache
        // to keep first load light; they are runtime-cached on first play
        // instead (see runtimeCaching below).
        globPatterns: [
          '**/*.{js,css,html,svg,png,ico,woff2}',
          'audio/**/*.mp3',
        ],
        runtimeCaching: [
          {
            // Nature ambience: cache-first, populated the first time a track is
            // played, so it is available offline thereafter without forcing the
            // audio download on every visitor up front.
            urlPattern: ({ url }) => url.pathname.startsWith('/ambient/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'ambient-audio',
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 60 * 60 * 24 * 60, // 60 days
              },
              cacheableResponse: {
                // 200 (full) and 206 (partial/range) responses are both cacheable.
                statuses: [200, 206],
              },
            },
          },
        ],
      },
    }),
  ],
})
