import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";
import glsl from "vite-plugin-glsl";
import wasm from "vite-plugin-wasm";

export default defineConfig({
  plugins: [glsl(), wasm(), cloudflare()],
});
