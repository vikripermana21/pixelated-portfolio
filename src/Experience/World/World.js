import Experience from "../Experience";
import Environment from "./Environment";
import Floor from "./Floor";
import Grass from "./Grass";
import Pillars from "./Pillars";
import Grass2 from "./Grass2";
import Grass3 from "./Grass3";
import Grace from "./Grace";
import Physics from "./Physics";
import Character from "./Character";

export default class World {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.physics = new Physics();

    this.physics.on("ready", () => {
      // Wait for resources
      this.resources.on("ready", () => {
        this.floor = new Floor();
        this.character = new Character();
        this.grass = new Grass();
        this.grass2 = new Grass2();
        this.grass3 = new Grass3();
        this.pillars = new Pillars();
        this.environment = new Environment();
        this.grace = new Grace();
        this.grace2 = new Grace();
        this.grace2.instance.position.setScalar(-70);
      });
    });
  }

  update() {
    this.physics.update();
    if (this.environment) this.environment.update();
    if (this.floor) this.floor.update();
    if (this.grass) this.grass.update();
    if (this.grass2) this.grass2.update();
    if (this.grass3) this.grass3.update();
    if (this.grace) this.grace.update();
    if (this.grace2) this.grace2.update();
    if (this.character) this.character.update();
  }
}
