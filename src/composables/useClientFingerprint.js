// src/composables/useClientFingerprint.js
export function getClientFingerprint() {
  // En SSR o tests no hay window
  if (typeof window === 'undefined') return null

  const nav = window.navigator || {}
  const scr = window.screen || {}

  const ua = nav.userAgent || ''
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua)

  return {
    // Info de navegación
    url: window.location.href,
    referrer: document.referrer || null,

    // Navegador / SO / idioma
    userAgent: ua,
    language: nav.language || null,
    platform: nav.platform || null,

    // Device / pantalla
    deviceType: isMobile ? 'mobile' : 'desktop',
    screen: {
      width: scr.width || null,
      height: scr.height || null,
      availWidth: scr.availWidth || null,
      availHeight: scr.availHeight || null,
      pixelRatio: window.devicePixelRatio || 1,
    },

    // Zona horaria y fecha/hora del evento
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    sentAtIso: new Date().toISOString(),
  }
}
