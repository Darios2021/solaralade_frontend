import { createApp } from 'vue'
import App from './App.vue'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Vuetify config
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

// Función para montar la app del calculador
function mount(targetId = 'solar-calculator') {
  const el = document.getElementById(targetId)

  if (!el) {
    console.error('[solar-calculator] No se encontró #' + targetId)
    return
  }

  const app = createApp(App)
  app.use(vuetify)
  app.mount(el)

  return app
}

// Exponer API global para Elementor / HTML externo
window.SolarCalculator = { mount }

// Montaje automático si existe el contenedor en el DOM
if (document.getElementById('solar-calculator')) {
  mount()
}

export { mount }
export default { mount }
