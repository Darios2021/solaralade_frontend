<template>
  <v-app>
    <SolarGreenLanding @open-calculator="goCalculator" />
  </v-app>
</template>

<script setup>
import SolarGreenLanding from "./components/SolarGreenLanding.vue";

function goCalculator() {
  window.location.href = "https://grupoalade.com/calculo-paneles/";
}
</script>
