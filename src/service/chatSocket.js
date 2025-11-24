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

// listeners registrados desde el widget
const messageHandlers = new Set()
const agentsOnlineHandlers = new Set()
const agentTypingHandlers = new Set()

/**
 * Conecta el socket.
 * role: 'visitor' (widget) | 'agent'
 * sessionId: ID de sesión de chat para unirse al room de esa sesión
 */
export function connectSocket (role = 'visitor', sessionId = null) {
  if (socket && socket.connected) {
    // si ya está conectado, solo aseguramos que esté en el room de sesión
    if (sessionId) {
      socket.emit('joinSession', { sessionId: String(sessionId) })
    }
    return socket
  }

  socket = io(WS_URL, {
    transports: ['websocket'],
    path: '/socket.io',
    query: { role },
  })

  socket.on('connect', () => {
    console.log('[ChatSock] conectado', socket.id, 'role =', role)

    // al conectar por primera vez, nos unimos al room de la sesión
    if (sessionId) {
      socket.emit('joinSession', { sessionId: String(sessionId) })
    }
  })

  socket.on('disconnect', () => {
    console.log('[ChatSock] desconectado')
  })

  // Mensajes de chat
  socket.on('chatMessage', payload => {
    messageHandlers.forEach(fn => {
      try {
        fn(payload)
      } catch (e) {
        console.error('[ChatSock] error en handler chatMessage', e)
      }
    })
  })

  // Presencia de agentes
  socket.on('agentsOnline', payload => {
    agentsOnlineHandlers.forEach(fn => {
      try {
        fn(payload)
      } catch (e) {
        console.error('[ChatSock] error en handler agentsOnline', e)
      }
    })
  })

  // Indicador “agente escribiendo”
  socket.on('agentTyping', payload => {
    agentTypingHandlers.forEach(fn => {
      try {
        fn(payload)
      } catch (e) {
        console.error('[ChatSock] error en handler agentTyping', e)
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
 * “Typing” desde el widget → por ahora NO se usa en el server,
 * dejamos un no-op para no romper la firma que espera useChatbot.
 */
export function sendTyping (_payload) {
  // noop
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
