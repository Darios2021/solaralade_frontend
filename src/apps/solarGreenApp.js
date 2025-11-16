// src/apps/solarGreenApp.js
import { createApp } from "vue";
import SolarGreenApp from "../SolarGreenApp.vue";

import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

console.log("[SolarGreen] Bundle cargado, definiendo API global...");

const vuetify = createVuetify({
  components,
  directives,
});

function mount(target = "solar-green") {
  const el =
    typeof target === "string"
      ? document.getElementById(target) || document.querySelector(`#${target}`)
      : target;

  if (!el) {
    console.error("[SolarGreen] No se encontró el contenedor:", target);
    return null;
  }

  if (el.dataset.sgMounted === "1") {
    console.log("[SolarGreen] Ya estaba montado en", target);
    return null;
  }

  const app = createApp(SolarGreenApp);
  app.use(vuetify);
  app.mount(el);

  el.dataset.sgMounted = "1";

  return app;
}

// Nombre global que usa tu HTML: SolarGreenLanding
if (typeof window !== "undefined") {
  if (!window.SolarGreenLanding) {
    window.SolarGreenLanding = {};
  }
  window.SolarGreenLanding.mount = mount;
}

export { mount };
export default { mount };
