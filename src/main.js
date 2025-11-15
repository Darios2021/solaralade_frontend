import { createApp } from 'vue'
import App from './App.vue'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
})

// Función de montaje que podemos invocar desde WordPress
export function mountSolarCalculator(targetId = 'solar-calculator', props = {}) {
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

// Exponer una API global para usar desde el <script> de Elementor
if (typeof window !== 'undefined') {
  window.SolarCalculator = {
    mount: mountSolarCalculator,
  }
}
