<template>
  <div class="calc-view">
    <div class="aux-header">
      <h3 class="aux-title">Calculá tu consumo estimado</h3>
      <p class="aux-subtitle">
        Ingresá el valor aproximado de tu factura mensual de luz y te mostramos
        una estimación rápida de consumo y tamaño de sistema.
      </p>
    </div>

    <v-text-field
      v-model="bill"
      label="Factura promedio de luz (ARS)"
      type="number"
      variant="outlined"
      density="comfortable"
      hide-details="auto"
    />

    <div v-if="hasData" class="calc-summary">
      <div class="calc-row">
        <span class="calc-label">Consumo estimado</span>
        <span class="calc-value">≈ {{ monthlyKwh }} kWh/mes</span>
      </div>
      <div class="calc-row">
        <span class="calc-label">Tamaño sugerido del sistema</span>
        <span class="calc-value">≈ {{ systemSize }} kWp</span>
      </div>
      <div v-if="panels" class="calc-row">
        <span class="calc-label">Cantidad de paneles</span>
        <span class="calc-value">≈ {{ panels }}</span>
      </div>
      <div v-if="yearlyKwh" class="calc-row">
        <span class="calc-label">Energía anual estimada</span>
        <span class="calc-value">≈ {{ yearlyKwh }} kWh/año</span>
      </div>
      <div v-if="yearlySavings" class="calc-row">
        <span class="calc-label">Ahorro anual estimado</span>
        <span class="calc-value">
          ≈ ${{ yearlySavings.toLocaleString('es-AR') }}
        </span>
      </div>
    </div>

    <div class="aux-actions">
      <v-btn
        class="submit-btn"
        color="primary"
        variant="flat"
        @click="handleAskContact"
      >
        Quiero que me contacten
      </v-btn>

      <v-btn variant="text" class="back-btn" @click="emit('open-form')">
        Volver al formulario
      </v-btn>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineEmits } from 'vue'
import {
  estimateMonthlyKwh,
  estimateSystemSizeKw,
  estimatePanels,
  estimateYearlyKwh,
  estimateYearlySavingsArs,
} from '../service/solarMath'

const emit = defineEmits(['open-form'])

const bill = ref(null)

const monthlyKwh = computed(() => {
  if (!bill.value) return null
  return estimateMonthlyKwh(Number(bill.value))
})

const systemSize = computed(() => {
  if (!monthlyKwh.value) return null
  return estimateSystemSizeKw(monthlyKwh.value)
})

const panels = computed(() => {
  if (!systemSize.value) return null
  return estimatePanels(systemSize.value)
})

const yearlyKwh = computed(() => {
  if (!monthlyKwh.value) return null
  return estimateYearlyKwh(monthlyKwh.value)
})

const yearlySavings = computed(() => {
  if (!bill.value) return null
  return estimateYearlySavingsArs(Number(bill.value))
})

const hasData = computed(() => !!(monthlyKwh.value && systemSize.value))

const handleAskContact = () => {
  // 1) Primero mandamos el evento con la factura
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('solar-calculator:use-bill', {
        detail: bill.value ? Number(bill.value) : null,
      }),
    )
  }

  // 2) Luego pedimos volver al formulario
  emit('open-form')
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

.submit-btn {
  font-weight: 600;
  text-transform: none;
}

.back-btn {
  align-self: flex-start;
  padding-left: 0;
  text-transform: none;
}
</style>
