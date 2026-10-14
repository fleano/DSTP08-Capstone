import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  // server: {
  //   host: true, 
  //   port: 5173,
  //   proxy: {
  //     // 1. Catches any frontend requests going to /api
  //     '/api': {
  //       target: 'http://backend:3000',
  //       changeOrigin: true,
  //       secure: false,
  //     },
  //     // 2. Catches any frontend requests going to /auth
  //     '/auth': {
  //       target: 'http://backend:3000',
  //       changeOrigin: true,
  //       secure: false,
  //     }
  //   },
  // }
})
