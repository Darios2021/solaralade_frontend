<!-- src/components/ChatbotWidget.vue -->
<template>
  <div class="chatbot-root">
    <!-- BOTÓN FLOTANTE -->
    <v-btn
      class="chatbot-fab"
      size="large"
      elevation="6"
      color="primary"
      variant="flat"
      @click="toggleOpen"
    >
      <v-icon start>mdi-forum</v-icon>
      <span class="d-none d-sm-inline">Asistente</span>
    </v-btn>

    <!-- PANEL DE CHAT -->
    <transition name="chatbot-slide">
      <v-card
        v-if="isOpen"
        class="chatbot-card"
        elevation="12"
      >
        <!-- HEADER -->
        <v-card-title
          class="py-2 px-3 d-flex align-center justify-space-between chatbot-header"
        >
          <div class="d-flex align-center">
            <v-avatar size="32" class="mr-3 chatbot-avatar">
              <v-icon>mdi-robot</v-icon>
            </v-avatar>
            <div>
              <div class="text-subtitle-1 font-weight-bold">
                Asistente Solar
              </div>
              <div class="text-caption d-flex align-center chatbot-status">
                <span
                  class="status-dot mr-1"
                  :class="{
                    'status-dot--online': agentOnline,
                    'status-dot--offline': !agentOnline
                  }"
                />
                <span>
                  {{ statusText }}
                </span>
              </div>
            </div>
          </div>

          <v-btn
            icon
            variant="flat"
            size="small"
            class="chatbot-close-btn"
            @click="toggleOpen"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider />

        <!-- CUERPO (MENSAJES) -->
        <v-card-text class="chatbot-messages-wrapper px-3 py-2">
          <div
            ref="messagesContainer"
            class="chatbot-messages"
          >
            <TransitionGroup
              name="chatbot-msg"
              tag="div"
            >
              <div
                v-for="msg in messages"
                :key="msg.id"
                class="chatbot-message-row"
                :class="{
                  'chatbot-message-row--user': msg.from === 'user',
                  'chatbot-message-row--bot': msg.from === 'bot'
                }"
              >
                <div class="chatbot-message-bubble">
                  <div class="chatbot-message-text">
                    {{ msg.text }}
                  </div>
                  <div class="chatbot-message-meta">
                    <span>{{ formatTime(msg.ts) }}</span>
                    <span v-if="msg.from === 'bot'"> · Asistente</span>
                    <span v-else> · Tú</span>
                  </div>
                </div>
              </div>
            </TransitionGroup>

            <div
              v-if="isLoadingHistory && !messages.length"
              class="text-caption text-medium-emphasis pa-3"
            >
              Cargando conversación…
            </div>

            <!-- indicador de que el asesor está escribiendo -->
            <div
              v-if="agentTyping"
              class="chatbot-typing-indicator text-caption text-medium-emphasis"
            >
              Un asesor está escribiendo…
            </div>
          </div>
        </v-card-text>

        <v-divider />

        <!-- INPUT -->
        <v-card-actions class="chatbot-input-wrapper py-2 px-3">
          <v-text-field
            v-model="newMessage"
            variant="outlined"
            density="comfortable"
            placeholder="Escribí tu consulta..."
            hide-details
            class="flex-grow-1 mr-2 chatbot-input"
            @keyup.enter="handleSend"
            @input="handleTyping"
          >
            <template #prepend-inner>
              <v-icon size="18" class="chatbot-input-icon">
                mdi-message-text-outline
              </v-icon>
            </template>
          </v-text-field>

          <v-btn
            class="chatbot-send-btn"
            color="primary"
            variant="flat"
            :disabled="!canSend"
            :loading="isSending"
            icon
            @click="handleSend"
          >
            <v-icon class="chatbot-send-icon">mdi-send</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </transition>
  </div>
</template>

<script setup>
import {
  ref,
  onMounted,
  onBeforeUnmount,
  nextTick,
  computed,
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
  onTyping,
  offTyping,
  sendTyping,
  // si en tu chatSocket ya tenés presencia, podés agregar:
  // onPresence,
  // offPresence,
} from '../service/chatSocket'

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
// 'none' -> todavía no pedimos datos
// 'askName' -> esperando nombre y apellido
// 'askEmail' -> esperando mail
// 'askPhone' -> esperando teléfono
// 'done' -> ya tenemos todo
const contactStage = ref('none')

const messagesContainer = ref(null)

let wsMessageHandler = null
let wsTypingHandler = null
// let wsPresenceHandler = null
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

  initSocket()

  return session.id
}

async function loadHistory () {
  if (!sessionId.value) return
  isLoadingHistory.value = true
  try {
    const { messages: backendMessages } =
      await fetchSessionMessages(sessionId.value)

    messages.value = backendMessages.map(mapBackendMessage)
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

  connectSocket('visitor', sessionId.value)

  // mensajes nuevos desde el CRM (agente / bot server)
  wsMessageHandler = payload => {
    // ignoramos mensajes que vengan marcados como 'user'
    if (payload.from === 'user') return

    const msg = mapSocketMessage(payload)
    messages.value.push(msg)
    nextTick(scrollToBottom)
  }

  // typing del agente
  wsTypingHandler = data => {
    if (!data) return
    if (data.from === 'agent') {
      agentTyping.value = !!data.isTyping
      // se apaga solo después de unos segundos si no llega nada más
      if (agentTyping.value) {
        setTimeout(() => {
          agentTyping.value = false
        }, 5000)
      }
    }
  }

  // presencia (si la tenés implementada en el server y chatSocket)
  /*
  wsPresenceHandler = data => {
    if (!data || data.sessionId !== sessionId.value) return
    agentOnline.value = !!data.agentOnline
  }
  */

  onWsMessage(wsMessageHandler)
  onTyping(wsTypingHandler)
  // onPresence(wsPresenceHandler)

  socketInitialized.value = true
}

// ---------- flujo de captura de datos ----------

async function askForName (sid) {
  const text =
    'Antes de seguir, ¿me decís tu nombre y apellido para registrarte?'

  // lo persistimos también como mensaje de bot
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

  // guardamos en la sesión de chat
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

  // Mensaje local inmediato (UX)
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

    // HTTP para persistir en BD (siempre lo guardamos como mensaje de usuario)
    await sendHttpMessage(sid, text, 'user', {
      origin: 'widget',
      contactStage: contactStage.value,
    })

    // WS para que el CRM reciba en tiempo real
    sendWsMessage({ from: 'user', text })

    // según la etapa, corremos un flujo u otro
    if (contactStage.value === 'askName') {
      await handleNameStep(sid, text)
    } else if (contactStage.value === 'askEmail') {
      await handleEmailStep(sid, text)
    } else if (contactStage.value === 'askPhone') {
      await handlePhoneStep(sid, text)
    } else {
      // flujo normal: auto-respuesta + luego pedir datos
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

      // También se la mandamos al CRM por WS
      sendWsMessage({ from: 'bot', text: autoText })

      // después de la primera respuesta pedimos datos
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
    // avisamos que dejamos de escribir
    sendTyping({ from: 'user', isTyping: false })
  }
}

// avisar al CRM que el usuario está / dejó de escribir
let typingTimeout = null
function handleTyping () {
  // apenas empieza a tipear, mandamos isTyping true
  sendTyping({ from: 'user', isTyping: true })

  if (typingTimeout) clearTimeout(typingTimeout)
  typingTimeout = setTimeout(() => {
    sendTyping({ from: 'user', isTyping: false })
  }, 2000)
}

// ---------- ciclo de vida ----------
onMounted(() => {
  // Mensaje de bienvenida local
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
  if (wsTypingHandler) offTyping(wsTypingHandler)
  // if (wsPresenceHandler) offPresence(wsPresenceHandler)
})
</script>

<style scoped>
.chatbot-root {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 9999;
}

/* BOTÓN FLOTANTE */
.chatbot-fab {
  border-radius: 999px;
  padding-inline: 16px;
  font-weight: 600;
}

/* PANEL */
.chatbot-card {
  position: absolute;
  bottom: 64px;
  right: 0;
  width: 360px;
  max-height: 540px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 18px;
}

/* HEADER */
.chatbot-header {
  background: linear-gradient(135deg, #1a5634, #227346);
  color: #ffffff;
}

.chatbot-avatar {
  background-color: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

.chatbot-status {
  opacity: 0.9;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot--online {
  background-color: #4caf50;
}

.status-dot--offline {
  background-color: #9e9e9e;
}

/* BOTÓN CERRAR */
.chatbot-close-btn {
  border-radius: 999px;
  background-color: rgba(0, 0, 0, 0.1);
  color: #ffffff;
  transition: transform 0.15s ease, background-color 0.15s ease;
}

.chatbot-close-btn:hover {
  background-color: rgba(0, 0, 0, 0.18);
  transform: scale(1.05);
}

/* MENSAJES */
.chatbot-messages-wrapper {
  padding: 0;
}

.chatbot-messages {
  max-height: 360px;
  min-height: 220px;
  overflow-y: auto;
  padding: 8px 4px 12px;
}

.chatbot-message-row {
  display: flex;
  margin: 4px 0;
}

.chatbot-message-row--bot {
  justify-content: flex-start;
}

.chatbot-message-row--user {
  justify-content: flex-end;
}

.chatbot-message-bubble {
  max-width: 80%;
  border-radius: 16px;
  padding: 8px 11px;
  font-size: 0.9rem;
  line-height: 1.35;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
}

.chatbot-message-row--bot .chatbot-message-bubble {
  background-color: #f5f5f5;
  border-bottom-left-radius: 4px;
}

.chatbot-message-row--user .chatbot-message-bubble {
  background-color: #1a73e8;
  color: #ffffff;
  border-bottom-right-radius: 4px;
}

.chatbot-message-meta {
  margin-top: 4px;
  font-size: 0.7rem;
  opacity: 0.85;
}

/* indicador typing */
.chatbot-typing-indicator {
  margin-top: 4px;
  padding-left: 4px;
}

/* INPUT */
.chatbot-input-wrapper {
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  background-color: #fafafa;
}

.chatbot-input :deep(.v-field) {
  border-radius: 999px !important;
}

.chatbot-input-icon {
  opacity: 0.6;
}

/* BOTÓN ENVIAR */
.chatbot-send-btn {
  border-radius: 999px;
  width: 44px;
  height: 44px;
  min-width: 44px;
  box-shadow: 0 3px 8px rgba(26, 115, 232, 0.35);
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
}

.chatbot-send-btn:disabled {
  opacity: 0.4;
  box-shadow: none;
}

.chatbot-send-btn:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(26, 115, 232, 0.4);
}

.chatbot-send-icon {
  transform: translateX(1px);
}

/* ANIMACIONES PANEL */
.chatbot-slide-enter-active,
.chatbot-slide-leave-active {
  transition: all 0.18s ease-out;
}

.chatbot-slide-enter-from,
chatbot-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* ANIMACIONES MENSAJES */
.chatbot-msg-enter-active {
  transition: all 0.18s ease-out;
}

.chatbot-msg-enter-from {
  opacity: 0;
  transform: translateY(6px) scale(0.98);
}

/* RESPONSIVE */
@media (max-width: 600px) {
  .chatbot-root {
    right: 12px;
    bottom: 12px;
  }

  .chatbot-card {
    position: fixed;
    bottom: 72px;
    left: 50%;
    transform: translateX(-50%);
    width: calc(100vw - 24px);
    max-width: 420px;
    right: auto;
    margin: 0 auto;
  }
}
</style>
