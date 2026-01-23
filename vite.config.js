import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";
import glsl from "vite-plugin-glsl";
import wasm from "vite-plugin-wasm";

export default defineConfig({
  build: {
    target: "es2022",
    cssTarget: "es2022",
  },
  plugins: [glsl(), wasm(), cloudflare()],
});
