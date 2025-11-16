// src/service/solarMath.js

// Estima consumo mensual en kWh a partir de la factura
export function estimateMonthlyKwh(billArs, avgTariffArsPerKwh = 120) {
  const bill = Number(billArs) || 0
  if (!bill || !avgTariffArsPerKwh) return null
  return Math.round(bill / avgTariffArsPerKwh)
}

// Estima tamaño de sistema (kWp) a partir de kWh/mes
export function estimateSystemSizeKw(monthlyKwh, kwhPerKw = 130) {
  if (!monthlyKwh || !kwhPerKw) return null
  return Number((monthlyKwh / kwhPerKw).toFixed(1))
}

// Cantidad estimada de paneles (ej: 550 W c/u)
export function estimatePanels(systemSizeKw, panelWatts = 550) {
  if (!systemSizeKw || !panelWatts) return null
  const kwToW = systemSizeKw * 1000
  return Math.max(1, Math.round(kwToW / panelWatts))
}

// Energía anual estimada (kWh/año)
export function estimateYearlyKwh(monthlyKwh) {
  if (!monthlyKwh) return null
  return monthlyKwh * 12
}

// Ahorro anual estimado en ARS (tomando factura actual * 12)
export function estimateYearlySavingsArs(monthlyBillArs) {
  const bill = Number(monthlyBillArs) || 0
  if (!bill) return null
  return bill * 12
}

// (Opcional) Payback aproximado si tuvieras costo total del sistema
export function estimatePaybackYears(systemCostArs, yearlySavingsArs) {
  const cost = Number(systemCostArs) || 0
  const savings = Number(yearlySavingsArs) || 0
  if (!cost || !savings) return null
  return Number((cost / yearlySavingsArs).toFixed(1))
}
