import Phaser from 'phaser';
import { Weapon } from './Weapon.js';

export class GarlicWeapon extends Weapon {
  constructor(scene, config) {
    super(scene, config);
    
    this.graphics = scene.add.graphics();
    this.lastTick = 0;
    this.damagedEnemies = new Set();
  }

  update(player, enemies, delta) {
    if (!this.active) return;

    this.drawAura(player);
    
    this.lastTick += delta;
    if (this.lastTick >= this.config.tickInterval) {
      this.lastTick = 0;
      this.applyDamage(player, enemies);
    }
  }

  drawAura(player) {
    this.graphics.clear();
    this.graphics.fillStyle(this.config.color, this.config.alpha);
    this.graphics.fillCircle(player.x, player.y, this.config.radius);
  }

  applyDamage(player, enemies) {
    this.damagedEnemies.clear();
    
    enemies.forEach(enemy => {
      if (!enemy.active || this.damagedEnemies.has(enemy)) return;
      
      const dist = Math.sqrt(
        Math.pow(player.x - enemy.x, 2) + Math.pow(player.y - enemy.y, 2)
      );
      
      if (dist < this.config.radius + enemy.radius) {
        this.scene.dealDamageToEnemy(enemy, this.config.damage);
        this.damagedEnemies.add(enemy);
      }
    });
  }

  destroy() {
    this.graphics.destroy();
  }
}
