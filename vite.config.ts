import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@shapes': fileURLToPath(
        new URL('./src/shapes/shapes', import.meta.url),
      ),
      '@shape': fileURLToPath(new URL('./src/shapes', import.meta.url)),
      '@canvas': fileURLToPath(new URL('./src/canvas', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
    }
  }
})
