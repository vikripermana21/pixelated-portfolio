import Experience from "../Experience";
import * as THREE from "three";
import { FlexibleToonMaterial } from "../Materials/FlexibleToonMaterial";
import { color } from "three/src/nodes/TSL.js";

export default class Grass {
  constructor() {
    this.params = {
      color: "#2e8b57",
    };
    this.count = 10000;
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
    this.geo = new THREE.PlaneGeometry(2, 2);
    this.mat = new FlexibleToonMaterial({
      color: new THREE.Color(this.params.color),
      alphaMap: this.alphaGrass,
      alphaTest: 0.1,
      isGrass: true,
    });
    // this.mat = new THREE.ShaderMaterial({
    //   lights: true,
    //   uniforms: {
    //     ...THREE.UniformsLib.lights,
    //     uColor: { value: new THREE.Color(this.params.color) },
    //     uAlphaGrass: { value: this.alphaGrass },
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
    this.instance.getWorldPosition(new THREE.Vector3());

    this.mat.userData.shader?.uniforms.objectCenter.value.copy(
      new THREE.Vector3(),
    );

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
