import {
  EffectComposer,
  OutputPass,
  RenderPass,
  ShaderPass,
  UnrealBloomPass,
} from "three/examples/jsm/Addons.js";
import Experience from "./Experience";
import PixelationPass from "./Postprocessing/Pixelation";
import vertexShader from "./Shaders/Mix/mix.vert";
import fragmentShader from "./Shaders/Mix/mix.frag";
import * as THREE from "three";

export default class Composer {
  constructor() {
    this.params = {
      bloomStrength: 0.1,
      bloomRadius: 0.1,
      bloomThreshold: 0.1,
    };
    this.experience = new Experience();
    this.renderer = this.experience.renderer;
    this.debug = this.experience.debug;
    this.scene = this.experience.scene;
    this.camera = this.experience.camera;
    this.sizes = this.experience.sizes;

    this.bloomLayer = this.experience.bloomLayer;

    this.darkMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    this.materials = {};

    this.setBloom();
    this.setInstance();
    this.setTweaks();
  }

  nonBloomed(obj) {
    if (obj.isMesh && this.bloomLayer.test(obj.layers) === false) {
      this.materials[obj.uuid] = obj.material;
      obj.material = this.darkMaterial;
    }
  }

  restoreMaterial(obj) {
    if (this.materials[obj.uuid]) {
      obj.material = this.materials[obj.uuid];
      delete this.materials[obj.uuid];
    }
  }

  setBloom() {
    // Render Pass
    this.renderPass = new RenderPass(this.scene, this.camera.instance);

    this.bloomComposer = new EffectComposer(this.renderer.instance);
    this.bloomComposer.addPass(this.renderPass);

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(this.sizes.resolution),
    );
    this.bloomPass.threshold = this.params.bloomThreshold;
    this.bloomPass.strength = this.params.bloomStrength;
    this.bloomPass.radius = this.params.bloomRadius;
    this.bloomComposer.addPass(this.bloomPass);

    this.bloomComposer.renderToScreen = false;

    this.mixPass = new ShaderPass(
      new THREE.ShaderMaterial({
        uniforms: {
          baseTexture: { value: null },
          bloomTexture: { value: this.bloomComposer.renderTarget2.texture },
        },
        vertexShader,
        fragmentShader,
      }),
      "baseTexture",
    );
  }

  setInstance() {
    this.instance = new EffectComposer(this.renderer.instance);

    this.instance.addPass(this.renderPass);

    // Pixelated Pass
    this.pixelatedPass = new PixelationPass(
      4,
      this.scene,
      this.camera.instance,
    );
    this.pixelatedPass.normalEdgeStrength = 2;
    this.pixelatedPass.depthEdgeStrength = 2;
    this.instance.addPass(this.pixelatedPass);

    this.instance.addPass(this.mixPass);

    // Output Pass
    this.outputPass = new OutputPass();
    this.instance.addPass(this.outputPass);
  }

  setTweaks() {
    if (this.debug.active) {
      this.tweaks = this.debug.ui.addFolder({ title: "Bloom" });
      this.tweaks.addBinding(this.params, "bloomStrength", {
        min: 0,
        max: 10,
        step: 0.1,
      });
      this.tweaks.addBinding(this.params, "bloomThreshold", {
        min: 0,
        max: 100,
        step: 0.1,
      });
      this.tweaks.addBinding(this.params, "bloomRadius", {
        min: 0,
        max: 100,
        step: 0.1,
      });
    }
  }

  update() {
    this.bloomPass.strength = this.params.bloomStrength;
    this.bloomPass.threshold = this.params.bloomThreshold;
    this.bloomPass.radius = this.params.bloomRadius;
    this.scene.traverse((child) => {
      this.nonBloomed(child);
    });
    this.bloomComposer.render();
    this.scene.traverse((child) => {
      this.restoreMaterial(child);
    });
    this.instance.render();
  }
}
