import { createApp } from 'vue'
import SolarGreenApp from './SolarGreenApp.vue'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
})

function mountSolarGreen(targetId = 'solar-green') {
  const el = document.getElementById(targetId)

  if (!el) {
    console.error(`[solar-green] No encontré el div #${targetId}`)
    return
  }

  const app = createApp(SolarGreenApp)
  app.use(vuetify)
  app.mount(el)

  return app
}

// Autoinit
if (document.getElementById('solar-green')) {
  mountSolarGreen()
}

// API global WordPress
window.SolarGreenLanding = {
  mount: mountSolarGreen,
}
