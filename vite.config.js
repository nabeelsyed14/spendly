import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    // No service worker in the Android app — a precaching SW inside the
    // Capacitor WebView serves stale bundles after APK updates.
    ...(mode === 'capacitor'
      ? []
      : [
          VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.svg'],
            manifest: {
              name: 'Spendly',
              short_name: 'Spendly',
              description: 'Smart offline budget tracker with spending insights',
              theme_color: '#6d28d9',
              background_color: '#0d0a14',
              display: 'standalone',
              start_url: '/',
              scope: '/',
              icons: [
                {
                  src: '/favicon.svg',
                  sizes: 'any',
                  type: 'image/svg+xml',
                  purpose: 'any maskable',
                },
              ],
            },
            workbox: {
              navigateFallback: 'index.html',
              globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
              maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
            },
          }),
        ]),
  ],
}))
