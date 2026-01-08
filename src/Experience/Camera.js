import { OrthographicCamera } from "three";
import Experience from "./Experience";
import { OrbitControls } from "three/examples/jsm/Addons.js";

export default class Camera {
  constructor() {
    this.params = {
      autoRotate: false,
    };
    this.experience = new Experience();
    this.debug = this.experience.debug;
    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.canvas = this.experience.canvas;
    this.time = this.experience.time;

    this.setInstance();
    this.setControls();
    this.setDebug();
  }

  setInstance() {
    this.instance = new OrthographicCamera(
      this.sizes.width / -25,
      this.sizes.width / 25,
      this.sizes.height / 25,
      this.sizes.height / -25,
      -20,
      1000,
    );
    this.instance.position.x = 50;
    this.instance.position.y = 50;
    this.instance.position.z = 50;
    this.instance.lookAt(0, 0, 0);
    this.instance.layers.enableAll();
    this.scene.add(this.instance);
  }

  setControls() {
    this.controls = new OrbitControls(this.instance, this.canvas);
    this.controls.autoRotate = this.params.autoRotate;
    this.controls.enableDamping = true;
  }

  setDebug() {
    if (this.debug.active) this.debug.ui.addBinding(this.params, "autoRotate");
  }

  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height;
    this.instance.updateProjectionMatrix();
  }

  update() {
    this.controls.update();
    this.controls.autoRotate = this.params.autoRotate;
  }
}
