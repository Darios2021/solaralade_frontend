<template>
  <div class="green-view">
    <div class="aux-header">
      <h3 class="aux-title">Solar Green · Grupo Alade</h3>
      <p class="aux-subtitle">
        Descubrí nuestros proyectos solares integrales, financiamiento y
        soluciones llave en mano para hogares, comercios y campo.
      </p>
    </div>

    <ul class="info-list">
      <li>Diseño, instalación y puesta en marcha de sistemas fotovoltaicos.</li>
      <li>Equipos certificados y primeras marcas internacionales.</li>
      <li>Monitoreo y soporte técnico especializado.</li>
      <li>Opciones de financiamiento y beneficios impositivos vigentes.</li>
    </ul>

    <div class="aux-actions">
      <v-btn
        class="submit-btn"
        color="primary"
        variant="flat"
        @click="goToSolarGreen"
      >
        Ir al sitio Solar Green Alade
      </v-btn>

      <v-btn variant="text" class="back-btn" @click="emit('open-form')">
        Volver al simulador
      </v-btn>
    </div>
  </div>
</template>

<script setup>
import { defineEmits } from 'vue'

const emit = defineEmits(['open-form'])

const solarGreenUrl =
  typeof window !== 'undefined' && window.SOLAR_GREEN_URL
    ? window.SOLAR_GREEN_URL
    : 'https://grupoalade.com.ar/solar-green'

const goToSolarGreen = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('solar-calculator:open-solar-green', { detail: null }),
    )
    if (solarGreenUrl) {
      window.open(solarGreenUrl, '_blank')
    }
  }
}
</script>

<style scoped>
.green-view {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.aux-header {
  margin-bottom: 4px;
}

.aux-title {
  margin: 0 0 4px;
  font-size: 1rem;
  font-weight: 700;
  color: #1a5934;
}

.aux-subtitle {
  margin: 0;
  font-size: 0.83rem;
  color: #4f4f4f;
}

.info-list {
  margin: 4px 0 0;
  padding-left: 18px;
  font-size: 0.8rem;
  color: #444;
}

.info-list li {
  margin-bottom: 4px;
}

.aux-actions {
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.submit-btn {
  font-weight: 600;
  text-transform: none;
}

.back-btn {
  align-self: flex-start;
  padding-left: 0;
  text-transform: none;
}
</style>
