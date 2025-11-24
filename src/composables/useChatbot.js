// src/composables/useChatbot.js
import {
  ref,
  computed,
  onMounted,
  nextTick,
} from 'vue'

import { getClientMeta } from '../service/clientMeta'
import {
  createChatSession,
  sendChatMessage as sendHttpMessage,
  fetchSessionMessages,
} from '../service/chatClient'

import useChatSocket from './useChatSocket'
import useChatContactFlow from './useChatContactFlow'

export default function useChatbot () {
  // ---------- state UI ----------
  const isOpen = ref(false)
  const newMessage = ref('')
  const isSending = ref(false)
  const isLoadingHistory = ref(false)

  const messages = ref([])
  const messagesContainer = ref(null)

  // sesión
  const sessionId = ref(null)

  // composables especializados
  const {
    agentOnline,
    agentTyping,
    initSocket,
    sendWs,
    notifyTyping,
  } = useChatSocket()

  const {
    contact,
    contactStage,
    askForName,
    handleNameStep,
    handleEmailStep,
    handlePhoneStep,
  } = useChatContactFlow()

  // ---------- helpers visuales ----------
  function formatTime (date) {
    if (!date) return ''
    const d = new Date(date)
    return d.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function scrollToBottom () {
    const el = messagesContainer.value
    if (!el) return
    el.scrollTop = el.scrollHeight
  }

  const canSend = computed(
    () => newMessage.value.trim().length > 0 && !isSending.value,
  )

  const statusText = computed(() => {
    if (agentTyping.value) return 'Un asesor está escribiendo…'
    if (agentOnline.value) return 'Asesor en línea'
    return 'Dejanos tu consulta y la revisamos a la brevedad'
  })

  // ---------- mapeos ----------
  function mapBackendMessage (m) {
    return {
      id: m.id || `${Date.now()}-${m.sender || 'agent'}`,
      from: m.sender === 'agent' || m.sender === 'bot' ? 'bot' : 'user',
      text: m.text,
      ts: m.createdAt || new Date().toISOString(),
    }
  }

  function mapSocketMessage (p) {
    return {
      id: p.id || `${Date.now()}-${p.from || 'agent'}`,
      from: p.from === 'agent' || p.from === 'bot' ? 'bot' : 'user',
      text: p.message,
      ts: p.createdAt || new Date().toISOString(),
    }
  }

  // ---------- backend helpers ----------
  async function ensureSession () {
    if (sessionId.value) return sessionId.value

    const meta = getClientMeta({ origin: 'solar-widget' })
    const session = await createChatSession(
      {
        ...meta,
        sourceUrl:
          (typeof window !== 'undefined' && window.location.href) || null,
      },
      {}, // contact vacío
      null,
    )

    sessionId.value = session.id

    // inicializar socket para esta sesión
    initSocket(session.id, payload => {
      const msg = mapSocketMessage(payload)
      messages.value.push(msg)
      nextTick(scrollToBottom)
    })

    return session.id
  }

  async function loadHistory () {
    if (!sessionId.value) return
    isLoadingHistory.value = true
    try {
      const backendMessages = await fetchSessionMessages(sessionId.value)
      messages.value = backendMessages.map(mapBackendMessage)
      await nextTick()
      scrollToBottom()
    } catch (err) {
      console.error('[Chatbot] Error cargando historial', err)
    } finally {
      isLoadingHistory.value = false
    }
  }

  // helper para crear mensajes locales de bot
  function pushLocalBotMessage (text, keySuffix = 'bot') {
    messages.value.push({
      id: `${Date.now()}-${keySuffix}`,
      from: 'bot',
      text,
      ts: new Date(),
    })
  }

  async function sendBotMessage (sid, text, extraMeta = {}) {
    await sendHttpMessage(sid, text, 'bot', extraMeta)
  }

  // ---------- acciones UI ----------
  async function toggleOpen () {
    isOpen.value = !isOpen.value
    if (isOpen.value) {
      await ensureSession()
      await loadHistory()
      await nextTick()
      scrollToBottom()
    }
  }

  async function handleSend () {
    if (!canSend.value) return

    const text = newMessage.value.trim()
    if (!text) return

    const localMsg = {
      id: Date.now() + '-user',
      from: 'user',
      text,
      ts: new Date(),
    }
    messages.value.push(localMsg)
    newMessage.value = ''
    await nextTick()
    scrollToBottom()

    isSending.value = true
    try {
      const sid = await ensureSession()

      await sendHttpMessage(sid, text, 'user', {
        origin: 'widget',
        contactStage: contactStage.value,
      })

      // WS para que el CRM reciba en tiempo real
      sendWs({ from: 'user', text })

      // flujo de contacto (según estado actual)
      if (contactStage.value === 'askName') {
        await handleNameStep(sid, text, {
          sendBotMessage,
          pushLocalBotMessage,
        })
      } else if (contactStage.value === 'askEmail') {
        await handleEmailStep(sid, text, {
          sendBotMessage,
          pushLocalBotMessage,
        })
      } else if (contactStage.value === 'askPhone') {
        await handlePhoneStep(sid, text, {
          sendBotMessage,
          pushLocalBotMessage,
        })
      } else {
        // flujo normal: autoreply + eventualmente inicio captura de datos
        const autoText =
          'Gracias por tu consulta. Un asesor va a revisarla y, si hace falta, se contactará por este chat o por WhatsApp/mail.'

        await sendBotMessage(sid, autoText, { autoReply: true })
        pushLocalBotMessage(autoText, 'bot-autoreply')

        sendWs({ from: 'bot', text: autoText })

        if (contactStage.value === 'none') {
          await askForName(sid, {
            sendBotMessage,
            pushLocalBotMessage,
          })
        }
      }

      await nextTick()
      scrollToBottom()
    } catch (err) {
      console.error('[Chatbot] Error enviando mensaje', err)
    } finally {
      isSending.value = false
      notifyTyping({ from: 'user', isTyping: false })
    }
  }

  // avisar al CRM que el usuario está / dejó de escribir
  let typingTimeout = null
  function handleTyping () {
    notifyTyping({ from: 'user', isTyping: true })

    if (typingTimeout) clearTimeout(typingTimeout)
    typingTimeout = setTimeout(() => {
      notifyTyping({ from: 'user', isTyping: false })
    }, 2000)
  }

  // ---------- ciclo de vida ----------
  onMounted(() => {
    messages.value.push({
      id: 'welcome-bot',
      from: 'bot',
      text:
        '¡Hola! Soy tu asistente virtual para energía solar. ' +
        'Contame tu consulta y la derivamos al equipo comercial.',
      ts: new Date(),
    })

    nextTick(scrollToBottom)
  })

  return {
    // state UI
    isOpen,
    newMessage,
    isSending,
    isLoadingHistory,
    messages,
    messagesContainer,
    // estado de agente
    agentOnline,
    agentTyping,
    // contacto (por si después lo querés mostrar)
    contact,
    contactStage,
    // computeds
    canSend,
    statusText,
    // helpers
    formatTime,
    // acciones
    toggleOpen,
    handleSend,
    handleTyping,
  }
}
