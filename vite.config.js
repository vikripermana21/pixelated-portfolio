import { defineConfig } from "vite";
import glsl from "vite-plugin-glsl";
import wasm from "vite-plugin-wasm";

export default defineConfig({
  build: {
    cssTarget: "es2022",
  },
  plugins: [glsl(), wasm()],
});
