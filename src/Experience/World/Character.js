import * as THREE from "three";
import Experience from "../Experience";
import FootstepBank from "../Utils/FootstepBank";
import { inputStore } from "../Utils/Store";

const normalizeAngle = (angle) => {
  while (angle > Math.PI) angle -= 2 * Math.PI;
  while (angle < -Math.PI) angle += 2 * Math.PI;
  return angle;
};

const lerpAngle = (start, end, t) => {
  start = normalizeAngle(start);
  end = normalizeAngle(end);

  if (Math.abs(end - start) > Math.PI) {
    if (end > start) {
      start += 2 * Math.PI;
    } else {
      end += 2 * Math.PI;
    }
  }

  return normalizeAngle(start + (end - start) * t);
};

export default class Character {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.physics = this.experience.world.physics;
    this.time = this.experience.time;
    this.camera = this.experience.camera;
    this.resources = this.experience.resources;

    this.resource = this.resources.items.characterModel;

    // ---- State ----
    this.forward = false;
    this.backward = false;
    this.left = false;
    this.right = false;
    this.run = false;
    this.touchGrace = false;
    this.prevTouchGrace = false;

    // ---- Movement tuning ----
    this.walkSpeed = 10;
    this.runSpeed = 20;
    this.turnSpeed = 0.5;
    this.currentYaw = 0;
    this.gravity = -9.81;
    this.characterRotationTarget = 0;

    // ---- Footstep state ----
    this.rightFootUp = false;
    this.leftFootUp = false;

    // ---- Area (Box3) ----
    this.area = new THREE.Box3();

    // ---- Init ----
    this.initInput();
    this.initSound();
    this.initModel();
    this.initPhysics();
    this.initAnimation();
  }

  /* -------------------------------------------------------------------------- */
  /*                                    INPUT                                   */
  /* -------------------------------------------------------------------------- */

  initInput() {
    inputStore.subscribe((state) => {
      this.forward = state.forward;
      this.backward = state.backward;
      this.left = state.left;
      this.right = state.right;
      this.run = state.run;
      this.touchGrace = state.touchGrace;
      this.mouse = state.mouse;
      this.isClicking = state.isClicking;

      const pressed = state.touchGrace && !this.prevTouchGrace;
      this.prevTouchGrace = state.touchGrace;

      if (pressed) {
        this.touchGrace = true;

        this.animation.playChain(["kneeling", "standing"], () => {
          inputStore.setState({ touchGrace: false });
        });
        return;
      }

      if (this.animation.isLocked) return;
    });
  }

  /* -------------------------------------------------------------------------- */
  /*                                    SOUND                                   */
  /* -------------------------------------------------------------------------- */

  async initSound() {
    this.listener = new THREE.AudioListener();
    this.camera.instance.add(this.listener);

    this.audioLoader = new THREE.AudioLoader();
    const buffers = await Promise.all(
      [
        "/audio/grass_walk_1.wav",
        "/audio/grass_walk_2.wav",
        "/audio/grass_walk_3.wav",
        "/audio/grass_walk_4.wav",
        "/audio/grass_walk_5.wav",
        "/audio/grass_walk_6.wav",
      ].map(
        (path) =>
          new Promise((resolve) =>
            this.audioLoader.load(path, (buffer) => resolve(buffer)),
          ),
      ),
    );

    this.audio = new FootstepBank(this.listener, buffers);
  }

  /* -------------------------------------------------------------------------- */
  /*                                    MODEL                                   */
  /* -------------------------------------------------------------------------- */

  initModel() {
    this.instance = new THREE.Group();
    this.model = this.resource.scene;
    this.model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
      }
    });

    this.instance.position.set(0, 5, 30);
    this.model.scale.setScalar(5);

    this.scene.add(this.instance);
    this.instance.add(this.model);

    this.rightFoot = this.model.getObjectByName("mixamorigRightFoot");
    this.leftFoot = this.model.getObjectByName("mixamorigLeftFoot");

    this.rightFootProbe = this.createFootProbe();
    this.leftFootProbe = this.createFootProbe();

    this.rightFoot.add(this.rightFootProbe);
    this.leftFoot.add(this.leftFootProbe);

    // this.pointLight = new THREE.PointLight(0xffce3c, 200);
    // this.pointLight.position.set(1, 5, -3);
    // this.instance.add(this.pointLight);
  }

  createFootProbe() {
    return new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial({ visible: false }),
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                                   PHYSICS                                  */
  /* -------------------------------------------------------------------------- */

  initPhysics() {
    const rbDesc = this.physics.rapier.RigidBodyDesc.kinematicVelocityBased();
    this.rigidBody = this.physics.world.createRigidBody(rbDesc);

    const colDesc = this.physics.rapier.ColliderDesc.cuboid(1.5, 0.5, 1.5);
    this.collider = this.physics.world.createCollider(colDesc, this.rigidBody);

    const pos = this.instance.getWorldPosition(new THREE.Vector3());
    const rot = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0));
    this.rigidBody.setTranslation(pos);
    this.rigidBody.setRotation(rot);

    this.characterController =
      this.physics.world.createCharacterController(0.01);
    this.characterController.setApplyImpulsesToDynamicBodies(true);
  }

  /* -------------------------------------------------------------------------- */
  /*                                 ANIMATION                                  */
  /* -------------------------------------------------------------------------- */

  initAnimation() {
    this.animation = {
      mixer: new THREE.AnimationMixer(this.model),
      actions: {},
      current: null,
      isLocked: false,
    };

    const get = (name) => this.resource.animations.find((a) => a.name === name);

    const A = this.animation.actions;
    A.idle = this.animation.mixer.clipAction(get("IDLE"));
    A.walking = this.animation.mixer.clipAction(get("WALKING"));
    A.running = this.animation.mixer.clipAction(get("RUNNING"));
    A.kneeling = this.animation.mixer.clipAction(get("KNEELING"));
    A.standing = this.animation.mixer.clipAction(get("STANDING"));

    this.animation.current = A.idle;
    A.idle.play();

    this.animation.play = (name) => {
      if (this.animation.isLocked) return;

      const next = A[name];
      if (!next || next === this.animation.current) return;

      next.reset().play();
      next.crossFadeFrom(this.animation.current, 0.3, false);
      this.animation.current = next;
    };

    this.animation.playOnce = (name) =>
      new Promise((resolve) => {
        const action = A[name];
        if (!action) return resolve();

        action.reset();
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;
        action.play();

        action.crossFadeFrom(this.animation.current, 0.3, false);
        this.animation.current = action;

        const onFinished = (e) => {
          if (e.action === action) {
            this.animation.mixer.removeEventListener("finished", onFinished);
            resolve();
          }
        };

        this.animation.mixer.addEventListener("finished", onFinished);
      });

    this.animation.playChain = async (names, onFinished) => {
      if (this.animation.isLocked) return;

      this.animation.isLocked = true;

      for (const name of names) {
        await this.animation.playOnce(name);
      }

      this.animation.isLocked = false;
      this.animation.play("idle");
      onFinished?.();
    };
  }

  /* -------------------------------------------------------------------------- */
  /*                                   UPDATE                                   */
  /* -------------------------------------------------------------------------- */

  update() {
    const dt = this.time.delta * 0.001;

    this.area.setFromObject(this.model);

    this.updateMovement(dt);
    this.syncVisuals();
    this.updateFootsteps();

    this.animation.mixer.update(dt);
  }

  updateMovement(dt) {
    const vel = new THREE.Vector3();

    const movement = {
      x: 0,
      z: 0,
    };

    vel.y = this.gravity;

    let speed = this.run ? this.runSpeed : this.walkSpeed;

    if (!this.touchGrace) {
      if (this.forward) {
        movement.z = 1;
      }
      if (this.backward) {
        movement.z = -1;
      }
      if (this.left) {
        movement.x = 1;
      }
      if (this.right) {
        movement.x = -1;
      }
    }

    if (movement.x !== 0 || movement.z !== 0) {
      this.characterRotationTarget = Math.atan2(movement.x, movement.z);
      vel.x = Math.sin(this.characterRotationTarget) * speed * -1;
      vel.z = Math.cos(this.characterRotationTarget) * speed * -1;
      if (speed === this.runSpeed) {
        this.animation.play("running");
      } else {
        this.animation.play("walking");
      }
    } else {
      this.animation.play("idle");
    }

    this.instance.rotation.y = lerpAngle(
      this.instance.rotation.y,
      this.characterRotationTarget,
      0.1,
    );

    const frameMove = vel.clone().multiplyScalar(dt);
    this.characterController.computeColliderMovement(this.collider, frameMove);

    const move = this.characterController.computedMovement();
    this.rigidBody.setLinvel(
      { x: move.x / dt, y: move.y / dt, z: move.z / dt },
      true,
    );
  }

  syncVisuals() {
    this.instance.position.copy(this.rigidBody.translation());
    this.camera.updateCamera(this.instance);
  }

  updateFootsteps() {
    const rightY = this.rightFootProbe.getWorldPosition(new THREE.Vector3()).y;
    const leftY = this.leftFootProbe.getWorldPosition(new THREE.Vector3()).y;

    if (rightY >= 1.3) this.rightFootUp = true;
    if (leftY >= 1.3) this.leftFootUp = true;

    if (this.rightFootUp && rightY <= 1.1) {
      this.rightFootUp = false;
      this.audio.play(this.rightFootProbe, this.run ? 1.0 : 0.5);
    }

    if (this.leftFootUp && leftY <= 1.1) {
      this.leftFootUp = false;
      this.audio.play(this.leftFootProbe, this.run ? 1.0 : 0.5);
    }
  }
}
