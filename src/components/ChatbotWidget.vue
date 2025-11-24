<template>
  <div class="chatbot-root">
    <!-- Botón flotante -->
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

    <!-- Panel -->
    <transition name="chatbot-slide">
      <v-card
        v-if="isOpen"
        class="chatbot-card"
        elevation="12"
      >

        <!-- Header -->
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
                <span
                  class="status-dot mr-1"
                  :class="{
                    'status-dot--online': agentOnline,
                    'status-dot--offline': !agentOnline
                  }"
                />
                <span>{{ statusText }}</span>
              </div>
            </div>
          </div>

          <v-btn icon variant="flat" size="small" class="chatbot-close-btn" @click="toggleOpen">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider />

        <!-- Mensajes -->
        <v-card-text class="chatbot-messages-wrapper px-3 py-2">
          <div ref="messagesContainer" class="chatbot-messages">

            <TransitionGroup name="chatbot-msg" tag="div">
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
                  <div class="chatbot-message-text">{{ msg.text }}</div>
                  <div class="chatbot-message-meta">
                    <span>{{ formatTime(msg.ts) }}</span>
                    <span v-if="msg.from === 'bot'"> · Asistente</span>
                    <span v-else> · Tú</span>
                  </div>
                </div>
              </div>
            </TransitionGroup>

            <!-- Loading historial -->
            <div v-if="isLoadingHistory && !messages.length" class="text-caption text-medium-emphasis pa-3">
              Cargando conversación…
            </div>

            <!-- Typing -->
            <div v-if="agentTyping" class="chatbot-typing-indicator text-caption text-medium-emphasis">
              El asesor está escribiendo…
            </div>

          </div>
        </v-card-text>

        <v-divider />

        <!-- Input -->
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
            icon
            :loading="isSending"
            :disabled="!canSend"
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
import useChatbot from '@/composables/useChatbot'

const {
  isOpen,
  messages,
  newMessage,
  isSending,
  isLoadingHistory,
  agentOnline,
  agentTyping,
  messagesContainer,
  canSend,
  statusText,
  formatTime,
  toggleOpen,
  handleSend,
  handleTyping
} = useChatbot()
</script>

<style scoped>
/* ———————————— TODO TU CSS ORIGINAL, sin tocar ———————————— */
</style>
