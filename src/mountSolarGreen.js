// src/mountSolarGreen.js
import { createApp } from 'vue'
import SolarGreenApp from './SolarGreenApp.vue'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

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
          primary: '#1a5634',      // 💚 verde principal
          secondary: '#0f3a23',
          background: '#f5f5f5',
          surface: '#ffffff',
          'on-primary': '#ffffff',
        },
      },
    },
  },
})

function mountSolarGreen(targetId = 'solar-green') {
  const el = document.getElementById(targetId)

  if (!el) {
    console.error('[solar-green] No existe #' + targetId)
    return
  }

  // evitar doble montaje (por si Elementor re-ejecuta scripts)
  if (el.dataset.sgMounted === '1') {
    console.log('[solar-green] Ya estaba montado en', targetId)
    return
  }

  const app = createApp(SolarGreenApp)
  app.use(vuetify)
  app.mount(el)

  el.dataset.sgMounted = '1'

  return app
}

// Exponer en window para Elementor / páginas externas
window.SolarGreenLanding = {
  mount: mountSolarGreen,
}

export { mountSolarGreen }
export default { mountSolarGreen }
