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
    this.time = this.experience.time;

    this.setAmbientLight();
    this.setDirectionalLight();
    this.setPointLight();
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
    this.directionalLight.position.x = 25;
    this.directionalLight.position.y = 25;
    this.directionalLight.position.z = -25;
    this.directionalLight.lookAt(new THREE.Vector3());
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.width = 4096;
    this.directionalLight.shadow.mapSize.height = 4096;
    this.directionalLight.shadow.camera.left = -100;
    this.directionalLight.shadow.camera.right = 100;
    this.directionalLight.shadow.camera.top = 100;
    this.directionalLight.shadow.camera.bottom = -100;
    this.directionalLight.shadow.camera.near = -1;
    this.directionalLight.shadow.camera.far = 1000;
    this.scene.add(this.directionalLight);
    // this.directionalLightHelper = new THREE.DirectionalLightHelper(
    //   this.directionalLight,
    // );
    // this.scene.add(this.directionalLightHelper);
  }

  setPointLight() {
    this.pointLight = new THREE.PointLight(new THREE.Color(0x000099), 100);
    this.pointLight.position.y = 100;
    this.pointLight.position.x = 2;
    this.pointLight.position.z = 1;
    // this.scene.add(this.pointLight);

    this.pointLightHelper = new THREE.PointLightHelper(this.pointLight);
    this.scene.add(this.pointLightHelper);
  }

  update() {
    this.ambientLight.intensity = this.params.ambientLightIntensity;
    this.directionalLight.intensity = this.params.directionalLightIntensity;
    this.directionalLight.lookAt(new THREE.Vector3());
    this.pointLight.position.y = 7 + Math.sin(this.time.elapsed * 0.001);
    this.pointLight.rotation.x = Math.sin(this.time.elapsed * 0.001);
    this.pointLight.rotation.z = Math.cos(this.time.elapsed * 0.001);
  }
}
