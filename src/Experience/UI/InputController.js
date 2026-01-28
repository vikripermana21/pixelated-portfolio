import { inputStore } from "../Utils/Store";

export default class InputController {
  constructor() {
    this.startListening();
    this.inputStore = inputStore;
    this.keyPressed = {};
    this.isClicking = false;

    inputStore.subscribe((state) => {
      this.isClicking = state.isClicking;
    });
  }

  startListening() {
    window.addEventListener("keydown", (event) => {
      this.onKeyDown(event);
    });

    window.addEventListener("keyup", (event) => {
      this.onKeyUp(event);
    });

    // window.addEventListener("mousedown", (event) => {
    //   inputStore.setState({ isClicking: true, mouse: event });
    //   // this.onTouchMove(event);
    // });
    //
    // window.addEventListener("mousemove", (event) => {
    //   // this.onTouchMove(event);
    // });
    //
    // window.addEventListener("mouseup", (event) => {
    //   inputStore.setState({ isClicking: false, mouse: event });
    // });

    window.addEventListener("touchstart", (event) => {
      inputStore.setState({ isClicking: true, mouse: event });
      this.onTouchMove(event);
    });

    window.addEventListener("touchmove", (event) => {
      this.onTouchMove(event);
    });
    window.addEventListener("touchend", (event) => {
      inputStore.setState({ isClicking: false });
      this.onTouchMove(event);
    });
  }

  onTouchMove(event) {
    const x = event?.changedTouches?.[0]?.pageX / window.innerWidth;
    const y = event?.changedTouches?.[0]?.pageY / window.innerHeight;

    if (this.isClicking) {
      inputStore.setState({ mouse: { x, y } });
    }
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
