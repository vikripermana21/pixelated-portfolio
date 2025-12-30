import Experience from "../Experience";
import * as THREE from "three";

export default class Environment {
  constructor() {
    this.params = {
      ambientLightIntensity: 1,
      directionalLightIntensity: 1,
    };
    this.experience = new Experience();
    this.debug = this.experience.debug;
    this.scene = this.experience.scene;

    this.setAmbientLight();
    this.setDirectionalLight();
  }

  setAmbientLight() {
    this.debug.ui.addBinding(this.params, "ambientLightIntensity", {
      min: 0,
      max: 10,
      step: 0.1,
    });
    this.debug.ui.addBinding(this.params, "directionalLightIntensity", {
      min: 0,
      max: 10,
      step: 0.1,
    });

    this.ambientLight = new THREE.AmbientLight();
    this.ambientLight.intensity = this.params.ambientLightIntensity;
    this.scene.add(this.ambientLight);
  }

  setDirectionalLight() {
    this.directionalLight = new THREE.DirectionalLight();
    this.directionalLight.position.x = 5;
    this.directionalLight.position.y = 5;
    this.directionalLight.position.z = -5;
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.width = 4096;
    this.directionalLight.shadow.mapSize.height = 4096;
    this.directionalLight.shadow.camera.near = 2;
    this.directionalLight.shadow.camera.far = 15;
    this.scene.add(this.directionalLight);
  }

  update() {
    this.ambientLight.intensity = this.params.ambientLightIntensity;
    this.directionalLight.intensity = this.params.directionalLightIntensity;
  }
}
