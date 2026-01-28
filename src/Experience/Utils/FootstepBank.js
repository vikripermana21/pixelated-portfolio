import * as THREE from "three";

export default class FootstepBank {
  constructor(listener, buffers, poolSize = 6) {
    this.pool = buffers.flatMap((buffer) => {
      return Array.from({ length: poolSize }, () => {
        const audio = new THREE.Audio(listener);
        audio.setBuffer(buffer);
        audio.setLoop(false);
        audio.setVolume(0.5);
        return audio;
      });
    });

    this.index = 0;
  }

  play(parent, volume = 1) {
    const audio = this.pool[this.index];
    audio.setVolume(volume);
    this.index = (this.index + 1) % this.pool.length;

    if (audio.isPlaying) {
      audio.stop();
    }

    parent.add(audio);
    audio.play();
  }
}
