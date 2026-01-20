import Experience from "../Experience";
import * as THREE from "three";
import { FlexibleToonMaterial } from "../Materials/FlexibleToonMaterial";

export default class Grass3 {
  constructor() {
    this.params = {
      color: "#27794b",
    };
    this.count = 100;
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.camera = this.experience.camera;
    this.debug = this.experience.debug;
    this.resources = this.experience.resources;

    this.alphaGrass3 = this.resources.items.alphaGrass3;
    this.alphaGrass3.minFilter = THREE.NearestFilter;
    this.alphaGrass3.magFilter = THREE.NearestFilter;
    this.alphaGrass3.generateMipmaps = false;
    this.alphaGrass3.wrapS = THREE.ClampToEdgeWrapping;
    this.alphaGrass3.wrapT = THREE.ClampToEdgeWrapping;

    this.setParams();
    this.setInstance();
  }

  setParams() {
    if (this.debug.active) {
      this.debug.ui.addBinding(this.params, "color").on("change", (ev) => {
        this.instance.material.color = new THREE.Color(ev.value);
      });
    }
  }

  setInstance() {
    this.geo = new THREE.PlaneGeometry(1.5, 1.5);
    this.mat = new FlexibleToonMaterial({
      color: new THREE.Color(this.params.color),
      alphaMap: this.alphaGrass3,
      alphaTest: 0.1,
      isGrass: true,
    });

    // this.mat = new THREE.ShaderMaterial({
    //   lights: true,
    //   uniforms: {
    //     ...THREE.UniformsLib.lights,
    //     uColor: { value: new THREE.Color(this.params.color) },
    //     uAlphaGrass: { value: this.alphaGrass3 },
    //   },
    //   vertexShader,
    //   fragmentShader,
    //   transparent: true,
    //   depthTest: true,
    //   depthWrite: true,
    // });

    this.instance = new THREE.InstancedMesh(this.geo, this.mat, this.count);
    this.instance.layers.set(1);
    this.instance.receiveShadow = true;

    this.dummy = new THREE.Object3D();
    this.matrix = new THREE.Matrix4();

    for (let i = 0; i < this.count; i++) {
      this.dummy.position.x = (0.5 - Math.random()) * 200;
      this.dummy.position.y = 1.5 / 2;
      this.dummy.position.z = (0.5 - Math.random()) * 200;
      this.dummy.updateMatrix();
      this.instance.setMatrixAt(i, this.dummy.matrix);
    }
    this.scene.add(this.instance);
  }

  update() {
    for (let i = 0; i < this.count; i++) {
      this.instance.getMatrixAt(i, this.matrix);
      this.matrix.decompose(
        this.dummy.position,
        this.dummy.rotation,
        this.dummy.scale,
        this.dummy.receiveShadow,
      );

      this.dummy.lookAt(
        this.camera.instance.position.x,
        0,
        this.camera.instance.position.z,
      );

      this.dummy.updateMatrix();
      this.instance.setMatrixAt(i, this.dummy.matrix);
    }
    this.instance.instanceMatrix.needsUpdate = true;
  }
}
