<template>
  <div class="calc-view">
    <!-- CABECERA -->
    <div class="aux-header">
      <h3 class="aux-title">Tu cálculo de consumo estimado</h3>
      <p class="aux-subtitle">
        Estos valores se calculan a partir de los datos que nos compartiste en el
        formulario. Nos sirven para diseñar una propuesta técnica y económica
        ajustada a tu caso.
      </p>
    </div>

    <!-- SI NO HAY LEAD TODAVÍA -->
    <div v-if="!hasLead" class="calc-empty">
      <p>
        Para ver tu cálculo de consumo estimado primero necesitamos que completes
        y envíes el formulario de simulador.
      </p>
      <v-btn
        class="submit-btn"
        color="primary"
        variant="flat"
        @click="emit('open-form')"
      >
        Completar formulario
      </v-btn>
    </div>

    <!-- RESULTADOS -->
    <div v-else class="calc-results">
      <div class="calc-summary">
        <div class="calc-row">
          <span class="calc-label">Ubicación</span>
          <span class="calc-value">{{ locationSummary }}</span>
        </div>
        <div class="calc-row">
          <span class="calc-label">Uso del sistema</span>
          <span class="calc-value">{{ usageSummary }}</span>
        </div>
        <div class="calc-row">
          <span class="calc-label">Factura actual</span>
          <span class="calc-value">
            {{ billDisplay }}
          </span>
        </div>
        <div class="calc-row">
          <span class="calc-label">Consumo estimado</span>
          <span class="calc-value">
            {{ monthlyKwhDisplay }}
          </span>
        </div>
        <div class="calc-row">
          <span class="calc-label">Tamaño sugerido del sistema</span>
          <span class="calc-value">
            {{ systemSizeDisplay }}
          </span>
        </div>
        <div class="calc-row" v-if="panels">
          <span class="calc-label">Cantidad estimada de paneles</span>
          <span class="calc-value">
            ≈ {{ panels }}
          </span>
        </div>
        <div class="calc-row" v-if="yearlyKwh">
          <span class="calc-label">Energía generada por año</span>
          <span class="calc-value">
            ≈ {{ yearlyKwh.toLocaleString('es-AR') }} kWh/año
          </span>
        </div>
        <div class="calc-row" v-if="yearlySavings">
          <span class="calc-label">Ahorro estimado anual</span>
          <span class="calc-value">
            ≈ ${{ yearlySavings.toLocaleString('es-AR') }}
          </span>
        </div>
        <div class="calc-row" v-if="priority">
          <span class="calc-label">Prioridad del proyecto</span>
          <span class="calc-value">
            {{ priority }}
          </span>
        </div>
      </div>

      <p class="calc-footnote">
        Estos valores son estimados y pueden variar según tu perfil de consumo,
        orientación del techo, tipo de estructura y condiciones del lugar.
        En el contacto posterior afinamos el diseño del sistema.
      </p>

      <div class="aux-actions">
        <v-btn
          class="submit-btn"
          color="primary"
          variant="flat"
          @click="emit('open-form')"
        >
          Actualizar mis datos
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  defineEmits,
} from 'vue'

const emit = defineEmits(['open-form'])

const hasLead = ref(false)
const lastLead = ref(null)

const bill = ref(null)
const monthlyKwh = ref(null)
const systemSizeKw = ref(null)
const panels = ref(null)
const yearlyKwh = ref(null)
const yearlySavings = ref(null)
const priority = ref(null)

const locationSummary = ref('Sin datos')
const usageSummary = ref('Sin datos')

function handleLeadEvent(evt) {
  const lead = evt.detail || {}
  lastLead.value = lead
  hasLead.value = true

  const loc = lead.location || {}
  const proj = lead.project || {}
  const crm = lead.crm || {}

  // Ubicación
  const locParts = [
    loc.city,
    loc.provinceName,
    loc.countryName,
  ].filter(Boolean)
  locationSummary.value = locParts.length ? locParts.join(', ') : 'Sin datos'

  // Uso / motivo
  const usageParts = [
    proj.usageLabel,
    proj.purposeLabel,
  ].filter(Boolean)
  usageSummary.value = usageParts.length
    ? usageParts.join(' · ')
    : 'Sin datos'

  bill.value = proj.monthlyBillArs || null
  monthlyKwh.value = proj.estimatedMonthlyKwh || null
  systemSizeKw.value = proj.estimatedSystemSizeKw || null
  panels.value = proj.estimatedPanels || null
  yearlyKwh.value = proj.estimatedYearlyKwh || null
  yearlySavings.value = proj.estimatedYearlySavingsArs || null
  priority.value = proj.priority || crm.priorityLabel || null

  console.log('[solar-calculator] Calculadora recibió lead:', lead)
}

onMounted(() => {
  if (typeof window === 'undefined') return
  window.addEventListener('solar-calculator:lead', handleLeadEvent)
})

onBeforeUnmount(() => {
  if (typeof window === 'undefined') return
  window.removeEventListener('solar-calculator:lead', handleLeadEvent)
})

const billDisplay = computed(() => {
  if (!bill.value) return 'Sin dato'
  return `Aprox. $${Number(bill.value).toLocaleString('es-AR')} / mes`
})

const monthlyKwhDisplay = computed(() => {
  if (!monthlyKwh.value) return 'A estimar'
  return `≈ ${monthlyKwh.value.toLocaleString('es-AR')} kWh/mes`
})

const systemSizeDisplay = computed(() => {
  if (!systemSizeKw.value) return 'A estimar'
  return `≈ ${systemSizeKw.value} kWp`
})
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

/* Sin lead aún */
.calc-empty {
  border-radius: 12px;
  background: #f9faf9;
  border: 1px dashed rgba(42, 124, 65, 0.45);
  padding: 12px 12px 10px;
  font-size: 0.85rem;
  color: #444;
}

.calc-empty p {
  margin: 0 0 8px;
}

/* Resultados */
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

.calc-footnote {
  margin: 6px 0 0;
  font-size: 0.78rem;
  color: #666;
}

.aux-actions {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.submit-btn {
  font-weight: 600;
  text-transform: none;
}
</style>
