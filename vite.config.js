import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig(({ mode }) => {
  const ENTRIES = {
    calculator: 'src/main.js',
    green: 'src/mountSolarGreen.js',
  }

  const isGreen = mode === 'green'

  return {
    plugins: [vue(), vuetify({ autoImport: true })],

    build: {
      outDir: 'dist',
      emptyOutDir: false,

      lib: {
        entry: ENTRIES[mode] || 'src/main.js',
        name: isGreen ? 'SolarGreenLanding' : 'SolarCalculator',
        formats: ['iife'],
        fileName: () => (isGreen ? 'solar-green.js' : 'solar-calculator.js'),
      },

      rollupOptions: {
        output: {
          assetFileNames: 'assets/[name].[ext]',
        },
      },
    },
  }
})
