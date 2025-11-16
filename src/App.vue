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

            <!-- SWITCH DE VISTAS -->
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
              <button
                type="button"
                class="view-tab"
                :class="{ active: activeView === 'info' }"
                @click="activeView = 'info'"
              >
                Más información
              </button>
            </div>
          </div>

          <!-- ===================== -->
          <!-- VISTA 1: FORMULARIO   -->
          <!-- ===================== -->
          <v-form
            v-if="activeView === 'form'"
            ref="formRef"
            class="form-body"
          >
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

            <!-- BOTONES FORM -->
            <div class="form-actions">
              <v-btn
                v-if="step > 1"
                variant="text"
                class="mr-2 back-btn"
                :disabled="isSubmitting"
                @click="goPrev"
              >
                Anterior
              </v-btn>

              <v-spacer />

              <v-btn
                class="submit-btn"
                color="primary"
                variant="flat"
                :loading="isSubmitting"
                :disabled="isSubmitting"
                @click="step < totalSteps ? goNext() : handleSubmit()"
              >
                {{ step < totalSteps ? 'Siguiente' : 'Solicitar cotización' }}
              </v-btn>
            </div>

            <!-- MENSAJE DE ERROR SIMPLE -->
            <p v-if="errorMessage" class="error-message">
              {{ errorMessage }}
            </p>
          </v-form>

          <!-- ========================= -->
          <!-- VISTA 2: CALCULAR CONSUMO -->
          <!-- ========================= -->
          <div
            v-else-if="activeView === 'calc'"
            class="aux-view aux-view--calc"
          >
            <div class="aux-header">
              <h3 class="aux-title">Calculá tu consumo estimado</h3>
              <p class="aux-subtitle">
                Ingresá el valor aproximado de tu factura mensual de luz y te
                mostramos una estimación rápida de consumo y tamaño de sistema.
              </p>
            </div>

            <v-text-field
              v-model="calcBill"
              label="Factura promedio de luz (ARS)"
              type="number"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
            />

            <div v-if="hasCalcData" class="calc-summary">
              <div class="calc-row">
                <span class="calc-label">Consumo estimado</span>
                <span class="calc-value">
                  ≈ {{ calcMonthlyKwh }} kWh/mes
                </span>
              </div>
              <div class="calc-row">
                <span class="calc-label">Tamaño sugerido del sistema</span>
                <span class="calc-value">
                  ≈ {{ calcSystemSize }} kWp
                </span>
              </div>
              <div v-if="calcPanels" class="calc-row">
                <span class="calc-label">Cantidad de paneles</span>
                <span class="calc-value">
                  ≈ {{ calcPanels }}
                </span>
              </div>
              <div v-if="calcYearlyKwh" class="calc-row">
                <span class="calc-label">Energía anual estimada</span>
                <span class="calc-value">
                  ≈ {{ calcYearlyKwh }} kWh/año
                </span>
              </div>
              <div v-if="calcYearlySavings" class="calc-row">
                <span class="calc-label">Ahorro anual estimado</span>
                <span class="calc-value">
                  ≈ ${{ calcYearlySavings.toLocaleString('es-AR') }}
                </span>
              </div>
            </div>

            <div class="aux-actions">
              <v-btn
                class="submit-btn"
                color="primary"
                variant="flat"
                @click="goToFormFromCalc"
              >
                Quiero que me contacten
              </v-btn>

              <v-btn
                variant="text"
                class="back-btn aux-back-btn"
                @click="activeView = 'form'"
              >
                Volver al formulario
              </v-btn>
            </div>
          </div>

          <!-- ========================= -->
          <!-- VISTA 3: MÁS INFORMACIÓN  -->
          <!-- ========================= -->
          <div v-else class="aux-view aux-view--info">
            <div class="aux-header">
              <h3 class="aux-title">Solar Green · Grupo Alade</h3>
              <p class="aux-subtitle">
                Conocé más sobre nuestras soluciones solares integrales,
                financiamiento y casos reales de clientes que ya están
                generando su propia energía limpia.
              </p>
            </div>

            <ul class="info-list">
              <li>Proyectos llave en mano residenciales, comerciales y agro.</li>
              <li>Equipos certificados y primeras marcas internacionales.</li>
              <li>Acompañamiento técnico desde el diseño hasta la puesta en marcha.</li>
              <li>Opciones de financiamiento y beneficios impositivos vigentes.</li>
            </ul>

            <div class="aux-actions">
              <v-btn
                class="submit-btn"
                color="primary"
                variant="flat"
                @click="goToSolarGreen"
              >
                Ir a Solar Green Alade
              </v-btn>

              <v-btn
                variant="text"
                class="back-btn aux-back-btn"
                @click="activeView = 'form'"
              >
                Volver al simulador
              </v-btn>
            </div>
          </div>
        </v-card>
      </div>
    </v-container>

    <!-- MODAL DE ÉXITO -->
    <v-dialog
      v-model="showSuccess"
      max-width="430"
      persistent
      transition="scale-transition"
    >
      <v-card class="success-card">
        <div class="success-icon-wrap">
          <v-icon size="40" class="success-icon">mdi-check-circle</v-icon>
        </div>
        <h3 class="success-title">
          ¡Gracias{{ form.fullName ? `, ${form.fullName}` : '' }}!
        </h3>

        <p class="success-copy">
          Recibimos tu solicitud de cotización. Un asesor de Grupo Alade se va a
          contactar al
          <strong>{{ form.phone || 'teléfono que nos indicaste' }}</strong>
          <span v-if="form.email">
            y al correo <strong>{{ form.email }}</strong>
          </span>
          en las próximas horas hábiles.
        </p>

        <div class="success-summary">
          <div class="success-row">
            <span class="success-label">Ubicación</span>
            <span class="success-value">{{ summaryLocation }}</span>
          </div>
          <div class="success-row">
            <span class="success-label">Uso del sistema</span>
            <span class="success-value">{{ summaryUsage }}</span>
          </div>
          <div class="success-row">
            <span class="success-label">Factura actual</span>
            <span class="success-value">{{ summaryBill }}</span>
          </div>
          <div class="success-row">
            <span class="success-label">Tamaño estimado</span>
            <span class="success-value">{{ summarySystemSize }}</span>
          </div>
        </div>

        <p class="success-footnote">
          Podés cerrar esta ventana, no necesitás hacer nada más.
        </p>

        <!-- ACCIONES DEL MODAL - EN COLUMNA PARA QUE NO SE ROMPAN -->
        <div class="success-actions">
          <v-btn
            class="submit-btn"
            color="primary"
            variant="flat"
            @click="resetFlow"
          >
            Hacer otra simulación
          </v-btn>

          <v-btn
            variant="outlined"
            class="success-secondary-btn"
            @click="openConsumptionCalc"
          >
            Realizar cálculo de consumo
          </v-btn>

          <v-btn
            variant="text"
            class="success-link-btn"
            @click="goToSolarGreen"
          >
            Ir a Solar Green Alade
          </v-btn>

          <v-btn variant="text" class="success-link-btn" @click="closeOnly">
            Cerrar
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { postLead } from './service/apiClient'
import {
  estimateMonthlyKwh,
  estimateSystemSizeKw,
  estimatePanels,
  estimateYearlyKwh,
  estimateYearlySavingsArs,
} from './service/solarMath'

const step = ref(1)
const totalSteps = 4
const formRef = ref(null)
const isSubmitting = ref(false)
const errorMessage = ref('')
const showSuccess = ref(false)
const lastLead = ref(null)

// VISTA ACTIVA: 'form' | 'calc' | 'info'
const activeView = ref('form')

// URL de Solar Green (podés sobreescribirla desde el sitio si querés)
const solarGreenUrl =
  typeof window !== 'undefined' && window.SOLAR_GREEN_URL
    ? window.SOLAR_GREEN_URL
    : 'https://grupoalade.com.ar/solar-green'

const createInitialForm = () => ({
  city: '',
  province: null,
  country: 'AR',
  purpose: null,
  usage: null,
  currentBill: null,
  fullName: '',
  phone: '',
  email: '',
})

const form = reactive(createInitialForm())

// =======================
//   OPCIONES DE SELECTS
// =======================

const provinces = [
  { value: 'BA', label: 'Buenos Aires' },
  { value: 'CABA', label: 'CABA' },
  { value: 'SJ', label: 'San Juan' },
  { value: 'SL', label: 'San Luis' },
  { value: 'MZA', label: 'Mendoza' },
  { value: 'CB', label: 'Córdoba' },
]

const countries = [{ value: 'AR', label: 'Argentina' }]

const purposes = [
  { value: '1', label: '1 - Para bajar la huella de carbono.', driver: 'sustentabilidad' },
  { value: '2', label: '2 - Para generar un ahorro en la factura eléctrica.', driver: 'ahorro' },
  { value: '3', label: '3 - Para tener autonomía en caso de cortes de servicio.', driver: 'autonomia' },
  { value: '4', label: '4 - Para tener energía donde no llega la red.', driver: 'offgrid' },
  { value: '5', label: '5 - Para un motor home.', driver: 'movil' },
  { value: '6', label: '6 - Bombeo solar para campos.', driver: 'bombeo' },
  { value: '7', label: '7 - Opciones 1, 2, 3 y 4.', driver: 'mixto' },
]

const usages = [
  { value: 'home',     label: 'Mi casa',                               segment: 'Residencial' },
  { value: 'commerce', label: 'Mi comercio',                           segment: 'Comercial' },
  { value: 'company',  label: 'Mi empresa',                            segment: 'Comercial' },
  { value: 'weekend',  label: 'Mi casa de fin de semana o veraneo',    segment: 'Residencial' },
  { value: 'agro',     label: 'Para establecimientos agrícolas',       segment: 'Agro / Rural' },
  { value: 'other',    label: 'Otros',                                 segment: 'Otros' },
]

const purposeMap = computed(() =>
  Object.fromEntries(purposes.map(p => [p.value, p])),
)
const usageMap = computed(() =>
  Object.fromEntries(usages.map(u => [u.value, u])),
)

// =======================
//   VALIDACIONES
// =======================

const rules = {
  required: v => !!v || 'Campo obligatorio',
  requiredNumber: v =>
    (v !== null && v !== '' && !isNaN(Number(v))) || 'Ingresá un valor numérico',
  email: v => !v || /.+@.+\..+/.test(v) || 'Email inválido',
}

// =======================
//   NAVEGACIÓN DE PASOS
// =======================

const goNext = async () => {
  errorMessage.value = ''
  if (!formRef.value) return
  const { valid } = await formRef.value.validate()
  if (valid && step.value < totalSteps) {
    step.value++
    formRef.value.resetValidation()
  }
}

const goPrev = () => {
  errorMessage.value = ''
  if (step.value > 1) {
    step.value--
    formRef.value?.resetValidation()
  }
}

// =======================
//   LÓGICA DE PRIORIDAD / CRM
// =======================

function estimatePriority(purposeValue, monthlyBill) {
  const bill = Number(monthlyBill) || 0
  const driver = purposeMap.value[purposeValue]?.driver

  if (bill > 60000 || driver === 'mixto') return 'Muy alta'
  if (bill > 30000 || driver === 'ahorro' || driver === 'autonomia') return 'Alta'
  if (driver === 'bombeo' || driver === 'offgrid') return 'Proyecto específico'
  if (driver === 'sustentabilidad') return 'Media'
  return 'A evaluar'
}

function mapPropertyType(usageValue) {
  switch (usageValue) {
    case 'home':
      return 'Hogar'
    case 'weekend':
      return 'Hogar fin de semana'
    case 'commerce':
    case 'company':
      return 'Comercial / Empresa'
    case 'agro':
      return 'Campo / Agro'
    case 'other':
    default:
      return 'Otros'
  }
}

function mapCrmScore(priorityLabel) {
  const k = String(priorityLabel || '').toLowerCase()
  if (k.includes('muy alta')) return 90
  if (k.includes('alta')) return 75
  if (k.includes('proyecto')) return 65
  if (k.includes('media')) return 50
  return 40
}

function buildCrmTags(usage, purpose, segment) {
  const tags = ['web', 'simulador-solar']
  if (usage?.value) tags.push(`uso:${usage.value}`)
  if (segment) tags.push(`segmento:${segment}`)
  if (purpose?.driver) tags.push(`driver:${purpose.driver}`)
  return tags.join(', ')
}

// =======================
//   ARMADO DEL PAYLOAD
// =======================

function buildLeadPayload() {
  const province = provinces.find(p => p.value === form.province) || null
  const country = countries.find(c => c.value === form.country) || null
  const purpose = purposeMap.value[form.purpose] || null
  const usage = usageMap.value[form.usage] || null

  const monthlyBillNumber = form.currentBill ? Number(form.currentBill) : null

  // Cálculos energéticos
  const monthlyKwh = estimateMonthlyKwh(monthlyBillNumber)
  const systemSizeKw = estimateSystemSizeKw(monthlyKwh)
  const priority = estimatePriority(form.purpose, form.currentBill)

  const panels = estimatePanels(systemSizeKw)
  const yearlyKwh = estimateYearlyKwh(monthlyKwh)
  const yearlySavings = estimateYearlySavingsArs(monthlyBillNumber)
  const propertyType = mapPropertyType(form.usage)

  // CRM básico
  const crmStatus = 'nuevo'
  const crmScore = mapCrmScore(priority)
  const tags = buildCrmTags(usage, purpose, usage?.segment)

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
      propertyType,

      monthlyBillArs: monthlyBillNumber,
      estimatedMonthlyKwh: monthlyKwh,
      estimatedSystemSizeKw: systemSizeKw,
      priority,

      estimatedPanels: panels,
      estimatedInverterKw: systemSizeKw ? Number(systemSizeKw.toFixed(1)) : null,
      estimatedYearlyKwh: yearlyKwh,
      estimatedYearlySavingsArs: yearlySavings,
      paybackYears: null, // lo podemos calcular mejor más adelante
    },
    contact: {
      fullName: form.fullName,
      phone: form.phone,
      email: form.email,
    },
    crm: {
      crmStatus,
      crmScore,
      assignedTo: null,
      lastContactAt: null,
      nextActionAt: null,
      nextActionType: null,
      internalNotes: null,
      tags,
    },
    meta: {
      createdAt: new Date().toISOString(),
      sourceUrl: typeof window !== 'undefined' ? window.location.href : null,
      sourceTag: 'web-grupoalade-simulador-solar',
    },
  }
}

// =======================
//   ENVÍO
// =======================

const handleSubmit = async () => {
  errorMessage.value = ''

  if (!formRef.value) return
  const { valid } = await formRef.value.validate()
  if (!valid) return

  const payload = buildLeadPayload()
  isSubmitting.value = true

  try {
    const data = await postLead(payload)

    if (!data.ok) {
      console.error('[solar-calculator] Respuesta backend no OK:', data)
      errorMessage.value =
        'No pudimos registrar tu solicitud, contactanos por los canales habituales.'
      return
    }

    console.log('[solar-calculator] Lead generado', data)

    // evento para integraciones externas
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('solar-calculator:lead', {
          detail: data.lead || payload,
        }),
      )
    }

    lastLead.value = data.lead || payload
    showSuccess.value = true
  } catch (err) {
    console.error('[solar-calculator] Error al enviar lead:', err)
    errorMessage.value =
      'No pudimos conectar con el servidor. Verificá tu conexión e intentá de nuevo.'
  } finally {
    isSubmitting.value = false
  }
}

// =======================
//   RESÚMENES PARA MODAL
// =======================

const summaryLocation = computed(() => {
  const province = provinces.find(p => p.value === form.province)
  const country = countries.find(c => c.value === form.country)
  const parts = [form.city, province?.label, country?.label].filter(Boolean)
  return parts.length ? parts.join(', ') : 'Sin datos'
})

const summaryUsage = computed(() => {
  const usage = usageMap.value[form.usage]
  const purpose = purposeMap.value[form.purpose]
  if (!usage && !purpose) return 'Sin datos'
  if (usage && purpose) return `${usage.label} · ${purpose.label}`
  return (usage?.label || purpose?.label) ?? 'Sin datos'
})

const summaryBill = computed(() => {
  if (!form.currentBill) return 'Sin dato'
  const n = Number(form.currentBill)
  return `Aprox. $${n.toLocaleString('es-AR')} / mes`
})

// Para vista previa y resumen del formulario
const previewKwh = computed(() => estimateMonthlyKwh(form.currentBill))
const previewSystemSize = computed(() =>
  estimateSystemSizeKw(previewKwh.value),
)

const summarySystemSize = computed(() => {
  if (!previewSystemSize.value || !previewKwh.value) {
    return 'A estimar con más detalle'
  }
  return `${previewSystemSize.value} kWp (≈ ${previewKwh.value} kWh/mes)`
})

// =======================
//   CALCULADORA RÁPIDA
// =======================

const calcBill = ref(null)

const calcMonthlyKwh = computed(() => {
  if (!calcBill.value) return null
  return estimateMonthlyKwh(Number(calcBill.value))
})

const calcSystemSize = computed(() => {
  if (!calcMonthlyKwh.value) return null
  return estimateSystemSizeKw(calcMonthlyKwh.value)
})

const calcPanels = computed(() => {
  if (!calcSystemSize.value) return null
  return estimatePanels(calcSystemSize.value)
})

const calcYearlyKwh = computed(() => {
  if (!calcMonthlyKwh.value) return null
  return estimateYearlyKwh(calcMonthlyKwh.value)
})

const calcYearlySavings = computed(() => {
  if (!calcBill.value) return null
  return estimateYearlySavingsArs(Number(calcBill.value))
})

const hasCalcData = computed(
  () => !!(calcMonthlyKwh.value && calcSystemSize.value),
)

const goToFormFromCalc = () => {
  if (calcBill.value) {
    form.currentBill = calcBill.value
    // si vuelvo al form, lo dejo en el paso 3 para que ya vea el monto
    step.value = Math.max(step.value, 3)
  }
  activeView.value = 'form'
}

// =======================
//   RESET / MODAL / ACCIONES EXTRA
// =======================

const closeOnly = () => {
  showSuccess.value = false
}

const resetFlow = () => {
  showSuccess.value = false
  Object.assign(form, createInitialForm())
  step.value = 1
  errorMessage.value = ''
  lastLead.value = null
  formRef.value?.resetValidation()
  activeView.value = 'form'
}

// desde el modal, pasar directo a la vista de cálculo
const openConsumptionCalc = () => {
  showSuccess.value = false
  activeView.value = 'calc'

  // disparamos un evento por si WP quiere enganchar algo
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('solar-calculator:open-consumption-calc', {
        detail: lastLead.value || null,
      }),
    )
  }
}

const goToSolarGreen = () => {
  // vista info interna
  activeView.value = 'info'

  if (typeof window !== 'undefined') {
    // evento para integraciones
    window.dispatchEvent(
      new CustomEvent('solar-calculator:open-solar-green', {
        detail: lastLead.value || null,
      }),
    )

    // fallback: abrir la landing en otra pestaña
    if (solarGreenUrl) {
      window.open(solarGreenUrl, '_blank')
    }
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
  padding: 6px 8px;
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

/* BOTÓN principal más chico */
.submit-btn {
  min-width: 140px;
  font-weight: 600;
  color: #ffffff;
  text-transform: none;
}

.error-message {
  margin-top: 10px;
  font-size: 0.8rem;
  color: #c62828;
}

/* VISTAS AUXILIARES (calc / info) */
.aux-view {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.aux-header {
  margin-bottom: 4px;
}

.aux-title {
  margin: 0 0 4px;
  font-size: 1rem;
  font-weight: 700;
  color: #1a5934;
}

.aux-subtitle {
  margin: 0;
  font-size: 0.83rem;
  color: #4f4f4f;
}

.calc-summary {
  margin-top: 4px;
  padding: 8px 10px;
  border-radius: 12px;
  background: #f5fbf7;
  border: 1px solid rgba(42, 124, 65, 0.16);
  font-size: 0.8rem;
}

.calc-row {
  display: flex;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 4px;
}

.calc-row:last-child {
  margin-bottom: 0;
}

.calc-label {
  color: #1a5934;
  font-weight: 600;
}

.calc-value {
  text-align: right;
  color: #333;
}

.aux-actions {
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.aux-back-btn {
  align-self: flex-start;
  padding-left: 0;
  text-transform: none;
}

.info-list {
  margin: 4px 0 0;
  padding-left: 18px;
  font-size: 0.8rem;
  color: #444;
}

.info-list li {
  margin-bottom: 4px;
}

/* MODAL ÉXITO */
.success-card {
  padding: 18px 18px 16px;
  border-radius: 16px;
}

.success-icon-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 6px;
}

.success-icon {
  color: #2a7c41;
  animation: pop-in 0.45s ease-out;
}

@keyframes pop-in {
  0% {
    transform: scale(0.4);
    opacity: 0;
  }
  60% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.success-title {
  margin: 4px 0 6px;
  font-size: 1.12rem;
  font-weight: 800;
  text-align: center;
  color: #1a5934;
}

.success-copy {
  margin: 0 auto 12px;
  font-size: 0.84rem;
  color: #444;
  text-align: center;
}

.success-summary {
  margin: 0 auto 10px;
  padding: 8px 10px;
  border-radius: 12px;
  background: #f5fbf7;
  border: 1px solid rgba(42, 124, 65, 0.16);
  font-size: 0.78rem;
}

.success-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 4px;
}

.success-row:last-child {
  margin-bottom: 0;
}

.success-label {
  font-weight: 600;
  color: #1a5934;
}

.success-value {
  text-align: right;
  color: #333;
}

.success-footnote {
  margin: 4px 0 8px;
  font-size: 0.75rem;
  color: #666;
  text-align: center;
}

/* Acciones del modal en columna para que no se deformen */
.success-actions {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 6px;
  margin-top: 8px;
}

.success-actions .v-btn {
  width: 100%;
  justify-content: center;
}

.success-secondary-btn {
  text-transform: none;
}

.success-link-btn {
  text-transform: none;
  font-size: 0.78rem;
  color: #1a5934;
}

/* TABLET */
@media (max-width: 960px) {
  .form-wrapper {
    padding: 12px;
  }

  .form-card {
    max-width: 520px;
    width: 100%;
  }
}

/* MOBILE */
@media (max-width: 600px) {
  .form-wrapper {
    padding: 10px;
  }

  .form-card {
    max-width: 100%;
    width: 100%;
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

  .form-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .submit-btn {
    width: 100%;
    min-width: 0;
    justify-content: center;
  }

  .back-btn {
    align-self: flex-start;
    padding-left: 0;
  }

  .success-card {
    padding: 16px 14px 14px;
  }

  .success-summary {
    font-size: 0.74rem;
  }
}
</style>

<!-- Estilos globales para blindar contra Elementor -->
<style>
/* Caja del simulador: fondo transparente */
#solar-calculator .solar-app,
#solar-calculator .solar-app .v-application__wrap,
#solar-calculator .solar-app .v-main,
#solar-calculator .solar-app .v-container {
  background: transparent !important;
  box-shadow: none;
}

/* Evitar que Elementor cambie box-sizing */
#solar-calculator *,
#solar-calculator *::before,
#solar-calculator *::after {
  box-sizing: border-box;
}

/* BOTONES VUETIFY: tamaño y padding moderado */
#solar-calculator .v-btn,
#solar-calculator .v-btn:link,
#solar-calculator .v-btn:visited {
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  padding: 8px 22px !important;
  min-height: 38px !important;
  height: auto !important;
  border-radius: 999px !important;
  text-decoration: none !important;
  text-transform: none !important;
  letter-spacing: 0 !important;
  font-weight: 600 !important;
  font-size: 0.9rem !important;
}

#solar-calculator .v-btn__content {
  text-decoration: none !important;
  text-transform: none !important;
  line-height: 1.1 !important;
}

/* Por si Elementor toca cualquier <button> genérico */
#solar-calculator button {
  text-decoration: none !important;
  text-transform: none !important;
}

/* Inputs / selects Vuetify */
#solar-calculator .v-field,
#solar-calculator .v-input,
#solar-calculator .v-text-field,
#solar-calculator .v-select {
  font-family: inherit;
  text-transform: none;
}

#solar-calculator .v-field__input,
#solar-calculator .v-text-field input,
#solar-calculator .v-select input {
  font-size: 0.95rem;
  line-height: 1.3;
}

/* Mensajes de error */
#solar-calculator .v-messages__message {
  font-size: 0.75rem;
  text-transform: none;
}

/* Limpiar sombras/bordes heredados */
#solar-calculator button,
#solar-calculator input,
#solar-calculator select,
#solar-calculator textarea {
  box-shadow: none;
}

/* Ajuste del dialog en mobile */
@media (max-width: 600px) {
  #solar-calculator .v-overlay__content {
    margin: 0 10px !important;
  }
}
</style>
