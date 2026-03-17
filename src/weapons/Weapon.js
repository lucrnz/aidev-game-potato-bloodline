import Phaser from 'phaser';

export class Weapon {
  constructor(scene, config) {
    this.scene = scene;
    this.config = config;
    this.name = config.name;
    this.active = true;
  }

  update(player, enemies, delta) {
    
  }

  destroy() {
    
  }
}
