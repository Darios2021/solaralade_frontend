<template>
  <v-app class="solar-app">
    <v-container class="pa-0 d-flex justify-center" fluid>
      <div class="form-wrapper">
        <v-card class="form-card" elevation="8">
          <!-- HEADER -->
          <div class="form-header">
            <span class="form-chip">Simulador inicial</span>
            <h2 class="form-title">Cotizá tu instalación solar</h2>
            <p class="form-subtitle">
              Completá unos datos y te ayudamos a estimar la mejor solución para vos.
            </p>

            <!-- NAV DE VISTAS -->
            <div class="view-tabs">
              <button
                type="button"
                class="view-tab"
                :class="{ active: activeView === 'form' }"
                @click="activeView = 'form'"
              >
                Formulario
              </button>
              <button
                type="button"
                class="view-tab"
                :class="{ active: activeView === 'calc' }"
                @click="activeView = 'calc'"
              >
                Calcular consumo
              </button>
            </div>
          </div>

          <!-- VISTA FORMULARIO -->
          <SolarLeadForm
            v-show="activeView === 'form'"
          />

          <!-- VISTA CALCULADORA DE CONSUMO -->
          <ConsumptionCalculator
            v-show="activeView === 'calc'"
          />

          <!-- BOTÓN MÁS INFORMACIÓN (link a landing externa) -->
          <div class="more-info-wrap">
            <v-btn
              variant="text"
              class="more-info-btn"
              @click="goToMoreInfo"
            >
              Más información sobre energía solar
            </v-btn>
          </div>
        </v-card>
      </div>
    </v-container>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import SolarLeadForm from './components/SolarLeadForm.vue'
import ConsumptionCalculator from './components/ConsumptionCalculator.vue'

console.log('[solar-calculator] App.vue montado')

const activeView = ref('form')

const moreInfoUrl = 'https://grupoalade.com/calculo-paneles-2'

const goToMoreInfo = () => {
  if (typeof window !== 'undefined') {
    window.open(moreInfoUrl, '_blank')
  }
}
</script>

<style scoped>
.form-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 16px;
}

.form-card {
  max-width: 420px;
  width: 100%;
  border-radius: 18px;
  padding: 24px 22px 20px;
  background: #ffffff;
  border: 1px solid rgba(42, 124, 65, 0.18);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
}

.form-header {
  margin-bottom: 16px;
}

.form-chip {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  color: #ffffff;
  background-color: #1a5934;
  margin-bottom: 6px;
}

.form-title {
  font-size: 1.25rem;
  font-weight: 800;
  margin: 0 0 4px;
  color: #1a5934;
}

.form-subtitle {
  font-size: 0.83rem;
  margin: 0;
  color: #4f4f4f;
}

/* Tabs de vista */
.view-tabs {
  margin-top: 12px;
  display: flex;
  gap: 6px;
  padding: 4px;
  border-radius: 999px;
  background: #f4f7f5;
}

.view-tab {
  flex: 1 1 0;
  border: none;
  border-radius: 999px;
  padding: 5px 8px;
  font-size: 0.75rem;
  font-weight: 600;
  background: transparent;
  color: #30553b;
  cursor: pointer;
  text-align: center;
  white-space: nowrap;
}

.view-tab.active {
  background: #2a7c41;
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
}

/* Botón "Más información" al pie */
.more-info-wrap {
  margin-top: 10px;
  display: flex;
  justify-content: center;
}

.more-info-btn {
  text-transform: none !important;
  font-size: 0.8rem !important;
  color: #2a7c41 !important;
}

/* RESPONSIVE */
@media (max-width: 960px) {
  .form-wrapper {
    padding: 12px;
  }
  .form-card {
    max-width: 520px;
  }
}

@media (max-width: 600px) {
  .form-wrapper {
    padding: 10px;
  }
  .form-card {
    max-width: 100%;
    padding: 20px 18px 18px;
    border-radius: 16px;
    box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25);
  }
  .form-title {
    font-size: 1.15rem;
  }
  .form-subtitle {
    font-size: 0.8rem;
  }
}
</style>

<!-- Estilos globales para blindar contra Elementor y refinar botones -->
<style>
#solar-calculator .solar-app,
#solar-calculator .solar-app .v-application__wrap,
#solar-calculator .solar-app .v-main,
#solar-calculator .solar-app .v-container {
  background: transparent !important;
  box-shadow: none !important;
}

/* Sandbox fuerte */
#solar-calculator,
#solar-calculator * {
  box-sizing: border-box !important;
}

/* Botones Vuetify: más delicados */
#solar-calculator .v-btn,
#solar-calculator .v-btn:link,
#solar-calculator .v-btn:visited {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 6px 14px !important;
  min-height: 30px !important;
  height: auto !important;
  border-radius: 999px !important;
  text-decoration: none !important;
  text-transform: none !important;
  letter-spacing: 0 !important;
  font-weight: 600 !important;
  font-size: 0.82rem !important;
  background-image: none !important;
}

#solar-calculator .v-btn__content {
  text-transform: none !important;
  line-height: 1.2 !important;
}

/* Por si Elementor toca <button> genérico */
#solar-calculator button {
  text-decoration: none !important;
  text-transform: none !important;
  font-size: 0.82rem !important;
}

/* Inputs / selects Vuetify */
#solar-calculator .v-field,
#solar-calculator .v-input,
#solar-calculator .v-text-field,
#solar-calculator .v-select {
  font-family: inherit !important;
  text-transform: none !important;
}

#solar-calculator .v-field__input,
#solar-calculator .v-text-field input,
#solar-calculator .v-select input {
  font-size: 0.95rem !important;
  line-height: 1.3 !important;
}

/* Mensajes de error */
#solar-calculator .v-messages__message {
  font-size: 0.75rem !important;
  text-transform: none !important;
}

/* Limpiar sombras/bordes heredados */
#solar-calculator button,
#solar-calculator input,
#solar-calculator select,
#solar-calculator textarea {
  box-shadow: none !important;
}

/* Dialog responsive */
@media (max-width: 600px) {
  #solar-calculator .v-overlay__content {
    margin: 0 10px !important;
  }
}
</style>
