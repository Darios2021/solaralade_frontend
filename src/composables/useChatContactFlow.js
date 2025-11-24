// src/composables/useChatContactFlow.js
import { ref } from 'vue'
import { updateChatContact } from '../service/chatClient'

/**
 * Maneja el flujo de capturar nombre, email y teléfono del usuario.
 * Trabaja recibiendo callbacks para:
 *  - sendBotMessage: enviar mensaje al backend (HTTP)
 *  - pushLocalBotMessage: mostrar mensaje del bot en el UI
 */
export default function useChatContactFlow () {
  const contact = ref({
    name: '',
    email: '',
    phone: '',
  })

  // 'none' | 'askName' | 'askEmail' | 'askPhone' | 'done'
  const contactStage = ref('none')

  async function askForName (sid, { sendBotMessage, pushLocalBotMessage }) {
    const text =
      'Antes de seguir, ¿me decís tu nombre y apellido para registrarte?'

    if (sendBotMessage) {
      await sendBotMessage(sid, text, { kind: 'askName' })
    }

    if (pushLocalBotMessage) {
      pushLocalBotMessage(text, 'ask-name')
    }

    contactStage.value = 'askName'
  }

  async function handleNameStep (
    sid,
    text,
    { sendBotMessage, pushLocalBotMessage },
  ) {
    contact.value.name = text.trim()
    const firstName = contact.value.name.split(' ')[0] || ''

    const askEmailText = firstName
      ? `Gracias, ${firstName}. ¿Cuál es tu correo electrónico?`
      : 'Gracias. ¿Cuál es tu correo electrónico?'

    if (sendBotMessage) {
      await sendBotMessage(sid, askEmailText, { kind: 'askEmail' })
    }

    if (pushLocalBotMessage) {
      pushLocalBotMessage(askEmailText, 'ask-email')
    }

    contactStage.value = 'askEmail'
  }

  async function handleEmailStep (
    sid,
    text,
    { sendBotMessage, pushLocalBotMessage },
  ) {
    const email = text.trim()
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

    if (!emailOk) {
      const retryText =
        'Parece que el correo no es válido. Probá ingresarlo nuevamente (ejemplo: usuario@correo.com).'

      if (sendBotMessage) {
        await sendBotMessage(sid, retryText, { kind: 'invalidEmail' })
      }

      if (pushLocalBotMessage) {
        pushLocalBotMessage(retryText, 'email-invalid')
      }

      return
    }

    contact.value.email = email

    const askPhoneText =
      'Perfecto. ¿Me dejás un número de WhatsApp o teléfono de contacto?'

    if (sendBotMessage) {
      await sendBotMessage(sid, askPhoneText, { kind: 'askPhone' })
    }

    if (pushLocalBotMessage) {
      pushLocalBotMessage(askPhoneText, 'ask-phone')
    }

    contactStage.value = 'askPhone'
  }

  async function handlePhoneStep (
    sid,
    text,
    { sendBotMessage, pushLocalBotMessage },
  ) {
    const cleaned = (text || '').replace(/\D/g, '')
    if (cleaned.length < 6) {
      const retryText =
        'Necesito un número un poco más completo (incluí código de área, por ejemplo 264xxxxxxx).'

      if (sendBotMessage) {
        await sendBotMessage(sid, retryText, { kind: 'invalidPhone' })
      }

      if (pushLocalBotMessage) {
        pushLocalBotMessage(retryText, 'phone-invalid')
      }

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

    if (sendBotMessage) {
      await sendBotMessage(sid, doneText, { kind: 'contactDone' })
    }

    if (pushLocalBotMessage) {
      pushLocalBotMessage(doneText, 'contact-done')
    }

    contactStage.value = 'done'
  }

  return {
    contact,
    contactStage,
    askForName,
    handleNameStep,
    handleEmailStep,
    handlePhoneStep,
  }
}
