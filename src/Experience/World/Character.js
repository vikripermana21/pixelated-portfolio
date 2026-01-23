import Experience from "../Experience";
import { FlexibleToonMaterial } from "../Materials/FlexibleToonMaterial";
import FootstepBank from "../Utils/FootstepBank";
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

    // movement tuning (units per second)
    this.right_foot_up = false;
    this.left_foot_up = false;
    this.walkSpeed = 5;
    this.runSpeed = 10;
    this.turnSpeed = 2.5;
    this.gravity = -9.81;

    this.rotationY = 0;
    this.area = new THREE.Box3();

    inputStore.subscribe((state) => {
      this.forward = state.forward;
      this.backward = state.backward;
      this.left = state.left;
      this.right = state.right;
      this.run = state.run;
      this.touchGrace = state.touchGrace;

      if (this.forward) {
        this.animation.play(this.run ? "running" : "walking");
      } else {
        this.animation.play("idle");
      }

      if (this.touchGrace) {
        this.animation.play("kneeling");
        setTimeout(() => this.animation.play("kneeling_idle"), 2000);
        setTimeout(() => this.animation.play("standing"), 4000);
        setTimeout(() => {
          this.animation.play("idle");
          inputStore.setState({ touchGrace: false });
        }, 6000);
      }
    });

    this.setSound();
    this.setInstance();
    this.setAnimation();
  }

  async setSound() {
    this.listener = new THREE.AudioListener();
    this.camera.instance.add(this.listener);
    // create a global audio source
    this.sound = new THREE.Audio(this.listener);
    // load a sound and set it as the Audio object's buffer
    this.audioLoader = new THREE.AudioLoader();
    this.grassBuffer = await this.loadBuffers([
      "/audio/grass_walk_1.wav",
      "/audio/grass_walk_2.wav",
      "/audio/grass_walk_3.wav",
      "/audio/grass_walk_4.wav",
      "/audio/grass_walk_5.wav",
      "/audio/grass_walk_6.wav",
    ]);
    this.audio = new FootstepBank(this.listener, this.grassBuffer);
    // this.audioLoader.load("/audio/grass_walk.wav", (buffer) => {
    //   this.sound.setBuffer(buffer);
    //   this.sound.setLoop(false);
    //   this.sound.setVolume(0.5);
    //   this.rightFootProbe.sound = this.sound;
    //   this.leftFootProbe.sound = this.sound;
    // });
  }

  async loadBuffers(paths) {
    const entries = await Promise.all(
      paths.map(
        (path) =>
          new Promise((resolve) =>
            this.audioLoader.load(path, (buffer) => resolve(buffer)),
          ),
      ),
    );

    return entries;
  }

  setInstance() {
    this.model = this.resource.scene;
    this.model.position.set(0, 5, 30);
    this.model.scale.setScalar(5);
    this.rightFoot = this.model.getObjectByName("mixamorigRightFoot");
    this.leftFoot = this.model.getObjectByName("mixamorigLeftFoot");
    this.rightFootProbe = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial(),
    );

    this.rightFootProbe.position.set(0, 0, 0);
    this.leftFootProbe = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial(),
    );
    this.leftFootProbe.position.set(0, 0, 0);
    this.rightFoot.add(this.rightFootProbe);
    this.leftFoot.add(this.leftFootProbe);
    this.scene.add(this.model);

    // Debug mesh (optional)
    const geometry = new THREE.BoxGeometry(2, 4, 2);
    const material = new FlexibleToonMaterial({ color: 0x00ff00 });
    this.instance = new THREE.Mesh(geometry, material);
    this.instance.visible = false;
    this.scene.add(this.instance);

    // Velocity-based kinematic body
    const rbDesc = this.physics.rapier.RigidBodyDesc.kinematicVelocityBased();
    this.rigidBody = this.physics.world.createRigidBody(rbDesc);

    const colDesc = this.physics.rapier.ColliderDesc.cuboid(1.5, 0.5, 1.5);
    this.collider = this.physics.world.createCollider(colDesc, this.rigidBody);

    // Sync initial transform
    const pos = this.model.getWorldPosition(new THREE.Vector3());
    const rot = this.model.getWorldQuaternion(new THREE.Quaternion());
    this.rigidBody.setTranslation(pos);
    this.rigidBody.setRotation(rot);

    // Character controller
    this.characterController =
      this.physics.world.createCharacterController(0.01);
    this.characterController.setApplyImpulsesToDynamicBodies(true);
    // this.characterController.enableSnapToGround(0.5);
    // this.characterController.enableAutostep(0.5, 0.2, true);
  }

  setAnimation() {
    this.animation = {};
    this.animation.mixer = new THREE.AnimationMixer(this.model);
    this.animation.actions = {};

    const get = (name) => this.resource.animations.find((a) => a.name === name);

    this.animation.actions.idle = this.animation.mixer.clipAction(get("IDLE"));
    this.animation.actions.walking = this.animation.mixer.clipAction(
      get("WALKING"),
    );
    this.animation.actions.running = this.animation.mixer.clipAction(
      get("RUNNING"),
    );
    this.animation.actions.kneeling = this.animation.mixer.clipAction(
      get("KNEELING"),
    );
    this.animation.actions.kneeling_idle = this.animation.mixer.clipAction(
      get("KNEELING_IDLE"),
    );
    this.animation.actions.standing = this.animation.mixer.clipAction(
      get("STANDING"),
    );

    this.animation.actions.kneeling.setLoop(THREE.LoopOnce);

    this.animation.actions.current = this.animation.actions.idle;
    this.animation.actions.current.play();

    this.animation.play = (name) => {
      const next = this.animation.actions[name];
      const current = this.animation.actions.current;
      if (next === current) return;

      next.reset().play();
      next.crossFadeFrom(current, 0.3, false);
      this.animation.actions.current = next;
    };
  }

  update() {
    const dt = this.time.delta * 0.001;

    this.area.setFromObject(this.model);

    // Get forward from rigid body rotation
    const rbRot = this.rigidBody.rotation();
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(
      new THREE.Quaternion(rbRot.x, rbRot.y, rbRot.z, rbRot.w),
    );

    // Desired velocity
    const velocity = new THREE.Vector3();

    if (this.forward) {
      const speed = this.run ? this.runSpeed : this.walkSpeed;
      velocity.add(forward.multiplyScalar(speed));
    }

    // gravity
    velocity.y = this.gravity;

    // Character controller expects displacement
    const frameMovement = velocity.clone().multiplyScalar(dt);

    this.characterController.computeColliderMovement(
      this.collider,
      frameMovement,
    );

    // Convert Rapier vec → THREE vec
    const move = this.characterController.computedMovement();
    const correctedVelocity = new THREE.Vector3(
      move.x,
      move.y,
      move.z,
    ).multiplyScalar(1 / dt);

    this.rigidBody.setLinvel(
      {
        x: correctedVelocity.x,
        y: correctedVelocity.y,
        z: correctedVelocity.z,
      },
      true,
    );

    // -------- Rotation --------
    let angVelY = 0;
    if (this.left) angVelY = this.turnSpeed;
    if (this.right) angVelY = -this.turnSpeed;

    this.rigidBody.setAngvel({ x: 0, y: angVelY, z: 0 }, true);

    // -------- Sync visuals --------
    this.model.position.copy(this.rigidBody.translation());
    this.model.quaternion.copy(this.rigidBody.rotation());

    this.camera.updateCamera(this.model);
    this.animation.mixer.update(dt);

    if (this.rightFootProbe.getWorldPosition(new THREE.Vector3()).y >= 1.3) {
      this.right_foot_up = true;
    }
    if (this.leftFootProbe.getWorldPosition(new THREE.Vector3()).y >= 1.3) {
      this.left_foot_up = true;
    }

    if (
      this.right_foot_up &&
      this.rightFootProbe.getWorldPosition(new THREE.Vector3()).y <= 1.1
    ) {
      this.right_foot_up = false;

      this.audio.play(this.rightFootProbe);
    }
    if (
      this.left_foot_up &&
      this.leftFootProbe.getWorldPosition(new THREE.Vector3()).y <= 1.1
    ) {
      this.left_foot_up = false;
      this.audio.play(this.leftFootProbe);
    }
  }
}

// export default class Character {
//   constructor() {
//     this.experience = new Experience();
//     this.scene = this.experience.scene;
//     this.physics = this.experience.world.physics;
//     this.time = this.experience.time;
//     this.camera = this.experience.camera;
//     this.resources = this.experience.resources;

//     this.resource = this.resources.items.characterModel;
//     this.speed = 0.01;
//     this.area = new THREE.Box3();
//     this.rotationY = 0;
//     this.turnSpeed = 0.003;

//     inputStore.subscribe((state) => {
//       this.forward = state.forward;
//       this.backward = state.backward;
//       this.left = state.left;
//       this.right = state.right;
//       this.run = state.run;
//       this.touchGrace = state.touchGrace;

//       if (this.forward) {
//         if (this.run) {
//           this.animation.play("running");
//         } else {
//           this.animation.play("walking");
//         }
//       } else {
//         this.animation.play("idle");
//       }

//       if (this.touchGrace) {
//         this.animation.play("kneeling");
//         setTimeout(() => {
//           this.animation.play("kneeling_idle");
//         }, 1500);
//         setTimeout(() => {
//           this.animation.play("standing");
//         }, 3500);
//         setTimeout(() => {
//           this.animation.play("idle");
//           inputStore.setState({ touchGrace: false });
//         }, 4000);
//       }
//     });

//     this.setInstance();
//     this.setAnimation();
//   }

//   setInstance() {
//     this.model = this.resource.scene;
//     this.model.position.set(0, 5, 30);
//     this.model.scale.setScalar(5);
//     const geometry = new THREE.BoxGeometry(2, 4, 2);
//     const material = new FlexibleToonMaterial({
//       color: 0x00ff00,
//       wireframe: false,
//     });
//     this.instance = new THREE.Mesh(geometry, material);
//     this.instance.position.set(0, 20, 30);
//     this.instance.castShadow = true;
//     this.scene.add(this.model);

//     // create a rigid body
//     this.rigidBodyType =
//       this.physics.rapier.RigidBodyDesc.kinematicVelocityBased();
//     this.rigidBody = this.physics.world.createRigidBody(this.rigidBodyType);

//     // create a collider
//     this.colliderType = this.physics.rapier.ColliderDesc.cuboid(
//       3 / 2,
//       1 / 2,
//       3 / 2,
//     );
//     this.collider = this.physics.world.createCollider(
//       this.colliderType,
//       this.rigidBody,
//     );

//     // set rigid body position to character position
//     const worldPosition = this.model.getWorldPosition(new THREE.Vector3());
//     const worldRotation = this.model.getWorldQuaternion(new THREE.Quaternion());

//     this.rigidBody.setTranslation(worldPosition);
//     this.rigidBody.setRotation(worldRotation);

//     this.characterController =
//       this.physics.world.createCharacterController(0.01);
//   }

//   setAnimation() {
//     this.animation = {};

//     // Mixer
//     this.animation.mixer = new THREE.AnimationMixer(this.model);

//     // Actions
//     this.animation.actions = {};

//     console.log(this.resource.animations);

//     this.animation.actions.idle = this.animation.mixer.clipAction(
//       this.resource.animations.find((item) => item.name === "IDLE"),
//     );
//     this.animation.actions.walking = this.animation.mixer.clipAction(
//       this.resource.animations.find((item) => item.name === "WALKING"),
//     );
//     this.animation.actions.running = this.animation.mixer.clipAction(
//       this.resource.animations.find((item) => item.name === "RUNNING"),
//     );
//     this.animation.actions.kneeling = this.animation.mixer.clipAction(
//       this.resource.animations.find((item) => item.name === "KNEELING"),
//     );
//     this.animation.actions.kneeling_idle = this.animation.mixer.clipAction(
//       this.resource.animations.find((item) => item.name === "KNEELING_IDLE"),
//     );
//     this.animation.actions.standing = this.animation.mixer.clipAction(
//       this.resource.animations.find((item) => item.name === "STANDING"),
//     );
//     this.animation.actions.kneeling.setLoop(THREE.LoopOnce);

//     this.animation.actions.current = this.animation.actions.idle;
//     this.animation.actions.current.play();

//     // Play the action
//     this.animation.play = (name) => {
//       const newAction = this.animation.actions[name];
//       const oldAction = this.animation.actions.current;

//       if (newAction === oldAction) return;

//       newAction.reset();
//       newAction.play();
//       newAction.crossFadeFrom(oldAction, 1);

//       this.animation.actions.current = newAction;
//     };
//   }

//   update() {
//     this.area.setFromObject(this.model);
//     const movement = new THREE.Vector3();
//     let speed = 0.01;
//     const forward = new THREE.Vector3(0, 0, -1);
//     forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotationY);

//     // if (this.forward) {
//     //   movement.z -= 1;
//     // }
//     // if (this.backward) {
//     //   movement.z += 1;
//     // }
//     if (this.forward) {
//       if (this.left) {
//         this.rotationY += this.time.delta * this.turnSpeed;
//       }

//       if (this.right) {
//         this.rotationY -= this.time.delta * this.turnSpeed;
//       }

//       if (this.run) {
//         speed += 0.01;
//       }
//       movement.add(forward);
//     }

//     // if (this.backward) {
//     //   movement.sub(forward);
//     // }
//     // if (this.left) {
//     //   movement.x -= 1;
//     // }
//     // if (this.right) {
//     //   movement.x += 1;
//     // }

//     movement.normalize().multiplyScalar(this.time.delta * speed);
//     movement.y = -1;
//     this.characterController.computeColliderMovement(this.collider, movement);
//     this.characterController.setApplyImpulsesToDynamicBodies(true);
//     // this.characterController.enableAutostep(3, 0.1, true);
//     // this.characterController.enableSnapToGround(1);

//     const rotation = new THREE.Quaternion().setFromAxisAngle(
//       new THREE.Vector3(0, 1, 0),
//       this.rotationY,
//     );

//     const newPosition = new THREE.Vector3()
//       .copy(this.rigidBody.translation())
//       .add(this.characterController.computedMovement());

//     this.rigidBody.setNextKinematicTranslation(newPosition);
//     this.rigidBody.setNextKinematicRotation(rotation);

//     this.model.position.copy(this.rigidBody.translation());
//     this.model.quaternion.copy(this.rigidBody.rotation());

//     this.camera.updateCamera(this.model);
//     this.animation.mixer.update(this.time.delta * 0.001);
//   }
// }
