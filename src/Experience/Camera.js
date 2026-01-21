import { OrthographicCamera } from "three";
import Experience from "./Experience";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import * as THREE from "three";

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

    this.cameraOffset = new THREE.Vector3(50, 50, 50); // height, distance
    this.cameraLerpFactor = 0.08; // smoothing (0–1)
    this.cameraMinusLimit = -10; // smoothing (0–1)

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

  updateCamera(character) {
    this.instance.position.set(
      THREE.MathUtils.clamp(
        character.position.x + this.cameraOffset.x,
        this.cameraMinusLimit,
        100,
      ),
      50,
      THREE.MathUtils.clamp(
        character.position.z + this.cameraOffset.z,
        this.cameraMinusLimit,
        100,
      ),
    );
    this.instance.lookAt(
      new THREE.Vector3(
        THREE.MathUtils.clamp(
          character.position.x,
          -this.cameraOffset.x + this.cameraMinusLimit,
          50,
        ),
        0,
        THREE.MathUtils.clamp(
          character.position.z,
          -this.cameraOffset.z + this.cameraMinusLimit,
          50,
        ),
      ),
    );
  }

  update() {
    this.controls.update();
    this.controls.autoRotate = this.params.autoRotate;
  }
}
