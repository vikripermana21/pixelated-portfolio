import { createStore } from "zustand/vanilla";

export const inputStore = createStore(() => ({
  forward: false,
  backward: false,
  left: false,
  right: false,
  run: false,
  touchGrace: false,
}));
