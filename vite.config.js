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
    // Modo librería: genera UN solo JS fijo: solar-calculator.js
    lib: {
      entry: 'src/main.js',
      name: 'SolarCalculator',
      formats: ['iife'],
      fileName: () => 'solar-calculator.js',
    },
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
  base: '/',
})
