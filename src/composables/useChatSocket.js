// src/composables/useChatSocket.js
import { ref, onBeforeUnmount } from 'vue'
import {
  connectSocket,
  onChatMessage as onWsMessage,
  offChatMessage as offWsMessage,
  sendChatMessage as sendWsMessage,
  sendTyping as wsSendTyping,
  onAgentsOnline,
  offAgentsOnline,
  onAgentTyping,
  offAgentTyping,
} from '../service/chatSocket' // ojo: si tu carpeta real es "services", cambiá a "../services/chatSocket"

/**
 * Hook/composable de WebSocket para el chatbot en el FRONT (visitante).
 * Maneja:
 * - presencia de agentes (agentOnline)
 * - typing del agente (agentTyping)
 * - registro / desregistro de handlers al desmontar
 */
function useChatSocket () {
  const agentOnline = ref(false)
  const agentTyping = ref(false)
  const socketInitialized = ref(false)

  let wsMessageHandler = null
  let wsAgentsOnlineHandler = null
  let wsAgentTypingHandler = null

  /**
   * Inicializa el socket para una sesión
   * @param {string|number} sessionId
   * @param {(msg: any) => void} onNewMessage callback cuando llega un mensaje del agente/bot
   */
  function initSocket (sessionId, onNewMessage) {
    if (!sessionId || socketInitialized.value) return

    // Abrimos socket como "visitor"
    connectSocket('visitor', sessionId)

    // mensajes nuevos desde el CRM (agente / bot server)
    wsMessageHandler = payload => {
      // ignoramos mensajes que vengan marcados como 'user'
      if (payload?.from === 'user') return

      if (typeof onNewMessage === 'function') {
        onNewMessage(payload)
      }
    }

    // presencia de agentes: { count }
    wsAgentsOnlineHandler = data => {
      if (!data) return
      const count = Number(data.count || 0)
      agentOnline.value = count > 0
    }

    // typing del agente: { sessionId, typing }
    wsAgentTypingHandler = data => {
      if (!data) return
      // si quisieras filtrar por sessionId:
      // if (String(data.sessionId || '') !== String(sessionId || '')) return

      agentTyping.value = !!data.typing

      if (agentTyping.value) {
        setTimeout(() => {
          agentTyping.value = false
        }, 5000)
      }
    }

    onWsMessage(wsMessageHandler)
    onAgentsOnline(wsAgentsOnlineHandler)
    onAgentTyping(wsAgentTypingHandler)

    socketInitialized.value = true
  }

  /** Enviar un mensaje por WebSocket (para que lo vea el CRM en tiempo real) */
  function sendWs (payload) {
    sendWsMessage(payload)
  }

  /** Notificar al backend que el usuario está (o no) escribiendo */
  function notifyTyping ({ from = 'user', isTyping = false } = {}) {
    wsSendTyping({ from, isTyping })
  }

  onBeforeUnmount(() => {
    if (wsMessageHandler) offWsMessage(wsMessageHandler)
    if (wsAgentsOnlineHandler) offAgentsOnline(wsAgentsOnlineHandler)
    if (wsAgentTypingHandler) offAgentTyping(wsAgentTypingHandler)
  })

  return {
    agentOnline,
    agentTyping,
    initSocket,
    sendWs,
    notifyTyping,
  }
}

// ⬅️ Exportamos **default** y también **named**
export default useChatSocket
export { useChatSocket }
