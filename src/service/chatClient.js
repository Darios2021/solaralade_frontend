// src/service/chatClient.js
import { getClientMeta } from './clientMeta'

// ===============================
//  BASE URL BACKEND
// ===============================
const API_BASE_URL =
  (import.meta &&
    import.meta.env &&
    (import.meta.env.VITE_SOLAR_API_BASE_URL ||
      import.meta.env.VITE_API_BASE_URL)) ||
  (typeof window !== 'undefined' && window.SOLAR_CALCULATOR_API_BASE) ||
  'https://solar-backend.cingulado.org'

// -------------------------------
// Helper genérico para requests
// -------------------------------
async function request (path, options = {}) {
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
//  CHAT API (WIDGET)
// ===============================

/**
 * Crea una sesión de chat nueva.
 */
export async function createChatSession (
  extraMeta = {},
  contact = {},
  leadId = null,
) {
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
 * Actualiza datos de contacto de la sesión
 * (nombre, email, teléfono, leadId, etc.).
 */
export async function updateChatContact (sessionId, contact = {}) {
  const data = await request(`/api/chat/session/${sessionId}/contact`, {
    method: 'PATCH',
    body: JSON.stringify(contact),
  })

  // backend: { ok:true, session:{...} }
  return data.session
}

/**
 * Envía un mensaje dentro de una sesión.
 */
export async function sendChatMessage (
  sessionId,
  text,
  sender = 'user',
  meta = {},
) {
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
 * Recuperar historial completo de una sesión.
 * Devuelve el objeto completo:
 *   { session, messages }
 * para que el widget pueda conocer también metadatos.
 */
export async function fetchSessionMessages (sessionId) {
  const data = await request(`/api/chat/sessions/${sessionId}/messages`, {
    method: 'GET',
  })

  // backend: { ok:true, session:{...}, messages:[...] }
  return {
    session: data.session || null,
    messages: data.messages || [],
  }
}

/**
 * Alias de conveniencia: solo devuelve el array de mensajes.
 */
export async function listSessionMessages (sessionId) {
  const { messages } = await fetchSessionMessages(sessionId)
  return messages
}

const chatClient = {
  createChatSession,
  updateChatContact,
  sendChatMessage,
  fetchSessionMessages,
  listSessionMessages,
}

export default chatClient
