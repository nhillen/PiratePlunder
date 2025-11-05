import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@pirate/game-warfaire']
  },
  server: {
    host: '0.0.0.0', // Allow external connections
    port: 5173
  },
  build: {
    // Force unique filenames for all assets to prevent caching issues
    rollupOptions: {
      output: {
        // Add timestamp to chunk names for better cache busting
        entryFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        chunkFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || 'asset'
          const ext = name.split('.').pop()
          return `assets/[name]-[hash]-${Date.now()}.${ext}`
        }
      }
    },
    // Clear output directory on build
    emptyOutDir: true
  }
})
