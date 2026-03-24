import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  /* -------------------- THIS IS THE FIX -------------------- */
  server: {
    proxy: {
      "/api": {
        target: "https://parkera-backend.onrender.com",
        changeOrigin: true,
        secure: false
      }
    }
  },
  /* ---------------------------------------------------------- */

  build: {
    chunkSizeWarningLimit: 1600,
  },

  assetsInclude: ['**/*.svg', '**/*.csv'],
})
