import { inputStore } from "../Utils/Store";

export default class InputController {
  constructor() {
    this.startListening();
    this.inputStore = inputStore;
    this.keyPressed = {};
  }

  startListening() {
    window.addEventListener("keydown", (event) => {
      this.onKeyDown(event);
    });

    window.addEventListener("keyup", (event) => {
      this.onKeyUp(event);
    });
  }

  onKeyDown(event) {
    if (this.keyPressed[event.code]) return;

    switch (event.code) {
      case "KeyE":
        inputStore.setState({ touchGrace: true });
        break;
      case "KeyW":
      case "ArrowUp":
        inputStore.setState({ forward: true });
        break;
      case "KeyA":
      case "ArrowLeft":
        inputStore.setState({ left: true });
        break;
      case "KeyS":
      case "ArrowDown":
        inputStore.setState({ backward: true });
        break;
      case "KeyD":
      case "ArrowRight":
        inputStore.setState({ right: true });
        break;
      case "ShiftLeft":
        inputStore.setState({ run: true });
        break;
    }
    this.keyPressed[event.code] = true;
  }

  onKeyUp(event) {
    switch (event.code) {
      case "KeyW":
      case "ArrowUp":
        inputStore.setState({ forward: false });
        break;
      case "KeyA":
      case "ArrowLeft":
        inputStore.setState({ left: false });
        break;
      case "KeyS":
      case "ArrowDown":
        inputStore.setState({ backward: false });
        break;
      case "KeyD":
      case "ArrowRight":
        inputStore.setState({ right: false });
        break;
      case "ShiftLeft":
        inputStore.setState({ run: false });
        break;
    }
    this.keyPressed[event.code] = false;
  }
}
