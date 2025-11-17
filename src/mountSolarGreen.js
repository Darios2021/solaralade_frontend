// src/mountSolarGreen.js
import { createApp } from 'vue'
import SolarGreenApp from './SolarGreenApp.vue'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

// Theme ALADE Green
const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'greenLight',
    themes: {
      greenLight: {
        dark: false,
        colors: {
          primary: '#1a5634', // 💚 verde principal
          secondary: '#0f3a23',
          background: '#f5f5f5',
          surface: '#ffffff',
          'on-primary': '#ffffff',
        },
      },
    },
  },
})

/**
 * Monta la landing + formulario + chatbot
 * target puede ser '#solar-green' o 'solar-green'
 */
export function mountSolarGreen(target = '#solar-green') {
  let selector = target

  if (typeof selector === 'string') {
    if (!selector.startsWith('#')) selector = '#' + selector
  }

  const el =
    typeof selector === 'string' ? document.querySelector(selector) : selector

  if (!el) {
    console.warn('[SolarGreenLanding] No se encontró el contenedor:', selector)
    return
  }

  // evitar doble montaje (por si Elementor re-ejecuta scripts)
  if (el.dataset.sgMounted === '1') {
    console.log('[solar-green] Ya estaba montado en', selector)
    return
  }

  console.log('[solar-green] Montando landing en', selector)

  const app = createApp(SolarGreenApp)
  app.use(vuetify)
  app.mount(el)

  el.dataset.sgMounted = '1'
  return app
}

// Exponer en window para Elementor / páginas externas
if (typeof window !== 'undefined') {
  window.SolarGreenLanding = window.SolarGreenLanding || {}
  window.SolarGreenLanding.mount = mountSolarGreen
}

export default { mountSolarGreen }
