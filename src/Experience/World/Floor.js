import Experience from "../Experience";
import * as THREE from "three";

export default class Floor {
  constructor() {
    this.params = {
      color: "#48873a",
    };
    this.experience = new Experience();
    this.debug = this.experience.debug;
    this.scene = this.experience.scene;

    this.setParams();
    this.setInstance();
  }

  setParams() {
    this.debug.ui.addBinding(this.params, "color").on("change", (ev) => {
      this.instance.material.color.set(new THREE.Color(ev.value));
    });
  }

  setInstance() {
    this.geo = new THREE.PlaneGeometry(5, 5);
    this.mat = new THREE.MeshStandardMaterial({
      color: this.params.color,
    });

    this.instance = new THREE.Mesh(this.geo, this.mat);
    this.instance.rotation.x = -Math.PI / 2;
    this.instance.receiveShadow = true;
    this.scene.add(this.instance);
  }

  update() {}
}
