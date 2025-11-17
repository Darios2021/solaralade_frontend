// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig(({ mode }) => {
  const ENTRIES = {
    calculator: 'src/main.js',          // BUNDLE VIEJO: sólo formulario+calculador
    green: 'src/mountSolarGreen.js',    // BUNDLE NUEVO: landing + chatbot
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
          assetFileNames: (assetInfo) => {
            if (assetInfo.name === 'style.css') {
              return isGreen
                ? 'assets/green.css'
                : 'assets/calculator.css'
            }
            return 'assets/[name].[ext]'
          },
        },
      },
    },
  }
})
