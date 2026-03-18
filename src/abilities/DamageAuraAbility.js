import { Ability } from './Ability.js';

export class DamageAuraAbility extends Ability {
  constructor(scene, definition, stats) {
    super(scene, definition, stats);

    this.graphics = scene.add.graphics();
    this.lastTick = 0;
    this.damagedEnemies = new Set();
  }

  update(player, enemies, delta) {
    if (!this.active) return;

    this.drawAura(player);

    this.lastTick += delta;
    if (this.lastTick >= this.stats.tickInterval) {
      this.lastTick = 0;
      this.applyDamage(player, enemies);
    }
  }

  drawAura(player) {
    this.graphics.clear();
    this.graphics.fillStyle(this.definition.visuals.color, this.definition.visuals.alpha);
    this.graphics.fillCircle(player.x, player.y, this.stats.radius);
  }

  applyDamage(player, enemies) {
    this.damagedEnemies.clear();

    enemies.forEach(enemy => {
      if (!enemy.active || this.damagedEnemies.has(enemy)) return;

      const dist = Math.sqrt(
        Math.pow(player.x - enemy.x, 2) + Math.pow(player.y - enemy.y, 2)
      );

      if (dist < this.stats.radius + enemy.radius) {
        this.scene.dealDamageToEnemy(enemy, this.stats.damage);
        this.damagedEnemies.add(enemy);
      }
    });
  }

  destroy() {
    this.graphics.destroy();
  }
}
