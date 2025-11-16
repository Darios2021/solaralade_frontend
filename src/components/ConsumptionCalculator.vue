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
import { postLead } from '../service/apiClient'
import {
  estimateMonthlyKwh,
  estimateSystemSizeKw,
  estimatePanels,
  estimateYearlyKwh,
  estimateYearlySavingsArs,
} from '../service/solarMath'

// Normaliza "20.000", "40,000", "50000" => número
function parseMoney(value) {
  if (value === null || value === undefined) return null
  const cleaned = String(value).replace(/\./g, '').replace(/,/g, '').trim()
  if (!cleaned) return null
  const n = Number(cleaned)
  return Number.isNaN(n) ? null : n
}

const formRef = ref(null)
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const hasSubmitted = ref(false)

const createInitialForm = () => ({
  fullName: '',
  phone: '',
  email: '',
  usage: null,
  currentBill: null,
})

const form = reactive(createInitialForm())

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

const rules = {
  required: v => !!v || 'Campo obligatorio',
  requiredNumber: v => {
    const n = parseMoney(v)
    return (n !== null && !Number.isNaN(n)) || 'Ingresá un valor numérico'
  },
  email: v => !v || /.+@.+\..+/.test(v) || 'Email inválido',
}

/* === CÁLCULOS EN VIVO === */

const billNumber = computed(() => parseMoney(form.currentBill))

const monthlyKwh = computed(() => {
  if (!billNumber.value) return null
  return estimateMonthlyKwh(billNumber.value)
})

const systemSizeKw = computed(() => {
  if (!monthlyKwh.value) return null
  return estimateSystemSizeKw(monthlyKwh.value)
})

const panels = computed(() => {
  if (!systemSizeKw.value) return null
  return estimatePanels(systemSizeKw.value)
})

const yearlyKwh = computed(() => {
  if (!monthlyKwh.value) return null
  return estimateYearlyKwh(monthlyKwh.value)
})

const yearlySavings = computed(() => {
  if (!billNumber.value) return null
  return estimateYearlySavingsArs(billNumber.value)
})

// Ahorro mensual aproximado = factura actual
const monthlySavings = computed(() => {
  if (!billNumber.value) return null
  return billNumber.value
})

const canShowResults = computed(() => {
  return (
    !!form.fullName &&
    !!form.phone &&
    !!form.email &&
    !!form.usage &&
    !!form.currentBill &&
    !!monthlyKwh.value &&
    !!systemSizeKw.value
  )
})

/* === ENVÍO A CRM === */

function buildLeadPayload() {
  const usage = usageMap.value[form.usage] || null

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
      usageCode: usage ? usage.value : null,
      usageLabel: usage ? usage.label : null,
      segment: usage ? usage.segment : null,
      propertyType: usage ? usage.segment : null,

      monthlyBillArs: billNumber.value,
      estimatedMonthlyKwh: monthlyKwh.value || null,
      estimatedSystemSizeKw: systemSizeKw.value || null,
      priority: 'A evaluar',

      estimatedPanels: panels.value || null,
      estimatedInverterKw: systemSizeKw.value
        ? Number(systemSizeKw.value.toFixed(1))
        : null,
      estimatedYearlyKwh: yearlyKwh.value || null,
      estimatedYearlySavingsArs: yearlySavings.value || null,
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
      assignedTo: null,
      lastContactAt: null,
      nextActionAt: null,
      nextActionType: null,
      internalNotes: 'Lead originado en calculadora de consumo',
      tags: 'web,simulador-consumo',
    },
    meta: {
      createdAt: new Date().toISOString(),
      sourceUrl: typeof window !== 'undefined' ? window.location.href : null,
      sourceTag: 'web-grupoalade-simulador-consumo',
    },
  }
}

const handleSubmit = async () => {
  if (hasSubmitted.value) return

  errorMessage.value = ''
  successMessage.value = ''

  if (!formRef.value) return
  const { valid } = await formRef.value.validate()
  if (!valid) {
    errorMessage.value = 'Revisá los datos marcados antes de continuar.'
    return
  }

  if (!canShowResults.value) {
    errorMessage.value =
      'Necesitamos todos los datos para poder calcular tu ahorro estimado.'
    return
  }

  const payload = buildLeadPayload()
  isSubmitting.value = true
  console.log('[solar-calculator] Enviando lead desde calculadora:', payload)

  try {
    const data = await postLead(payload)

    if (!data.ok) {
      console.error('[solar-calculator] Respuesta backend no OK:', data)
      errorMessage.value =
        'No pudimos registrar tu solicitud. Probá nuevamente o contactanos por los canales habituales.'
      return
    }

    console.log('[solar-calculator] Lead calculadora OK:', data)

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('solar-calculator:lead', {
          detail: data.lead || payload,
        }),
      )
    }

    successMessage.value =
      'Listo, registramos tu simulación. Un asesor de Grupo Alade te va a contactar con más detalles.'
    hasSubmitted.value = true
  } catch (err) {
    console.error('[solar-calculator] Error al enviar lead:', err)
    errorMessage.value =
      'No pudimos conectar con el servidor. Verificá tu conexión e intentá de nuevo.'
  } finally {
    isSubmitting.value = false
  }
}

/* === COMPROBANTE PDF (ventana imprimible) === */

const downloadReceiptPdf = () => {
  if (!canShowResults.value || typeof window === 'undefined') return

  const usoObj = usageMap.value[form.usage]
  const usoLabel = usoObj ? usoObj.label : 'Sin especificar'
  const nowStr = new Date().toLocaleString('es-AR')

  // Filas opcionales
  let extraRows = ''

  if (yearlyKwh.value) {
    extraRows +=
      '<div class="row">' +
      '<span class="label">Energía anual estimada</span>' +
      '<span class="value">' +
      yearlyKwh.value.toLocaleString('es-AR') +
      ' kWh/año</span>' +
      '</div>'
  }

  if (monthlySavings.value) {
    extraRows +=
      '<div class="row">' +
      '<span class="label">Ahorro mensual estimado</span>' +
      '<span class="value">$' +
      monthlySavings.value.toLocaleString('es-AR') +
      '</span>' +
      '</div>'
  }

  if (yearlySavings.value) {
    extraRows +=
      '<div class="row">' +
      '<span class="label">Ahorro anual estimado</span>' +
      '<span class="value">$' +
      yearlySavings.value.toLocaleString('es-AR') +
      '</span>' +
      '</div>'
  }

  const panelTxt = panels.value
    ? systemSizeKw.value + ' kWp · ' + panels.value + ' paneles'
    : systemSizeKw.value + ' kWp'

  // HTML armado con concatenación clásica (sin backticks)
  let html = ''

  html += '<!doctype html>'
  html += '<html lang="es">'
  html += '<head>'
  html += '<meta charset="utf-8" />'
  html += '<title>Comprobante de simulación - Grupo Alade</title>'
  html +=
    '<style>' +
    'body{font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;margin:24px;color:#222;}' +
    '.box{max-width:700px;margin:0 auto;padding:24px 28px;border-radius:14px;border:1px solid #d4e3d9;background:#fff;}' +
    'h1{font-size:20px;margin:0 0 6px;color:#1a5934;}' +
    'h2{font-size:15px;margin:16px 0 6px;color:#1a5934;}' +
    'p{font-size:13px;margin:3px 0;}' +
    '.row{display:flex;justify-content:space-between;gap:12px;font-size:13px;margin:3px 0;}' +
    '.label{font-weight:600;color:#1a5934;}' +
    '.value{text-align:right;}' +
    '.foot{margin-top:14px;font-size:11px;color:#666;}' +
    'hr{border:none;border-top:1px dashed #c5d7c9;margin:10px 0 8px;}' +
    '</style>'
  html += '</head>'
  html += '<body>'
  html += '<div class="box">'
  html += '<h1>Simulación solar - Grupo Alade</h1>'
  html +=
    '<p>Comprobante de simulación generado el ' + nowStr + '</p>'

  html += '<h2>Datos de contacto</h2>'
  html +=
    '<div class="row"><span class="label">Nombre</span><span class="value">' +
    form.fullName +
    '</span></div>'
  html +=
    '<div class="row"><span class="label">Teléfono</span><span class="value">' +
    form.phone +
    '</span></div>'
  html +=
    '<div class="row"><span class="label">Email</span><span class="value">' +
    form.email +
    '</span></div>'
  html +=
    '<div class="row"><span class="label">Uso declarado</span><span class="value">' +
    usoLabel +
    '</span></div>'

  html += '<h2>Datos de consumo</h2>'
  html +=
    '<div class="row"><span class="label">Factura mensual informada</span><span class="value">$' +
    billNumber.value.toLocaleString('es-AR') +
    '</span></div>'
  html +=
    '<div class="row"><span class="label">Consumo estimado</span><span class="value">' +
    monthlyKwh.value.toLocaleString('es-AR') +
    ' kWh/mes</span></div>'
  html +=
    '<div class="row"><span class="label">Tamaño sugerido del sistema</span><span class="value">' +
    panelTxt +
    '</span></div>'

  html += extraRows

  html += '<hr />'
  html +=
    '<p class="foot">Este comprobante es una estimación inicial. El diseño definitivo del sistema y la propuesta económica pueden variar según la evaluación técnica del lugar, la calidad de la red eléctrica y otras condiciones.</p>'
  html += '</div>'
  html +=
    '<script>window.onload=function(){window.print();};</' +
    'script>'
  html += '</body></html>'

  const win = window.open('', '_blank')
  if (!win) return
  win.document.open()
  win.document.write(html)
  win.document.close()
}


/* === RESET DEL FLUJO === */

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
  min-height: 30px;
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
