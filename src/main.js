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

// API global opcional
window.SolarCalculator = {
  mount: mountSolarCalculator,
}
