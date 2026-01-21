import Experience from "../Experience";
import * as THREE from "three";
import { FlexibleToonMaterial } from "../Materials/FlexibleToonMaterial";
import vertexShader from "../Shaders/Grace/grace.vert";
import fragmentShader from "../Shaders/Grace/grace.frag";
import gsap from "gsap";

export default class Grace {
  constructor() {
    this.sound = new Audio("/audio/grace.mp3");
    this.sound.volume = 0.2;
    this.params = {
      uColor: "#f8f1e2",
    };
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.time = this.experience.time;
    this.camera = this.experience.camera;
    this.debug = this.experience.debug;
    this.sizes = this.experience.sizes;

    this.setInstance();

    window.addEventListener("click", () => {
      if (!this.plane) {
        this.sound.play();
        this.setLight();
      }
    });

    this.setTweaks();
  }

  setInstance() {
    this.geo = new THREE.BoxGeometry(1, 2, 1);
    this.mat = new FlexibleToonMaterial();
    this.instance = new THREE.Mesh(this.geo, this.mat);
    this.scene.add(this.instance);
  }

  setLight() {
    this.plane = new THREE.Mesh(
      new THREE.PlaneGeometry(50, 50),
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color(this.params.uColor) },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    this.plane.layers.set(1);
    this.scene.add(this.plane);

    this.pointLight = new THREE.PointLight(
      new THREE.Color(this.params.pointLightColor),
      0,
    );
    this.pointLight.decay = 1;
    this.pointLight.distance = 40;
    this.scene.add(this.pointLight);

    gsap.to(this.pointLight, {
      intensity: 100,
      ease: "sine.inOut",
      duration: 3,
    });

    gsap.to(this.plane.material.uniforms.uTime, {
      value: 10,
      duration: 10,
      ease: "power.inOut",
    });
  }

  setTweaks() {
    if (this.debug.active) {
      this.tweaks = this.debug.ui.addFolder({ title: "Grace" });
      this.tweaks.addBinding(this.params, "uColor").on("change", (ev) => {
        this.plane.material.uniforms.uColor.value = new THREE.Color(ev.value);
      });
    }
  }

  update() {
    this.instance.position.y = 5 + Math.sin(this.time.elapsed * 0.001) * 2;
    if (this.plane) {
      this.plane.position.copy(this.instance.position);
      this.plane.lookAt(
        this.camera.instance.position.x,
        0,
        this.camera.instance.position.z,
      );
      this.pointLight.position.y = 15 + Math.sin(this.time.elapsed * 0.001) * 2;
    }
  }
}
