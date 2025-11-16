// src/service/apiClient.js

// Resolución de la URL base del backend
const API_BASE_URL =
  // 1) Si algún día usás Vite env, lo toma
  (import.meta && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  // 2) Si lo definís desde WP (window.SOLAR_CALCULATOR_API_BASE)
  (typeof window !== 'undefined' && window.SOLAR_CALCULATOR_API_BASE) ||
  // 3) Fallback producción
  'https://solar-backend.cingulado.org';

// Enviar lead del simulador solar
export async function postLead(payload) {
  const res = await fetch(`${API_BASE_URL}/api/leads/solar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const msg =
      (data && (data.message || data.error)) ||
      `Error HTTP ${res.status} al contactar API`;
    const error = new Error(msg);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data || { ok: true };
}
