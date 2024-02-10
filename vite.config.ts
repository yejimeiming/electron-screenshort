import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron/simple'

export default defineConfig({
  plugins: [
    electron({
      main: {
        entry: 'electron/main.ts',
      },
      preload: {
        input: 'electron/preload.ts',
      },
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        index: 'index.html',
        screenshot: 'screenshot.html',
      },
    },
  },
})
