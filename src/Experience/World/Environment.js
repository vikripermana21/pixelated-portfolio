import gsap from "gsap";
import Experience from "../Experience";
import * as THREE from "three";

export default class Environment {
  constructor() {
    this.params = {
      ambientLightIntensity: 0,
      directionalLightIntensity: 0,
      pointLightIntensity: 0,
      pointLightColor: "#ffe500",
      pointLightDecay: 1,
    };
    this.experience = new Experience();
    this.debug = this.experience.debug;
    this.scene = this.experience.scene;
    this.time = this.experience.time;

    this.setTweaks();
    this.setAmbientLight();
    this.setDirectionalLight();
    this.setPointLight();
  }

  setTweaks() {
    if (this.debug.active) {
      this.tweaks = this.debug.ui.addFolder({
        title: "Lighting",
        expanded: false,
      });

      this.ambientTweaks = this.tweaks.addFolder({
        title: "Ambient Light",
      });

      this.directionalTweaks = this.tweaks.addFolder({
        title: "Directional Light",
      });

      this.pointTweaks = this.tweaks.addFolder({
        title: "Point Light",
      });
      this.ambientTweaks.addBinding(this.params, "ambientLightIntensity", {
        label: "intensity",
        min: 0,
        max: 10,
        step: 0.1,
      });

      this.directionalTweaks.addBinding(
        this.params,
        "directionalLightIntensity",
        {
          label: "intensity",
          min: 0,
          max: 10,
          step: 0.1,
        },
      );
      this.pointTweaks.addBinding(this.params, "pointLightIntensity", {
        label: "intensity",
        min: 0,
        max: 1000,
        step: 1,
      });

      this.pointTweaks.addBinding(this.params, "pointLightDecay", {
        label: "decay",
        min: 0,
        max: 10,
        step: 0.1,
      });
      this.pointTweaks
        .addBinding(this.params, "pointLightColor", { label: "color" })
        .on("change", (ev) => {
          this.pointLight.color.set(new THREE.Color(ev.value));
        });
    }
  }

  setAmbientLight() {
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
    this.pointLight = new THREE.PointLight(
      new THREE.Color(this.params.pointLightColor),
      this.params.pointLightIntensity,
    );
    this.pointLight.decay = 1;
    this.pointLight.distance = 40;
    this.scene.add(this.pointLight);

    gsap.to(this.pointLight, {
      intensity: 100,
      ease: "sine.inOut",
      duration: 2,
    });

    // this.pointLightHelper = new THREE.PointLightHelper(this.pointLight);
    // this.scene.add(this.pointLightHelper);
  }

  update() {
    this.ambientLight.intensity = this.params.ambientLightIntensity;
    this.directionalLight.intensity = this.params.directionalLightIntensity;
    // this.pointLight.intensity = this.params.pointLightIntensity;
    this.pointLight.decay = this.params.pointLightDecay;
    this.directionalLight.lookAt(new THREE.Vector3());
    this.pointLight.position.y = 10 + Math.sin(this.time.elapsed * 0.001);
    this.pointLight.rotation.x = Math.sin(this.time.elapsed * 0.001);
    this.pointLight.rotation.z = Math.cos(this.time.elapsed * 0.001);
  }
}
