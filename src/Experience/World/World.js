import * as THREE from "three";
import Experience from "../Experience";
import Environment from "./Environment";
import Floor from "./Floor";
import Grass from "./Grass";

export default class World {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    // Wait for resources
    // this.resources.on("ready", () => {
    this.floor = new Floor();
    this.grass = new Grass();
    this.environment = new Environment();

    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(2, 4, 2),
      new THREE.MeshToonMaterial(),
    );
    this.mesh.position.y = 2;
    this.mesh.position.z = -3;
    this.mesh.castShadow = true;

    this.scene.add(this.mesh);

    this.mesh2 = new THREE.Mesh(
      new THREE.BoxGeometry(2, 4, 2),
      new THREE.MeshToonMaterial(),
    );
    this.mesh2.position.y = 2;
    this.mesh2.position.z = 3;
    this.mesh2.castShadow = true;

    this.scene.add(this.mesh2);

    // });
  }

  update() {
    this.environment.update();
    this.floor.update();
    this.grass.update();
  }
}
