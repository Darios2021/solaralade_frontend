<template>
  <v-app>
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
                item-title="label"
                item-value="value"
                label="Seleccionar provincia"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                :rules="[rules.required]"
              />

              <v-select
                v-model="form.country"
                :items="countries"
                item-title="label"
                item-value="value"
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
                item-title="label"
                item-value="value"
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
                item-title="label"
                item-value="value"
                label="Esto es para:"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                :rules="[rules.required]"
              />

              <v-text-field
                v-model="form.currentBill"
                label="¿Cuánto pagás aprox. de luz al mes? (ARS)"
                type="number"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                :rules="[rules.requiredNumber]"
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
                class="mr-2 back-btn"
                @click="goPrev"
              >
                Anterior
              </v-btn>

              <v-spacer />

              <v-btn
                class="submit-btn"
                color="primary"
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
import { reactive, ref, computed } from 'vue'

const step = ref(1)
const totalSteps = 4
const formRef = ref(null)

// === DATOS DEL FORM ===
const form = reactive({
  city: '',
  province: null,
  country: 'AR', // Argentina por defecto
  purpose: null,
  usage: null,
  currentBill: null, // factura mensual aprox en ARS
  fullName: '',
  phone: '',
  email: '',
})

// Catálogos con códigos + labels (lógica de negocio seria)
const provinces = [
  { value: 'BA', label: 'Buenos Aires' },
  { value: 'CABA', label: 'CABA' },
  { value: 'SJ', label: 'San Juan' },
  { value: 'SL', label: 'San Luis' },
  { value: 'MZA', label: 'Mendoza' },
  { value: 'CB', label: 'Córdoba' },
  // ...podés seguir sumando
]

const countries = [{ value: 'AR', label: 'Argentina' }]

const purposes = [
  {
    value: '1',
    label: '1 - Para bajar la huella de carbono.',
    driver: 'sustentabilidad',
  },
  {
    value: '2',
    label: '2 - Para generar un ahorro en la factura eléctrica.',
    driver: 'ahorro',
  },
  {
    value: '3',
    label: '3 - Para tener autonomía en caso de cortes de servicio.',
    driver: 'autonomia',
  },
  {
    value: '4',
    label: '4 - Para tener energía donde no llega la red.',
    driver: 'offgrid',
  },
  { value: '5', label: '5 - Para un motor home.', driver: 'movil' },
  { value: '6', label: '6 - Bombeo solar para campos.', driver: 'bombeo' },
  {
    value: '7',
    label: '7 - Opciones 1, 2, 3 y 4.',
    driver: 'mixto',
  },
]

const usages = [
  { value: 'home', label: 'Mi casa', segment: 'Residencial' },
  { value: 'commerce', label: 'Mi comercio', segment: 'Comercial' },
  { value: 'company', label: 'Mi empresa', segment: 'Comercial' },
  {
    value: 'weekend',
    label: 'Mi casa de fin de semana o veraneo',
    segment: 'Residencial',
  },
  {
    value: 'agro',
    label: 'Para establecimientos agrícolas',
    segment: 'Agro / Rural',
  },
  { value: 'other', label: 'Otros', segment: 'Otros' },
]

// Mapas para lookup rápido en la lógica
const purposeMap = computed(() =>
  Object.fromEntries(purposes.map(p => [p.value, p]))
)
const usageMap = computed(() =>
  Object.fromEntries(usages.map(u => [u.value, u]))
)

// === REGLAS VALIDACIÓN ===
const rules = {
  required: v => !!v || 'Campo obligatorio',
  requiredNumber: v =>
    (v !== null && v !== '' && !isNaN(Number(v))) || 'Ingresá un valor numérico',
  email: v =>
    !v || /.+@.+\..+/.test(v) || 'Email inválido',
}

// === NAVEGACIÓN ENTRE PASOS ===
const goNext = async () => {
  if (!formRef.value) return
  const { valid } = await formRef.value.validate()
  if (valid && step.value < totalSteps) {
    step.value++
    formRef.value.resetValidation()
  }
}

const goPrev = () => {
  if (step.value > 1) {
    step.value--
    formRef.value?.resetValidation()
  }
}

// === LÓGICA DE NEGOCIO DE LEAD ===

// Estimación MUY simple de consumo en kWh a partir de la factura (ARS)
// Esto después lo podemos refinar con tarifas reales de San Juan / EPRE.
function estimateMonthlyKwh(billArs) {
  const bill = Number(billArs) || 0
  const avgTariff = 120; // ARS/kWh aprox (placeholder razonable)
  if (!bill) return null
  return Math.round(bill / avgTariff)
}

// Estimar tamaño de sistema recomendado (kWp) desde los kWh mensuales
function estimateSystemSizeKw(monthlyKwh) {
  if (!monthlyKwh) return null
  // Regla aproximada: 1 kWp genera ~130 kWh/mes (depende provincia, aquí promedio)
  const kwhPerKw = 130
  return Number((monthlyKwh / kwhPerKw).toFixed(1))
}

// Derivar prioridad según motivo + factura
function estimatePriority(purpose, monthlyBill) {
  const bill = Number(monthlyBill) || 0
  const driver = purposeMap.value[purpose]?.driver

  if (bill > 60000 || driver === 'mixto') return 'Muy alta'
  if (bill > 30000 || driver === 'ahorro' || driver === 'autonomia') return 'Alta'
  if (driver === 'bombeo' || driver === 'offgrid') return 'Proyecto específico'
  if (driver === 'sustentabilidad') return 'Media'
  return 'A evaluar'
}

// Construir payload completo para enviar a backend / CRM
function buildLeadPayload() {
  const province = provinces.find(p => p.value === form.province) || null
  const country = countries.find(c => c.value === form.country) || null
  const purpose = purposeMap.value[form.purpose] || null
  const usage = usageMap.value[form.usage] || null

  const monthlyKwh = estimateMonthlyKwh(form.currentBill)
  const systemSizeKw = estimateSystemSizeKw(monthlyKwh)
  const priority = estimatePriority(form.purpose, form.currentBill)

  return {
    location: {
      city: form.city || null,
      provinceCode: province?.value || null,
      provinceName: province?.label || null,
      countryCode: country?.value || null,
      countryName: country?.label || null,
    },
    project: {
      purposeCode: purpose?.value || null,
      purposeLabel: purpose?.label || null,
      purposeDriver: purpose?.driver || null,
      usageCode: usage?.value || null,
      usageLabel: usage?.label || null,
      segment: usage?.segment || null,
      monthlyBillArs: form.currentBill ? Number(form.currentBill) : null,
      estimatedMonthlyKwh: monthlyKwh,
      estimatedSystemSizeKw: systemSizeKw,
      priority,
    },
    contact: {
      fullName: form.fullName,
      phone: form.phone,
      email: form.email,
    },
    meta: {
      createdAt: new Date().toISOString(),
      sourceUrl: window.location.href,
      sourceTag: 'web-grupoalade-simulador-solar',
    },
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  const { valid } = await formRef.value.validate()
  if (!valid) return

  const payload = buildLeadPayload()

  // 1) Log de control desarrollador
  console.log('[solar-calculator] Lead generado', payload)

  // 2) Disparar evento global para que WordPress / GTM / scripts externos lo capten
  window.dispatchEvent(
    new CustomEvent('solar-calculator:lead', { detail: payload })
  )

  // 3) TODO: acá podrías hacer fetch a tu backend / webhook:
  // await fetch('https://api.grupoalade.com/solar/leads', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(payload),
  // })

  alert(
    '¡Gracias! Recibimos tu solicitud de cotización. Un asesor de Grupo Alade se pondrá en contacto con vos.'
  )
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
  border: 1px solid rgba(42, 124, 65, 0.18); /* #2a7c41 suave */
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

.step-indicator {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin: 4px 0 14px;
}

.step-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background-color: #d3d3d3;
  transition: all 0.2s ease;
}

.step-dot.active {
  width: 20px;
  background-color: #2a7c41;
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

.back-btn {
  color: #1a5934;
}

.submit-btn {
  min-width: 170px;
  font-weight: 600;
  color: #ffffff;
  text-transform: none;
}

/* Responsive pequeño */
@media (max-width: 600px) {
  .form-card {
    max-width: 100%;
    padding-inline: 18px;
  }
}
</style>
