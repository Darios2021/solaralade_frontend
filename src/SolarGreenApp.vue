<template>
  <v-app>
    <v-main class="bg-grey-lighten-5">
      <!-- HERO -->
      <section class="bg-white">
        <v-container class="py-12 py-md-16 text-center">
          <div class="text-h4 text-md-h3 font-weight-bold text-green-darken-2 mb-3">
            Bienvenido a ALADE Green
          </div>
          <div class="text-subtitle-1 text-medium-emphasis mb-8 mx-auto" style="max-width: 640px;">
            La energía solar para hogares y comercios con la calidad de Grupo Alade.
            Te acompañamos en todo el proceso: desde el análisis de tu consumo
            hasta la puesta en marcha del sistema.
          </div>

          <v-btn
            color="primary"
            size="large"
            class="px-8 py-3 text-button"
            @click="goToCalculator"
          >
            CALCULAR MI AHORRO
          </v-btn>
        </v-container>
      </section>

      <!-- BENEFICIOS PRINCIPALES -->
      <section>
        <v-container class="py-10">
          <div class="text-h5 text-md-h4 font-weight-medium text-center mb-6">
            ¿Por qué elegir energía solar con ALADE Green?
          </div>

          <v-row dense align="stretch">
            <v-col cols="12" md="4">
              <v-card class="h-100" elevation="2">
                <v-card-text class="py-6">
                  <div class="text-h6 mb-2 text-green-darken-2">
                    Ahorro en tu factura
                  </div>
                  <div class="text-body-2 text-medium-emphasis">
                    Reducí de forma significativa el costo de tu energía eléctrica.
                    A partir de un análisis simple de tu factura estimamos el tamaño
                    del sistema y el ahorro aproximado que podés obtener.
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="4">
              <v-card class="h-100" elevation="2">
                <v-card-text class="py-6">
                  <div class="text-h6 mb-2 text-green-darken-2">
                    Tecnología y calidad
                  </div>
                  <div class="text-body-2 text-medium-emphasis">
                    Trabajamos con paneles y equipamiento certificados, instalados
                    por equipos técnicos especializados, garantizando performance
                    y seguridad a largo plazo.
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="4">
              <v-card class="h-100" elevation="2">
                <v-card-text class="py-6">
                  <div class="text-h6 mb-2 text-green-darken-2">
                    Acompañamiento integral
                  </div>
                  <div class="text-body-2 text-medium-emphasis">
                    Te asesoramos en cada instancia: simulación de ahorro,
                    diseño del sistema, instalación y seguimiento posterior.
                    Queremos que entiendas cada paso y tomes decisiones informadas.
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <!-- CÓMO FUNCIONA -->
      <section class="bg-white">
        <v-container class="py-10">
          <div class="text-h5 text-md-h4 font-weight-medium text-center mb-8">
            ¿Cómo es el proceso?
          </div>

          <v-row class="justify-center">
            <v-col cols="12" md="10">
              <v-timeline density="compact">
                <v-timeline-item dot-color="primary" fill-dot>
                  <template #opposite> Paso 1 </template>
                  <v-card elevation="1">
                    <v-card-title class="text-subtitle-1 font-weight-medium">
                      Simulá tu ahorro
                    </v-card-title>
                    <v-card-text class="text-body-2 text-medium-emphasis">
                      Completá la calculadora con el valor de tu factura eléctrica.
                      El sistema estima tu consumo, el tamaño del sistema solar
                      sugerido y un rango de ahorro aproximado.
                    </v-card-text>
                  </v-card>
                </v-timeline-item>

                <v-timeline-item dot-color="primary" fill-dot>
                  <template #opposite> Paso 2 </template>
                  <v-card elevation="1">
                    <v-card-title class="text-subtitle-1 font-weight-medium">
                      Recibí el asesoramiento
                    </v-card-title>
                    <v-card-text class="text-body-2 text-medium-emphasis">
                      Un asesor de ALADE Green se pondrá en contacto con vos
                      para revisar el resultado, ajustar la propuesta a tu
                      realidad (hogar, comercio, industria) y responder tus dudas.
                    </v-card-text>
                  </v-card>
                </v-timeline-item>

                <v-timeline-item dot-color="primary" fill-dot>
                  <template #opposite> Paso 3 </template>
                  <v-card elevation="1">
                    <v-card-title class="text-subtitle-1 font-weight-medium">
                      Instalación y puesta en marcha
                    </v-card-title>
                    <v-card-text class="text-body-2 text-medium-emphasis">
                      Nuestro equipo técnico instala el sistema, realiza las
                      pruebas necesarias y te enseña a leer los indicadores
                      básicos de generación y ahorro.
                    </v-card-text>
                  </v-card>
                </v-timeline-item>
              </v-timeline>
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
                ¿Necesito cambiar toda la instalación eléctrica de mi casa?
              </v-expansion-panel-title>
              <v-expansion-panel-text class="text-body-2 text-medium-emphasis">
                No. El sistema se conecta a tu tablero eléctrico existente.
                En algunos casos se realizan adecuaciones menores para garantizar
                seguridad y buen funcionamiento, pero no es necesario “romper todo”.
              </v-expansion-panel-text>
            </v-expansion-panel>

            <v-expansion-panel>
              <v-expansion-panel-title>
                ¿Qué pasa en días nublados o de baja radiación?
              </v-expansion-panel-title>
              <v-expansion-panel-text class="text-body-2 text-medium-emphasis">
                Los paneles siguen generando energía, aunque en menor cantidad.
                El sistema se integra con la red convencional, por lo que nunca
                te quedás sin suministro por depender solo del sol.
              </v-expansion-panel-text>
            </v-expansion-panel>

            <v-expansion-panel>
              <v-expansion-panel-title>
                ¿En cuánto tiempo se recupera la inversión?
              </v-expansion-panel-title>
              <v-expansion-panel-text class="text-body-2 text-medium-emphasis">
                Depende del tipo de usuario, el consumo y la tarifa actual.
                En la mayoría de los casos el payback se da en un rango de
                algunos años, y a partir de allí el sistema sigue generando
                ahorro durante toda su vida útil.
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-container>
      </section>

      <!-- CTA FINAL -->
      <section class="bg-green-darken-1">
        <v-container class="py-10 text-center">
          <div class="text-h5 text-md-h4 font-weight-medium mb-2 text-white">
            ¿Listo para dar el primer paso?
          </div>
          <div class="text-body-2 text-md-body-1 mb-6 text-white text-medium-emphasis">
            Usá la calculadora para tener una primera idea de tu ahorro potencial
            y recibí el acompañamiento del equipo de ALADE Green.
          </div>

          <v-btn
            color="white"
            variant="outlined"
            size="large"
            class="px-8 py-3 text-button"
            @click="goToCalculator"
          >
            IR A LA CALCULADORA
          </v-btn>
        </v-container>
      </section>
    </v-main>
  </v-app>
</template>

<script setup>
const calculatorUrl =
  (typeof window !== 'undefined' && window.SOLAR_CALCULATOR_URL) ||
  'https://grupoalade.com.ar/calculo-paneles'

function goToCalculator() {
  if (typeof window !== 'undefined') {
    window.location.href = calculatorUrl
  }
}
</script>
