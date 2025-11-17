// src/service/trackingClient.js
import { getClientFingerprint } from '@/composables/useClientFingerprint'

/**
 * Enriquecer el payload del lead con meta del cliente
 * y disparar evento a Google Tag Manager si existe.
 */
export function enrichLeadPayload(leadPayload = {}) {
  const clientMeta = getClientFingerprint()

  // 1) Evento a Tag Manager / GA4 (si está instalado)
  try {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'solar_lead_sent',
        deviceType: clientMeta?.deviceType,
        url: clientMeta?.url,
        referrer: clientMeta?.referrer,
        language: clientMeta?.language,
      })
    }
  } catch (err) {
    // En producción mejor loguear en consola y seguir
    console.warn('Error enviando evento a dataLayer', err)
  }

  // 2) Devolver payload extendido para el backend
  //    Podés guardar clientMeta como JSON en una columna
  return {
    ...leadPayload,
    clientMeta, // el back lo puede guardar como JSON / TEXT
  }
}
