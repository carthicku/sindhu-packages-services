import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        // three.js is left to Rollup's automatic splitting so it only loads
        // with the first 3D scene instead of being preloaded with the page.
        manualChunks: {
          motion: ['framer-motion'],
        },
      },
    },
  },
});
