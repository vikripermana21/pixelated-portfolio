import * as THREE from "three";
import Experience from "../Experience";
import Environment from "./Environment";
import Floor from "./Floor";
import Grass from "./Grass";
import Pillars from "./Pillars";

export default class World {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    // Wait for resources
    this.resources.on("ready", () => {
      this.floor = new Floor();
      this.grass = new Grass();
      this.pillars = new Pillars();
      this.environment = new Environment();
    });
  }

  update() {
    if (this.environment) this.environment.update();
    if (this.floor) this.floor.update();
    if (this.grass) this.grass.update();
  }
}
