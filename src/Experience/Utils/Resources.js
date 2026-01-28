import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import EventEmitter from "./EventEmitter.js";
import { DRACOLoader } from "three/examples/jsm/Addons.js";
import gsap from "gsap";

export default class Resources extends EventEmitter {
  constructor(sources) {
    super();

    this.loadingWrapper = document.querySelector(".loading-wrapper");
    this.clickTitle = document.querySelector(".loading-wrapper>p");
    this.loadingBar = document.querySelector(".loading-bar");

    this.sources = sources;

    this.items = {};
    this.toLoad = this.sources.length;
    this.loaded = 0;

    this.setLoaders();
    this.startLoading();

    window.addEventListener("click", () => {
      gsap.to(this.loadingWrapper, { opacity: 0, duration: 3, ease: "sine" });
    });
  }

  setLoaders() {
    this.loadingManager = new THREE.LoadingManager(
      // ...
      () => {
        gsap.from(this.loadingWrapper, {
          opacity: 1,
        });

        gsap.fromTo(
          this.clickTitle,
          {
            opacity: 0,
          },
          {
            opacity: 1,
            duration: 1,
            yoyo: true,
            repeat: Infinity,
            ease: "sine.inOut",
            delay: 2,
          },
        );
      },

      // Progress
      (itemUrl, itemsLoaded, itemsTotal) => {
        const progressRatio = itemsLoaded / itemsTotal;
        gsap.to(this.loadingBar, {
          scaleX: 1,
          duration: 2,
          ease: "sine",
        });
      },
    );
    this.loaders = {};
    this.loaders.gltfLoader = new GLTFLoader(this.loadingManager);
    this.dracoLoader = new DRACOLoader(this.loadingManager);
    this.dracoLoader.setDecoderPath("draco/");
    this.loaders.gltfLoader.setDRACOLoader(this.dracoLoader);
    this.loaders.textureLoader = new THREE.TextureLoader(this.loadingManager);
    this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader(
      this.loadingManager,
    );
  }

  startLoading() {
    // Load each source
    for (const source of this.sources) {
      if (source.type === "gltfModel") {
        this.loaders.gltfLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file);
        });
      } else if (source.type === "texture") {
        this.loaders.textureLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file);
        });
      } else if (source.type === "cubeTexture") {
        this.loaders.cubeTextureLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file);
        });
      }
    }
  }

  sourceLoaded(source, file) {
    this.items[source.name] = file;

    this.loaded++;

    if (this.loaded === this.toLoad) {
      this.trigger("ready");
    }
  }
}
