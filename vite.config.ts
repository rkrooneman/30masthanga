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
        // pose-name / switch-sides / Namaste voice clips and the completion bell
        // (public/audio/**, ~1.3 MB total), so guided-practice audio works fully
        // offline. The large background-music track (public/music/**, ~36 MB) is
        // deliberately EXCLUDED from precache so first load stays light; it is
        // runtime-cached on first play instead (see runtimeCaching below).
        globPatterns: [
          '**/*.{js,css,html,svg,png,ico,woff2}',
          'audio/**/*.mp3',
        ],
        runtimeCaching: [
          {
            // Background music: cache-first, populated the first time the track
            // is played, so it is available offline thereafter without forcing a
            // ~36 MB download on every visitor up front.
            urlPattern: ({ url }) => url.pathname.startsWith('/music/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'music-audio',
              // The single ambient track is ~36 MB, well above Workbox's default
              // range-request handling threshold; allow it explicitly.
              rangeRequests: true,
              expiration: {
                maxEntries: 4,
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
