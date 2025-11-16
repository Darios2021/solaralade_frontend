<template>
  <div class="calc-view">
    <!-- CABECERA -->
    <div class="aux-header">
      <h3 class="aux-title">Calculá tu consumo y tu ahorro</h3>
      <p class="aux-subtitle">
        Completá tus datos y el valor aproximado de tu factura de luz. Te mostramos
        una estimación de consumo, tamaño de sistema solar y cuánto podrías ahorrar.
      </p>
    </div>

    <v-form ref="formRef" class="calc-form">
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
          type="number"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          :rules="[rules.requiredNumber]"
        />
      </div>

      <!-- BLOQUE DE RESULTADOS -->
      <div class="calc-summary-wrapper">
        <div class="calc-summary" v-if="canShowResults">
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
          :disabled="isSubmitting"
          @click="handleSubmit"
        >
          Ver mi ahorro y que me contacten
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

const formRef = ref(null)
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const form = reactive({
  fullName: '',
  phone: '',
  email: '',
  usage: null,
  currentBill: null,
})

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
  requiredNumber: v =>
    (v !== null && v !== '' && !isNaN(Number(v))) || 'Ingresá un valor numérico',
  email: v => !v || /.+@.+\..+/.test(v) || 'Email inválido',
}

/* CÁLCULOS EN VIVO */

const monthlyKwh = computed(() => {
  if (!form.currentBill) return null
  return estimateMonthlyKwh(Number(form.currentBill))
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
  if (!form.currentBill) return null
  return estimateYearlySavingsArs(Number(form.currentBill))
})

// Ahorro mensual aproximado: tomamos el valor de la factura actual
const monthlySavings = computed(() => {
  if (!form.currentBill) return null
  return Number(form.currentBill)
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

/* ENVÍO A CRM */

function buildLeadPayload() {
  const usage = usageMap.value[form.usage] || null
  const billNumber = form.currentBill ? Number(form.currentBill) : null

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

      monthlyBillArs: billNumber,
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

    // Evento para integraciones / analytics
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('solar-calculator:lead', {
          detail: data.lead || payload,
        }),
      )
    }

    successMessage.value =
      'Listo, registramos tu simulación. Un asesor de Grupo Alade te va a contactar con más detalles.';
  } catch (err) {
    console.error('[solar-calculator] Error al enviar lead:', err)
    errorMessage.value =
      'No pudimos conectar con el servidor. Verificá tu conexión e intentá de nuevo.'
  } finally {
    isSubmitting.value = false
  }
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
  gap: 8px;
}

.submit-btn {
  font-weight: 600;
  text-transform: none;
}

/* Responsive */
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
