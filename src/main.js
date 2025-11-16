import { createApp } from 'vue'
import App from './App.vue'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'aladeLight',
    themes: {
      aladeLight: {
        dark: false,
        colors: {
          primary: '#2a7c41',      // Verde principal
          secondary: '#1a5934',    // Verde oscuro
          background: '#ffffff',
          surface: '#ffffff',
          'on-primary': '#ffffff',
          'on-secondary': '#ffffff',
          // tono suave para fondos y resaltados
          'primary-soft': '#e0f2e7',
        },
      },
    },
  },
})

/**
 * Monta el calculador dentro de un div por id (para WordPress/Elementor)
 * Ej: window.SolarCalculator.mount('solar-calculator')
 */
function mountSolarCalculator(targetId = 'solar-calculator', props = {}) {
  const el = document.getElementById(targetId)

  if (!el) {
    console.error(`[solar-calculator] No se encontró el elemento #${targetId}`)
    return null
  }

  const app = createApp(App, props)
  app.use(vuetify)
  app.mount(el)

  return app
}

// Montaje automático si existe el div
if (document.getElementById('solar-calculator')) {
  mountSolarCalculator()
}

// API global para usar desde WordPress
window.SolarCalculator = {
  mount: mountSolarCalculator,
}
