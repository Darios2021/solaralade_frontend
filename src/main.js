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
          primary: '#2a7c41',
          secondary: '#1a5934',
          background: '#ffffff',
          surface: '#ffffff',
          'on-primary': '#ffffff',
        },
      },
    },
  },
})

function mount(targetId = 'solar-calculator') {
  const el = document.getElementById(targetId)

  if (!el) {
    console.error('[solar-calculator] No se encontró #' + targetId)
    return
  }

  // Anti doble montaje
  if (el.dataset.scMounted === '1') {
    console.log('[solar-calculator] Ya estaba montado en', targetId)
    return
  }

  const app = createApp(App)
  app.use(vuetify)
  app.mount(el)

  el.dataset.scMounted = '1'

  return app
}

// API global que usa tu snippet de Elementor
window.SolarCalculator = { mount }

// Montaje automático si el div ya existe
if (document.getElementById('solar-calculator')) {
  mount()
}

export { mount }
export default { mount }
