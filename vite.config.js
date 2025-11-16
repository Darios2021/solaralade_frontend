import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig(({ mode }) => {
  const isCalculator = mode === 'calculator'
  const isGreen = mode === 'green'

  return {
    plugins: [
      vue(),
      vuetify({ autoImport: true }),
    ],

    build: {
      outDir: 'dist',
      emptyOutDir: false,

      lib: {
        entry: isCalculator
          ? 'src/apps/calculatorApp.js'
          : 'src/apps/greenLandingApp.js',

        name: isCalculator ? 'SolarCalculator' : 'SolarGreenLanding',

        formats: ['iife'],

        fileName: () =>
          isCalculator ? 'solar-calculator.js' : 'solar-green.js'
      },

      rollupOptions: {
        output: {
          assetFileNames: 'assets/[name].[ext]'
        }
      }
    }
  }
})
