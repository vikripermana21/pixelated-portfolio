import Camera from "./Camera";
import Renderer from "./Renderer";
import Resources from "./Utils/Resources";
import Sizes from "./Utils/Sizes";
import Time from "./Utils/Time";
import * as THREE from "three";
import World from "./World/World";
import sources from "./sources";
import Debug from "./Utils/Debug";
import Composer from "./Composer";
import Physics from "./World/Physics";
import InputController from "./UI/InputController";
import Stats from "three/examples/jsm/libs/stats.module.js";

let instance;
export default class Experience {
  constructor(_canvas) {
    // Singleton
    if (instance) {
      return instance;
    }
    instance = this;

    this.outlineObject = [];

    this.stats = new Stats();
    this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(this.stats.dom);

    this.canvas = _canvas;
    this.bloomLayer = new THREE.Layers();
    this.bloomLayer.set(2);

    this.debug = new Debug();
    this.inputController = new InputController();
    this.sizes = new Sizes();
    this.time = new Time();
    this.scene = new THREE.Scene();
    this.resources = new Resources(sources);
    this.camera = new Camera();
    this.renderer = new Renderer();
    this.composer = new Composer();
    this.world = new World();

    this.sizes.on("resize", () => {
      this.resize();
    });

    this.time.on("tick", () => {
      this.update();
    });
  }

  resize() {
    this.camera.resize();
    this.renderer.resize();
  }

  update() {
    this.stats.begin();
    this.camera.update();
    this.world.update();
    this.composer.update();
    this.stats.end();
  }
}
