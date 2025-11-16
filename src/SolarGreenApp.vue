<template>
  <v-app class="solar-green-app">
    <v-main class="bg-grey-lighten-5">
      <!-- HERO -->
      <section class="bg-white">
        <v-container class="py-12 py-md-16 text-center">
          <div class="text-h4 text-md-h3 font-weight-bold text-green-darken-2 mb-3">
            Bienvenido a ALADE Green
          </div>
          <div
            class="text-subtitle-1 text-medium-emphasis mb-8 mx-auto"
            style="max-width: 640px;"
          >
            La energía solar para hogares y comercios con la calidad de Grupo Alade.
            Conocé cómo funciona un sistema de paneles solares, estimá tu ahorro
            y dejá tus datos para que un asesor te acompañe en todo el proceso.
          </div>

          <v-btn
            color="primary"
            size="large"
            class="px-8 py-3 text-button"
            @click="scrollToCalculator"
          >
            CALCULAR MI AHORRO
          </v-btn>
        </v-container>
      </section>

      <!-- BENEFICIOS PRINCIPALES -->
      <section>
        <v-container class="py-10">
          <div class="text-h5 text-md-h4 font-weight-medium text-center mb-6">
            ¿Por qué instalar un sistema de paneles solares?
          </div>

          <v-row dense align="stretch">
            <v-col cols="12" md="4">
              <v-card class="h-100" elevation="2">
                <v-card-text class="py-6">
                  <div class="text-h6 mb-2 text-green-darken-2">
                    Ahorro económico
                  </div>
                  <div class="text-body-2 text-medium-emphasis">
                    Un sistema fotovoltaico genera parte de la energía que
                    consumís todos los meses. Eso se traduce en menor
                    dependencia de la red y una reducción progresiva de
                    la factura eléctrica.
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="4">
              <v-card class="h-100" elevation="2">
                <v-card-text class="py-6">
                  <div class="text-h6 mb-2 text-green-darken-2">
                    Sustentabilidad
                  </div>
                  <div class="text-body-2 text-medium-emphasis">
                    La energía solar es renovable y limpia. Al generar parte
                    de tu consumo a partir del sol, reducís tu huella de carbono
                    y contribuís a un modelo energético más responsable.
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="4">
              <v-card class="h-100" elevation="2">
                <v-card-text class="py-6">
                  Confort y previsibilidad
                  <div class="text-body-2 text-medium-emphasis mt-2">
                    Un sistema bien dimensionado te da previsibilidad de costos
                    a mediano y largo plazo, y puede integrarse con soluciones
                    de respaldo frente a cortes de energía.
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <!-- SECCIÓN CALCULADORA + FORMULARIO -->
      <section id="green-calculator-section" class="bg-grey-lighten-4">
        <v-container class="py-10 d-flex justify-center">
          <!-- wrapper con el mismo estilo que App.vue -->
          <div id="solar-calculator" class="form-wrapper">
            <v-card class="form-card" elevation="8">
              <!-- HEADER -->
              <div class="form-header">
                <span class="form-chip">Simulador inicial</span>
                <h2 class="form-title">Cotizá tu instalación solar</h2>
                <p class="form-subtitle">
                  Completá unos datos y te ayudamos a estimar el sistema de paneles
                  adecuado para tu hogar o comercio.
                </p>

                <!-- NAV DE VISTAS -->
                <div class="view-tabs">
                  <button
                    type="button"
                    class="view-tab"
                    :class="{ active: activeView === 'form' }"
                    @click="activeView = 'form'"
                  >
                    Dejar mis datos
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
              <SolarLeadForm v-show="activeView === 'form'" />

              <!-- VISTA CALCULADORA DE CONSUMO -->
              <ConsumptionCalculator v-show="activeView === 'calc'" />

              <!-- BOTÓN MÁS INFORMACIÓN (scroll a sección de info) -->
              <div class="more-info-wrap">
                <v-btn
                  variant="text"
                  class="more-info-btn"
                  @click="scrollToInfo"
                >
                  Quiero saber más sobre energía solar
                </v-btn>
              </div>
            </v-card>
          </div>
        </v-container>
      </section>

      <!-- CÓMO FUNCIONA UN SISTEMA SOLAR -->
      <section ref="infoSection" class="bg-white">
        <v-container class="py-10">
          <div class="text-h5 text-md-h4 font-weight-medium text-center mb-8">
            ¿Cómo funciona un sistema de paneles solares?
          </div>

          <v-row>
            <v-col cols="12" md="4">
              <h3 class="text-subtitle-1 font-weight-medium mb-2">
                1. Captación de energía
              </h3>
              <p class="text-body-2 text-medium-emphasis">
                Los paneles fotovoltaicos convierten la radiación solar en
                energía eléctrica de corriente continua (CC). Se colocan en
                techos o estructuras con buena exposición al sol.
              </p>
            </v-col>

            <v-col cols="12" md="4">
              <h3 class="text-subtitle-1 font-weight-medium mb-2">
                2. Conversión e integración
              </h3>
              <p class="text-body-2 text-medium-emphasis">
                Un inversor transforma esa energía en corriente alterna (CA),
                compatible con la instalación eléctrica convencional. El sistema
                se conecta a tu tablero existente.
              </p>
            </v-col>

            <v-col cols="12" md="4">
              <h3 class="text-subtitle-1 font-weight-medium mb-2">
                3. Uso y monitoreo
              </h3>
              <p class="text-body-2 text-medium-emphasis">
                La energía generada se utiliza en tiempo real y, según la
                normativa local, puede complementarse con la red y sistemas de
                medición bidireccional. Es posible monitorear producción y
                ahorro desde apps o portales web.
              </p>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <!-- PREGUNTAS FRECUENTES -->
      <section>
        <v-container class="py-10">
          <div class="text-h5 text-md-h4 font-weight-medium text-center mb-6">
            Preguntas frecuentes
          </div>

          <v-expansion-panels variant="accordion">
            <v-expansion-panel>
              <v-expansion-panel-title>
                ¿Tengo que cambiar toda mi instalación eléctrica?
              </v-expansion-panel-title>
              <v-expansion-panel-text class="text-body-2 text-medium-emphasis">
                No. El sistema se integra a tu tablero actual. Sólo se hacen
                adecuaciones puntuales para garantizar seguridad y funcionamiento
                óptimo según la normativa vigente.
              </v-expansion-panel-text>
            </v-expansion-panel>

            <v-expansion-panel>
              <v-expansion-panel-title>
                ¿Qué pasa cuando está nublado o es de noche?
              </v-expansion-panel-title>
              <v-expansion-panel-text class="text-body-2 text-medium-emphasis">
                La generación baja cuando hay poca radiación, y es nula de noche.
                Por eso el sistema trabaja en conjunto con la red eléctrica
                convencional y, si lo deseás, con baterías de respaldo.
              </v-expansion-panel-text>
            </v-expansion-panel>

            <v-expansion-panel>
              <v-expansion-panel-title>
                ¿En cuánto tiempo se recupera la inversión?
              </v-expansion-panel-title>
              <v-expansion-panel-text class="text-body-2 text-medium-emphasis">
                Depende del consumo, la tarifa y el tipo de usuario. En muchos
                casos el retorno se observa en un rango de algunos años, y luego
                el sistema continúa generando ahorro durante su vida útil.
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-container>
      </section>

      <!-- CTA FINAL -->
      <section class="bg-green-darken-1">
        <v-container class="py-10 text-center">
          <div class="text-h5 text-md-h4 font-weight-medium mb-2 text-white">
            Empezá hoy tu proyecto solar
          </div>
          <div class="text-body-2 text-md-body-1 mb-6 text-white text-medium-emphasis">
            Usá el simulador para tener una primera referencia y dejá tus datos
            para recibir una propuesta adaptada a tu realidad.
          </div>

          <v-btn
            color="white"
            variant="outlined"
            size="large"
            class="px-8 py-3 text-button"
            @click="scrollToCalculator"
          >
            IR AL SIMULADOR
          </v-btn>
        </v-container>
      </section>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import SolarLeadForm from './components/SolarLeadForm.vue'
import ConsumptionCalculator from './components/ConsumptionCalculator.vue'

const activeView = ref('form')
const infoSection = ref(null)

function scrollToCalculator() {
  const el = document.getElementById('green-calculator-section')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

function scrollToInfo() {
  const el = infoSection.value
  if (el?.$el) {
    el.$el.scrollIntoView({ behavior: 'smooth' })
  } else {
    const dom = document.querySelector('[ref="infoSection"]')
    if (dom) dom.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<style scoped>
/* Wrapper del simulador (copiado de App.vue para mantener estética) */
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
  font-weight: 700;
  margin-bottom: 4px;
}

.form-subtitle {
  font-size: 0.9rem;
  color: #6b6f75;
  margin: 0;
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
  padding: 6px 10px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  background: transparent;
  color: #4b4f55;
  transition: all 0.2s ease;
}

.view-tab.active {
  background: #2a7c41;
  color: #ffffff;
}

/* Footer */
.more-info-wrap {
  margin-top: 16px;
  text-align: center;
}

.more-info-btn {
  text-transform: none !important;
  font-weight: 500 !important;
  font-size: 0.82rem !important;
}

/* Ajustes generales dentro del contenedor */
#solar-calculator .v-field,
#solar-calculator .v-btn {
  box-shadow: none !important;
}
</style>
