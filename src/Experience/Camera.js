import { OrthographicCamera } from "three";
import Experience from "./Experience";
import { OrbitControls } from "three/examples/jsm/Addons.js";

export default class Camera {
  constructor() {
    this.experience = new Experience();
    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.canvas = this.experience.canvas;
    this.time = this.experience.time;

    this.setInstance();
    this.setControls();
  }

  setInstance() {
    this.instance = new OrthographicCamera(
      this.sizes.width / -50,
      this.sizes.width / 50,
      this.sizes.height / 50,
      this.sizes.height / -50,
      -20,
      1000,
    );
    this.instance.position.x = 50;
    this.instance.position.y = 50;
    this.instance.position.z = 50;
    this.instance.layers.enableAll();
    this.scene.add(this.instance);
  }

  setControls() {
    this.controls = new OrbitControls(this.instance, this.canvas);
    this.controls.enableDamping = true;
  }

  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height;
    this.instance.updateProjectionMatrix();
  }

  update() {
    this.controls.update();
  }
}
