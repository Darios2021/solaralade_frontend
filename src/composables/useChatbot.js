// src/composables/useChatbot.js
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  nextTick,
} from 'vue'

import { getClientMeta } from '../service/clientMeta'
import {
  createChatSession,
  sendChatMessage as sendHttpMessage,
  fetchSessionMessages,
  updateChatContact,
} from '../service/chatClient'

import {
  connectSocket,
  onChatMessage as onWsMessage,
  offChatMessage as offWsMessage,
  sendChatMessage as sendWsMessage,
  sendTyping,
  onAgentsOnline,
  offAgentsOnline,
  onAgentTyping,
  offAgentTyping,
} from '../service/chatSocket'

export default function useChatbot () {
  // ---------- state básico ----------
  const isOpen = ref(false)
  const newMessage = ref('')
  const isSending = ref(false)
  const isLoadingHistory = ref(false)

  const messages = ref([])

  // id de sesión en backend
  const sessionId = ref(null)

  // contacto que queremos capturar
  const contact = ref({
    name: '',
    email: '',
    phone: '',
  })

  // etapas para capturar los datos
  // 'none' | 'askName' | 'askEmail' | 'askPhone' | 'done'
  const contactStage = ref('none')

  const messagesContainer = ref(null)

  let wsMessageHandler = null
  let wsAgentsOnlineHandler = null
  let wsAgentTypingHandler = null
  const socketInitialized = ref(false)

  // estado de asesor
  const agentOnline = ref(false)
  const agentTyping = ref(false)

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
      text: p.message ?? p.text,
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

    initSocket()

    return session.id
  }

  async function loadHistory () {
    if (!sessionId.value) return
    isLoadingHistory.value = true
    try {
      const backendMessages = await fetchSessionMessages(sessionId.value)
      // en este proyecto fetchSessionMessages devuelve ARRAY simple
      const arr = Array.isArray(backendMessages)
        ? backendMessages
        : backendMessages.messages || []

      messages.value = arr.map(mapBackendMessage)
      await nextTick()
      scrollToBottom()
    } catch (err) {
      console.error('[Chatbot] Error cargando historial', err)
    } finally {
      isLoadingHistory.value = false
    }
  }

  function initSocket () {
    if (!sessionId.value || socketInitialized.value) return

    // role "visitor" → en server va a parar al room "widgets"
    connectSocket('visitor', sessionId.value)

    // mensajes nuevos desde el CRM (agente / bot server)
    wsMessageHandler = payload => {
      // ignoramos mensajes que vengan marcados como 'user'
      if (payload.from === 'user') return

      const msg = mapSocketMessage(payload)
      messages.value.push(msg)
      nextTick(scrollToBottom)
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
      if (String(data.sessionId || '') !== String(sessionId.value || '')) return

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

  // ---------- flujo de captura de datos ----------
  async function askForName (sid) {
    const text =
      'Antes de seguir, ¿me decís tu nombre y apellido para registrarte?'

    await sendHttpMessage(sid, text, 'bot', { kind: 'askName' })

    messages.value.push({
      id: Date.now() + '-bot-ask-name',
      from: 'bot',
      text,
      ts: new Date(),
    })

    contactStage.value = 'askName'
  }

  async function handleNameStep (sid, text) {
    contact.value.name = text.trim()

    const firstName = contact.value.name.split(' ')[0] || ''

    const askEmailText = firstName
      ? `Gracias, ${firstName}. ¿Cuál es tu correo electrónico?`
      : 'Gracias. ¿Cuál es tu correo electrónico?'

    await sendHttpMessage(sid, askEmailText, 'bot', { kind: 'askEmail' })

    messages.value.push({
      id: Date.now() + '-bot-ask-email',
      from: 'bot',
      text: askEmailText,
      ts: new Date(),
    })

    contactStage.value = 'askEmail'
  }

  async function handleEmailStep (sid, text) {
    const email = text.trim()
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

    if (!emailOk) {
      const retryText =
        'Parece que el correo no es válido. Probá ingresarlo nuevamente (ejemplo: usuario@correo.com).'
      await sendHttpMessage(sid, retryText, 'bot', { kind: 'invalidEmail' })

      messages.value.push({
        id: Date.now() + '-bot-email-invalid',
        from: 'bot',
        text: retryText,
        ts: new Date(),
      })
      return
    }

    contact.value.email = email

    const askPhoneText =
      'Perfecto. ¿Me dejás un número de WhatsApp o teléfono de contacto?'

    await sendHttpMessage(sid, askPhoneText, 'bot', { kind: 'askPhone' })

    messages.value.push({
      id: Date.now() + '-bot-ask-phone',
      from: 'bot',
      text: askPhoneText,
      ts: new Date(),
    })

    contactStage.value = 'askPhone'
  }

  async function handlePhoneStep (sid, text) {
    const cleaned = (text || '').replace(/\D/g, '')
    if (cleaned.length < 6) {
      const retryText =
        'Necesito un número un poco más completo (incluí código de área, por ejemplo 264xxxxxxx).'
      await sendHttpMessage(sid, retryText, 'bot', { kind: 'invalidPhone' })

      messages.value.push({
        id: Date.now() + '-bot-phone-invalid',
        from: 'bot',
        text: retryText,
        ts: new Date(),
      })
      return
    }

    contact.value.phone = text.trim()

    try {
      await updateChatContact(sid, {
        name: contact.value.name,
        email: contact.value.email,
        phone: contact.value.phone,
      })
    } catch (e) {
      console.error('[Chatbot] Error actualizando contacto', e)
    }

    const doneText =
      '¡Listo! Ya guardamos tus datos para que un asesor pueda contactarte si hace falta.'

    await sendHttpMessage(sid, doneText, 'bot', { kind: 'contactDone' })

    messages.value.push({
      id: Date.now() + '-bot-contact-done',
      from: 'bot',
      text: doneText,
      ts: new Date(),
    })

    contactStage.value = 'done'
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
    agentTyping.value = false
    try {
      const sid = await ensureSession()

      await sendHttpMessage(sid, text, 'user', {
        origin: 'widget',
        contactStage: contactStage.value,
      })

      // WS para que el CRM reciba en tiempo real (ahora con sessionId)
      sendWsMessage({
        sessionId: sid,
        from: 'user',
        message: text,
      })

      if (contactStage.value === 'askName') {
        await handleNameStep(sid, text)
      } else if (contactStage.value === 'askEmail') {
        await handleEmailStep(sid, text)
      } else if (contactStage.value === 'askPhone') {
        await handlePhoneStep(sid, text)
      } else {
        const autoText =
          'Gracias por tu consulta. Un asesor va a revisarla y, si hace falta, se contactará por este chat o por WhatsApp/mail.'

        await sendHttpMessage(sid, autoText, 'bot', { autoReply: true })

        const autoMsg = {
          id: Date.now() + '-bot-autoreply',
          from: 'bot',
          text: autoText,
          ts: new Date(),
        }
        messages.value.push(autoMsg)

        // también por WS, con sessionId
        sendWsMessage({
          sessionId: sid,
          from: 'bot',
          message: autoText,
        })

        if (contactStage.value === 'none') {
          await askForName(sid)
        }
      }

      await nextTick()
      scrollToBottom()
    } catch (err) {
      console.error('[Chatbot] Error enviando mensaje', err)
    } finally {
      isSending.value = false
      sendTyping({ from: 'user', isTyping: false })
    }
  }

  // avisar al CRM que el usuario está / dejó de escribir
  let typingTimeout = null
  function handleTyping () {
    sendTyping({ from: 'user', isTyping: true })

    if (typingTimeout) clearTimeout(typingTimeout)
    typingTimeout = setTimeout(() => {
      sendTyping({ from: 'user', isTyping: false })
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

  onBeforeUnmount(() => {
    if (wsMessageHandler) offWsMessage(wsMessageHandler)
    if (wsAgentsOnlineHandler) offAgentsOnline(wsAgentsOnlineHandler)
    if (wsAgentTypingHandler) offAgentTyping(wsAgentTypingHandler)
  })

  // lo que exponemos al componente
  return {
    // state
    isOpen,
    newMessage,
    isSending,
    isLoadingHistory,
    messages,
    messagesContainer,
    agentOnline,
    agentTyping,
    // computeds
    canSend,
    statusText,
    // helpers
    formatTime,
    // actions
    toggleOpen,
    handleSend,
    handleTyping,
  }
}
