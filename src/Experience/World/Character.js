import Experience from "../Experience";
import { FlexibleToonMaterial } from "../Materials/FlexibleToonMaterial";
import { inputStore } from "../Utils/Store";
import * as THREE from "three";

export default class Character {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.physics = this.experience.world.physics;
    this.time = this.experience.time;
    this.camera = this.experience.camera;
    this.speed = 0.01;
    this.area = new THREE.Box3();

    inputStore.subscribe((state) => {
      this.forward = state.forward;
      this.backward = state.backward;
      this.left = state.left;
      this.right = state.right;
      this.run = state.run;
    });

    this.setInstance();
  }

  setInstance() {
    const geometry = new THREE.BoxGeometry(2, 4, 2);
    const material = new FlexibleToonMaterial({
      color: 0x00ff00,
      wireframe: false,
    });
    this.instance = new THREE.Mesh(geometry, material);
    this.instance.position.set(0, 20, 30);
    this.instance.castShadow = true;
    this.scene.add(this.instance);

    // create a rigid body
    this.rigidBodyType =
      this.physics.rapier.RigidBodyDesc.kinematicPositionBased();
    this.rigidBody = this.physics.world.createRigidBody(this.rigidBodyType);

    // create a collider
    this.colliderType = this.physics.rapier.ColliderDesc.cuboid(
      2 / 2,
      4 / 2,
      2 / 2,
    );
    this.collider = this.physics.world.createCollider(
      this.colliderType,
      this.rigidBody,
    );

    // set rigid body position to character position
    const worldPosition = this.instance.getWorldPosition(new THREE.Vector3());
    const worldRotation = this.instance.getWorldQuaternion(
      new THREE.Quaternion(),
    );
    this.rigidBody.setTranslation(worldPosition);
    this.rigidBody.setRotation(worldRotation);

    this.characterController =
      this.physics.world.createCharacterController(0.01);
  }

  update() {
    this.area.setFromObject(this.instance);
    const movement = new THREE.Vector3();
    let speed = 0.01;

    if (this.forward) {
      movement.z -= 1;
    }
    if (this.backward) {
      movement.z += 1;
    }
    if (this.left) {
      movement.x -= 1;
    }
    if (this.right) {
      movement.x += 1;
    }
    if (this.run) {
      speed += 0.01;
    }

    movement.normalize().multiplyScalar(this.time.delta * speed);
    movement.y = -1;
    this.characterController.computeColliderMovement(this.collider, movement);
    this.characterController.setApplyImpulsesToDynamicBodies(true);
    // this.characterController.enableAutostep(3, 0.1, true);
    // this.characterController.enableSnapToGround(1);

    const newPosition = new THREE.Vector3()
      .copy(this.rigidBody.translation())
      .add(this.characterController.computedMovement());

    this.rigidBody.setNextKinematicTranslation(newPosition);

    this.instance.position.copy(this.rigidBody.translation());

    this.camera.updateCamera(this.instance);
  }
}
