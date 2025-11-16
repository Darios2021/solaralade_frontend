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
      input: {
        // ⚡ App principal (lead form + calculadora)
        calculator: 'src/main.js',

        // ⚡ Nueva Landing Alade Green
        solar_green: 'src/mountSolarGreen.js',
      },

      output: {
        // Cada entrada produce su propio JS
        entryFileNames: (chunk) => {
          if (chunk.name === 'calculator') return 'solar-calculator.js'
          if (chunk.name === 'solar_green') return 'solar-green.js'
          return '[name].js'
        },
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },

  base: '/',
})
