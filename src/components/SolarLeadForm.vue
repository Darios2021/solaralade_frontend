<template>
  <div class="lead-form">
    <v-form ref="formRef" class="form-body">
      <!-- Indicador de pasos -->
      <div class="step-indicator">
        <span
          v-for="n in totalSteps"
          :key="n"
          class="step-dot"
          :class="{ active: n === step }"
        />
      </div>

      <!-- PASO 1: UBICACIÓN -->
      <div v-if="step === 1" class="step-body">
        <v-text-field
          v-model="form.city"
          label="Ciudad"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          :rules="[rules.required]"
        />

        <v-select
          v-model="form.province"
          :items="provinces"
          item-title="label"
          item-value="value"
          label="Seleccionar provincia"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          :rules="[rules.required]"
        />

        <v-select
          v-model="form.country"
          :items="countries"
          item-title="label"
          item-value="value"
          label="País"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          :rules="[rules.required]"
        />
      </div>

      <!-- PASO 2: MOTIVO -->
      <div v-else-if="step === 2" class="step-body">
        <v-select
          v-model="form.purpose"
          :items="purposes"
          item-title="label"
          item-value="value"
          label="¿Para qué querés un sistema Solar fotovoltaico?"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          :rules="[rules.required]"
        />
      </div>

      <!-- PASO 3: TIPO DE USO -->
      <div v-else-if="step === 3" class="step-body">
        <v-select
          v-model="form.usage"
          :items="usages"
          item-title="label"
          item-value="value"
          label="Esto es para:"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          :rules="[rules.required]"
        />

        <v-text-field
          v-model="form.currentBill"
          label="¿Cuánto pagás aprox. de luz al mes? (ARS)"
          type="text"
          placeholder="Ej: 20.000"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          :rules="[rules.requiredNumber]"
        />
      </div>

      <!-- PASO 4: DATOS DE CONTACTO -->
      <div v-else-if="step === 4" class="step-body">
        <v-text-field
          v-model="form.fullName"
          label="Nombre y apellido"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          :rules="[rules.required]"
        />

        <v-text-field
          v-model="form.phone"
          label="Teléfono"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          :rules="[rules.required]"
        />

        <v-text-field
          v-model="form.email"
          label="Email"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          :rules="[rules.required, rules.email]"
        />
      </div>

      <!-- BOTONES FORM -->
      <div class="form-actions">
        <v-btn
          v-if="step > 1"
          variant="text"
          class="back-btn"
          :disabled="isSubmitting"
          @click="goPrev"
        >
          Anterior
        </v-btn>

        <v-spacer />

        <v-btn
          class="submit-btn"
          color="primary"
          variant="flat"
          :loading="isSubmitting"
          :disabled="isSubmitting || hasSubmitted"
          @click="step < totalSteps ? goNext() : handleSubmit()"
        >
          {{
            hasSubmitted
              ? 'Solicitud enviada'
              : step < totalSteps
              ? 'Siguiente'
              : 'Solicitar cotización'
          }}
        </v-btn>
      </div>

      <!-- MENSAJE DE ERROR SIMPLE -->
      <p v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </p>
    </v-form>

    <!-- MODAL DE ÉXITO -->
    <v-dialog
      v-model="showSuccess"
      max-width="430"
      persistent
      transition="scale-transition"
    >
      <v-card class="success-card">
        <div class="success-icon-wrap">
          <v-icon size="40" class="success-icon">mdi-check-circle</v-icon>
        </div>
        <h3 class="success-title">
          ¡Gracias{{ form.fullName ? `, ${form.fullName}` : '' }}!
        </h3>

        <p class="success-copy">
          Recibimos tu solicitud de cotización. Un asesor de Grupo Alade se va a
          contactar al
          <strong>{{ form.phone || 'teléfono que nos indicaste' }}</strong>
          <span v-if="form.email">
            y al correo <strong>{{ form.email }}</strong>
          </span>
          en las próximas horas hábiles.
        </p>

        <div class="success-summary">
          <div class="success-row">
            <span class="success-label">Ubicación</span>
            <span class="success-value">{{ summaryLocation }}</span>
          </div>
          <div class="success-row">
            <span class="success-label">Uso del sistema</span>
            <span class="success-value">{{ summaryUsage }}</span>
          </div>
          <div class="success-row">
            <span class="success-label">Factura actual</span>
            <span class="success-value">{{ summaryBill }}</span>
          </div>
          <div class="success-row">
            <span class="success-label">Tamaño estimado</span>
            <span class="success-value">{{ summarySystemSize }}</span>
          </div>
        </div>

        <p class="success-footnote">
          Podés cerrar esta ventana, no necesitás hacer nada más.
        </p>

        <div class="success-actions">
          <v-btn
            class="success-btn success-btn--primary"
            color="primary"
            variant="flat"
            @click="handleReset"
          >
            Nueva simulación
          </v-btn>

          <v-btn
            class="success-btn success-btn--ghost"
            variant="text"
            @click="closeOnly"
          >
            Cerrar
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { defineEmits } from 'vue'
import { useSolarLead } from '../composables/useSolarLead'

defineEmits(['open-calc', 'open-solar-green'])

const {
  step,
  totalSteps,
  formRef,
  form,
  provinces,
  countries,
  purposes,
  usages,
  rules,
  isSubmitting,
  errorMessage,
  showSuccess,
  summaryLocation,
  summaryUsage,
  summaryBill,
  summarySystemSize,
  goNext,
  goPrev,
  handleSubmit,
  resetFlow,
  closeOnly,
  hasSubmitted,
} = useSolarLead()

const handleReset = () => {
  resetFlow()
}
</script>

<style scoped>
.lead-form {
  width: 100%;
}

.form-body {
  margin-top: 8px;
}

.step-indicator {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin: 4px 0 14px;
}

.step-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background-color: #d3d3d3;
  transition: all 0.2s ease;
}

.step-dot.active {
  width: 20px;
  background-color: #2a7c41;
}

.step-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-actions {
  display: flex;
  align-items: center;
  margin-top: 18px;
}

.back-btn {
  color: #1a5934;
  text-transform: none;
}

.submit-btn {
  min-width: 120px;
  font-weight: 600;
  color: #ffffff;
  text-transform: none;
  font-size: 0.82rem;
}

.error-message {
  margin-top: 10px;
  font-size: 0.8rem;
  color: #c62828;
}

/* MODAL ÉXITO */
.success-card {
  padding: 18px 18px 16px;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.22);
}

.success-icon-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 6px;
}

.success-icon {
  color: #2a7c41;
  animation: pop-in 0.45s ease-out;
}

@keyframes pop-in {
  0% {
    transform: scale(0.4);
    opacity: 0;
  }
  60% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.success-title {
  margin: 4px 0 6px;
  font-size: 1.05rem;
  font-weight: 800;
  text-align: center;
  color: #1a5934;
}

.success-copy {
  margin: 0 auto 12px;
  font-size: 0.82rem;
  color: #444;
  text-align: center;
}

.success-summary {
  margin: 0 auto 10px;
  padding: 8px 10px;
  border-radius: 12px;
  background: #f5fbf7;
  border: 1px solid rgba(42, 124, 65, 0.16);
  font-size: 0.78rem;
}

.success-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 4px;
}

.success-row:last-child {
  margin-bottom: 0;
}

.success-label {
  font-weight: 600;
  color: #1a5934;
}

.success-value {
  text-align: right;
  color: #333;
}

.success-footnote {
  margin: 4px 0 8px;
  font-size: 0.74rem;
  color: #666;
  text-align: center;
}

/* Acciones del modal: botones más livianos */
.success-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 6px;
}

.success-btn {
  width: 100%;
  justify-content: center;
  font-size: 0.8rem !important;
  font-weight: 600 !important;
  text-transform: none !important;
  min-height: 30px !important;
  border-radius: 999px !important;
}

.success-btn--primary {
  box-shadow: 0 2px 6px rgba(42, 124, 65, 0.25);
}

.success-btn--ghost {
  font-weight: 500 !important;
}


/* ============================================
   FIX SELECT — eliminar líneas fantasma en Vuetify
============================================ */

/* Quita la línea interna superior que deja el theme */
:deep(.v-select .v-field__input),
:deep(.v-select .v-field__input *),
:deep(.v-select .v-field__overlay),
:deep(.v-select .v-field__outline) {
  box-shadow: none !important;
  border-top: none !important;
  background: transparent !important;
}

/* Elimina pseudo-elementos externos */
:deep(.v-select .v-field__outline::before),
:deep(.v-select .v-field__outline::after),
:deep(.v-select .v-field__input::before),
:deep(.v-select .v-field__input::after) {
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
}

/* Mantiene el borde rojo correcto de Vuetify */
:deep(.v-input--error .v-field__outline) {
  border-color: #c62828 !important;
  border-width: 2px !important;
}

/* Evita que Elementor agregue bordes extra */
:deep(.v-select),
:deep(.v-select *) {
  outline: none !important;
  background-image: none !important;
  border-image: none !important;
}

</style>
