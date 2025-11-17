// src/service/chatClient.js
import apiClient from './apiClient'

export async function createChatSession(meta = {}, contact = {}, leadId = null) {
  const { data } = await apiClient.post('/chat/session', {
    meta,
    contact,
    leadId,
  })
  return data.session
}

export async function updateChatContact(sessionId, contact = {}) {
  const { data } = await apiClient.patch(
    `/chat/session/${sessionId}/contact`,
    contact,
  )
  return data.session
}

export async function sendChatMessage(sessionId, text, sender = 'user', meta) {
  const { data } = await apiClient.post('/chat/message', {
    sessionId,
    text,
    sender,
    meta,
  })
  return data.message
}
