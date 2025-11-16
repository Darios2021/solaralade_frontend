<template>
  <div class="solar-green-landing">
    <h1>Bienvenido a ALADE Green</h1>

    <p class="subtitle">
      La energía solar para hogares y comercios con la calidad de Grupo Alade.
    </p>

    <v-btn
      color="primary"
      class="cta-btn"
      @click="$emit('open-calculator')"
    >
      Calcular mi ahorro
    </v-btn>
  </div>
</template>

<script setup>
defineEmits(["open-calculator"])
</script>

<style scoped>
.solar-green-landing {
  width: 100%;
  padding: 40px 20px;
  text-align: center;
}
.subtitle {
  color: #444;
  margin: 10px 0 30px;
}
.cta-btn {
  font-weight: 700;
  font-size: 1.1rem;
  padding: 14px 26px;
  border-radius: 999px;
}
</style>
