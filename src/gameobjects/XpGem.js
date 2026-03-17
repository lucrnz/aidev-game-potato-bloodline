import Phaser from 'phaser';
import { CONFIG } from '../config.js';

export class XpGem extends Phaser.GameObjects.Graphics {
  constructor(scene, x, y, value) {
    super(scene);
    
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.value = value || CONFIG.xpGem.value;
    this.active = true;
    this.attracted = false;
    
    const { radius, color, borderColor, borderThickness } = CONFIG.xpGem;
    this.radius = radius;
    
    this.fillStyle(color, 1);
    this.fillCircle(0, 0, radius);
    this.lineStyle(borderThickness, borderColor, 1);
    this.strokeCircle(0, 0, radius);
    
    scene.add.existing(this);
  }

  update(playerX, playerY, delta, attractRadius = CONFIG.xpGem.attractRadius) {
    if (!this.active) return;
    
    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < attractRadius || this.attracted) {
      this.attracted = true;
      
      const speed = CONFIG.xpGem.attractSpeed;
      const vx = (dx / dist) * speed;
      const vy = (dy / dist) * speed;
      
      this.x += vx * (delta / 1000);
      this.y += vy * (delta / 1000);
    }
    
    if (dist < CONFIG.player.radius + this.radius) {
      this.collect();
    }
  }

  collect() {
    if (!this.active) return;
    
    this.active = false;
    this.scene.collectXp(this.value);
    this.destroy();
  }
}
