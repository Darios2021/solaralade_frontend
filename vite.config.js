// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig(({ mode }) => {
  const ENTRIES = {
    calculator: 'src/main.js',          // bundle viejo: sólo formulario/consumo
    green: 'src/mountSolarGreen.js',    // NUEVO: landing + chatbot
  }

  // flag para saber si estamos construyendo el modo green
  const isGreen = mode === 'green'

  return {
    plugins: [vue(), vuetify({ autoImport: true })],

    build: {
      outDir: 'dist',
      // no vaciamos el directorio para poder tener ambos bundles conviviendo
      emptyOutDir: false,

      lib: {
        // entry según el mode
        entry: ENTRIES[mode] || 'src/main.js',
        // nombre global del bundle (window.SolarGreenLanding o window.SolarCalculator)
        name: isGreen ? 'SolarGreenLanding' : 'SolarCalculator',
        formats: ['iife'],
        fileName: () => (isGreen ? 'solar-green.js' : 'solar-calculator.js'),
      },

      rollupOptions: {
        output: {
          // 👉 CSS separado por modo para que no se pisen
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
