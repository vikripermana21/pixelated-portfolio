import Experience from "../Experience";
import nipplejs from "nipplejs";
import { inputStore } from "../Utils/Store";

export default class JoystickController {
  constructor() {
    this.experience = new Experience();

    this.instance;
    this.options = {
      maxNumberOfNipples: 1,
      mode: "dynamic",
      restJoystick: true,
      shape: "circle",
      dynamicPage: true,
    };

    this.setInstance();
  }
  setInstance() {
    this.instance = nipplejs.create(this.options);
  }

  update() {
    this.instance
      .on("move", (evt, data) => {
        const forward = data.vector.y;
        const turn = data.vector.x;
        const distance = data.distance;
        const angle = data.angle.degree;

        if (angle < 130 && angle > 30) {
          inputStore.setState({ forward: true });
        } else {
          inputStore.setState({ forward: false });
        }

        if (angle < 50 || angle > 300) {
          inputStore.setState({ right: true });
        } else {
          inputStore.setState({ right: false });
        }

        if (angle > 120 && angle < 230) {
          inputStore.setState({ left: true });
        } else {
          inputStore.setState({ left: false });
        }

        if (angle > 230 && angle < 320) {
          inputStore.setState({ backward: true });
        } else {
          inputStore.setState({ backward: false });
        }

        if (distance > 25) {
          inputStore.setState({ run: true });
        } else {
          inputStore.setState({ run: false });
        }
      })
      .on("end", (evt) => {
        inputStore.setState({
          forward: false,
          backward: false,
          left: false,
          right: false,
          run: false,
        });
      });
  }
}
