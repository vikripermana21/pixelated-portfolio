import Experience from "../Experience";
import * as THREE from "three";

export default class Floor {
  constructor() {
    this.params = {
      color: "#2e8b57",
    };
    this.experience = new Experience();
    this.resources = this.experience.resources;
    this.debug = this.experience.debug;
    this.scene = this.experience.scene;
    this.grassUniforms =
      this.experience?.world?.grass?.instance?.material?.uniforms?.uColor;

    this.gradientMap = this.resources.items.gradientMap;

    this.setParams();
    this.setInstance();
  }

  setParams() {
    if (this.debug.active) {
      this.debug.ui.addBinding(this.params, "color").on("change", (ev) => {
        this.instance.material.color.set(new THREE.Color(ev.value));
        this.experience.world.grass.instance.material.uniforms.uColor.value =
          new THREE.Color(ev.value);
      });
    }
  }

  setInstance() {
    this.geo = new THREE.PlaneGeometry(300, 300);
    this.mat = new THREE.MeshToonMaterial({
      color: this.params.color,
      gradientMap: this.gradientMap,
    });

    this.instance = new THREE.Mesh(this.geo, this.mat);
    this.instance.rotation.x = -Math.PI / 2;
    this.instance.receiveShadow = true;
    this.scene.add(this.instance);
  }

  update() {}
}
