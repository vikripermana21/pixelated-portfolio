import Experience from "../Experience";
import Environment from "./Environment";
import Floor from "./Floor";
import Grass from "./Grass";
import Pillars from "./Pillars";
import Grass2 from "./Grass2";
import Grass3 from "./Grass3";

export default class World {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    // Wait for resources
    this.resources.on("ready", () => {
      this.floor = new Floor();
      this.grass = new Grass();
      this.grass2 = new Grass2();
      this.grass3 = new Grass3();
      this.pillars = new Pillars();
      this.environment = new Environment();
    });
  }

  update() {
    if (this.environment) this.environment.update();
    if (this.floor) this.floor.update();
    if (this.grass) this.grass.update();
    if (this.grass2) this.grass2.update();
    if (this.grass3) this.grass3.update();
  }
}
