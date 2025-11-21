// src/service/chatClient.js
import { getClientMeta } from './clientMeta'

// ===============================
//  BASE URL BACKEND
// ===============================
const API_BASE_URL =
  // 1) Vite env (si lo usás)
  (import.meta && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  // 2) Definido desde WP (window.SOLAR_CALCULATOR_API_BASE)
  (typeof window !== 'undefined' && window.SOLAR_CALCULATOR_API_BASE) ||
  // 3) Fallback producción
  'https://solar-backend.cingulado.org'

// -------------------------------
// Helper genérico para requests
// -------------------------------
async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
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
    const err = new Error(msg)
    err.status = res.status
    err.data = data
    throw err
  }

  return data
}

// ===============================
//  CHAT API
// ===============================

/**
 * Crea una sesión de chat nueva.
 * Guarda meta técnica básica del cliente.
 */
export async function createChatSession(extraMeta = {}, contact = {}, leadId = null) {
  const clientMeta = getClientMeta({
    origin: 'widget',
    ...extraMeta,
  })

  const body = {
    contact,
    meta: clientMeta,
    leadId,
  }

  const data = await request('/api/chat/session', {
    method: 'POST',
    body: JSON.stringify(body),
  })

  // backend: { ok:true, session:{...} }
  return data.session
}

/**
 * Envía un mensaje dentro de una sesión.
 */
export async function sendChatMessage(sessionId, text, sender = 'user', meta = {}) {
  const body = {
    sessionId,
    text,
    sender,
    meta: {
      origin: 'widget',
      ...meta,
    },
  }

  const data = await request('/api/chat/message', {
    method: 'POST',
    body: JSON.stringify(body),
  })

  // backend: { ok:true, message:{...} }
  return data.message
}

/**
 * (Opcional) Recuperar historial si querés usarlo en el widget.
 */
export async function fetchSessionMessages(sessionId) {
  const data = await request(`/api/chat/sessions/${sessionId}/messages`, {
    method: 'GET',
  })

  return {
    session: data.session,
    messages: data.messages || [],
  }
}

const chatClient = {
  createChatSession,
  sendChatMessage,
  fetchSessionMessages,
}

export default chatClient
