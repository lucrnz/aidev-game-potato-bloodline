import { Weapon } from './Weapon.js';

export class KnifeWeapon extends Weapon {
  constructor(scene, definition, stats) {
    super(scene, definition, stats);

    this.angle = 0;
    this.graphics = scene.add.graphics();
    this.hitCooldowns = new Map();
  }

  update(player, enemies, delta) {
    if (!this.active) return;

    this.angle += this.stats.rotationSpeed * (delta / 1000);

    this.graphics.clear();
    this.hitCooldowns.forEach((cooldown, enemyId, map) => {
      if (cooldown <= 0) {
        map.delete(enemyId);
      } else {
        map.set(enemyId, cooldown - delta);
      }
    });

    const angleStep = (Math.PI * 2) / this.stats.count;

    for (let i = 0; i < this.stats.count; i++) {
      const knifeAngle = this.angle + (angleStep * i);
      const knifeX = player.x + Math.cos(knifeAngle) * this.stats.orbitRadius;
      const knifeY = player.y + Math.sin(knifeAngle) * this.stats.orbitRadius;

      this.drawKnife(knifeX, knifeY, knifeAngle);
      this.checkKnifeCollision(knifeX, knifeY, knifeAngle, enemies);
    }
  }

  drawKnife(x, y, angle) {
    const { knifeLength, knifeWidth } = this.stats;
    const { color } = this.definition.visuals;

    const tipX = x + Math.cos(angle) * knifeLength;
    const tipY = y + Math.sin(angle) * knifeLength;
    const baseX = x - Math.cos(angle) * (knifeLength * 0.3);
    const baseY = y - Math.sin(angle) * (knifeLength * 0.3);

    this.graphics.lineStyle(knifeWidth, color, 1);
    this.graphics.lineBetween(baseX, baseY, tipX, tipY);

    this.graphics.fillStyle(color, 1);
    this.graphics.fillCircle(tipX, tipY, knifeWidth / 2);
  }

  checkKnifeCollision(knifeX, knifeY, angle, enemies) {
    const tipX = knifeX + Math.cos(angle) * this.stats.knifeLength;
    const tipY = knifeY + Math.sin(angle) * this.stats.knifeLength;

    enemies.forEach(enemy => {
      if (!enemy.active) return;

      const enemyId = enemy.uid || enemy;
      if (this.hitCooldowns.has(enemyId)) return;

      const dist = Math.sqrt(
        Math.pow(tipX - enemy.x, 2) + Math.pow(tipY - enemy.y, 2)
      );

      if (dist < enemy.radius + this.stats.knifeWidth) {
        this.scene.dealDamageToEnemy(enemy, this.stats.damage);
        this.hitCooldowns.set(enemyId, this.stats.hitCooldown);
      }
    });
  }

  destroy() {
    this.graphics.destroy();
  }
}
