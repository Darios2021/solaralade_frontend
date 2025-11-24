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
// 👇 Ojo con la ruta: relativa, SIN "@"
import useChatbot from '../composables/useChatbot'

const {
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
} = useChatbot()
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
.chatbot-slide-leave-to {
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
