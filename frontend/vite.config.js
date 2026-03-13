import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      less: {},
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Animation lib — used on main page
          'vendor-motion': ['framer-motion'],
          // Heavy libs — only loaded by AdminPanel chunk
          'vendor-charts': ['recharts'],
          'vendor-yaml': ['js-yaml'],
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
