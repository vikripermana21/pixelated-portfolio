import * as THREE from "three";

export default class FootstepBank {
  constructor(listener, buffers, poolSize = 6) {
    this.pool = buffers.flatMap((buffer) => {
      return Array.from({ length: poolSize }, () => {
        const audio = new THREE.PositionalAudio(listener);
        audio.setBuffer(buffer);
        audio.setLoop(false);
        audio.setRefDistance(0.8);
        audio.setRolloffFactor(2.5);
        audio.setVolume(100);
        return audio;
      });
    });

    this.index = 0;
  }

  play(parent) {
    const audio = this.pool[this.index];
    this.index = (this.index + 1) % this.pool.length;

    if (audio.isPlaying) {
      audio.stop();
    }

    parent.add(audio);
    audio.play();
  }
}
