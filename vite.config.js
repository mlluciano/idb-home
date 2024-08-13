import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from "autoprefixer";
import commonjs from 'vite-plugin-commonjs';
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    commonjs(),
    nodePolyfills()
  ],
  optimizeDeps: {
    include: [
      'jquery',
      'lodash',
      'geopoint',
      'leaflet',
      'leaflet-image',
      '@elastic/filesaver',
      'leaflet-draw',
      'request'
    ],
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer
      ],
    },
  }
})
