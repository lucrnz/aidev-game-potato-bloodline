import Phaser from 'phaser';
import { CONFIG } from '../config.js';

export class Enemy extends Phaser.GameObjects.Graphics {
  constructor(scene, x, y) {
    super(scene);
    
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.active = true;
    
    const { radius, color, borderColor, borderThickness, speed, hp, damage, xpValue } = CONFIG.enemy;
    this.radius = radius;
    this.speed = speed;
    this.maxHp = hp;
    this.hp = hp;
    this.damage = damage;
    this.xpValue = xpValue;
    
    this.draw();
    
    scene.add.existing(this);
  }

  draw() {
    this.clear();
    
    const hpPercent = this.hp / this.maxHp;
    const r = 255;
    const g = Math.floor(68 * hpPercent);
    const b = Math.floor(68 * hpPercent);
    const color = (r << 16) | (g << 8) | b;
    
    this.fillStyle(color, 1);
    this.fillCircle(0, 0, this.radius);
    this.lineStyle(CONFIG.enemy.borderThickness, CONFIG.enemy.borderColor, 1);
    this.strokeCircle(0, 0, this.radius);
  }

  takeDamage(amount) {
    if (!this.active) return false;
    
    this.hp -= amount;
    this.draw();
    
    if (this.hp <= 0) {
      this.die();
      return true;
    }
    return false;
  }

  die() {
    this.active = false;
    this.scene.spawnXpGem(this.x, this.y, this.xpValue);
    this.destroy();
  }

  update(playerX, playerY, delta) {
    if (!this.active) return;
    
    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > 0) {
      const vx = (dx / dist) * this.speed;
      const vy = (dy / dist) * this.speed;
      
      this.x += vx * (delta / 1000);
      this.y += vy * (delta / 1000);
    }
  }

  destroy() {
    super.destroy();
  }
}
