import { createApp } from 'vue'
import SolarGreenApp from './SolarGreenApp.vue'

function mountSolarGreen(targetId = 'solar-green') {
  const el = document.getElementById(targetId)

  if (!el) {
    console.error('[solar-green] No existe #' + targetId)
    return
  }

  const app = createApp(SolarGreenApp)
  app.mount(el)

  return app
}

window.SolarGreenLanding = {
  mount: mountSolarGreen
}
