import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      vue(),
      vuetify({ autoImport: true }),
    ],

    build: {
      outDir: 'dist',
      emptyOutDir: false, // importante: no borrar build anterior

      lib: {
        entry:
          mode === 'green'
            ? 'src/apps/solarGreenApp.js'
            : 'src/apps/calculatorApp.js',

        name:
          mode === 'green'
            ? 'SolarGreenLanding'
            : 'SolarCalculator',

        fileName:
          mode === 'green'
            ? () => 'solar-green.js'
            : () => 'solar-calculator.js',

        formats: ['iife'],
      },

      rollupOptions: {
        output: {
          assetFileNames: 'assets/[name].[ext]',
        },
      },
    },
  }
})
