<template>
  <v-app>
    <v-container class="pa-0 d-flex justify-center" fluid>
      <div class="form-wrapper">
        <v-card class="form-card" elevation="6">
          <!-- HEADER -->
          <div class="form-header">
            <h2 class="form-title">Cotizá tu instalación solar</h2>
            <p class="form-subtitle">
              Completá unos datos y te ayudamos a estimar la mejor solución para vos.
            </p>
          </div>

          <!-- FORM -->
          <v-form ref="formRef" class="form-body">
            <!-- Indicador de pasos -->
            <div class="step-indicator">
              <span
                v-for="n in totalSteps"
                :key="n"
                class="step-dot"
                :class="{ active: n === step }"
              />
            </div>

            <!-- PASO 1: UBICACIÓN -->
            <div v-if="step === 1" class="step-body">
              <v-text-field
                v-model="form.city"
                label="Ciudad"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                :rules="[rules.required]"
              />

              <v-select
                v-model="form.province"
                :items="provinces"
                label="Seleccionar provincia"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                :rules="[rules.required]"
              />

              <v-select
                v-model="form.country"
                :items="countries"
                label="País"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                :rules="[rules.required]"
              />
            </div>

            <!-- PASO 2: MOTIVO -->
            <div v-else-if="step === 2" class="step-body">
              <v-select
                v-model="form.purpose"
                :items="purposes"
                label="¿Para qué querés un sistema Solar fotovoltaico?"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                :rules="[rules.required]"
              />
            </div>

            <!-- PASO 3: TIPO DE USO -->
            <div v-else-if="step === 3" class="step-body">
              <v-select
                v-model="form.usage"
                :items="usages"
                label="Esto es para:"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                :rules="[rules.required]"
              />
            </div>

            <!-- PASO 4: DATOS DE CONTACTO -->
            <div v-else-if="step === 4" class="step-body">
              <v-text-field
                v-model="form.fullName"
                label="Nombre y apellido"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                :rules="[rules.required]"
              />

              <v-text-field
                v-model="form.phone"
                label="Teléfono"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                :rules="[rules.required]"
              />

              <v-text-field
                v-model="form.email"
                label="Email"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                :rules="[rules.required, rules.email]"
              />
            </div>

            <!-- BOTONES -->
            <div class="form-actions">
              <v-btn
                v-if="step > 1"
                variant="text"
                class="mr-2"
                @click="goPrev"
              >
                Anterior
              </v-btn>

              <v-spacer />

              <v-btn
                class="submit-btn"
                color="orange"
                variant="flat"
                @click="step < totalSteps ? goNext() : handleSubmit()"
              >
                {{ step < totalSteps ? 'Siguiente' : 'Solicitar cotización' }}
              </v-btn>
            </div>
          </v-form>
        </v-card>
      </div>
    </v-container>
  </v-app>
</template>

<script setup>
import { reactive, ref } from 'vue'

const step = ref(1)
const totalSteps = 4
const formRef = ref(null)

const form = reactive({
  city: '',
  province: '',
  country: 'Argentina',
  purpose: '',
  usage: '',
  fullName: '',
  phone: '',
  email: '',
})

const provinces = [
  'Buenos Aires',
  'CABA',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán',
]

const countries = ['Argentina']

const purposes = [
  '1 - Para bajar la huella de carbono.',
  '2 - Para generar un ahorro en la factura eléctrica.',
  '3 - Para tener autonomía en caso de cortes de servicio.',
  '4 - Para tener energía donde no llega la red.',
  '5 - Para un motor home.',
  '6 - Bombeo solar para campos.',
  '7 - Opciones 1, 2, 3 y 4.',
]

const usages = [
  'Mi casa',
  'Mi comercio',
  'Mi empresa',
  'Mi casa de fin de semana o veraneo',
  'Para establecimientos agrícolas',
  'Otros',
]

const rules = {
  required: v => !!v || 'Campo obligatorio',
  email: v =>
    !v ||
    /.+@.+\..+/.test(v) ||
    'Email inválido',
}

const goNext = async () => {
  if (!formRef.value) return
  const { valid } = await formRef.value.validate()
  if (valid && step.value < totalSteps) {
    step.value++
    // limpiamos mensajes de validación al cambiar de paso
    formRef.value.resetValidation()
  }
}

const goPrev = () => {
  if (step.value > 1) {
    step.value--
    formRef.value?.resetValidation()
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  const { valid } = await formRef.value.validate()
  if (!valid) return

  // Acá integrás con tu backend / webhook / mail, etc.
  console.log('[solar-calculator] Lead enviado:', { ...form })

  // Por ahora solo feedback simple al usuario
  alert('¡Gracias! Recibimos tu solicitud de cotización.')
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
  background-color: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.form-header {
  margin-bottom: 12px;
}

.form-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 4px;
}

.form-subtitle {
  font-size: 0.85rem;
  margin: 0;
  color: #666;
}

.step-indicator {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin: 8px 0 16px;
}

.step-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background-color: #ddd;
  transition: all 0.2s ease;
}

.step-dot.active {
  width: 18px;
  background-color: #ff9800;
}

.step-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-actions {
  display: flex;
  align-items: center;
  margin-top: 18px;
}

.submit-btn {
  min-width: 160px;
  font-weight: 600;
  color: #fff;
}
</style>
