// src/service/apiClient.js

import { getClientFingerprint } from '../composables/useClientFingerprint'

// Resolución de la URL base del backend
const API_BASE_URL =
  // 1) Vite env
  (import.meta && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  // 2) Definido desde WP (window.SOLAR_CALCULATOR_API_BASE)
  (typeof window !== 'undefined' && window.SOLAR_CALCULATOR_API_BASE) ||
  // 3) Fallback producción
  'https://solar-backend.cingulado.org'

/**
 * Enviar lead del simulador solar.
 * Enriquecemos el payload con meta de dispositivo/navegador
 * para que quede guardado en la columna rawMetaJson del CRM.
 */
export async function postLead(originalPayload) {
  // 1) Meta que ya venga del flujo actual (sourceUrl, sourceTag, etc.)
  const existingMeta = (originalPayload && originalPayload.meta) || {}

  // 2) Fingerprint del cliente (frontend)
  const clientMeta = getClientFingerprint()

  // 3) Source URL / tag por defecto
  let defaultSourceUrl = null
  let defaultSourceTag = null

  if (typeof window !== 'undefined') {
    defaultSourceUrl = window.location.href
    // Por si desde WP querés setear un tag tipo "landing_verde"
    defaultSourceTag = window.SOLAR_CALCULATOR_SOURCE_TAG || null
  }

  // 4) Meta final que va a la API
  const mergedMeta = {
    // Primero lo que ya tenías
    ...existingMeta,

    // Defaults de source
    sourceUrl: existingMeta.sourceUrl || defaultSourceUrl,
    sourceTag: existingMeta.sourceTag || defaultSourceTag,

    // Fingerprint del cliente (quedan al mismo nivel)
    client: clientMeta || null,
  }

  // 5) Payload final que mandamos al backend
  const payload = {
    ...originalPayload,
    meta: mergedMeta,
  }

  // 6) Opcional: evento a Google Tag Manager / GA4
  try {
    if (typeof window !== 'undefined' && window.dataLayer && clientMeta) {
      window.dataLayer.push({
        event: 'solar_lead_sent',
        deviceType: clientMeta.deviceType,
        language: clientMeta.language,
        url: clientMeta.url,
        referrer: clientMeta.referrer,
      })
    }
  } catch (err) {
    // No rompemos el flujo si falla el tracking
    console.warn('[postLead] Error enviando evento a dataLayer:', err)
  }

  // 7) POST real al backend
  const res = await fetch(`${API_BASE_URL}/api/leads/solar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }

  if (!res.ok) {
    const msg =
      (data && (data.message || data.error)) ||
      `Error HTTP ${res.status} al contactar API`
    const error = new Error(msg)
    error.status = res.status
    error.data = data
    throw error
  }

  return data || { ok: true }
}
