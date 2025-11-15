import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig({
  plugins: [
    vue(),
    vuetify({
      autoImport: true,
    }),
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      // Dejamos que Vite use index.html como entry
      output: {
        // Nombre estable para el bundle principal
        entryFileNames: 'solar-calculator.js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
  base: '/',
})
