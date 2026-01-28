import Experience from "../Experience";
import * as THREE from "three";
import { FlexibleToonMaterial } from "../Materials/FlexibleToonMaterial";
import { label } from "three/tsl";

export default class Floor {
  constructor() {
    this.params = {
      color: "#5c9237",
      step: 10.0,
      noiseStrength: 0.35,
      noiseScale: 0.05,
    };
    this.experience = new Experience();
    this.world = this.experience.world;
    this.time = this.experience.time;
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

      this.tweaks.addBinding(this.params, "noiseScale", {
        label: "Noise Scale",
        min: 0,
        max: 1,
        step: 0.01,
      });

      this.tweaks.addBinding(this.params, "noiseStrength", {
        label: "Noise Strength",
        min: 0,
        max: 1,
        step: 0.01,
      });
    }
  }

  setInstance() {
    this.geo = new THREE.BoxGeometry(300, 300, 2);
    this.mat = new FlexibleToonMaterial({
      color: new THREE.Color(this.params.color),
      isGrass: false,
      step: this.params.step,
    });
    this.instance = new THREE.Mesh(this.geo, this.mat);
    this.instance.position.y = -1;
    this.instance.rotation.x = -Math.PI / 2;
    this.instance.receiveShadow = true;
    this.scene.add(this.instance);

    this.world.physics.add(this.instance, "fixed", "cuboid");
  }

  update() {
    this.mat.step = this.params.step;
    this.mat.noiseScale = this.params.noiseScale;
    this.mat.noiseStrength = this.params.noiseStrength;
    this.mat.time = this.time.elapsed * 0.001;
    if (this.world) {
      this.world.grass.instance.material.step = this.params.step;
      this.world.grass.instance.material.noiseScale = this.params.noiseScale;
      this.world.grass.instance.material.noiseStrength =
        this.params.noiseStrength;
      this.world.pillars.model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material.step = this.params.step;
        }
      });
    }
  }
}
