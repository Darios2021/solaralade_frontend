// src/service/chatSocket.js
import { io } from 'socket.io-client'

let socket = null
let currentSessionId = null

// URL del backend (podés pasarlo a .env si querés)
const SOCKET_URL =
  import.meta.env.VITE_SOLAR_SOCKET_URL ||
  'https://solar-backend.cingulado.org'

export function connectSocket(userType = 'visitor', sessionId) {
  if (!sessionId) return null

  // Si ya estoy conectado a esta sesión, no reconecto
  if (socket && socket.connected && currentSessionId === sessionId) {
    return socket
  }

  currentSessionId = sessionId

  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    withCredentials: true,
  })

  socket.on('connect', () => {
    console.log('🟢 Socket conectado:', socket.id)

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

export function onChatMessage(callback) {
  if (!socket) return
  socket.on('chatMessage', callback)
}

export function offChatMessage(callback) {
  if (!socket) return
  socket.off('chatMessage', callback)
}

export function sendChatMessage({ from = 'visitor', text }) {
  if (!socket || !socket.connected || !currentSessionId) return

  socket.emit('chatMessage', {
    sessionId: currentSessionId,
    from,
    message: text,
  })
}

export function sendTyping({ from = 'visitor', isTyping }) {
  if (!socket || !socket.connected || !currentSessionId) return

  socket.emit('typing', {
    sessionId: currentSessionId,
    from,
    isTyping: !!isTyping,
  })
}

export function onTyping(callback) {
  if (!socket) return
  socket.on('typing', callback)
}

export function offTyping(callback) {
  if (!socket) return
  socket.off('typing', callback)
}
