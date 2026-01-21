import Experience from "../Experience";
import * as THREE from "three";
import { FlexibleToonMaterial } from "../Materials/FlexibleToonMaterial";

export default class Pillars {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.layers = this.experience.layers;

    this.resource = this.resources.items.pillarsModel;
    this.setModel();
  }

  setModel() {
    this.model = this.resource.scene;
    this.model.scale.setScalar(2);
    this.model.position.x = -70;
    this.model.position.z = -70;
    this.scene.add(this.model);

    this.model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        // child.receiveShadow = true;
        child.material = new FlexibleToonMaterial({
          color: 0x747474,
        });
      }
    });
  }
}
