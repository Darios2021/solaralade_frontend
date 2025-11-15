<template>
  <v-app>
    <v-main>
      <v-container class="pa-0" fluid>
        <v-card class="pa-4 solar-card" elevation="3" rounded="xl">
          <v-card-title class="text-h6 font-weight-bold">
            Calculá tu kit de energía solar
          </v-card-title>

          <v-card-subtitle class="text-body-2 mb-3">
            Ingresá tu consumo y te mostramos una estimación de paneles, potencia y ahorro mensual.
          </v-card-subtitle>

          <v-divider class="mb-4" />

          <v-form @submit.prevent="onSubmit" v-model="formValid">
            <div class="form-grid">
              <v-text-field
                v-model.number="form.consumoMensualKwh"
                label="Consumo mensual (kWh)"
                type="number"
                min="0"
                required
                :rules="[v => !!v || 'Requerido']"
              />

              <v-text-field
                v-model="form.facturaPromedio"
                label="Factura promedio ($ / mes)"
                type="number"
                min="0"
              />

              <v-select
                v-model="form.provincia"
                :items="provincias"
                label="Provincia"
                required
                :rules="[v => !!v || 'Requerido']"
              />

              <v-text-field v-model="form.localidad" label="Localidad" />
              <v-text-field v-model="form.email" label="Email" type="email" required />
              <v-text-field v-model="form.telefono" label="WhatsApp / Teléfono" />
            </div>

            <v-btn class="mt-4" color="primary" block size="large" type="submit" :loading="loading">
              Calcular mi kit solar
            </v-btn>
          </v-form>

          <v-alert v-if="error" type="error" variant="tonal" class="mt-4">
            {{ error }}
          </v-alert>

          <v-expand-transition>
            <div v-if="resultado" class="mt-4">
              <v-divider class="mb-4" />
              <v-card variant="tonal" class="pa-4" rounded="lg">
                <h3 class="text-subtitle-1 font-weight-bold mb-2">Resultado estimado</h3>
                <p class="text-body-2 mb-4">Estimación basada en tu consumo.</p>

                <div class="resultado-grid">
                  <div class="resultado-item" v-for="(v,k) in display" :key="k">
                    <div class="resultado-label">{{ k }}</div>
                    <div class="resultado-value">{{ v }}</div>
                  </div>
                </div>
              </v-card>
            </div>
          </v-expand-transition>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'

const form = reactive({
  consumoMensualKwh: null,
  facturaPromedio: null,
  provincia: null,
  localidad: '',
  email: '',
  telefono: '',
})

const provincias = [
  'San Juan', 'Mendoza', 'San Luis', 'La Rioja', 'Córdoba',
  'Buenos Aires', 'Santa Fe', 'Otra'
]

const formValid = ref(false)
const loading = ref(false)
const error = ref('')
const resultado = ref(null)

const nf = new Intl.NumberFormat('es-AR')

function calcularLocal(f) {
  const consumo = Number(f.consumoMensualKwh)
  if (!consumo) throw new Error('Ingresá el consumo.')

  const produccionPorKwpMes = 130
  const potenciaRecomendadaKwp = consumo / produccionPorKwpMes

  const panel = 0.55
  const cantidadPaneles = Math.max(1, Math.round(potenciaRecomendadaKwp / panel))

  const produccionEstimadaKwhMes = cantidadPaneles * panel * produccionPorKwpMes

  const valorKwh = f.facturaPromedio && consumo ? f.facturaPromedio / consumo : 120
  const ahorroEstimadoMensual = produccionEstimadaKwhMes * valorKwh * 0.9

  const costoEstimadoKit = potenciaRecomendadaKwp * 900000
  const paybackAnios = costoEstimadoKit / (ahorroEstimadoMensual * 12)

  return {
    potenciaRecomendadaKwp,
    cantidadPaneles,
    produccionEstimadaKwhMes,
    ahorroEstimadoMensual,
    costoEstimadoKit,
    paybackAnios,
  }
}

const display = computed(() => resultado.value ? {
  'Potencia recomendada': resultado.value.potenciaRecomendadaKwp.toFixed(1) + ' kWp',
  'Paneles necesarios': resultado.value.cantidadPaneles,
  'Generación mensual': nf.format(resultado.value.produccionEstimadaKwhMes) + ' kWh',
  'Ahorro mensual': '$ ' + nf.format(resultado.value.ahorroEstimadoMensual),
  'Costo estimado': '$ ' + nf.format(resultado.value.costoEstimadoKit),
  'Payback estimado': resultado.value.paybackAnios.toFixed(1) + ' años'
} : {})

async function onSubmit() {
  error.value = ''
  resultado.value = null
  loading.value = true

  try {
    resultado.value = calcularLocal(form)
  } catch (e) {
    error.value = e.message
  }

  loading.value = false
}
</script>

<style scoped>
.solar-card { max-width: 960px; margin: auto; }
.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}
.resultado-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.resultado-item {
  padding: 10px;
  border-radius: 8px;
  background: rgba(0,0,0,.05);
}
.resultado-label {
  font-size: .85rem;
  opacity: .7;
}
.resultado-value {
  font-size: 1rem;
  font-weight: 600;
}
</style>
