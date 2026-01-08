import Experience from "../Experience";
import * as THREE from "three";

export default class Pillars {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.layers = this.experience.layers;

    this.resource = this.resources.items.pillarsModel;
    this.gradientMap = this.resources.items.gradientMap;
    this.setModel();
  }

  setModel() {
    this.model = this.resource.scene;
    this.model.scale.setScalar(2);
    this.model.position.z = -15;
    this.model.position.x = 2;
    this.scene.add(this.model);

    this.model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.material = new THREE.MeshToonMaterial({
          color: 0x747474,
          gradientMap: this.gradientMap,
        });
      }
    });
  }
}
