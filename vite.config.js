import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vuetify from "vite-plugin-vuetify";

export default defineConfig(({ mode }) => {
  const ENTRIES = {
    calculator: "src/apps/calculatorApp.js",
    green: "src/apps/solarGreenApp.js",
  };

  return {
    plugins: [vue(), vuetify({ autoImport: true })],

    build: {
      outDir: "dist",
      emptyOutDir: false,

      lib: {
        entry: ENTRIES[mode],
        name: mode === "calculator" ? "SolarCalculator" : "SolarGreenLanding",
        formats: ["iife"],
        fileName: () =>
          mode === "calculator" ? "solar-calculator.js" : "solar-green.js",
      },

      rollupOptions: {
        output: {
          assetFileNames: "assets/[name].[ext]",
        },
      },
    },
  };
});
