import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
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
        navigateFallback: '/offline-fallback.html',
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
