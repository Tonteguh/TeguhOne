import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  base: '/TeguhOne/',

  plugins: [
    react(),
    tailwindcss(),

    VitePWA({
      registerType: 'autoUpdate',

      manifest: {
        id: '/TeguhOne/',
        name: 'TeguhOne - Satu Aplikasi Banyak Manfaat',
        short_name: 'TeguhOne',

        description:
          'TeguhOne - satu aplikasi banyak manfaat: TChat, TMarket, Tuning Pro, Tilawah, Video, Radio, Belanja dan Kang Teguh AI.',

        theme_color: '#008069',
        background_color: '#ffffff',

        display: 'standalone',

        start_url: '/TeguhOne/',
        scope: '/TeguhOne/',

        icons: [
          {
            src: '/TeguhOne/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/TeguhOne/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
        ],
      },

      workbox: {
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,woff,woff2,webp}',
        ],
      },

      devOptions: {
        enabled: false,
      },
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(
        import.meta.dirname || process.cwd(),
        '.'
      ),
    },
  },

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
  },

  server: {
    hmr: false,
  },
});

