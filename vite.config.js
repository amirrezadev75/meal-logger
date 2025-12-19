import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',        // makes all paths relative (important for shared hosting)
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  build: {
    assetsDir: '',   // puts ALL files in the same directory (no assets folder)
  },
})
