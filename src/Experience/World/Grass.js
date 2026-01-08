import Experience from "../Experience";
import * as THREE from "three";
import vertexShader from "../Shaders/Toon/toon.vert";
import fragmentShader from "../Shaders/Toon/toon.frag";

export default class Grass {
  constructor() {
    this.params = {
      color: "#2e8b57",
    };
    this.count = 1000;
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.camera = this.experience.camera;
    this.debug = this.experience.debug;
    this.resources = this.experience.resources;

    this.alphaGrass = this.resources.items.alphaGrass;
    this.alphaGrass.minFilter = THREE.NearestFilter;
    this.alphaGrass.magFilter = THREE.NearestFilter;
    this.alphaGrass.generateMipmaps = false;
    this.alphaGrass.wrapS = THREE.ClampToEdgeWrapping;
    this.alphaGrass.wrapT = THREE.ClampToEdgeWrapping;

    this.setInstance();
  }

  setInstance() {
    this.geo = new THREE.PlaneGeometry(1.5, 1.5);
    this.mat = new THREE.ShaderMaterial({
      lights: true,
      uniforms: {
        ...THREE.UniformsLib.lights,
        uColor: { value: new THREE.Color(this.params.color) },
        uAlphaGrass: { value: this.alphaGrass },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthTest: true,
      depthWrite: true,
    });

    this.instance = new THREE.InstancedMesh(this.geo, this.mat, this.count);
    this.instance.layers.set(1);
    this.instance.receiveShadow = true;

    this.dummy = new THREE.Object3D();
    this.matrix = new THREE.Matrix4();

    for (let i = 0; i < this.count; i++) {
      this.dummy.position.x = (0.5 - Math.random()) * 100;
      this.dummy.position.y = 1.5 / 2;
      this.dummy.position.z = (0.5 - Math.random()) * 100;
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
