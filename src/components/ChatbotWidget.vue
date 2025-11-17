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
        elevation="10"
      >
        <!-- HEADER -->
        <v-card-title class="py-2 px-3 d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-avatar size="32" class="mr-3">
              <v-icon>mdi-robot</v-icon>
            </v-avatar>
            <div>
              <div class="text-subtitle-1 font-weight-bold">
                Asistente Solar
              </div>
              <div class="text-caption d-flex align-center">
                <span class="status-dot mr-1" />
                En línea
              </div>
            </div>
          </div>

          <v-btn
            icon
            variant="text"
            size="small"
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
            class="flex-grow-1 mr-2"
            @keyup.enter="handleSend"
          >
            <template #prepend-inner>
              <v-icon size="18">mdi-message-text-outline</v-icon>
            </template>
          </v-text-field>

          <v-btn
            color="primary"
            variant="flat"
            :disabled="!canSend"
            :loading="isSending"
            icon
            @click="handleSend"
          >
            <v-icon>mdi-send</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'

const isOpen = ref(false)
const newMessage = ref('')
const isSending = ref(false)
const messages = ref([])

const messagesContainer = ref(null)

function toggleOpen() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(scrollToBottom)
  }
}

function formatTime(date) {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function scrollToBottom() {
  const el = messagesContainer.value
  if (!el) return
  el.scrollTop = el.scrollHeight
}

const canSend = computed(
  () => newMessage.value.trim().length > 0 && !isSending.value,
)

async function handleSend() {
  if (!canSend.value) return

  const text = newMessage.value.trim()
  if (!text) return

  // mensaje del usuario
  messages.value.push({
    id: Date.now() + '-user',
    from: 'user',
    text,
    ts: new Date(),
  })

  newMessage.value = ''
  await nextTick()
  scrollToBottom()

  isSending.value = true

  try {
    // FUTURO: acá llamaremos a tu backend (API chat)
    const autoReply =
      'Gracias por tu consulta. En breve un asesor del equipo solar se pondrá en contacto o te responderé por aquí. ' +
      'Si querés, contame en qué ciudad estás y el valor aproximado de tu factura de luz.'

    await new Promise(resolve => setTimeout(resolve, 600))

    messages.value.push({
      id: Date.now() + '-bot',
      from: 'bot',
      text: autoReply,
      ts: new Date(),
    })

    await nextTick()
    scrollToBottom()
  } finally {
    isSending.value = false
  }
}

onMounted(() => {
  messages.value.push({
    id: 'welcome-bot',
    from: 'bot',
    text:
      '¡Hola! Soy tu asistente virtual para energía solar. ' +
      'Puedo ayudarte con dudas sobre el calculador, paneles solares y seguimiento de tu consulta.',
    ts: new Date(),
  })

  nextTick(scrollToBottom)
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
}

/* PANEL */
.chatbot-card {
  position: absolute;
  bottom: 64px;
  right: 0;
  width: 340px;
  max-height: 520px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* HEADER */
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #4caf50;
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
  border-radius: 14px;
  padding: 8px 10px;
  font-size: 0.9rem;
  line-height: 1.3;
}

.chatbot-message-row--bot .chatbot-message-bubble {
  background-color: #f5f5f5;
  border-bottom-left-radius: 4px;
}

.chatbot-message-row--user .chatbot-message-bubble {
  background-color: #1976d2;
  color: white;
  border-bottom-right-radius: 4px;
}

.chatbot-message-meta {
  margin-top: 4px;
  font-size: 0.7rem;
  opacity: 0.8;
}

/* INPUT */
.chatbot-input-wrapper {
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

/* ANIMACIONES */
.chatbot-slide-enter-active,
.chatbot-slide-leave-active {
  transition: all 0.2s ease-out;
}

.chatbot-slide-enter-from,
.chatbot-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* RESPONSIVE */
@media (max-width: 600px) {
  .chatbot-card {
    width: calc(100vw - 32px);
    right: 0;
    left: 0;
    margin: 0 auto;
  }
}
</style>
