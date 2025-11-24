// src/service/chatSocket.js
import { io } from 'socket.io-client'

const WS_URL =
  (import.meta &&
    import.meta.env &&
    (import.meta.env.VITE_SOLAR_API_BASE_URL ||
      import.meta.env.VITE_API_BASE_URL)) ||
  (typeof window !== 'undefined' && window.SOLAR_CALCULATOR_API_BASE) ||
  'https://solar-backend.cingulado.org'

let socket = null

// session actual del widget
let currentSessionId = null

// listeners registrados desde el widget
const messageHandlers = new Set()
const agentsOnlineHandlers = new Set()
const agentTypingHandlers = new Set()

/**
 * Conecta el socket del WIDGET.
 * role: 'widget' (por defecto)
 * sessionId: ID de sesión de chat para unirse al room de esa sesión
 */
export function connectSocket (role = 'widget', sessionId = null) {
  // Si ya hay socket conectado, solo lo unimos al room de sesión
  if (socket && socket.connected) {
    if (sessionId) {
      currentSessionId = String(sessionId)
      socket.emit('joinSession', { sessionId: currentSessionId })
    }
    return socket
  }

  socket = io(WS_URL, {
    transports: ['websocket'],
    path: '/socket.io',
    query: { role },
  })

  socket.on('connect', () => {
    console.log('[ChatSock widget] conectado', socket.id, 'role=', role)

    if (sessionId) {
      currentSessionId = String(sessionId)
      socket.emit('joinSession', { sessionId: currentSessionId })
    }
  })

  socket.on('disconnect', () => {
    console.log('[ChatSock widget] desconectado')
  })

  // Mensajes de chat (desde el server)
  socket.on('chatMessage', payload => {
    messageHandlers.forEach(fn => {
      try {
        fn(payload)
      } catch (e) {
        console.error('[ChatSock widget] error en handler chatMessage', e)
      }
    })
  })

  // Presencia de agentes POR SESIÓN { sessionId, count }
  socket.on('agentsOnline', payload => {
    agentsOnlineHandlers.forEach(fn => {
      try {
        fn(payload)
      } catch (e) {
        console.error('[ChatSock widget] error en handler agentsOnline', e)
      }
    })
  })

  // Indicador “agente escribiendo” POR SESIÓN
  socket.on('agentTyping', payload => {
    agentTypingHandlers.forEach(fn => {
      try {
        fn(payload)
      } catch (e) {
        console.error('[ChatSock widget] error en handler agentTyping', e)
      }
    })
  })

  return socket
}

/**
 * Enviar mensaje de chat por WS
 * payload: { sessionId, from: 'user' | 'bot' | 'agent' | 'system', message }
 */
export function sendChatMessage ({ sessionId, from, message }) {
  if (!socket) return
  if (!sessionId) return

  const payload = {
    sessionId: String(sessionId),
    from,
    message,
  }

  socket.emit('chatMessage', payload)
}

/**
 * “Typing” desde el widget → ahora SÍ lo usamos en el server
 * payload: { from: 'user', isTyping: boolean }
 */
export function sendTyping (payload) {
  if (!socket || !currentSessionId) return

  const typing = !!(payload && payload.isTyping)
  socket.emit('userTyping', {
    sessionId: currentSessionId,
    typing,
  })
}

/**
 * Suscribir/Desuscribir handlers
 */
export function onChatMessage (fn) {
  if (typeof fn === 'function') messageHandlers.add(fn)
}

export function offChatMessage (fn) {
  messageHandlers.delete(fn)
}

export function onAgentsOnline (fn) {
  if (typeof fn === 'function') agentsOnlineHandlers.add(fn)
}

export function offAgentsOnline (fn) {
  agentsOnlineHandlers.delete(fn)
}

export function onAgentTyping (fn) {
  if (typeof fn === 'function') agentTypingHandlers.add(fn)
}

export function offAgentTyping (fn) {
  agentTypingHandlers.delete(fn)
}
