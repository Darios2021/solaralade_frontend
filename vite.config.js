import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true })
  ],

  build: {
    outDir: 'dist',

    rollupOptions: {
      input: {
        calculator: 'src/main.js',
        solarGreen: 'src/mountSolarGreen.js'
      },

      output: {
        format: 'iife',

        entryFileNames: (chunk) => {
          if (chunk.name === 'calculator') return 'solar-calculator.js'
          if (chunk.name === 'solarGreen') return 'solar-green.js'
          return '[name].js'
        },

        assetFileNames: 'assets/[name].[ext]',
      }
    }
  },

  base: '/'
})
