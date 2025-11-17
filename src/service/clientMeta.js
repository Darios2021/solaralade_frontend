// src/service/clientMeta.js

// Devuelve info técnica del cliente (tipo analytics-light).
// extraData te permite sumar métricas propias: tiempos, scroll, utm, etc.
export function getClientMeta (extraData = {}) {
  if (typeof window === 'undefined') {
    return {
      createdAt: new Date().toISOString(),
      ...extraData,
    }
  }

  const nav = window.navigator || {}
  const screen = window.screen || {}
  const conn = nav.connection || nav.mozConnection || nav.webkitConnection || {}
  const docEl = document.documentElement || document.body || {}

  // Preferencias visuales
  let prefersDarkMode = false
  let prefersReducedMotion = false
  try {
    prefersDarkMode =
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    prefersReducedMotion =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    // ignore
  }

  const meta = {
    createdAt: new Date().toISOString(),

    // Contexto básico
    url: window.location.href || null,
    referrer: document.referrer || null,
    userAgent: nav.userAgent || null,
    language: nav.language || nav.userLanguage || null,
    platform: nav.platform || null,

    // Pantalla / dispositivo
    deviceType: detectDeviceType(nav.userAgent || ''),
    screen: {
      width: screen.width ?? null,
      height: screen.height ?? null,
      availWidth: screen.availWidth ?? null,
      availHeight: screen.availHeight ?? null,
      pixelRatio: window.devicePixelRatio ?? null,
    },

    // Hardware
    hardwareConcurrency: nav.hardwareConcurrency ?? null,
    deviceMemory: nav.deviceMemory ?? null, // puede ser undefined

    // Conexión
    connection: {
      effectiveType: conn.effectiveType || null, // 4g, 3g, etc.
      downlink: conn.downlink ?? null,          // Mbps aprox
      rtt: conn.rtt ?? null,                    // ms
      saveData: conn.saveData ?? null,          // modo ahorro datos
    },

    // Preferencias
    prefersDarkMode,
    prefersReducedMotion,

    // Extra (comportamiento, utm, etc.)
    ...extraData,
  }

  return meta
}

function detectDeviceType (ua) {
  const s = String(ua || '').toLowerCase()
  if (!s) return null
  if (/mobile|iphone|ipod|android.*mobile/.test(s)) return 'mobile'
  if (/ipad|tablet|android(?!.*mobile)/.test(s)) return 'tablet'
  return 'desktop'
}

// Lee parámetros UTM de la URL actual
export function getUtmParams () {
  if (typeof window === 'undefined') return null

  const params = new URLSearchParams(window.location.search || '')
  const utm = {}
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']

  let hasAny = false
  for (const k of keys) {
    const v = params.get(k)
    if (v) {
      utm[k] = v
      hasAny = true
    }
  }

  return hasAny ? utm : null
}
