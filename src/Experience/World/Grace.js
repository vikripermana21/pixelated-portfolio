import Experience from "../Experience";
import * as THREE from "three";
import { FlexibleToonMaterial } from "../Materials/FlexibleToonMaterial";
import gsap from "gsap";

export default class Grace {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.time = this.experience.time;
    this.camera = this.experience.camera;

    this.setInstance();
  }

  setInstance() {
    this.geo = new THREE.IcosahedronGeometry(1, 1);
    this.mat = new FlexibleToonMaterial({ color: 0xffee57 });
    this.instance = new THREE.Mesh(this.geo, this.mat);
    this.scene.add(this.instance);

    this.plane = new THREE.Mesh(
      new THREE.PlaneGeometry(50, 50),
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color("#ffe500") },
          uCenter: { value: new THREE.Vector2(0.5, 0.5) },
          uSpeed: { value: 5 },
          uFrequency: { value: 20 },
          uThickness: { value: 1 },
          uRing: { value: -100 },
        },
        vertexShader: `
varying vec2 vUv;

void main(){
gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
vUv = uv;
}
`,
        fragmentShader: `
uniform float uTime;
uniform vec2  uCenter;   // in UV space (0–1)
uniform float uSpeed;
uniform float uRing;
uniform float uFrequency;
uniform float uThickness;
uniform vec3 uColor;

varying vec2 vUv;

void main() {
    vec2 uv = vUv;

    float d = distance(uv, uCenter);

    // Traveling wave
    float wave = sin(d * uFrequency - uTime * uSpeed);

    // Convert sine into sharp ring
    float ring = smoothstep(
        uThickness,
        uRing,
        abs(wave)
    );

    // Fade over distance
    float fade = smoothstep(.5, .0, d);

    float intensity = ring * fade;

    vec3 color = uColor; 

    gl_FragColor = vec4(color, intensity);
#include <tonemapping_fragment>
    #include <colorspace_fragment>

}
`,
        transparent: true,
      }),
    );
    this.plane.layers.set(1);
    this.scene.add(this.plane);

    gsap.to(this.plane.material.uniforms.uRing, {
      value: 0,
      duration: 2,
      ease: "sine.inOut",
    });
  }

  update() {
    this.instance.position.y = 5 + Math.sin(this.time.elapsed * 0.001) * 2;
    this.plane.position.copy(this.instance.position);
    this.plane.material.uniforms.uTime.value = this.time.elapsed * 0.001;
    // this.plane.lookAt(this.camera.instance);
  }
}
