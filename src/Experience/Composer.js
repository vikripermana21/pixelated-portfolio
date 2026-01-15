import {
  EffectComposer,
  OutputPass,
  RenderPass,
  RenderPixelatedPass,
} from "three/examples/jsm/Addons.js";
import Experience from "./Experience";
import PixelationPass from "./Postprocessing/Pixelation";

export default class Composer {
  constructor() {
    this.experience = new Experience();
    this.renderer = this.experience.renderer;
    this.scene = this.experience.scene;
    this.camera = this.experience.camera;
    this.sizes = this.experience.sizes;

    this.setInstance();
  }

  setInstance() {
    this.instance = new EffectComposer(this.renderer.instance);

    // Render Pass
    this.renderPass = new RenderPass(this.scene, this.camera.instance);
    this.instance.addPass(this.renderPass);

    // Pixelated Pass
    this.pixelatedPass = new PixelationPass(
      2,
      this.scene,
      this.camera.instance,
    );
    this.pixelatedPass.normalEdgeStrength = 2;
    this.instance.addPass(this.pixelatedPass);

    // Output Pass
    this.outputPass = new OutputPass();
    this.instance.addPass(this.outputPass);
  }

  update() {
    this.instance.render();
  }
}
