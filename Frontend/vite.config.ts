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
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('@mui') || id.includes('@emotion')) {
              return 'vendor-mui';
            }
            if (id.includes('@radix-ui') || id.includes('lucide-react')) {
              return 'vendor-ui';
            }
            if (id.includes('recharts') || id.includes('leaflet') || id.includes('jsbarcode') || id.includes('jspdf')) {
              return 'vendor-utils';
            }
            return 'vendor'; // all other dependencies
          }
        }
      }
    }
  },

  assetsInclude: ['**/*.svg', '**/*.csv'],
})
