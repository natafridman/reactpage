import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Ensure a single React instance (blossom-carousel's pre-bundled dep must
  // share the app's React, otherwise hooks throw "Invalid hook call").
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['@blossom-carousel/react', 'react', 'react-dom'],
  },
  build: {
    rollupOptions: {
      output: {
        // React y el router cambian con cada actualizacion de dependencias, no
        // con cada deploy. Separandolos, quien ya visito el sitio vuelve a
        // bajar solo el codigo de la app y reusa este chunk de la cache.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
})
