// src/mountSolarGreen.js
import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

import SolarGreenApp from './SolarGreenApp.vue'

// Tema base (podés ajustarlo)
const vuetify = createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#1a5634',
        },
      },
    },
  },
})

/**
 * Monta la landing ALADE Green + formulario + chatbot
 * @param {string|Element} selector
 */
export function mount (selector = '#solar-calculator') {
  const el = typeof selector === 'string'
    ? document.querySelector(selector)
    : selector

  if (!el) {
    console.warn('[SolarGreenLanding] No se encontró el contenedor:', selector)
    return
  }

  const app = createApp(SolarGreenApp)
  app.use(vuetify)
  app.mount(el)

  return app
}

// Para uso directo desde el navegador (global)
if (typeof window !== 'undefined') {
  window.SolarGreenLanding = window.SolarGreenLanding || {}
  window.SolarGreenLanding.mount = mount
}
