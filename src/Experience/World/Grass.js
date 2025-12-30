import Experience from "../Experience";
import * as THREE from "three";
import vertexShader from "../Shaders/Toon/toon.vert";
import fragmentShader from "../Shaders/Toon/toon.frag";

export default class Grass {
  constructor() {
    this.params = {
      color: "#2e8b57",
    };
    this.count = 400;
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.camera = this.experience.camera;
    this.debug = this.experience.debug;

    this.setInstance();
  }

  setInstance() {
    this.geo = new THREE.PlaneGeometry(1, 1);
    this.mat = new THREE.ShaderMaterial({
      lights: true,
      uniforms: {
        ...THREE.UniformsLib.lights,
        uColor: { value: new THREE.Color(this.params.color) },
      },
      vertexShader,
      fragmentShader,
    });

    this.instance = new THREE.InstancedMesh(this.geo, this.mat, this.count);
    this.instance.receiveShadow = true;

    this.dummy = new THREE.Object3D();
    this.matrix = new THREE.Matrix4();

    for (let i = 0; i < this.count; i++) {
      this.dummy.position.x = (0.5 - Math.random()) * 30;
      this.dummy.position.y = 0.5;
      this.dummy.position.z = (0.5 - Math.random()) * 30;
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
