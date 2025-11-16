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
          // 👉 No más pisadas: style.css de cada modo con nombre propio
          assetFileNames: (assetInfo) => {
            // Sólo tocamos el CSS principal
            if (assetInfo.name === 'style.css') {
              return isGreen
                ? 'assets/green.css'
                : 'assets/calculator.css'
            }
            // Resto de assets igual
            return 'assets/[name].[ext]'
          },
        },
      },
    },
  }
})
