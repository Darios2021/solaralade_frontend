import { createApp } from 'vue'
import App from './App.vue'

import SolarGreenInfo from './components/SolarGreenInfo.vue'
import SolarLeadForm from './components/SolarLeadForm.vue'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

/* ============================================
   TEMA ALADE GREEN
============================================ */
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
          'on-secondary': '#ffffff',
          'primary-soft': '#e0f2e7',
        },
      },
    },
  },
})

/* ============================================
   MOUNT FUNCTIONS
============================================ */

/** Calculadora */
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

/** Lead Form */
function mountSolarLeadForm(targetId = 'solar-lead', props = {}) {
  const el = document.getElementById(targetId)
  if (!el) {
    console.error(`[solar-lead] No se encontró el elemento #${targetId}`)
    return null
  }

  const app = createApp(SolarLeadForm, props)
  app.use(vuetify)
  app.mount(el)
  return app
}

/** Landing Solar Green (NUEVA) */
function mountSolarGreenInfo(targetId = 'solar-info', props = {}) {
  const el = document.getElementById(targetId)
  if (!el) {
    console.error(`[solar-info] No se encontró el elemento #${targetId}`)
    return null
  }

  const app = createApp(SolarGreenInfo, props)
  app.use(vuetify)
  app.mount(el)
  return app
}

/* ============================================
   AUTO-MOUNT (opcional)
============================================ */

if (document.getElementById('solar-calculator')) {
  mountSolarCalculator()
}

if (document.getElementById('solar-lead')) {
  mountSolarLeadForm()
}

if (document.getElementById('solar-info')) {
  mountSolarGreenInfo()
}

/* ============================================
   APIs GLOBALES
============================================ */

window.SolarCalculator = { mount: mountSolarCalculator }
window.SolarLeadForm = { mount: mountSolarLeadForm }
window.SolarGreenInfo = { mount: mountSolarGreenInfo }
