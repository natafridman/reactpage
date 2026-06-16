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
})
