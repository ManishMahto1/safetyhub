import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    // keep in sync with the "@/*" path in jsconfig.json
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: false, // we ship a static manifest.webmanifest in public/
      includeAssets: [
        'icons/icon-192.png',
        'icons/icon-512.png',
        'icons/maskable-icon.png',
        'category-icons/*.svg',
        'offline-fallback.html',
      ],
      workbox: {
        // precache the static manifest too (not in Workbox's default glob)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        // Serve the precached app shell for offline navigations so the SPA
        // (and its client-side routes) keep working with zero network. The
        // static offline-fallback.html is still precached as a last resort.
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            // emergency numbers dataset: cache-first, always available offline
            urlPattern: /\/data\/emergencyNumbers\.json$/,
            handler: 'CacheFirst',
            options: { cacheName: 'safetyhub-static-data' },
          },
          {
            // places / photos from our API: network-first, fall back to cache
            urlPattern: /\/api\/places/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'safetyhub-places',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 6 },
            },
          },
          {
            urlPattern: /^https:\/\/[abc]\.tile\.openstreetmap\.org\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'osm-tiles',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 14 },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
  },
});
