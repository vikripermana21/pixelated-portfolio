import Experience from "../Experience";
import * as THREE from "three";
import { FlexibleToonMaterial } from "../Materials/FlexibleToonMaterial";
import { label } from "three/tsl";

export default class Floor {
  constructor() {
    this.params = {
      color: "#2e8b57",
      step: 10.0,
    };
    this.experience = new Experience();
    this.world = this.experience.world;
    this.resources = this.experience.resources;
    this.debug = this.experience.debug;
    this.scene = this.experience.scene;
    this.grassUniforms =
      this.experience?.world?.grass?.instance?.material?.uniforms?.uColor;

    this.gradientMap = this.resources.items.gradientMap;

    this.setInstance();
    this.setParams();
  }

  setParams() {
    if (this.debug.active) {
      this.tweaks = this.debug.ui.addFolder({ title: "Environment" });
      this.tweaks
        .addBinding(this.params, "color", {
          label: "Grass Floor Color",
        })
        .on("change", (ev) => {
          this.instance.material.color.set(new THREE.Color(ev.value));
          this.experience.world.grass.instance.material.color = new THREE.Color(
            ev.value,
          );
        });

      this.tweaks.addBinding(this.params, "step", {
        label: "Step Lighting",
        min: 1,
        max: 10,
        step: 1,
      });
    }
  }

  setInstance() {
    this.geo = new THREE.PlaneGeometry(300, 300);
    this.mat = new FlexibleToonMaterial({
      color: new THREE.Color(this.params.color),
      isGrass: false,
      step: this.params.step,
    });
    this.instance = new THREE.Mesh(this.geo, this.mat);
    this.instance.rotation.x = -Math.PI / 2;
    this.instance.receiveShadow = true;
    this.scene.add(this.instance);
  }

  update() {
    this.mat.step = this.params.step;
    if (this.world) {
      this.world.grass.instance.material.step = this.params.step;
      this.world.pillars.model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material.step = this.params.step;
        }
      });
    }
  }
}
