import Experience from "../Experience";
import * as THREE from "three";
import { FlexibleToonMaterial } from "../Materials/FlexibleToonMaterial";
import vertexShader from "../Shaders/Grace/grace.vert";
import fragmentShader from "../Shaders/Grace/grace.frag";
import gsap from "gsap";
import { inputStore } from "../Utils/Store";
import FootstepBank from "../Utils/FootstepBank";

export default class Grace {
  constructor() {
    this.params = {
      uColor: "#ffce3c",
    };
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.world = this.experience.world;
    this.time = this.experience.time;
    this.camera = this.experience.camera;
    this.debug = this.experience.debug;
    this.sizes = this.experience.sizes;
    this.area = new THREE.Box3();

    this.listener = new THREE.AudioListener();
    this.camera.instance.add(this.listener);
    this.audio = new FootstepBank(this.listener, [
      this.resources.items.graceSound,
    ]);

    inputStore.subscribe((state) => {
      this.touched = state.touchGrace;
    });

    this.setInstance();
    this.setTweaks();
  }

  touch() {
    setTimeout(() => {
      if (!this.plane) {
        this.audio.play(this.instance);
        this.setLight();
      }
    }, 2000);
  }

  setInstance() {
    this.instance = new THREE.Group();
    this.geo = new THREE.BoxGeometry(0.5, 1, 0.5);
    this.mat = new FlexibleToonMaterial({
      color: new THREE.Color(this.params.uColor),
    });
    this.mesh = new THREE.Mesh(this.geo, this.mat);
    this.mesh.position.y = 2;
    this.mesh.layers.set(2);
    this.instance.add(this.mesh);

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
    this.plane.layers.set(2);
    this.instance.add(this.plane);

    this.pointLight = new THREE.PointLight(
      new THREE.Color(this.params.uColor),
      0,
    );
    this.pointLight.decay = 1;
    this.pointLight.distance = 40;
    this.instance.add(this.pointLight);

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
        this.mesh.material.color = new THREE.Color(ev.value);
        this.pointLight.color = new THREE.Color(ev.value);
        this.plane.material.uniforms.uColor.value = new THREE.Color(ev.value);
      });
    }
  }

  update() {
    this.instance.position.y = Math.sin(this.time.elapsed * 0.001);
    if (this.plane) {
      this.plane.position.copy(this.mesh.position);
      this.plane.lookAt(this.camera.instance.position);
      this.pointLight.position.y = 15 + Math.sin(this.time.elapsed * 0.001) * 2;
    }
    this.area.setFromObject(this.instance);

    if (
      this.area.intersectsBox(
        this.experience.world.character.area.expandByScalar(10),
      ) &&
      this.touched
    ) {
      this.touch();
    }
  }
}
