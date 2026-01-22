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
    this.resources = this.experience.resources;

    this.resource = this.resources.items.characterModel;
    this.speed = 0.01;
    this.area = new THREE.Box3();
    this.rotationY = 0;
    this.turnSpeed = 0.003;

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
    this.model = this.resource.scene;
    this.model.position.set(0, 20, 30);
    this.model.scale.setScalar(5);
    const geometry = new THREE.BoxGeometry(2, 4, 2);
    const material = new FlexibleToonMaterial({
      color: 0x00ff00,
      wireframe: false,
    });
    this.instance = new THREE.Mesh(geometry, material);
    this.instance.position.set(0, 20, 30);
    this.instance.castShadow = true;
    this.scene.add(this.model);

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
    const worldPosition = this.model.getWorldPosition(new THREE.Vector3());
    const worldRotation = this.model.getWorldQuaternion(new THREE.Quaternion());
    this.rigidBody.setTranslation(worldPosition);
    this.rigidBody.setRotation(worldRotation);

    this.characterController =
      this.physics.world.createCharacterController(0.01);
  }

  update() {
    this.area.setFromObject(this.model);
    const movement = new THREE.Vector3();
    let speed = 0.01;
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotationY);

    // if (this.forward) {
    //   movement.z -= 1;
    // }
    // if (this.backward) {
    //   movement.z += 1;
    // }
    if (this.forward) {
      movement.add(forward);
    }

    if (this.backward) {
      movement.sub(forward);
    }
    // if (this.left) {
    //   movement.x -= 1;
    // }
    // if (this.right) {
    //   movement.x += 1;
    // }
    if (this.left) {
      this.rotationY += this.time.delta * this.turnSpeed;
    }

    if (this.right) {
      this.rotationY -= this.time.delta * this.turnSpeed;
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

    const rotation = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      this.rotationY,
    );

    const newPosition = new THREE.Vector3()
      .copy(this.rigidBody.translation())
      .add(this.characterController.computedMovement());

    this.rigidBody.setNextKinematicTranslation(newPosition);
    this.rigidBody.setNextKinematicRotation(rotation);

    this.model.position.copy(this.rigidBody.translation());
    this.model.quaternion.copy(this.rigidBody.rotation());

    this.camera.updateCamera(this.model);
  }
}
