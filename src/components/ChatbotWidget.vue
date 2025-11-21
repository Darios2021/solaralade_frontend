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
        <v-card-title class="py-2 px-3 d-flex align-center justify-space-between chatbot-header">
          <div class="d-flex align-center">
            <v-avatar size="32" class="mr-3 chatbot-avatar">
              <v-icon>mdi-robot</v-icon>
            </v-avatar>
            <div>
              <div class="text-subtitle-1 font-weight-bold">
                Asistente Solar
              </div>
              <div class="text-caption d-flex align-center chatbot-status">
                <span class="status-dot mr-1" />
                En línea
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

import {
  createChatSession,
  sendChatMessage,
  fetchSessionMessages,
} from '../service/chatClient'

// ---------- state básico ----------
const isOpen = ref(false)
const newMessage = ref('')
const isSending = ref(false)
const isLoadingHistory = ref(false)

const messages = ref([])
const sessionId = ref(null)
const pollingTimer = ref(null)

const messagesContainer = ref(null)

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

// ---------- backend helpers ----------
function mapBackendMessage (m) {
  return {
    id: m.id,
    from: m.sender === 'agent' || m.sender === 'bot' ? 'bot' : 'user',
    text: m.text,
    ts: m.createdAt || new Date().toISOString(),
  }
}

async function ensureSession () {
  if (sessionId.value) return sessionId.value

  // si querés persistir sesión por navegador:
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem('solar-chat-session-id')
    if (stored) {
      sessionId.value = Number(stored)
      startPolling()
      await loadHistory()
      return sessionId.value
    }
  }

  const session = await createChatSession(
    {
      sourceUrl:
        (typeof window !== 'undefined' && window.location.href) || null,
    },
    {},
    null,
  )

  sessionId.value = session.id

  if (typeof window !== 'undefined') {
    window.localStorage.setItem('solar-chat-session-id', String(session.id))
  }

  startPolling()
  await loadHistory()
  return session.id
}

async function loadHistory () {
  if (!sessionId.value) return
  isLoadingHistory.value = true
  try {
    const list = await fetchSessionMessages(sessionId.value)
    messages.value = list.map(mapBackendMessage)
    await nextTick()
    scrollToBottom()
  } catch (err) {
    console.error('[Chatbot] Error cargando historial', err)
  } finally {
    isLoadingHistory.value = false
  }
}

function startPolling () {
  stopPolling()
  pollingTimer.value = setInterval(() => {
    loadHistory()
  }, 5000) // cada 5 seg
}

function stopPolling () {
  if (pollingTimer.value) {
    clearInterval(pollingTimer.value)
    pollingTimer.value = null
  }
}

// ---------- acciones UI ----------
function toggleOpen () {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(scrollToBottom)
    // si ya había sesión, aseguro historial al abrir
    if (sessionId.value) {
      loadHistory()
    }
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

    await sendChatMessage(sid, text, 'user', { origin: 'widget' })

    // No agrego auto-respuesta local: el CRM puede responder y
    // el polling la va a traer. Si querés, podés dejar un texto corto:
    // const autoText = 'Gracias por tu consulta...'
    // await sendChatMessage(sid, autoText, 'bot', { autoReply: true })
  } catch (err) {
    console.error('[Chatbot] Error enviando mensaje', err)
  } finally {
    isSending.value = false
  }
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
  stopPolling()
})
</script>

<style scoped>
/* (mismos estilos que ya tenías) */
.chatbot-root {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 9999;
}

.chatbot-fab {
  border-radius: 999px;
  padding-inline: 16px;
  font-weight: 600;
}

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
  background-color: #4caf50;
}

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

.chatbot-slide-enter-active,
.chatbot-slide-leave-active {
  transition: all 0.18s ease-out;
}

.chatbot-slide-enter-from,
chatbot-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.chatbot-msg-enter-active {
  transition: all 0.18s ease-out;
}

.chatbot-msg-enter-from {
  opacity: 0;
  transform: translateY(6px) scale(0.98);
}

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
