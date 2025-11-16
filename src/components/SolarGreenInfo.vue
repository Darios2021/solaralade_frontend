<template>
  <div class="si-wrapper">

    <!-- HERO PRINCIPAL -->
    <section class="si-hero">
      <h1>Energía Solar Inteligente</h1>
      <p>
        Descubrí cómo ahorrar todos los meses y mejorar la eficiencia energética
        con tecnología solar de Grupo Alade.
      </p>

      <div class="si-hero-buttons">
        <button class="si-btn-primary" @click="goToCalc">
          Hacer simulación ahora
        </button>
        <button class="si-btn-secondary" @click="scrollTo('#beneficios')">
          Ver beneficios
        </button>
      </div>
    </section>

    <!-- BENEFICIOS -->
    <section id="beneficios" class="si-benefits">
      <h2>¿Por qué elegir energía solar?</h2>

      <div class="si-benefit-grid">
        <div class="si-card">
          <h3 class="si-card-title">Ahorro inmediato</h3>
          <p>Reducí tus costos desde el primer mes.</p>
        </div>

        <div class="si-card">
          <h3 class="si-card-title">Vida útil +20 años</h3>
          <p>Equipos de máxima durabilidad certificados.</p>
        </div>

        <div class="si-card">
          <h3 class="si-card-title">Instalación profesional</h3>
          <p>Equipo técnico especializado de Grupo Alade.</p>
        </div>

        <div class="si-card">
          <h3 class="si-card-title">Financiación accesible</h3>
          <p>Opciones disponibles para hogares y empresas.</p>
        </div>
      </div>
    </section>

    <!-- CÓMO FUNCIONA -->
    <section class="si-how">
      <h2>¿Cómo funciona?</h2>

      <div class="si-how-steps">
        <div class="si-step">
          <h3 class="si-step-title">1. Auditoría</h3>
          <p>Evaluamos tu consumo real.</p>
        </div>

        <div class="si-step">
          <h3 class="si-step-title">2. Diseño</h3>
          <p>Proyectamos tu sistema solar ideal.</p>
        </div>

        <div class="si-step">
          <h3 class="si-step-title">3. Instalación</h3>
          <p>Montaje certificado y seguro.</p>
        </div>

        <div class="si-step">
          <h3 class="si-step-title">4. Monitoreo</h3>
          <p>Seguimiento del sistema 24/7.</p>
        </div>
      </div>
    </section>

    <!-- CTA FINAL -->
    <section class="si-cta">
      <h2>¿Listo para empezar a ahorrar?</h2>
      <button class="si-cta-btn" @click="goToCalc">Solicitar cotización</button>
    </section>
  </div>
</template>

<script>
export default {
  name: "SolarGreenInfo",

  methods: {
    goToCalc() {
      window.location.href =
        window.SOLAR_CALCULATOR_URL ||
        "https://grupoalade.com.ar/solar-simulador";
    },

    scrollTo(id) {
      const el = document.querySelector(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }
};
</script>

<style scoped>
/* ============================================
   ESTILOS ALADE GREEN RESPONSIVE
============================================ */

* {
  font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
}

.si-wrapper {
  width: 100%;
  overflow-x: hidden;
}

/* ------------------ HERO ------------------ */
.si-hero {
  width: 100%;
  min-height: 90vh;
  padding: 80px 26px;
  color: white;
  background: linear-gradient(
      rgba(26, 89, 52, 0.55),
      rgba(26, 89, 52, 0.85)
    ),
    url("https://solar-calculator.cingulado.org/assets/solar-bg.jpg");
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.si-hero h1 {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 14px;
}

.si-hero p {
  font-size: 1.2rem;
  max-width: 520px;
  opacity: 0.92;
  margin-bottom: 28px;
}

.si-hero-buttons {
  display: flex;
  gap: 12px;
}

/* Botones */
.si-btn-primary {
  background: #2a7c41;
  padding: 14px 28px;
  border-radius: 999px;
  color: white;
  font-weight: 700;
}

.si-btn-secondary {
  background: rgba(255, 255, 255, 0.25);
  padding: 14px 28px;
  border-radius: 999px;
  color: white;
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.35);
}

/* ------------------ BENEFICIOS ------------------ */
.si-benefits {
  background: white;
  padding: 70px 26px;
}

.si-benefits h2 {
  text-align: center;
  font-size: 2.1rem;
  color: #1a5934;
  font-weight: 800;
  margin-bottom: 40px;
}

.si-card {
  background: #f5fbf7;
  padding: 26px;
  border-radius: 18px;
  border: 1px solid rgba(42, 124, 65, 0.20);
}

.si-card-title {
  color: #1a5934;
  font-weight: 700;
  font-size: 1.25rem;
}

/* ------------------ GRILLA ------------------ */
.si-benefit-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 26px;
}

/* ------------------ HOW IT WORKS ------------------ */
.si-how {
  background: #fafafa;
  padding: 70px 26px;
}

.si-how h2 {
  text-align: center;
  color: #1a5934;
  font-size: 2.1rem;
  font-weight: 800;
}

.si-how-steps {
  display: grid;
  gap: 26px;
  margin-top: 40px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.si-step {
  background: #fff;
  padding: 20px;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.07);
  text-align: center;
}

.si-step-title {
  color: #1a5934;
  font-weight: 600;
}

/* ------------------ CTA ------------------ */
.si-cta {
  background: #2a7c41;
  color: #fff;
  text-align: center;
  padding: 70px 26px;
}

.si-cta-btn {
  background: white;
  color: #1a5934;
  padding: 14px 30px;
  border-radius: 999px;
  font-weight: 700;
}
</style>
