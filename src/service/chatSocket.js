// src/service/chatSocket.js
import { io } from 'socket.io-client'

let socket = null
let currentSessionId = null

// URL del backend (podés pasarlo a .env si querés)
const SOCKET_URL =
  import.meta.env.VITE_SOLAR_SOCKET_URL ||
  'https://solar-backend.cingulado.org'

/**
 * Conecta el socket del widget.
 * userType: 'visitor' (widget) o 'agent' (si alguna vez lo reutilizás)
 * sessionId: id de sesión de chat
 */
export function connectSocket (userType = 'visitor', sessionId) {
  if (!sessionId) return null

  // Si ya estoy conectado a esta sesión, no reconecto
  if (socket && socket.connected && currentSessionId === sessionId) {
    return socket
  }

  currentSessionId = sessionId

  // el server espera role en el query: 'widget' o 'agent'
  const role = userType === 'agent' ? 'agent' : 'widget'

  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    withCredentials: true,
    query: { role },
  })

  socket.on('connect', () => {
    console.log('🟢 Socket conectado:', socket.id, 'role =', role)

    socket.emit('joinSession', {
      sessionId: currentSessionId,
      userType,
    })
  })

  socket.on('disconnect', () => {
    console.log('🔴 Socket desconectado')
  })

  return socket
}

/* ===========================
   MENSAJES DE CHAT
   =========================== */

export function onChatMessage (callback) {
  if (!socket) return
  socket.on('chatMessage', callback)
}

export function offChatMessage (callback) {
  if (!socket) return
  socket.off('chatMessage', callback)
}

export function sendChatMessage ({ from = 'visitor', text }) {
  if (!socket || !socket.connected || !currentSessionId) return

  socket.emit('chatMessage', {
    sessionId: currentSessionId,
    from,
    message: text,
  })
}

/* ===========================
   TYPING DEL VISITANTE
   (hacia el CRM) — opcional
   =========================== */

export function sendTyping ({ from = 'visitor', isTyping }) {
  if (!socket || !socket.connected || !currentSessionId) return

  socket.emit('typing', {
    sessionId: currentSessionId,
    from,
    isTyping: !!isTyping,
  })
}

export function onTyping (callback) {
  if (!socket) return
  socket.on('typing', callback)
}

export function offTyping (callback) {
  if (!socket) return
  socket.off('typing', callback)
}

/* ===========================
   PRESENCIA Y TYPING DEL AGENTE
   (eventos que emite el server)
   =========================== */

/** cantidad de agentes conectados total → { count } */
export function onAgentsOnline (callback) {
  if (!socket) return
  socket.on('agentsOnline', callback)
}

export function offAgentsOnline (callback) {
  if (!socket) return
  socket.off('agentsOnline', callback)
}

/** typing del agente en esta sesión → { sessionId, typing } */
export function onAgentTyping (callback) {
  if (!socket) return
  socket.on('agentTyping', callback)
}

export function offAgentTyping (callback) {
  if (!socket) return
  socket.off('agentTyping', callback)
}
