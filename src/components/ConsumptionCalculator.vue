<template>
  <div class="calc-view">
    <!-- CABECERA -->
    <div class="aux-header">
      <h3 class="aux-title">Calculá tu consumo y tu ahorro</h3>
      <p class="aux-subtitle">
        Completá tus datos y el valor aproximado de tu factura de luz. Te
        mostramos una estimación de consumo, tamaño de sistema solar y cuánto
        podrías ahorrar.
      </p>
    </div>

    <v-form ref="formRef" class="calc-form">
      <!-- DATOS -->
      <div class="calc-grid">
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
          label="Factura promedio de luz (ARS)"
          type="text"
          placeholder="Ej: 20.000"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          :rules="[rules.requiredNumber]"
        />
      </div>

      <!-- RESULTADOS EN VIVO -->
      <div class="calc-summary-wrapper">
        <div v-if="canShowResults" class="calc-summary">
          <div class="calc-row">
            <span class="calc-label">Consumo estimado</span>
            <span class="calc-value">
              ≈ {{ monthlyKwh.toLocaleString('es-AR') }} kWh/mes
            </span>
          </div>
          <div class="calc-row">
            <span class="calc-label">Tamaño sugerido del sistema</span>
            <span class="calc-value">
              ≈ {{ systemSizeKw }} kWp
              <span v-if="panels"> · {{ panels }} paneles</span>
            </span>
          </div>
          <div class="calc-row" v-if="yearlyKwh">
            <span class="calc-label">Energía anual generada</span>
            <span class="calc-value">
              ≈ {{ yearlyKwh.toLocaleString('es-AR') }} kWh/año
            </span>
          </div>
          <div class="calc-row" v-if="monthlySavings">
            <span class="calc-label">Ahorro estimado mensual</span>
            <span class="calc-value">
              ≈ ${{ monthlySavings.toLocaleString('es-AR') }} / mes
            </span>
          </div>
          <div class="calc-row" v-if="yearlySavings">
            <span class="calc-label">Ahorro estimado anual</span>
            <span class="calc-value">
              ≈ ${{ yearlySavings.toLocaleString('es-AR') }} / año
            </span>
          </div>
        </div>

        <div v-else class="calc-hint">
          Completá tus datos y el monto de la factura para ver tu cálculo
          estimado de consumo y ahorro.
        </div>
      </div>

      <!-- MENSAJES -->
      <p v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </p>
      <p v-if="successMessage" class="success-message">
        {{ successMessage }}
      </p>

      <!-- ACCIONES -->
      <div class="aux-actions">
        <v-btn
          class="submit-btn"
          color="primary"
          variant="flat"
          :loading="isSubmitting"
          :disabled="isSubmitting || hasSubmitted"
          @click="handleSubmit"
        >
          {{
            hasSubmitted
              ? 'Simulación registrada'
              : 'Ver mi ahorro y que me contacten'
          }}
        </v-btn>

        <v-btn
          v-if="hasSubmitted"
          variant="outlined"
          class="secondary-btn"
          color="primary"
          @click="downloadReceiptPdf"
        >
          Descargar comprobante (PDF)
        </v-btn>

        <v-btn
          v-if="hasSubmitted"
          variant="text"
          class="secondary-btn"
          @click="resetCalcForm"
        >
          Nueva simulación
        </v-btn>
      </div>
    </v-form>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { jsPDF } from 'jspdf'
import { postLead } from '../service/apiClient'
import {
  estimateMonthlyKwh,
  estimateSystemSizeKw,
  estimatePanels,
  estimateYearlyKwh,
  estimateYearlySavingsArs,
} from '../service/solarMath'

/* ============================================
   NORMALIZAR MONTOS (20.000 → 20000)
============================================ */
function parseMoney(value) {
  if (!value) return null
  const cleaned = String(value).replace(/\./g, '').replace(/,/g, '').trim()
  const n = Number(cleaned)
  return Number.isNaN(n) ? null : n
}

/* ============================================
   FORM STATE
============================================ */
const formRef = ref(null)
const isSubmitting = ref(false)
const hasSubmitted = ref(false)

const errorMessage = ref('')
const successMessage = ref('')

const createInitialForm = () => ({
  fullName: '',
  phone: '',
  email: '',
  usage: null,
  currentBill: null,
})

const form = reactive(createInitialForm())

/* ============================================
   OPCIONES USO
============================================ */
const usages = [
  { value: 'home', label: 'Mi casa', segment: 'Residencial' },
  { value: 'commerce', label: 'Mi comercio', segment: 'Comercial' },
  { value: 'company', label: 'Mi empresa', segment: 'Comercial' },
  { value: 'weekend', label: 'Casa de fin de semana', segment: 'Residencial' },
  { value: 'agro', label: 'Establecimiento agrícola', segment: 'Agro / Rural' },
  { value: 'other', label: 'Otros', segment: 'Otros' },
]

const usageMap = computed(() =>
  Object.fromEntries(usages.map(u => [u.value, u])),
)

/* ============================================
   VALIDACIONES
============================================ */
const rules = {
  required: v => !!v || 'Campo obligatorio',
  requiredNumber: v => {
    const n = parseMoney(v)
    return (n !== null && !Number.isNaN(n)) || 'Ingresá un monto válido'
  },
  email: v => !v || /.+@.+\..+/.test(v) || 'Email inválido',
}

/* ============================================
   CÁLCULOS EN VIVO (REACTIVOS)
============================================ */
const billNumber = computed(() => parseMoney(form.currentBill))

const monthlyKwh = computed(() =>
  billNumber.value ? estimateMonthlyKwh(billNumber.value) : null,
)

const systemSizeKw = computed(() =>
  monthlyKwh.value ? estimateSystemSizeKw(monthlyKwh.value) : null,
)

const panels = computed(() =>
  systemSizeKw.value ? estimatePanels(systemSizeKw.value) : null,
)

const yearlyKwh = computed(() =>
  monthlyKwh.value ? estimateYearlyKwh(monthlyKwh.value) : null,
)

const yearlySavings = computed(() =>
  billNumber.value ? estimateYearlySavingsArs(billNumber.value) : null,
)

// ahorro mensual ~ factura actual
const monthlySavings = computed(() =>
  billNumber.value ? billNumber.value : null,
)

const canShowResults = computed(() =>
  form.fullName &&
  form.phone &&
  form.email &&
  form.usage &&
  billNumber.value &&
  systemSizeKw.value &&
  monthlyKwh.value,
)

/* ============================================
   ARMADO DEL LEAD → CRM
============================================ */
function buildLeadPayload() {
  const usage = usageMap.value[form.usage]

  return {
    location: {
      city: null,
      provinceCode: null,
      provinceName: null,
      countryCode: null,
      countryName: null,
    },
    project: {
      purposeCode: null,
      purposeLabel: null,
      purposeDriver: null,

      usageCode: usage?.value || null,
      usageLabel: usage?.label || null,
      segment: usage?.segment || null,
      propertyType: usage?.segment || null,

      monthlyBillArs: billNumber.value,
      estimatedMonthlyKwh: monthlyKwh.value,
      estimatedSystemSizeKw: systemSizeKw.value,
      priority: 'A evaluar',

      estimatedPanels: panels.value,
      estimatedInverterKw: systemSizeKw.value
        ? Number(systemSizeKw.value.toFixed(1))
        : null,
      estimatedYearlyKwh: yearlyKwh.value,
      estimatedYearlySavingsArs: yearlySavings.value,
      paybackYears: null,
    },
    contact: {
      fullName: form.fullName,
      phone: form.phone,
      email: form.email,
    },
    crm: {
      crmStatus: 'nuevo',
      crmScore: 55,
      internalNotes: 'Lead originado en calculadora de consumo',
      tags: 'web,simulador-consumo',
    },
    meta: {
      createdAt: new Date().toISOString(),
      sourceUrl: window.location.href,
      sourceTag: 'web-grupoalade-simulador-consumo',
    },
  }
}

/* ============================================
   ENVIAR LEAD
============================================ */
const handleSubmit = async () => {
  if (hasSubmitted.value) return

  errorMessage.value = ''
  successMessage.value = ''

  const { valid } = await formRef.value.validate()
  if (!valid) {
    errorMessage.value = 'Revisá los datos marcados antes de continuar.'
    return
  }

  if (!canShowResults.value) {
    errorMessage.value =
      'Completá todos los datos para poder estimar tu ahorro.'
    return
  }

  const payload = buildLeadPayload()
  isSubmitting.value = true

  try {
    const data = await postLead(payload)

    if (!data.ok) {
      errorMessage.value =
        'No pudimos registrar tu solicitud. Intentá nuevamente.'
      return
    }

    window.dispatchEvent(
      new CustomEvent('solar-calculator:lead', {
        detail: data.lead || payload,
      }),
    )

    hasSubmitted.value = true
    successMessage.value =
      'Listo, registramos tu simulación. Un asesor te va a contactar.'
  } catch (err) {
    errorMessage.value =
      'No pudimos conectar con el servidor. Intentá otra vez.'
  } finally {
    isSubmitting.value = false
  }
}

//* =============PFD==========================

const downloadReceiptPdf = () => {
  if (!canShowResults.value) return

  const usoObj = usageMap.value[form.usage]
  const usoLabel = usoObj ? usoObj.label : 'Sin especificar'
  const nowStr = new Date().toLocaleString('es-AR')

  // Colores de marca
  const brandR = 42, brandG = 124, brandB = 65      // Verde Alade
  const textR = 40, textG = 40, textB = 40          // Texto principal
  const mutedR = 120, mutedG = 120, mutedB = 120    // Nota al pie / marca

  const doc = new jsPDF()
  let y = 18

  // TÍTULO
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(brandR, brandG, brandB)
  doc.text('Simulación solar - Grupo Alade', 14, y)
  y += 7

  // Marca / URL bajo el título
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(mutedR, mutedG, mutedB)
  doc.text('Grupo Alade · www.grupoalade.com.ar', 14, y)
  y += 8

  // Fecha
  doc.setTextColor(textR, textG, textB)
  doc.setFontSize(10)
  doc.text('Generado el ' + nowStr, 14, y)
  y += 10

  // DATOS DE CONTACTO
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(brandR, brandG, brandB)
  doc.text('Datos de contacto', 14, y)
  y += 7

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(textR, textG, textB)
  doc.text('Nombre: ' + (form.fullName || '—'), 14, y); y += 5
  doc.text('Teléfono: ' + (form.phone || '—'), 14, y); y += 5
  doc.text('Email: ' + (form.email || '—'), 14, y); y += 5
  doc.text('Uso declarado: ' + usoLabel, 14, y); y += 10

  // DATOS DE CONSUMO
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(brandR, brandG, brandB)
  doc.text('Datos de consumo', 14, y)
  y += 7

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(textR, textG, textB)

  doc.text(
    'Factura: $' + billNumber.value.toLocaleString('es-AR'),
    14,
    y,
  ); y += 5

  doc.text(
    'Consumo estimado: ' +
      monthlyKwh.value.toLocaleString('es-AR') +
      ' kWh/mes',
    14,
    y,
  ); y += 5

  const panelTxt = panels.value
    ? systemSizeKw.value + ' kWp · ' + panels.value + ' paneles'
    : systemSizeKw.value + ' kWp'

  doc.text('Tamaño del sistema: ' + panelTxt, 14, y); y += 5

  doc.text(
    'Energía anual: ' +
      yearlyKwh.value.toLocaleString('es-AR') +
      ' kWh/año',
    14,
    y,
  ); y += 5

  doc.text(
    'Ahorro mensual: $' +
      monthlySavings.value.toLocaleString('es-AR'),
    14,
    y,
  ); y += 5

  doc.text(
    'Ahorro anual: $' +
      yearlySavings.value.toLocaleString('es-AR'),
    14,
    y,
  ); y += 12

  // NOTA AL PIE
  const foot =
    'Este comprobante es una estimación inicial. El diseño definitivo y la propuesta económica pueden variar según la evaluación técnica del lugar.'

  const lines = doc.splitTextToSize(foot, 180)
  doc.setFontSize(9)
  doc.setTextColor(mutedR, mutedG, mutedB)
  doc.text(lines, 14, y)

  // Descarga directa
  doc.save('simulacion-solar-grupo-alade.pdf')
}


/* ============================================
   RESET FLUJO
============================================ */
const resetCalcForm = () => {
  Object.assign(form, createInitialForm())
  formRef.value?.resetValidation()
  errorMessage.value = ''
  successMessage.value = ''
  hasSubmitted.value = false
}
</script>

<style scoped>
.calc-view {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Forzamos contra estilos de Elementor */
.aux-header {
  margin-bottom: 4px;
}

.aux-title {
  margin: 0 0 4px;
  font-size: 1.05rem !important;
  line-height: 1.3 !important;
  font-weight: 700 !important;
  color: #1a5934 !important;
}

.aux-subtitle {
  margin: 0;
  font-size: 0.85rem !important;
  line-height: 1.4 !important;
  color: #4f4f4f !important;
}

.calc-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.calc-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Bloque resultados */
.calc-summary-wrapper {
  margin-top: 4px;
}

.calc-summary {
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

.calc-hint {
  padding: 8px 10px;
  border-radius: 10px;
  background: #f9faf9;
  border: 1px dashed rgba(42, 124, 65, 0.4);
  font-size: 0.8rem;
  color: #555;
}

/* Mensajes */
.error-message {
  margin-top: 6px;
  font-size: 0.78rem;
  color: #c62828;
}

.success-message {
  margin-top: 6px;
  font-size: 0.78rem;
  color: #2a7c41;
}

/* Acciones */
.aux-actions {
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.submit-btn {
  font-weight: 600;
  text-transform: none;
  min-height: 34px;
}

.secondary-btn {
  text-transform: none;
  font-size: 0.8rem;
}

/* Responsive: dos columnas en desktop */
@media (min-width: 720px) {
  .calc-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 12px;
  }

  .calc-grid > *:nth-child(5) {
    grid-column: 1 / -1;
  }
}
</style>
